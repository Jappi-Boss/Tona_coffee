import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { z } from "zod";
import ts from "typescript";
import { normalizeStockists, safeSocialUrl } from "../src/lib/locations.ts";
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
  return new Function("z", "safeSocialUrl", js + `return {${names.join(",")}};`)(z, safeSocialUrl);
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
  "feedbackInput",
  "locationRequestInput",
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
const socials = {
  facebook: "https://www.facebook.com/tona",
  instagram: "https://www.instagram.com/tona/",
  tiktok: "https://www.tiktok.com/@tona",
};
const locationWithSocials = admin.locationInput.parse({ ...loc, ...socials });
const [publicLocation] = normalizeStockists([locationWithSocials]);
for (const [platform, url] of Object.entries(socials)) {
  assert.equal(publicLocation[platform], url);
  assert.equal(admin.locationInput.parse(loc)[platform], "");
  assert.equal(admin.locationInput.safeParse({ ...loc, [platform]: "https://example.com/tona" }).success, false);
}
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
assert.ok(
  source.includes("stockist.latitude !== null && stockist.longitude !== null"),
);
assert.ok(!source.includes("KNOWN_MAP_POSITIONS"));
const adminUI = readFileSync("src/routes/30team-portal-10.tsx", "utf8");
assert.ok(adminUI.includes("View details"));
assert.ok(adminUI.includes('name="latitude"'));
assert.ok(adminUI.includes('name="longitude"'));
console.log(
  "UI/API contracts passed: optional fields, coordinate pairs, event validation, inquiry payload and full-detail controls.",
);

// Reference quotation form has package, roast format and message only.
const minimalQuote = pub.quotationInput.parse({packageSize:"1kg",format:"Medium bean",message:"25kg per month"});
assert.equal(minimalQuote.customerName, "");
assert.equal(minimalQuote.phone, "");
assert.equal(minimalQuote.message, "25kg per month");
assert.equal(pub.quotationInput.safeParse({packageSize:"invalid",format:""}).success,false);

