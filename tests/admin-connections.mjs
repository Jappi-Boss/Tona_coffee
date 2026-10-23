// Integration tests against an explicitly supplied ISOLATED Neon branch.
// The auth boundary is stubbed only in temporary compiled test modules;
// application authorization and outbound notification services are not bypassed in production.
import assert from "node:assert/strict";
import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  symlinkSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { neon } from "@neondatabase/serverless";
if (
  !process.argv.includes("--isolated-database") ||
  !process.env.TONA_QA_DATABASE_URL_FILE
)
  throw Error(
    "Use --isolated-database and TONA_QA_DATABASE_URL_FILE for a disposable branch.",
  );
process.env.DATABASE_URL = readFileSync(
  process.env.TONA_QA_DATABASE_URL_FILE,
  "utf8",
).trim();
const sql = neon(process.env.DATABASE_URL);
const temp = mkdtempSync(join(tmpdir(), "tona-integration-"));
symlinkSync(resolve("node_modules"), join(temp, "node_modules"));
if (process.env.TONA_QA_STORAGE_FILE)
  Object.assign(
    process.env,
    JSON.parse(readFileSync(process.env.TONA_QA_STORAGE_FILE, "utf8")),
  );
const modules = [
  "locations",
  "tona",
  "quotation-schema.server",
  "public-db.server",
  "admin-db.server",
];
for (const name of modules) {
  let source = readFileSync(`src/lib/${name}.ts`, "utf8");
  if (name === "admin-db.server") {
    const start = source.indexOf("async function requireAdmin("),
      end = source.indexOf("async function requireSuperAdmin(", start);
    source =
      source.slice(0, start) +
      `async function requireAdmin(token: string) { if (token !== 'qa-isolated-token') throw new Error('Invalid admin session.'); return {email:'qa-admin@example.invalid',name:'QA',role:'admin'}; }\n` +
      source.slice(end);
  }
  let output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
  output = output.replace(
    /(["'])\.\/([^"']+)\1/g,
    (_, quote, path) => `${quote}./${path}.mjs${quote}`,
  );
  writeFileSync(join(temp, name + ".mjs"), output);
}
writeFileSync(
  join(temp, "notifications.server.mjs"),
  "export async function sendSubmissionNotifications(){return {emailSent:false,whatsappSent:false}}",
);
const admin = await import(pathToFileURL(join(temp, "admin-db.server.mjs")));
const pub = await import(pathToFileURL(join(temp, "public-db.server.mjs")));
const token = "qa-isolated-token";
const prefix = "QA_" + Date.now();
const dashboard = () => admin.loadDashboard(token);
const find = (rows, id) => rows.find((row) => row.id === id);
let checks = 0;
const check = (label) => {
  checks++;
  console.log("PASS", label);
};
try {
  await sql`ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS coffee_interest text`;
  await assert.rejects(() => admin.loadDashboard("invalid"), /session/);
  check(
    "Test authorization guard rejects an invalid token (JWT verification tested separately)",
  );
  const outcomes = await Promise.allSettled([
    (async () => {
      if (!process.env.TONA_QA_STORAGE_FILE) return;
      await assert.rejects(
        () =>
          admin.storeAdminImage({
            token,
            contentType: "image/png",
            base64: Buffer.from("not an image").toString("base64"),
          }),
        /valid/,
      );
      const png =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2ioAAAAASUVORK5CYII=";
      const media = await admin.storeAdminImage({
        token,
        contentType: "image/png",
        base64: png,
      });
      const res = await fetch(media.url);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get("content-type"), "image/png");
      assert.equal(
        Buffer.from(await res.arrayBuffer()).toString("base64"),
        png,
      );
      check("Authenticated image upload and public image retrieval work");
    })(),
    (async () => {
      const product = {
        token,
        name: prefix + " Coffee",
        region: "Guji",
        process: "Natural",
        description: "Complete product description",
        tastingNotes: ["Cocoa", "Berry"],
        altitude: "1800m",
        imageUrl: "https://example.com/coffee.jpg",
        status: "draft",
        isAvailable: true,
        isFeatured: true,
      };
      const created = await admin.upsertProduct(product);
      assert.ok(!find((await pub.loadPublicCatalog()).products, created.id));
      check("Draft product remains hidden");
      await admin.upsertProduct({
        ...product,
        id: created.id,
        status: "published",
        name: prefix + " Edited Coffee",
      });
      let coffee = find((await pub.loadPublicCatalog()).products, created.id);
      assert.equal(coffee.name, prefix + " Edited Coffee");
      assert.deepEqual(coffee.tastingNotes, ["Cocoa", "Berry"]);
      assert.equal(coffee.imageUrl, product.imageUrl);
      check("Published product edits and image reach the public catalogue");
      await admin.upsertProduct({
        ...product,
        id: created.id,
        status: "published",
        isAvailable: false,
      });
      assert.ok(!find((await pub.loadPublicCatalog()).products, created.id));
      check("Unavailable product disappears publicly");
      await admin.upsertProduct({
        ...product,
        id: created.id,
        status: "archived",
      });
      assert.ok(!find((await pub.loadPublicCatalog()).products, created.id));
      check("Archived product stays hidden");
      await admin.deleteRecord({ token, entity: "products", id: created.id });
      assert.ok(!find((await dashboard()).products, created.id));
      check("Product delete removes only the test product");
      await assert.rejects(
        () => admin.upsertProduct({ ...product, id: created.id }),
        /no longer exists/,
      );
      check("Stale product edit fails clearly");
    })(),
    (async () => {
      const event = {
        token,
        title: prefix + " Event",
        summary: "Summary",
        description: "Full event description",
        eventDate: new Date(Date.now() + 86400000).toISOString(),
        location: "Addis Ababa",
        capacity: 3,
        coverImageUrl: "https://example.com/event.jpg",
        status: "published",
        registrationOpen: true,
      };
      const ev = await admin.upsertEvent(event);
      assert.equal(
        find((await pub.loadPublicCatalog()).events, ev.id).registrationOpen,
        true,
      );
      check(
        "Published event and registration settings reach the public catalogue",
      );
      const registration = {
        eventId: ev.id,
        fullName: prefix + " Guest",
        phone: "0903767778",
        email: null,
        guestCount: 2,
        notes: "Accessibility note preserved",
      };
      const results = await Promise.allSettled([
        pub.createEventRegistration(registration),
        pub.createEventRegistration({
          ...registration,
          fullName: prefix + " Second guest",
        }),
      ]);
      assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
      check("Concurrent registration cannot overbook capacity");
      const reg = results.find((r) => r.status === "fulfilled").value;
      const savedReg = find((await dashboard()).registrations, reg.id);
      assert.equal(savedReg.notes, registration.notes);
      assert.equal(
        find((await pub.loadPublicCatalog()).events, ev.id).registrationCount,
        2,
      );
      check("Registration notes preserved and counts use guests");
      await assert.rejects(
        () => admin.upsertEvent({ ...event, id: ev.id, capacity: 1 }),
        /capacity/,
      );
      check("Capacity cannot shrink below registered guests");
      await admin.changeRecordStatus({
        token,
        entity: "event_registrations",
        id: reg.id,
        status: "cancelled",
      });
      assert.equal(
        find((await pub.loadPublicCatalog()).events, ev.id).registrationCount,
        0,
      );
      check("Cancelling a registration releases guest capacity");
      const full = await pub.createEventRegistration({
        ...registration,
        guestCount: 3,
      });
      assert.equal(
        find((await pub.loadPublicCatalog()).events, ev.id).registrationOpen,
        false,
      );
      check("Full event closes publicly");
      await assert.rejects(
        () =>
          admin.changeRecordStatus({
            token,
            entity: "event_registrations",
            id: reg.id,
            status: "confirmed",
          }),
        /capacity/,
      );
      check("Reactivating a cancelled registration cannot overbook");
      await assert.rejects(
        () => admin.deleteRecord({ token, entity: "events", id: ev.id }),
        /registrations/,
      );
      check("Events with registrations cannot be deleted");
      await admin.upsertEvent({ ...event, id: ev.id, status: "completed" });
      assert.equal(
        find((await pub.loadPublicCatalog()).events, ev.id).status,
        "completed",
      );
      check("Completed event moves to public completed events");
      await admin.upsertEvent({
        ...event,
        id: ev.id,
        eventDate: new Date(Date.now() - 86400000).toISOString(),
      });
      assert.equal(
        find((await pub.loadPublicCatalog()).events, ev.id).registrationOpen,
        false,
      );
      await assert.rejects(
        () => pub.createEventRegistration(registration),
        /closed|full/,
      );
      check("Past events reject registrations on server and public catalogue");
      await admin.deleteRecord({
        token,
        entity: "event_registrations",
        id: full.id,
      });
      await admin.deleteRecord({
        token,
        entity: "event_registrations",
        id: reg.id,
      });
      await admin.deleteRecord({ token, entity: "events", id: ev.id });
      check("Registration and empty-event deletes work");
    })(),
    (async () => {
      const existingNumbers = new Set(
        (await pub.loadPublicLocations()).map((x) => x.number),
      );
      let firstNumber = 9000;
      while (
        existingNumbers.has(String(firstNumber)) ||
        existingNumbers.has(String(firstNumber + 1))
      )
        firstNumber += 2;
      const first = String(firstNumber),
        second = String(firstNumber + 1);
      const location = {
        token,
        number: first,
        name: prefix + " Store",
        address: "Test address",
        note: "Stock note",
        directions: "https://maps.google.com/?q=8.99,38.78",
        logoUrl: "https://example.com/logo.png",
        phone: "0903767778",
        instagram: "https://www.instagram.com/test_store/",
        latitude: 8.99,
        longitude: 38.78,
      };
      const loc = await admin.upsertLocation(location);
      let places = await pub.loadPublicLocations();
      assert.equal(find(places, loc.id).latitude, 8.99);
      assert.equal(find(places, loc.id).instagram, location.instagram);
      check("New location logo, contacts and coordinates reach public data");
      const secondLoc = await admin.upsertLocation({
        ...location,
        number: second,
        name: prefix + " Second Store",
      });
      await Promise.all([
        admin.upsertLocation({
          ...location,
          id: loc.id,
          address: "Edited first address",
        }),
        admin.upsertLocation({
          ...location,
          id: secondLoc.id,
          number: second,
          address: "Edited second address",
        }),
      ]);
      places = await pub.loadPublicLocations();
      assert.equal(find(places, loc.id).address, "Edited first address");
      assert.equal(find(places, secondLoc.id).address, "Edited second address");
      check("Concurrent location edits do not erase each other");
      await assert.rejects(
        () => admin.upsertLocation({ ...location, number: second }),
        /number/,
      );
      check("Duplicate location numbers rejected");
      await admin.removeLocation({ token, id: loc.id });
      assert.ok(!find(await pub.loadPublicLocations(), loc.id));
      assert.ok(find(await pub.loadPublicLocations(), secondLoc.id));
      await admin.removeLocation({ token, id: secondLoc.id });
      check("Location delete preserves other stores");
    })(),
    (async () => {
      for (const size of ["1kg", "500g", "250g", "custom"]) {
        const q = await pub.createQuotationRequest({
          packageSize: size,
          format: "Medium Bean",
          brandName: "Customer brand",
          customerName: prefix + " Customer",
          company: "Test company",
          phone: "0903767778",
          email: null,
          monthlyVolume: "25kg",
          message: "Complete quotation message",
        });
        const saved = find((await dashboard()).quotationRequests, q.id);
        assert.equal(saved.package_size, size);
        assert.equal(saved.brand_name, "Customer brand");
        await admin.changeRecordStatus({
          token,
          entity: "quotation_requests",
          id: q.id,
          status: "quoted",
        });
        assert.equal(
          find((await dashboard()).quotationRequests, q.id).status,
          "quoted",
        );
        await admin.deleteRecord({
          token,
          entity: "quotation_requests",
          id: q.id,
        });
      }
      check(
        "All quotation packages preserve form details, status updates and deletes",
      );
    })(),
    (async () => {
      const contact = await pub.createContactRequest({
        fullName: prefix + " Contact",
        organization: "Organization",
        phone: "0903767778",
        email: null,
        requestType: "Export enquiry",
        coffeeInterest: "Export",
        message: "A long complete customer message",
      });
      assert.equal(
        find((await dashboard()).contactRequests, contact.id).coffee_interest,
        "Export",
      );
      await admin.changeRecordStatus({
        token,
        entity: "contact_requests",
        id: contact.id,
        status: "resolved",
      });
      assert.equal(
        find((await dashboard()).contactRequests, contact.id).status,
        "resolved",
      );
      await admin.deleteRecord({
        token,
        entity: "contact_requests",
        id: contact.id,
      });
      check("Contact interest and message preserved, status and delete work");
      await assert.rejects(
        () =>
          admin.changeRecordStatus({
            token,
            entity: "contact_requests",
            id: contact.id,
            status: "resolved",
          }),
        /no longer exists/,
      );
      await assert.rejects(
        () =>
          admin.deleteRecord({
            token,
            entity: "contact_requests",
            id: contact.id,
          }),
        /no longer exists/,
      );
      check("Stale request updates and deletes fail clearly");
    })(),
    (async () => {
      const business = await pub.createBusinessInquiry({
        organization: prefix + " Hosted Event",
        contactPerson: "Test host",
        phone: "0903767778",
        email: null,
        businessType: "Corporate event",
        coffeeInterest: "Brew bar",
        estimatedQuantity: "30",
        message: "Date, service format and full location details",
      });
      assert.equal(
        find((await dashboard()).businessInquiries, business.id).message,
        "Date, service format and full location details",
      );
      await admin.changeRecordStatus({
        token,
        entity: "business_inquiries",
        id: business.id,
        status: "qualified",
      });
      assert.equal(
        find((await dashboard()).businessInquiries, business.id).status,
        "qualified",
      );
      await admin.deleteRecord({
        token,
        entity: "business_inquiries",
        id: business.id,
      });
      check("Hosted-event inquiry details, status and delete work");
    })(),
  ]);
  const failures = outcomes.filter((outcome) => outcome.status === "rejected");
  for (const failure of failures) console.error(failure.reason);
  assert.equal(failures.length, 0, `${failures.length} test groups failed`);
  console.log(
    `${checks} integration checks passed on the isolated branch. No outbound notifications sent.`,
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}
