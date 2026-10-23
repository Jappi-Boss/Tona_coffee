import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const authInput = z.object({ token: z.string().min(20) });

const statusInput = authInput.extend({
  entity: z.enum([
    "orders",
    "event_registrations",
    "business_inquiries",
    "contact_requests",
    "quotation_requests",
  ]),
  id: z.string().uuid(),
  status: z.string().min(1).max(40),
});

const productInput = authInput.extend({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  region: z.string().min(2).max(120),
  process: z.string().min(2).max(120),
  description: z.string().max(2000),
  tastingNotes: z.array(z.string().min(1).max(80)).max(12),
  altitude: z.string().max(120).nullable(),
  imageUrl: z
    .string()
    .trim()
    .max(2000)
    .url("Enter a valid image URL.")
    .refine((url) => url.startsWith("https://"), {
      message: "The image URL must use HTTPS.",
    })
    .nullable(),
  status: z.enum(["draft", "published", "archived"]),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
});

const deleteInput = authInput.extend({
  entity: z.enum([
    "products",
    "events",
    "orders",
    "event_registrations",
    "business_inquiries",
    "contact_requests",
    "quotation_requests",
  ]),
  id: z.string().uuid(),
});

const eventInput = authInput.extend({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(160),
  summary: z.string().max(500),
  description: z.string().max(3000),
  eventDate: z.string().datetime({ offset: true }),
  location: z.string().min(2).max(240),
  capacity: z.number().int().positive().nullable(),
  coverImageUrl: z
    .string()
    .trim()
    .max(2000)
    .url()
    .refine((url) => url.startsWith("https://"), "Use an HTTPS image URL.")
    .nullable(),
  status: z.enum(["draft", "published", "cancelled", "completed"]),
  registrationOpen: z.boolean(),
});

const locationInput = authInput
  .extend({
    id: z.string().trim().min(1).max(120).optional(),
    number: z
      .string()
      .trim()
      .regex(/^\d{1,4}$/, "Use a numeric location number."),
    latitude: z.number().min(-85).max(85).nullable().default(null),
    longitude: z.number().min(-180).max(180).nullable().default(null),
    name: z.string().trim().min(2).max(120),
    address: z.string().trim().max(240),
    logoUrl: z
      .string()
      .trim()
      .max(2000)
      .refine(
        (url) =>
          !url ||
          url.startsWith("https://") ||
          /^\/stockists\/[a-z0-9.-]+$/i.test(url),
        "Use an HTTPS logo URL.",
      )
      .default(""),
    phone: z
      .string()
      .trim()
      .max(40)
      .refine(
        (value) => !value || /^[+0-9() .-]{7,40}$/.test(value),
        "Enter a valid phone number.",
      )
      .default(""),
    instagram: z
      .string()
      .trim()
      .max(2000)
      .refine((value) => {
        if (!value) return true;
        try {
          const url = new URL(value);
          return (
            url.protocol === "https:" &&
            ["instagram.com", "www.instagram.com"].includes(url.hostname)
          );
        } catch {
          return false;
        }
      }, "Enter an HTTPS Instagram profile URL.")
      .default(""),
    note: z.string().trim().max(240),
    directions: z
      .string()
      .trim()
      .url("Enter a valid directions URL.")
      .refine((url) => url.startsWith("https://"), {
        message: "The directions link must use HTTPS.",
      }),
  })
  .refine(
    (value) => (value.latitude === null) === (value.longitude === null),
    "Enter both latitude and longitude, or leave both blank.",
  );

const locationDeleteInput = authInput.extend({
  id: z.string().trim().min(1).max(120),
});

const createAdminUserInput = authInput.extend({
  userId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  role: z.enum(["admin", "editor"]),
});

const resetAdminUserPasswordInput = authInput.extend({
  userId: z.string().uuid(),
});

export const getAdminDashboard = createServerFn({ method: "POST" })
  .validator(authInput)
  .handler(async ({ data }) => {
    const { loadDashboard } = await import("./admin-db.server");
    return loadDashboard(data.token);
  });

export const updateRecordStatus = createServerFn({ method: "POST" })
  .validator(statusInput)
  .handler(async ({ data }) => {
    const { changeRecordStatus } = await import("./admin-db.server");
    return changeRecordStatus(data);
  });

export const saveProduct = createServerFn({ method: "POST" })
  .validator(productInput)
  .handler(async ({ data }) => {
    const { upsertProduct } = await import("./admin-db.server");
    return upsertProduct(data);
  });

export const saveEvent = createServerFn({ method: "POST" })
  .validator(eventInput)
  .handler(async ({ data }) => {
    const { upsertEvent } = await import("./admin-db.server");
    return upsertEvent(data);
  });

export const saveLocation = createServerFn({ method: "POST" })
  .validator(locationInput)
  .handler(async ({ data }) => {
    const { upsertLocation } = await import("./admin-db.server");
    return upsertLocation(data);
  });

export const deleteLocation = createServerFn({ method: "POST" })
  .validator(locationDeleteInput)
  .handler(async ({ data }) => {
    const { removeLocation } = await import("./admin-db.server");
    return removeLocation(data);
  });

export const deleteAdminRecord = createServerFn({ method: "POST" })
  .validator(deleteInput)
  .handler(async ({ data }) => {
    const { deleteRecord } = await import("./admin-db.server");
    return deleteRecord(data);
  });

export const createAdminUser = createServerFn({ method: "POST" })
  .validator(createAdminUserInput)
  .handler(async ({ data }) => {
    const { createManagedUser } = await import("./admin-db.server");
    return createManagedUser(data);
  });

export const resetAdminUserPassword = createServerFn({ method: "POST" })
  .validator(resetAdminUserPasswordInput)
  .handler(async ({ data }) => {
    const { resetManagedUserPassword } = await import("./admin-db.server");
    return resetManagedUserPassword(data);
  });

export const recordAdminUserPasswordReset = createServerFn({ method: "POST" })
  .validator(resetAdminUserPasswordInput)
  .handler(async ({ data }) => {
    const { recordManagedUserPasswordReset } =
      await import("./admin-db.server");
    return recordManagedUserPasswordReset(data);
  });

export const uploadAdminImage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string().min(20),
      contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      base64: z.string().min(4).max(2_800_000),
    }),
  )
  .handler(async ({ data }) => {
    const { storeAdminImage } = await import("./admin-db.server");
    return storeAdminImage(data);
  });
