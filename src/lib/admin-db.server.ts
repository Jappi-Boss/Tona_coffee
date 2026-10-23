import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  STOCKISTS_SETTING_KEY,
  normalizeStockists,
  orderStockists,
} from "./locations";
import { ensureQuotationSchema } from "./quotation-schema.server";

const AUTH_JWKS_URL =
  process.env.NEON_AUTH_JWKS_URL ??
  "https://ep-falling-thunder-avg9v3nc.neonauth.c-11.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json";

const jwks = createRemoteJWKSet(new URL(AUTH_JWKS_URL));

const NEON_AUTH_URL =
  process.env.NEON_AUTH_URL ??
  "https://ep-falling-thunder-avg9v3nc.neonauth.c-11.us-east-1.aws.neon.tech/neondb/auth";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  return neon(connectionString);
}

async function requireAdmin(token: string) {
  const { payload } = await jwtVerify(token, jwks);
  if (!payload.sub) throw new Error("Invalid admin session.");

  const sql = database();
  const rows = await sql`
    SELECT u.email, u.name, a.role
    FROM neon_auth."user" u
    JOIN public.admin_allowlist a ON lower(a.email) = lower(u.email)
    WHERE u.id = ${payload.sub}::uuid
      AND a.is_active = true
      AND COALESCE(u.banned, false) = false
    LIMIT 1
  `;

  if (!rows[0])
    throw new Error("This account is not authorized for the Tona dashboard.");
  return {
    email: String(rows[0].email),
    name: String(rows[0].name ?? "Admin"),
    role: String(rows[0].role),
  };
}

async function requireSuperAdmin(token: string) {
  const admin = await requireAdmin(token);
  if (admin.role !== "super_admin")
    throw new Error("Only a super admin can manage dashboard users.");
  // Neon Auth's Admin plugin checks its own role claim. Keep it aligned with
  // the application's durable super-admin allowlist before admin operations.
  await database()`
    UPDATE neon_auth."user" u
    SET role = 'admin'
    FROM public.admin_allowlist a
    WHERE lower(a.email) = lower(u.email)
      AND lower(a.email) = lower(${admin.email})
      AND a.role = 'super_admin'
      AND COALESCE(u.role, '') <> 'admin'
  `;
  return admin;
}

export async function loadDashboard(token: string) {
  const admin = await requireAdmin(token);
  await ensureQuotationSchema();
  const sql = database();
  const [
    products,
    events,
    registrations,
    orders,
    quotationRequests,
    businessInquiries,
    contactRequests,
    locationSettings,
  ] = await Promise.all([
    sql`SELECT p.*, COUNT(v.id)::int AS variant_count FROM products p LEFT JOIN product_variants v ON v.product_id = p.id GROUP BY p.id ORDER BY p.sort_order, p.name`,
    sql`SELECT e.*, COUNT(r.id)::int AS registration_count, COALESCE(SUM(r.guest_count) FILTER (WHERE r.status <> 'cancelled'), 0)::int AS guest_count FROM events e LEFT JOIN event_registrations r ON r.event_id = e.id GROUP BY e.id ORDER BY e.event_date DESC`,
    sql`SELECT r.*, e.title AS event_title FROM event_registrations r JOIN events e ON e.id = r.event_id ORDER BY r.created_at DESC LIMIT 200`,
    sql`SELECT o.*, COALESCE(json_agg(json_build_object('productName', i.product_name, 'size', i.size, 'grind', i.grind, 'quantity', i.quantity, 'unitPrice', i.unit_price)) FILTER (WHERE i.id IS NOT NULL), '[]') AS items FROM orders o LEFT JOIN order_items i ON i.order_id = o.id GROUP BY o.id ORDER BY o.created_at DESC LIMIT 200`,
    sql`SELECT * FROM quotation_requests ORDER BY created_at DESC LIMIT 200`,
    sql`SELECT * FROM business_inquiries ORDER BY created_at DESC LIMIT 200`,
    sql`SELECT * FROM contact_requests ORDER BY created_at DESC LIMIT 200`,
    sql`SELECT value FROM public.site_settings WHERE key = ${STOCKISTS_SETTING_KEY} LIMIT 1`,
  ]);

  let users: Awaited<ReturnType<typeof listManagedUsers>> = [];
  if (admin.role === "super_admin") {
    users = await listManagedUsers();
  }

  return {
    admin,
    products,
    events,
    registrations,
    orders,
    quotationRequests,
    businessInquiries,
    contactRequests,
    locations: orderStockists(normalizeStockists(locationSettings[0]?.value)),
    users,
  };
}

