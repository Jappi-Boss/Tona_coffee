import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .nullable()
  .default(null);

const registrationInput = z.object({
  eventId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(200).optional().nullable().default(null),
  guestCount: z.number().int().min(1).max(10),
  notes: optionalText,
});

const businessInput = z.object({
  organization: z.string().trim().min(2).max(180),
  contactPerson: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(200).optional().nullable().default(null),
  businessType: optionalText,
  coffeeInterest: optionalText,
  estimatedQuantity: optionalText,
  message: optionalText,
});

const contactInput = z.object({
  fullName: z.string().trim().min(2).max(120),
  organization: optionalText,
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(200).optional().nullable().default(null),
  requestType: z.string().trim().min(2).max(120),
  coffeeInterest: optionalText,
  message: z.string().trim().min(3).max(3000),
});

const locationRequestInput = z.object({
  channel: z.enum(["email", "whatsapp"]).default("whatsapp"),
  area: z.string().trim().min(2).max(180),
  venue: z.string().trim().max(180).optional().nullable().default(null),
});

const feedbackInput = z.object({
  channel: z.enum(["email", "whatsapp"]).default("email"),
  fullName: z.string().trim().min(2).max(120),
  contact: z.string().trim().max(200).refine(
    (value) => z.string().email().safeParse(value).success || /^[+\d][\d\s().-]{6,39}$/.test(value),
    "Enter a valid phone number or email address.",
  ),
  feedbackType: z.enum(["Rate your coffee", "General feedback", "Report a problem"]),
  rating: z.number().int().min(0).max(5),
  product: optionalText,
  purchaseLocation: optionalText,
  comment: z.string().trim().min(3).max(2000),
}).refine((value) => value.feedbackType !== "Rate your coffee" || value.rating > 0, {
  message: "Choose a star rating for your coffee.", path: ["rating"],
});

const orderInput = z.object({
  productId: z.string().uuid(),
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(200).optional().nullable().default(null),
  size: z.string().trim().min(1).max(40),
  grind: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(50),
  notes: optionalText,
});

const quotationInput = z.object({
  channel: z.enum(["email", "whatsapp"]).default("whatsapp"),
  packageSize: z.enum(["1kg", "500g", "250g", "custom"]),
  format: z.string().trim().min(1).max(120),
  brandName: optionalText,
  customerName: z.string().trim().max(120).optional().default(""),
  company: optionalText,
  phone: z.string().trim().max(40).optional().default(""),
  email: z.string().trim().email().max(200).optional().nullable().default(null),
  monthlyVolume: optionalText,
  message: optionalText,
});

export const getPublicCatalog = createServerFn({ method: "GET" }).handler(
  async () => {
    const { loadPublicCatalog } = await import("./public-db.server");
    return loadPublicCatalog();
  },
);

export const getPublicLocations = createServerFn({ method: "GET" }).handler(
  async () => {
    const { loadPublicLocations } = await import("./public-db.server");
    return loadPublicLocations();
  },
);

export const submitEventRegistration = createServerFn({ method: "POST" })
  .validator(registrationInput)
  .handler(async ({ data }) => {
    const { createEventRegistration } = await import("./public-db.server");
    return createEventRegistration(data);
  });

export const submitBusinessInquiry = createServerFn({ method: "POST" })
  .validator(businessInput)
  .handler(async ({ data }) => {
    const { createBusinessInquiry } = await import("./public-db.server");
    return createBusinessInquiry(data);
  });

export const submitContactRequest = createServerFn({ method: "POST" })
  .validator(contactInput.extend({ channel: z.enum(["email", "whatsapp"]).default("email") }))
  .handler(async ({ data }) => {
    const { createContactRequest } = await import("./public-db.server");
    return createContactRequest(data);
  });

export const emailContactRequest = createServerFn({ method: "POST" })
  .validator(contactInput)
  .handler(async ({ data }) => {
    const { sendEnquiryEmail } = await import("./notifications.server");
    return sendEnquiryEmail({
      title: "New Tona Coffee enquiry",
      subject: "New Tona Coffee enquiry",
      customerEmail: data.email,
      fields: [
        { label: "Name", value: data.fullName },
        { label: "Phone", value: data.phone },
        { label: "Email", value: data.email },
        { label: "Organization", value: data.organization },
        { label: "Request type", value: data.requestType },
        { label: "Coffee interest", value: data.coffeeInterest },
        { label: "Message", value: data.message },
      ],
      whatsappMessage: "",
    });
  });

export const submitLocationRequest = createServerFn({ method: "POST" })
  .validator(locationRequestInput)
  .handler(async ({ data }) => {
    const { createContactRequest } = await import("./public-db.server");
    return createContactRequest({
      channel: data.channel,
      fullName: "Location request",
      organization: data.venue,
      phone: "",
      email: null,
      requestType: "location_request",
      coffeeInterest: data.area,
      message: [`Area: ${data.area}`, data.venue ? `Shop or café: ${data.venue}` : ""].filter(Boolean).join("\n"),
    });
  });

export const submitFeedback = createServerFn({ method: "POST" })
  .validator(feedbackInput)
  .handler(async ({ data }) => {
    const { createContactRequest } = await import("./public-db.server");
    const isEmail = z.string().email().safeParse(data.contact).success;
    return createContactRequest({
      channel: data.channel,
      fullName: data.fullName,
      organization: null,
      phone: isEmail ? "" : data.contact,
      email: isEmail ? data.contact : null,
      requestType: data.feedbackType === "Report a problem" ? "feedback_problem" : data.feedbackType === "Rate your coffee" ? "feedback_rating" : "feedback_general",
      coffeeInterest: data.product,
      message: [
        `Feedback: ${data.feedbackType}`,
        data.feedbackType === "Rate your coffee" ? `Rating: ${data.rating}/5` : "",
        data.product ? `Product: ${data.product}` : "",
        data.purchaseLocation ? `Purchase location: ${data.purchaseLocation}` : "",
        data.comment,
      ].filter(Boolean).join("\n"),
    });
  });

export const submitOrder = createServerFn({ method: "POST" })
  .validator(orderInput)
  .handler(async ({ data }) => {
    const { createOrder } = await import("./public-db.server");
    return createOrder(data);
  });

export const submitQuotation = createServerFn({ method: "POST" })
  .validator(quotationInput)
  .handler(async ({ data }) => {
    const { createQuotationRequest } = await import("./public-db.server");
    return createQuotationRequest(data);
  });

export type PublicCatalog = Awaited<ReturnType<typeof getPublicCatalog>>;
export type PublicProduct = PublicCatalog["products"][number];
export type PublicEvent = PublicCatalog["events"][number];
export type PublicStockist = Awaited<
  ReturnType<typeof getPublicLocations>
>[number];
