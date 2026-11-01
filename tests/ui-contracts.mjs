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
// Exercise the real enquiry handler with a server stub: contact details must survive the form boundary.
const siteSource = readFileSync("src/components/site/ReferenceSite.tsx", "utf8");
const handlerSource = siteSource.slice(siteSource.indexOf("async function submitRequestForm("), siteSource.indexOf("\nasync function ", siteSource.indexOf("async function submitRequestForm(") + 10));
const handlerJs = ts.transpileModule(handlerSource, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
let captured;
const submit = new Function("FormData", "formText", "optionalFormText", "submitContactRequest", "prepareWhatsAppWindow", "finishWhatsAppWindow", handlerJs + ";return submitRequestForm;")(
  class { constructor() {} },
  (_, key) => ({ "full-name": "Customer", phone: "0903767778", email: "customer@example.com", "request-type": "Export enquiry", "coffee-interest": "Export", message: "Please send details" }[key] || ""),
  (_, key) => ({ email: "customer@example.com", organization: "Company" }[key] || null),
  async ({ data }) => { captured = data; return { emailSent: false, whatsappSent: false }; },
  () => null, () => {},
);
await submit({ preventDefault() {}, currentTarget: {}, nativeEvent: {} }, () => {});
assert.equal(captured.phone, "0903767778");
assert.equal(captured.email, "customer@example.com");
assert.equal(pub.contactInput.safeParse(captured).success, true);

assert.equal(pub.locationRequestInput.safeParse({ area: "Bole" }).success, true);
assert.equal(pub.locationRequestInput.parse({ area: " Bole ", venue: " " }).area, "Bole");
assert.equal(pub.locationRequestInput.safeParse({ area: " " }).success, false);
assert.equal(pub.locationRequestInput.safeParse({ area: "a".repeat(181) }).success, false);
assert.equal(helpers.exports.requestView({ request_type: "location_request" }), "locationRequests");
assert.equal(helpers.exports.requestView({ request_type: "feedback_general" }), "feedback");
assert.equal(helpers.exports.requestView({ request_type: "Retail order" }), "contacts");
const areaHandlerSource = siteSource.slice(siteSource.indexOf("async function submitLocationRequestForm("), siteSource.indexOf("async function submitRequestForm("));
const areaHandlerJs = ts.transpileModule(areaHandlerSource, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
let locationSaved, locationReset = false, whatsappFinished = false;
const submitArea = new Function("FormData", "formText", "optionalFormText", "submitLocationRequest", "prepareWhatsAppWindow", "finishWhatsAppWindow", areaHandlerJs + ";return submitLocationRequestForm;")(
  class {}, () => "Bole", () => "Local café",
  async ({ data }) => { locationSaved = data; return { whatsappSent: false }; },
  () => null, () => { whatsappFinished = true; },
);
await submitArea({ preventDefault() {}, currentTarget: { querySelector() { return { disabled: false }; }, reset() { locationReset = true; } } }, () => {});
assert.deepEqual(locationSaved, { area: "Bole", venue: "Local café" });
assert.equal(locationReset, true);
assert.equal(whatsappFinished, true);