async function listManagedUsers() {
  return database()`
    SELECT
      u.id,
      a.email,
      COALESCE(a.display_name, u.name, 'User') AS name,
      a.role,
      a.is_permanent,
      (a.is_active AND NOT COALESCE(u.banned, false)) AS is_active,
      COALESCE(a.created_at, u."createdAt") AS created_at
    FROM public.admin_allowlist a
    LEFT JOIN neon_auth."user" u ON lower(u.email) = lower(a.email)
    ORDER BY a.created_at DESC
  `;
}

type CreateManagedUserInput = {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: "admin" | "editor";
};

export async function createManagedUser(input: CreateManagedUserInput) {
  const actor = await requireSuperAdmin(input.token);
  const email = input.email.trim().toLowerCase();
  const sql = database();
  const authUser = await sql`
    SELECT id, email
    FROM neon_auth."user"
    WHERE id = ${input.userId}::uuid AND lower(email) = lower(${email})
    LIMIT 1
  `;
  if (!authUser[0])
    throw new Error("The newly created Neon Auth user could not be verified.");
  await sql`
    INSERT INTO public.admin_allowlist
      (email, display_name, role, is_permanent, is_active)
    VALUES
      (${email}, ${input.name.trim()}, ${input.role}, false, true)
    ON CONFLICT (email) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      role = EXCLUDED.role,
      is_active = true,
      updated_at = now()
  `;

  await sql`
    INSERT INTO audit_log (actor_email, action, entity_type, entity_id, details)
    VALUES (${actor.email}, 'created', 'admin_user', ${input.userId}, ${JSON.stringify({ email, role: input.role })}::jsonb)
  `;
  return { ok: true };
}

type ResetManagedUserPasswordInput = {
  token: string;
  userId: string;
};

export async function resetManagedUserPassword(
  input: ResetManagedUserPasswordInput,
) {
  await requireSuperAdmin(input.token);
  const sql = database();
  const target = await sql`
    SELECT a.email, a.is_permanent, a.is_active
    FROM public.admin_allowlist a
    JOIN neon_auth."user" u ON lower(u.email) = lower(a.email)
    WHERE u.id = ${input.userId}::uuid
    LIMIT 1
  `;
  if (!target[0]) throw new Error("That dashboard user was not found.");
  if (target[0]["is_permanent"])
    throw new Error("The permanent super-admin password cannot be reset here.");
  if (!target[0]["is_active"])
    throw new Error("That dashboard user is inactive.");
  return { ok: true };
}

export async function recordManagedUserPasswordReset(
  input: ResetManagedUserPasswordInput,
) {
  const actor = await requireSuperAdmin(input.token);
  const sql = database();
  await sql`
    INSERT INTO audit_log (actor_email, action, entity_type, entity_id)
    VALUES (${actor.email}, 'password_reset', 'admin_user', ${input.userId})
  `;
  return { ok: true };
}