const feedback = { fullName: "Customer", contact: "customer@example.com", feedbackType: "Rate your coffee", rating: 5, product: "House Blend", purchaseLocation: "Allmart", comment: "Excellent coffee" };
assert.equal(pub.feedbackInput.parse(feedback).rating, 5);
assert.equal(pub.feedbackInput.safeParse({ ...feedback, rating: 0 }).success, false);
assert.equal(pub.feedbackInput.safeParse({ ...feedback, rating: 6 }).success, false);
assert.equal(pub.feedbackInput.safeParse({ ...feedback, contact: "invalid" }).success, false);
assert.equal(pub.feedbackInput.safeParse({ ...feedback, contact: "+251986212224" }).success, true);
assert.equal(pub.feedbackInput.safeParse({ ...feedback, feedbackType: "Report a problem", rating: 0 }).success, true);
const helpersJs = ts.transpileModule(readFileSync("src/lib/admin-requests.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const helpers = { exports: {} };
new Function("exports", helpersJs)(helpers.exports);
assert.equal(helpers.exports.isFeedbackRequest({ request_type: "Feedback" }), true);
assert.equal(helpers.exports.isFeedbackRequest({ request_type: "feedback_problem" }), true);
assert.equal(helpers.exports.isFeedbackRequest({ request_type: "Export enquiry" }), false);
assert.equal(helpers.exports.requestLabel("feedback_rating"), "Coffee rating");
// Enquiries hand off only to the chosen channel and never save an admin record.
const siteSource = readFileSync("src/components/site/ReferenceSite.tsx", "utf8");
const handlerSource = siteSource.slice(siteSource.indexOf("async function submitRequestForm("), siteSource.indexOf("\nasync function submitHostedEventForm"));
const handlerJs = ts.transpileModule(handlerSource, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
for (const channel of ["email", "whatsapp", "email-failure"]) {
  const browser = { location: { href: "" } };
  let resetCount = 0;
  let whatsapp = "";
  let status = "";
  const submit = new Function("FormData", "formText", "prepareWhatsAppWindow", "finishWhatsAppWindow", "window", "submitContactRequest", "optionalFormText", handlerJs + ";return submitRequestForm;")(
    class {}, (_, key) => ({ "full-name": "Customer", phone: "0903767778", email: "customer@example.com", organization: "Company", "request-type": "Retail order", "coffee-interest": "House Blend", message: "Please send details" }[key] || ""),
    () => null, (_, message) => { whatsapp = message; }, browser,
    async ({data}) => { if (channel === "email-failure") throw new Error("Delivery failed"); browser.email = data; return {ok:true,emailSent:true}; }, (_, key) => ({email:"customer@example.com", organization:"Company", "coffee-interest":"House Blend"}[key] || null),
  );
  await submit({ preventDefault() {}, currentTarget: { reset() { resetCount++; } }, nativeEvent: { submitter: { getAttribute: () => channel === "email-failure" ? "email" : channel } } }, value => { status = value; });
  if (channel === "email-failure") {
    assert.equal(resetCount, 0);
    assert.equal(status, "Delivery failed");
    continue;
  }
  assert.equal(resetCount, 1);
  if (channel === "email") {
    assert.equal(browser.location.href, "");
    assert.equal(browser.email.phone, "0903767778");
    assert.equal(whatsapp, "");
  } else {
    assert.equal(browser.location.href, "");
    assert.match(whatsapp, /customer@example.com/);
    assert.match(whatsapp, /Please send details/);
  }
  assert.match(status, channel === "email" ? /emailed/ : /WhatsApp/);
  assert.equal(browser.email.channel, channel);
}

assert.equal(pub.locationRequestInput.safeParse({ area: "Bole" }).success, true);
assert.equal(pub.locationRequestInput.parse({ area: " Bole ", venue: " " }).area, "Bole");
assert.equal(pub.locationRequestInput.safeParse({ area: " " }).success, false);
assert.equal(pub.locationRequestInput.safeParse({ area: "a".repeat(181) }).success, false);
assert.equal(helpers.exports.requestView({ request_type: "location_request" }), "locationRequests");
assert.equal(helpers.exports.requestView({ request_type: "feedback_general" }), "feedback");
assert.equal(helpers.exports.requestView({ request_type: "Retail order" }), "contacts");
const areaHandlerSource = siteSource.slice(siteSource.indexOf("async function submitLocationRequestForm("), siteSource.indexOf("async function submitRequestForm("));
const areaHandlerJs = ts.transpileModule(areaHandlerSource, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
for (const channel of ["whatsapp", "email"]) {
  let locationSaved, locationReset = false, whatsappFinished = false;
  const submitArea = new Function("FormData", "formText", "optionalFormText", "submitLocationRequest", "prepareWhatsAppWindow", "finishWhatsAppWindow", areaHandlerJs + ";return submitLocationRequestForm;")(
    class {}, () => "Bole", () => "Local café",
    async ({ data }) => { locationSaved = data; return { emailSent: true, whatsappSent: false }; },
    () => null, () => { whatsappFinished = true; },
  );
  await submitArea({
    preventDefault() {},
    nativeEvent: { submitter: { getAttribute: () => channel } },
    currentTarget: { querySelectorAll() { return []; }, reset() { locationReset = true; } },
  }, () => {});
  assert.deepEqual(locationSaved, { area: "Bole", venue: "Local café", channel });
  assert.equal(locationReset, true);
  assert.equal(whatsappFinished, channel === "whatsapp");
}

// Exercise all feedback types through API mapping, dashboard persistence and email.
const notificationJs = ts.transpileModule(readFileSync("src/lib/notifications.server.ts", "utf8").replaceAll("export ", ""), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const dbSource = readFileSync("src/lib/public-db.server.ts", "utf8");
const contactJs = ts.transpileModule(dbSource.slice(dbSource.indexOf("export async function createContactRequest"), dbSource.indexOf("export async function createOrder")).replace("export ", ""), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const apiSource = readFileSync("src/lib/public-api.ts", "utf8");
const feedbackHandlerJs = ts.transpileModule(apiSource.slice(apiSource.indexOf("export const submitFeedback"), apiSource.indexOf("export const submitOrder")).replace("export ", "").replace('    const { createContactRequest } = await import("./public-db.server");', ""), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
for (const [feedbackType, rating, channel = "email"] of [["Rate your coffee", 4], ["General feedback", 0], ["Report a problem", 0], ["Rate your coffee", 4, "whatsapp"]]) {
  let mail, whatsapp, stored;
  const notify = new Function("fetch", "process", "console", notificationJs + "; return sendSubmissionNotifications;")(
    async (url, request) => {
      assert.ok(stored, "Save feedback before sending");
      if (url.includes("resend.com")) mail = JSON.parse(request.body);
      else whatsapp = JSON.parse(request.body);
      return { ok: true };
    },
    { env: { RESEND_API_KEY: "test-only", WHATSAPP_ACCESS_TOKEN: "test-only", WHATSAPP_PHONE_NUMBER_ID: "test", WHATSAPP_NOTIFICATION_TO: "test", RESEND_FROM_EMAIL: "Tona Coffee <website@tonacoffee.et>" } }, console,
  );
  const createContact = new Function("database", "sendSubmissionNotifications", contactJs + ";return createContactRequest;")(
    () => async (_, ...values) => { stored = values; return [{ id: "test-record" }]; }, notify,
  );
  const submit = new Function("createServerFn", "feedbackInput", "z", "createContactRequest", feedbackHandlerJs + ";return submitFeedback;")(
    () => ({ validator: schema => ({ handler: fn => input => fn({ data: schema.parse(input.data) }) }) }), pub.feedbackInput, z, createContact,
  );
  const result = await submit({ data: { ...feedback, feedbackType, rating, channel, comment: "Feedback delivery test" } });
  if (channel === "whatsapp") {
    assert.equal(result.whatsappSent, true);
    assert.equal(mail, undefined);
    assert.match(whatsapp.text.body, /Rating: 4\/5/);
    assert.equal(result.whatsappMessage, whatsapp.text.body);
    continue;
  }
  assert.equal(whatsapp, undefined);
  assert.equal(result.emailSent, true);
  assert.equal(mail.to, "info@tonacoffee.et");
  assert.ok(mail.subject.includes(feedbackType));
  assert.ok(mail.html.includes(feedbackType));
  assert.ok(mail.html.includes("Feedback delivery test"));
  assert.ok(stored.includes("Feedback delivery test") || stored.some(value => typeof value === "string" && value.includes("Feedback delivery test")));
  assert.equal(mail.html.includes("Rating: 4/5"), feedbackType === "Rate your coffee");
}
console.log("All three feedback types save and send email; non-rating feedback needs no stars (mocked services).");
