import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { z } from "zod";
import ts from "typescript";
function schemas(file, end, names) {
  const source = readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => !line.startsWith("import "))
    .join("\n")
    .split(end)[0];
  const js = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
  return new Function("z", js + `return {${names.join(",")}};`)(z);
}
const admin = schemas(
  "src/lib/admin-api.ts",
  "export const getAdminDashboard",
  ["productInput", "eventInput", "locationInput"],
);
const pub = schemas("src/lib/public-api.ts", "export const getPublicCatalog", [
  "registrationInput",
  "contactInput",
  "quotationInput",
  "businessInput",
]);
const token = "x".repeat(24);
const loc = {
  token,
  name: "Store",
  number: "04",
  address: "",
  note: "",
  directions: "https://maps.google.com/",
  logoUrl: "",
  phone: "",
  instagram: "",
};
assert.equal(admin.locationInput.parse(loc).latitude, null);
assert.equal(
  admin.locationInput.safeParse({ ...loc, latitude: 9, longitude: null })
    .success,
  false,
);
assert.equal(
  admin.locationInput.safeParse({ ...loc, latitude: 90, longitude: 38 })
    .success,
  false,
);
assert.equal(
  admin.locationInput.parse({ ...loc, latitude: 9, longitude: 38 }).longitude,
  38,
);
assert.equal(
  admin.locationInput.safeParse({ ...loc, instagram: "https://evil.example/" })
    .success,
  false,
);
assert.equal(
  admin.locationInput.safeParse({ ...loc, logoUrl: "javascript:alert(1)" })
    .success,
  false,
);
const ev = {
  token,
  title: "Event",
  summary: "Summary",
  description: "Details",
  eventDate: "2026-12-01T07:00:00.000Z",
  location: "Addis Ababa",
  capacity: 2,
  coverImageUrl: null,
  status: "published",
  registrationOpen: true,
};
assert.equal(admin.eventInput.safeParse({ ...ev, capacity: 0 }).success, false);
assert.equal(
  admin.eventInput.safeParse({ ...ev, eventDate: "not a date" }).success,
  false,
);
assert.equal(
  admin.eventInput.safeParse({
    ...ev,
    coverImageUrl: "http://unsafe.example/image.jpg",
  }).success,
  false,
);
assert.equal(admin.eventInput.parse(ev).capacity, 2);
const contact = pub.contactInput.parse({
  fullName: "Customer",
  phone: "0903767778",
  requestType: "Export enquiry",
  coffeeInterest: "Export",
  message: "A request",
});
assert.equal(contact.coffeeInterest, "Export");
assert.equal(contact.email, null);
assert.equal(
  pub.registrationInput.safeParse({
    eventId: crypto.randomUUID(),
    fullName: "Customer",
    phone: "0903767778",
    guestCount: 11,
  }).success,
  false,
);
assert.equal(
  pub.quotationInput.safeParse({
    packageSize: "invalid",
    format: "Medium Bean",
    customerName: "Customer",
    phone: "0903767778",
  }).success,
  false,
);
const source = readFileSync("src/components/site/ReferenceSite.tsx", "utf8");
assert.ok(source.includes("coffeeInterest,\n        message:"));
assert.ok(
  source.includes("stockist.latitude !== null && stockist.longitude !== null"),
);
assert.ok(!source.includes("KNOWN_MAP_POSITIONS"));
const adminUI = readFileSync("src/routes/admin.tsx", "utf8");
assert.ok(adminUI.includes("View details"));
assert.ok(adminUI.includes('name="latitude"'));
assert.ok(adminUI.includes('name="longitude"'));
console.log(
  "UI/API contracts passed: optional fields, coordinate pairs, event validation, inquiry payload and full-detail controls.",
);