export async function storeAdminImage(input: {
  token: string;
  contentType: string;
  base64: string;
}) {
  await requireAdmin(input.token);
  const bytes = Buffer.from(input.base64, "base64");
  if (!bytes.length || bytes.length > 2 * 1024 * 1024)
    throw new Error("Image must be smaller than 2 MB.");
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp =
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP";
  const extension =
    input.contentType === "image/jpeg" && isJpeg
      ? "jpg"
      : input.contentType === "image/png" && isPng
        ? "png"
        : input.contentType === "image/webp" && isWebp
          ? "webp"
          : null;
  if (!extension) throw new Error("Choose a valid JPG, PNG, or WebP image.");
  const endpoint = process.env["AWS_ENDPOINT_URL_S3"];
  if (
    !endpoint ||
    !process.env["AWS_ACCESS_KEY_ID"] ||
    !process.env["AWS_SECRET_ACCESS_KEY"]
  )
    throw new Error("Image storage is not configured.");
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const key = `images/${crypto.randomUUID()}.${extension}`;
  const bucket = "admin-media";
  const { FetchHttpHandler } = await import("@smithy/fetch-http-handler");
  const client = new S3Client({
    endpoint,
    region: process.env["AWS_REGION"] ?? "us-east-1",
    forcePathStyle: true,
    requestHandler: new FetchHttpHandler({ requestTimeout: 20_000 }),
    maxAttempts: 2,
  });
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return { url: `${endpoint.replace(/\/$/, "")}/${bucket}/${key}` };
}

type StatusChange = {
  token: string;
  entity:
    | "orders"
    | "event_registrations"
    | "business_inquiries"
    | "contact_requests"
    | "quotation_requests";
  id: string;
  status: string;
};

const allowedStatuses: Record<StatusChange["entity"], string[]> = {
  orders: ["new", "confirmed", "processing", "completed", "cancelled"],
  event_registrations: ["new", "confirmed", "attended", "cancelled"],
  business_inquiries: ["new", "contacted", "qualified", "closed", "lost"],
  contact_requests: ["new", "in_progress", "resolved", "spam"],
  quotation_requests: [
    "new",
    "contacted",
    "quoted",
    "won",
    "lost",
    "cancelled",
  ],
};

export async function changeRecordStatus(input: StatusChange) {
  const admin = await requireAdmin(input.token);
  if (!allowedStatuses[input.entity].includes(input.status))
    throw new Error("Unsupported status.");
  const sql = database();

  let rows;
  if (input.entity === "event_registrations") {
    const result = await sql.transaction([
      sql`SELECT e.id FROM events e JOIN event_registrations r ON r.event_id = e.id WHERE r.id = ${input.id}::uuid FOR UPDATE OF e`,
      sql`UPDATE event_registrations r SET status = ${input.status}, updated_at = now()
        FROM events e WHERE r.id = ${input.id}::uuid AND e.id = r.event_id
        AND (${input.status} = 'cancelled' OR e.capacity IS NULL OR
          (SELECT COALESCE(SUM(other.guest_count), 0) FROM event_registrations other WHERE other.event_id = e.id AND other.status <> 'cancelled' AND other.id <> r.id) + r.guest_count <= e.capacity)
        RETURNING r.id`,
    ]);
    rows = result[1];
  } else {
    // Entity names come from the fixed allowlist above, never raw user input.
    rows = await sql.query(
      `UPDATE ${input.entity} SET status = $1, updated_at = now() WHERE id = $2::uuid RETURNING id`,
      [input.status, input.id],
    );
  }
  if (!rows?.[0])
    throw new Error(
      "The record no longer exists, or this registration would exceed event capacity. Refresh and try again.",
    );

  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id, details) VALUES (${admin.email}, 'status_changed', ${input.entity}, ${input.id}, ${JSON.stringify({ status: input.status })}::jsonb)`;
  return { ok: true };
}

type ProductUpdate = {
  token: string;
  id?: string | undefined;
  name: string;
  region: string;
  process: string;
  description: string;
  tastingNotes: string[];
  altitude: string | null;
  imageUrl: string | null;
  status: "draft" | "published" | "archived";
  isAvailable: boolean;
  isFeatured: boolean;
};

export async function upsertProduct(input: ProductUpdate) {
  const admin = await requireAdmin(input.token);
  const sql = database();
  let id = input.id;
  if (id) {
    const rows =
      await sql`UPDATE products SET name = ${input.name}, region = ${input.region}, process = ${input.process}, description = ${input.description}, tasting_notes = ${input.tastingNotes}, altitude = ${input.altitude}, image_url = ${input.imageUrl}, status = ${input.status}, is_available = ${input.isAvailable}, is_featured = ${input.isFeatured}, updated_at = now() WHERE id = ${id}::uuid RETURNING id`;
    if (!rows[0])
      throw new Error(
        "This product no longer exists. Refresh the dashboard and try again.",
      );
    id = String(rows[0].id);
  } else {
    const slug = `${input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${crypto.randomUUID().slice(0, 8)}`;
    const rows =
      await sql`INSERT INTO products (slug, name, region, process, description, tasting_notes, altitude, image_url, status, is_available, is_featured, sort_order) VALUES (${slug}, ${input.name}, ${input.region}, ${input.process}, ${input.description}, ${input.tastingNotes}, ${input.altitude}, ${input.imageUrl}, ${input.status}, ${input.isAvailable}, ${input.isFeatured}, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM products)) RETURNING id`;
    id = String(rows[0].id);
  }
  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id) VALUES (${admin.email}, 'saved', 'product', ${id})`;
  return { ok: true, id, imageUrl: input.imageUrl };
}

