import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";

const AUTH_JWKS_URL =
  process.env.NEON_AUTH_JWKS_URL ??
  "https://ep-falling-thunder-avg9v3nc.neonauth.c-11.us-east-1.aws.neon.tech/neondb/auth/.well-known/jwks.json";

const jwks = createRemoteJWKSet(new URL(AUTH_JWKS_URL));

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

export async function loadDashboard(token: string) {
  const admin = await requireAdmin(token);
  const sql = database();
  const [
    products,
    events,
    registrations,
    orders,
    businessInquiries,
    contactRequests,
  ] = await Promise.all([
    sql`SELECT p.*, COUNT(v.id)::int AS variant_count FROM products p LEFT JOIN product_variants v ON v.product_id = p.id GROUP BY p.id ORDER BY p.sort_order, p.name`,
    sql`SELECT e.*, COUNT(r.id)::int AS registration_count FROM events e LEFT JOIN event_registrations r ON r.event_id = e.id GROUP BY e.id ORDER BY e.event_date DESC`,
    sql`SELECT r.*, e.title AS event_title FROM event_registrations r JOIN events e ON e.id = r.event_id ORDER BY r.created_at DESC LIMIT 200`,
    sql`SELECT o.*, COALESCE(json_agg(json_build_object('productName', i.product_name, 'size', i.size, 'grind', i.grind, 'quantity', i.quantity, 'unitPrice', i.unit_price)) FILTER (WHERE i.id IS NOT NULL), '[]') AS items FROM orders o LEFT JOIN order_items i ON i.order_id = o.id GROUP BY o.id ORDER BY o.created_at DESC LIMIT 200`,
    sql`SELECT * FROM business_inquiries ORDER BY created_at DESC LIMIT 200`,
    sql`SELECT * FROM contact_requests ORDER BY created_at DESC LIMIT 200`,
  ]);

  return {
    admin,
    products,
    events,
    registrations,
    orders,
    businessInquiries,
    contactRequests,
  };
}

type StatusChange = {
  token: string;
  entity:
    | "orders"
    | "event_registrations"
    | "business_inquiries"
    | "contact_requests";
  id: string;
  status: string;
};

const allowedStatuses: Record<StatusChange["entity"], string[]> = {
  orders: ["new", "confirmed", "processing", "completed", "cancelled"],
  event_registrations: ["new", "confirmed", "attended", "cancelled"],
  business_inquiries: ["new", "contacted", "qualified", "closed", "declined"],
  contact_requests: ["new", "in_progress", "resolved", "closed"],
};

export async function changeRecordStatus(input: StatusChange) {
  const admin = await requireAdmin(input.token);
  if (!allowedStatuses[input.entity].includes(input.status))
    throw new Error("Unsupported status.");
  const sql = database();

  if (input.entity === "orders") {
    await sql`UPDATE orders SET status = ${input.status}, updated_at = now() WHERE id = ${input.id}::uuid`;
  } else if (input.entity === "event_registrations") {
    await sql`UPDATE event_registrations SET status = ${input.status}, updated_at = now() WHERE id = ${input.id}::uuid`;
  } else if (input.entity === "business_inquiries") {
    await sql`UPDATE business_inquiries SET status = ${input.status}, updated_at = now() WHERE id = ${input.id}::uuid`;
  } else {
    await sql`UPDATE contact_requests SET status = ${input.status}, updated_at = now() WHERE id = ${input.id}::uuid`;
  }

  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id, details) VALUES (${admin.email}, 'status_changed', ${input.entity}, ${input.id}, ${JSON.stringify({ status: input.status })}::jsonb)`;
  return { ok: true };
}

type ProductUpdate = {
  token: string;
  id: string;
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

export async function updateProduct(input: ProductUpdate) {
  const admin = await requireAdmin(input.token);
  const sql = database();
  await sql`UPDATE products SET name = ${input.name}, region = ${input.region}, process = ${input.process}, description = ${input.description}, tasting_notes = ${input.tastingNotes}, altitude = ${input.altitude}, image_url = ${input.imageUrl}, status = ${input.status}, is_available = ${input.isAvailable}, is_featured = ${input.isFeatured}, updated_at = now() WHERE id = ${input.id}::uuid`;
  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id) VALUES (${admin.email}, 'updated', 'product', ${input.id})`;
  return { ok: true };
}

type EventUpdate = {
  token: string;
  id?: string;
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
    await sql`UPDATE events SET title = ${input.title}, summary = ${input.summary}, description = ${input.description}, event_date = ${input.eventDate}::timestamptz, location = ${input.location}, capacity = ${input.capacity}, cover_image_url = ${input.coverImageUrl}, status = ${input.status}, registration_open = ${input.registrationOpen}, updated_at = now() WHERE id = ${id}::uuid`;
  } else {
    const slug = `${input.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-6)}`;
    const rows =
      await sql`INSERT INTO events (slug, title, summary, description, event_date, location, capacity, cover_image_url, status, registration_open) VALUES (${slug}, ${input.title}, ${input.summary}, ${input.description}, ${input.eventDate}::timestamptz, ${input.location}, ${input.capacity}, ${input.coverImageUrl}, ${input.status}, ${input.registrationOpen}) RETURNING id`;
    id = String(rows[0].id);
  }
  await sql`INSERT INTO audit_log (actor_email, action, entity_type, entity_id) VALUES (${admin.email}, 'saved', 'event', ${id})`;
  return { ok: true };
}
