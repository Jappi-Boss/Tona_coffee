import { neon } from "@neondatabase/serverless";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  return neon(connectionString);
}

export async function loadPublicCatalog() {
  const sql = database();
  const [products, events] = await Promise.all([
    sql`
      SELECT
        p.id,
        p.slug,
        p.name,
        p.region,
        p.process,
        p.description,
        p.tasting_notes,
        p.altitude,
        p.image_url,
        p.is_available,
        p.is_featured,
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'size', v.size,
              'grind', v.grind,
              'price', v.price,
              'stockQuantity', v.stock_quantity
            ) ORDER BY v.size, v.grind
          ) FILTER (WHERE v.id IS NOT NULL),
          '[]'
        ) AS variants
      FROM products p
      LEFT JOIN product_variants v
        ON v.product_id = p.id AND v.is_active = true
      WHERE p.status = 'published' AND p.is_available = true
      GROUP BY p.id
      ORDER BY p.is_featured DESC, p.sort_order, p.name
    `,
    sql`
      SELECT
        e.id,
        e.slug,
        e.title,
        e.summary,
        e.description,
        e.event_date,
        e.location,
        e.capacity,
        e.cover_image_url,
        e.registration_open,
        COUNT(r.id)::int AS registration_count
      FROM events e
      LEFT JOIN event_registrations r
        ON r.event_id = e.id AND r.status <> 'cancelled'
      WHERE e.status = 'published'
      GROUP BY e.id
      ORDER BY e.event_date
    `,
  ]);

  return {
    products: products.map((product) => ({
      id: String(product.id),
      slug: String(product.slug),
      name: String(product.name),
      region: String(product.region),
      process: String(product.process),
      description: String(product.description ?? ""),
      tastingNotes: Array.isArray(product.tasting_notes)
        ? product.tasting_notes.map(String)
        : [],
      altitude: product.altitude ? String(product.altitude) : null,
      imageUrl: product.image_url ? String(product.image_url) : null,
      isAvailable: Boolean(product.is_available),
      isFeatured: Boolean(product.is_featured),
      variants: Array.isArray(product.variants)
        ? product.variants.map((variant: Record<string, unknown>) => ({
            id: String(variant.id),
            size: String(variant.size),
            grind: String(variant.grind),
            price: variant.price == null ? null : Number(variant.price),
            stockQuantity: Number(variant.stockQuantity ?? 0),
          }))
        : [],
    })),
    events: events.map((event) => ({
      id: String(event.id),
      slug: String(event.slug),
      title: String(event.title),
      summary: String(event.summary ?? ""),
      description: String(event.description ?? ""),
      eventDate: new Date(String(event.event_date)).toISOString(),
      location: String(event.location),
      capacity: event.capacity == null ? null : Number(event.capacity),
      coverImageUrl: event.cover_image_url
        ? String(event.cover_image_url)
        : null,
      registrationOpen: Boolean(event.registration_open),
      registrationCount: Number(event.registration_count ?? 0),
    })),
  };
}

export async function createEventRegistration(input: {
  eventId: string;
  fullName: string;
  phone: string;
  email: string | null;
  guestCount: number;
  notes: string | null;
}) {
  const sql = database();
  const rows = await sql`
    INSERT INTO event_registrations
      (event_id, full_name, phone, email, guest_count, notes)
    SELECT
      e.id,
      ${input.fullName},
      ${input.phone},
      ${input.email},
      ${input.guestCount},
      ${input.notes}
    FROM events e
    WHERE e.id = ${input.eventId}::uuid
      AND e.status = 'published'
      AND e.registration_open = true
      AND (
        e.capacity IS NULL OR
        (SELECT COALESCE(SUM(r.guest_count), 0)
         FROM event_registrations r
         WHERE r.event_id = e.id AND r.status <> 'cancelled') + ${input.guestCount} <= e.capacity
      )
    RETURNING id
  `;
  if (!rows[0]) throw new Error("Registration is closed or the event is full.");
  return { ok: true, id: String(rows[0].id) };
}

export async function createBusinessInquiry(input: {
  organization: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  businessType: string | null;
  coffeeInterest: string | null;
  estimatedQuantity: string | null;
  message: string | null;
}) {
  const sql = database();
  const rows = await sql`
    INSERT INTO business_inquiries
      (organization, contact_person, phone, email, business_type, coffee_interest, estimated_quantity, message)
    VALUES
      (${input.organization}, ${input.contactPerson}, ${input.phone}, ${input.email}, ${input.businessType}, ${input.coffeeInterest}, ${input.estimatedQuantity}, ${input.message})
    RETURNING id
  `;
  return { ok: true, id: String(rows[0].id) };
}

export async function createContactRequest(input: {
  fullName: string;
  organization: string | null;
  phone: string;
  email: string | null;
  requestType: string;
  message: string;
}) {
  const sql = database();
  const rows = await sql`
    INSERT INTO contact_requests
      (full_name, organization, phone, email, request_type, message)
    VALUES
      (${input.fullName}, ${input.organization}, ${input.phone}, ${input.email}, ${input.requestType}, ${input.message})
    RETURNING id
  `;
  return { ok: true, id: String(rows[0].id) };
}

export async function createOrder(input: {
  productId: string;
  customerName: string;
  phone: string;
  email: string | null;
  size: string;
  grind: string;
  quantity: number;
  notes: string | null;
}) {
  const sql = database();
  const rows = await sql`
    WITH selected AS (
      SELECT p.id, p.name, v.price
      FROM products p
      LEFT JOIN product_variants v
        ON v.product_id = p.id
       AND v.size = ${input.size}
       AND v.grind = ${input.grind}
       AND v.is_active = true
      WHERE p.id = ${input.productId}::uuid
        AND p.status = 'published'
        AND p.is_available = true
      LIMIT 1
    ), new_order AS (
      INSERT INTO orders
        (customer_name, phone, email, channel, total_amount, customer_notes)
      SELECT
        ${input.customerName},
        ${input.phone},
        ${input.email},
        'website',
        CASE WHEN selected.price IS NULL THEN NULL ELSE selected.price * ${input.quantity} END,
        ${input.notes}
      FROM selected
      RETURNING id, order_number
    )
    INSERT INTO order_items
      (order_id, product_id, product_name, size, grind, quantity, unit_price)
    SELECT
      new_order.id,
      selected.id,
      selected.name,
      ${input.size},
      ${input.grind},
      ${input.quantity},
      selected.price
    FROM new_order, selected
    RETURNING
      order_id,
      (SELECT order_number FROM new_order) AS order_number
  `;
  if (!rows[0]) throw new Error("This product is not currently available.");
  return { ok: true, orderNumber: String(rows[0].order_number) };
}