type EventUpdate = {
  token: string;
  id?: string | undefined;
  title: string;
  summary: string;
  description: string;
  eventDate: string;
  location: string;
  capacity: number | null;
  coverImageUrl: string | null;
  status: "draft" | "published" | "cancelled" | "completed";
  registrationOpen: boolean;
};

export async function upsertEvent(input: EventUpdate) {
  const admin = await requireAdmin(input.token);
  const sql = database();
  let id = input.id;
  if (id) {
    const [, rows] = await sql.transaction([
      sql`SELECT id FROM events WHERE id = ${id}::uuid FOR UPDATE`,
      sql`UPDATE events SET title = ${input.title}, summary = ${input.summary}, description = ${input.description}, event_date = ${input.eventDate}::timestamptz, location = ${input.location}, capacity = ${input.capacity}, cover_image_url = ${input.coverImageUrl}, status = ${input.status}, registration_open = ${input.registrationOpen}, updated_at = now()
        WHERE id = ${id}::uuid AND (${input.capacity}::integer IS NULL OR ${input.capacity}::integer >= (SELECT COALESCE(SUM(guest_count), 0) FROM event_registrations WHERE event_id = ${id}::uuid AND status <> 'cancelled')) RETURNING id`,
    ]);
    if (!rows[0])
      throw new Error(
        "The event no longer exists, or capacity is below the number of registered guests.",
      );
  } else {
    const slug = `${input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${crypto.randomUUID().slice(0, 8)}`;
    const rows =
      await sql`INSERT INTO events (slug, title, summary, description, event_date, location, capacity, cover_image_url, status, registration_open) VALUES (${slug}, ${input.title}, ${input.summary}, ${input.description}, ${input.eventDate}::timestamptz, ${input.location}, ${input.capacity}, ${input.coverImageUrl}, ${input.status}, ${input.registrationOpen}) RETURNING id`;
    id = String(rows[0].id);
  }
  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id) VALUES (${admin.email}, 'saved', 'event', ${id})`;
  return { ok: true, id };
}

type LocationUpdate = {
  token: string;
  id?: string | undefined;
  number: string;
  name: string;
  address: string;
  note: string;
  directions: string;
  logoUrl: string;
  phone: string;
  instagram: string;
  latitude: number | null;
  longitude: number | null;
};

export async function upsertLocation(input: LocationUpdate) {
  const admin = await requireAdmin(input.token);
  const sql = database();
  const id = input.id?.trim() || crypto.randomUUID();
  const record = {
    id,
    number: input.number.trim(),
    name: input.name.trim(),
    address: input.address.trim(),
    note: input.note.trim(),
    directions: input.directions.trim(),
    logoUrl: input.logoUrl.trim(),
    phone: input.phone.trim(),
    instagram: input.instagram.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
  };
  const initial = orderStockists([
    ...normalizeStockists(undefined).filter((location) => location.id !== id),
    record,
  ]);
  const rows = await sql`
    INSERT INTO public.site_settings (key, value, description)
    VALUES (${STOCKISTS_SETTING_KEY}, ${JSON.stringify(initial)}::jsonb, 'Locations shown on the public stockist list and map.')
    ON CONFLICT (key) DO UPDATE SET
      value = (SELECT COALESCE(jsonb_agg(CASE WHEN item->>'id' = ${id} THEN ${JSON.stringify(record)}::jsonb ELSE item END ORDER BY ordinal), '[]'::jsonb)
        FROM jsonb_array_elements(site_settings.value) WITH ORDINALITY AS entries(item, ordinal))
        || CASE WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(site_settings.value) item WHERE item->>'id' = ${id}) THEN '[]'::jsonb ELSE jsonb_build_array(${JSON.stringify(record)}::jsonb) END,
      updated_at = now()
    WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(site_settings.value) item WHERE item->>'id' <> ${id} AND item->>'number' = ${record.number})
      AND (${!input.id} OR EXISTS (SELECT 1 FROM jsonb_array_elements(site_settings.value) item WHERE item->>'id' = ${id}))
    RETURNING key
  `;
  if (!rows[0])
    throw new Error(
      "That location number is already used, or the location no longer exists. Refresh and try again.",
    );
  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id) VALUES (${admin.email}, 'saved', 'location', ${id})`;
  return { ok: true, id };
}

export async function removeLocation(input: { token: string; id: string }) {
  const admin = await requireAdmin(input.token);
  const sql = database();
  const rows = await sql`
    UPDATE public.site_settings SET value = (
      SELECT COALESCE(jsonb_agg(item ORDER BY ordinal), '[]'::jsonb)
      FROM jsonb_array_elements(value) WITH ORDINALITY AS entries(item, ordinal)
      WHERE item->>'id' <> ${input.id}
    ), updated_at = now()
    WHERE key = ${STOCKISTS_SETTING_KEY}
      AND EXISTS (SELECT 1 FROM jsonb_array_elements(value) item WHERE item->>'id' = ${input.id})
    RETURNING key
  `;
  if (!rows[0])
    throw new Error(
      "This location no longer exists. Refresh the dashboard and try again.",
    );
  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id) VALUES (${admin.email}, 'deleted', 'location', ${input.id})`;
  return { ok: true };
}

type DeleteInput = {
  token: string;
  entity:
    | "products"
    | "events"
    | "orders"
    | "event_registrations"
    | "business_inquiries"
    | "contact_requests"
    | "quotation_requests";
  id: string;
};

export async function deleteRecord(input: DeleteInput) {
  const admin = await requireAdmin(input.token);
  const sql = database();
  let rows;
  if (input.entity === "events") {
    const result = await sql.transaction([
      sql`SELECT id FROM events WHERE id = ${input.id}::uuid FOR UPDATE`,
      sql`DELETE FROM events WHERE id = ${input.id}::uuid AND NOT EXISTS (SELECT 1 FROM event_registrations WHERE event_id = ${input.id}::uuid) RETURNING id`,
    ]);
    rows = result[1];
    if (!rows?.[0])
      throw new Error(
        "The event no longer exists or has registrations. Cancel or complete events with registrations instead of deleting them.",
      );
  } else {
    const entities = [
      "products",
      "orders",
      "event_registrations",
      "business_inquiries",
      "contact_requests",
      "quotation_requests",
    ];
    if (!entities.includes(input.entity))
      throw new Error("Unsupported record type.");
    rows = await sql.query(
      `DELETE FROM ${input.entity} WHERE id = $1::uuid RETURNING id`,
      [input.id],
    );
    if (!rows[0])
      throw new Error("This record no longer exists. Refresh the dashboard.");
  }
  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id) VALUES (${admin.email}, 'deleted', ${input.entity}, ${input.id})`;
  return { ok: true };
}
