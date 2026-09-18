import { neon } from "@neondatabase/serverless";
import { FORMATS, PRODUCTS, SIZES } from "./tona";
import {
  DEFAULT_STOCKISTS,
  STOCKISTS_SETTING_KEY,
  normalizeStockists,
} from "./locations";
import { sendSubmissionNotifications } from "./notifications.server";
import { ensureQuotationSchema } from "./quotation-schema.server";

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  return neon(connectionString);
}


export async function loadPublicLocations() {
  if (!process.env.DATABASE_URL) return normalizeStockists(DEFAULT_STOCKISTS);
  const sql = database();
  const rows =
    await sql`SELECT value FROM public.site_settings WHERE key = ${STOCKISTS_SETTING_KEY} LIMIT 1`;
  return normalizeStockists(rows[0]?.value);
}

export async function loadPublicCatalog() {
  if (!process.env.DATABASE_URL) return fallbackCatalog();
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
        e.status,
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
      WHERE e.status IN ('published', 'completed')
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
      status: String(event.status),
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

function fallbackCatalog() {
  const productIds = [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
    "33333333-3333-4333-8333-333333333333",
    "44444444-4444-4444-8444-444444444444",
  ];
  return {
    products: PRODUCTS.map((product, productIndex) => ({
      id: productIds[productIndex]!,
      slug: product.slug,
      name: product.name,
      region: product.region,
      process: product.process,
      description: product.blurb,
      tastingNotes: product.notes,
      altitude: product.altitude,
      imageUrl: null,
      isAvailable: true,
      isFeatured: productIndex < 2,
      variants: SIZES.flatMap((size, sizeIndex) =>
        FORMATS.map((grind, grindIndex) => ({
          id: `${productIds[productIndex]!.slice(0, 24)}${String(sizeIndex + 1).padStart(2, "0")}${String(grindIndex + 1).padStart(2, "0")}1111`,
          size,
          grind,
          price: null,
          stockQuantity: 0,
        })),
      ),
    })),
    events: [
      {
        id: "55555555-5555-4555-8555-555555555555",
        slug: "tona-coffee-ceremony-tasting",
        status: "published",
        title: "Tona Coffee Ceremony Tasting",
        summary: "Traditional ceremony, guided tasting and origin stories.",
        description: "Traditional ceremony, guided tasting and origin stories.",
        eventDate: "2026-09-14T07:00:00.000Z",
        location: "Bole, Addis Ababa · 10:00 AM",
        capacity: 30,
        coverImageUrl: null,
        registrationOpen: true,
        registrationCount: 0,
      },
      {
        id: "66666666-6666-4666-8666-666666666666",
        slug: "guji-jimma-cupping-table",
        status: "published",
        title: "Guji & Jimma Cupping Table",
        summary: "A guided comparison of two distinctive Ethiopian origins.",
        description: "A guided comparison of two distinctive Ethiopian origins.",
        eventDate: "2026-10-05T07:00:00.000Z",
        location: "Addis Ababa · 10:00 AM",
        capacity: 30,
        coverImageUrl: null,
        registrationOpen: true,
        registrationCount: 0,
      },
      {
        id: "77777777-7777-4777-8777-777777777777",
        slug: "second-round-pop-up",
        status: "published",
        title: "Second Round Pop-Up",
        summary: "Coffee, conversation and the spirit of Tona.",
        description: "Coffee, conversation and the spirit of Tona.",
        eventDate: "2026-11-22T07:00:00.000Z",
        location: "Addis Ababa · 10:00 AM",
        capacity: 30,
        coverImageUrl: null,
        registrationOpen: true,
        registrationCount: 0,
      },
      {
        id: "88888888-8888-4888-8888-888888888888",
        slug: "coffee-ceremony-morning",
        status: "completed",
        title: "Coffee Ceremony Morning",
        summary: "Ceremony experience",
        description: "Ceremony experience",
        eventDate: "2026-02-15T07:00:00.000Z",
        location: "Addis Ababa",
        capacity: 30,
        coverImageUrl: null,
        registrationOpen: false,
        registrationCount: 0,
      },
      {
        id: "99999999-9999-4999-8999-999999999999",
        slug: "origins-cupping-table",
        status: "completed",
        title: "Origins Cupping Table",
        summary: "Guided tasting",
        description: "Guided tasting",
        eventDate: "2026-04-15T07:00:00.000Z",
        location: "Addis Ababa",
        capacity: 30,
        coverImageUrl: null,
        registrationOpen: false,
        registrationCount: 0,
      },
      {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        slug: "second-round-pop-up-hosted",
        status: "completed",
        title: "Second Round Pop-Up",
        summary: "Brew bar & sampling",
        description: "Brew bar & sampling",
        eventDate: "2026-06-15T07:00:00.000Z",
        location: "Bole, Addis Ababa",
        capacity: 30,
        coverImageUrl: null,
        registrationOpen: false,
        registrationCount: 0,
      },
    ],
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
  const id = String(rows[0].id);
  const notifications = await sendSubmissionNotifications({
    title: "New event registration",
    subject: "New Tona Coffee event registration",
    customerEmail: input.email,
    fields: [
      { label: "Event ID", value: input.eventId },
      { label: "Full name", value: input.fullName },
      { label: "Phone", value: input.phone },
      { label: "Email", value: input.email },
      { label: "Guests", value: input.guestCount },
      { label: "Note", value: input.notes },
    ],
    whatsappMessage: [
      "Hi Tona, I would like to register for a Tona event.",
      `Event ID: ${input.eventId}`,
      `Name: ${input.fullName}`,
      `Phone: ${input.phone}`,
      `Email: ${input.email ?? ""}`,
      `Guests: ${input.guestCount}`,
      `Note: ${input.notes ?? ""}`,
    ].join("\n"),
  });
  return { ok: true, id, ...notifications };
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
  const id = String(rows[0].id);
  const notifications = await sendSubmissionNotifications({
    title: "New business inquiry",
    subject: "New Tona Coffee business inquiry",
    customerEmail: input.email,
    fields: [
      { label: "Organization", value: input.organization },
      { label: "Contact person", value: input.contactPerson },
      { label: "Phone", value: input.phone },
      { label: "Email", value: input.email },
      { label: "Business type", value: input.businessType },
      { label: "Coffee interest", value: input.coffeeInterest },
      { label: "Estimated quantity", value: input.estimatedQuantity },
      { label: "Message", value: input.message },
    ],
    whatsappMessage: [
      "Hi Tona, I would like to discuss business supply.",
      `Organization: ${input.organization}`,
      `Contact: ${input.contactPerson}`,
      `Phone: ${input.phone}`,
      `Email: ${input.email ?? ""}`,
      `Business type: ${input.businessType ?? ""}`,
      `Coffee interest: ${input.coffeeInterest ?? ""}`,
      `Estimated quantity: ${input.estimatedQuantity ?? ""}`,
      `Message: ${input.message ?? ""}`,
    ].join("\n"),
  });
  return { ok: true, id, ...notifications };
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
  const id = String(rows[0].id);
  const notifications = await sendSubmissionNotifications({
    title: "New contact request",
    subject: `New Tona Coffee contact request: ${input.requestType}`,
    customerEmail: input.email,
    fields: [
      { label: "Full name", value: input.fullName },
      { label: "Organization", value: input.organization },
      { label: "Phone", value: input.phone },
      { label: "Email", value: input.email },
      { label: "Request type", value: input.requestType },
      { label: "Message", value: input.message },
    ],
    whatsappMessage: [
      "Hi Tona, I have a request.",
      `Name: ${input.fullName}`,
      `Organization: ${input.organization ?? ""}`,
      `Phone: ${input.phone}`,
      `Email: ${input.email ?? ""}`,
      `Request type: ${input.requestType}`,
      `Message: ${input.message}`,
    ].join("\n"),
  });
  return { ok: true, id, ...notifications };
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
  const orderNumber = String(rows[0].order_number);
  const notifications = await sendSubmissionNotifications({
    title: "New website order",
    subject: `New Tona Coffee order ${orderNumber}`,
    customerEmail: input.email,
    fields: [
      { label: "Order", value: orderNumber },
      { label: "Product", value: input.productId },
      { label: "Customer", value: input.customerName },
      { label: "Phone", value: input.phone },
      { label: "Email", value: input.email },
      { label: "Size", value: input.size },
      { label: "Grind", value: input.grind },
      { label: "Quantity", value: input.quantity },
      { label: "Notes", value: input.notes },
    ],
    whatsappMessage: [
      "Hi Tona, I would like to place a retail coffee order.",
      `Order: ${orderNumber}`,
      `Product ID: ${input.productId}`,
      `Name: ${input.customerName}`,
      `Phone: ${input.phone}`,
      `Email: ${input.email ?? ""}`,
      `Size: ${input.size}`,
      `Grind: ${input.grind}`,
      `Quantity: ${input.quantity}`,
      `Notes: ${input.notes ?? ""}`,
    ].join("\n"),
  });
  return { ok: true, orderNumber, ...notifications };
}

export async function createQuotationRequest(input: {
  packageSize: "1kg" | "500g" | "250g" | "custom";
  format: string;
  brandName: string | null;
  customerName: string;
  company: string | null;
  phone: string;
  email: string | null;
  monthlyVolume: string | null;
  message: string | null;
}) {
  await ensureQuotationSchema();
  const sql = database();
  const rows = await sql`
    INSERT INTO public.quotation_requests
      (package_size, format, brand_name, customer_name, company, phone, email, monthly_volume, message)
    VALUES
      (${input.packageSize}, ${input.format}, ${input.brandName}, ${input.customerName}, ${input.company}, ${input.phone}, ${input.email}, ${input.monthlyVolume}, ${input.message})
    RETURNING id, quote_number
  `;
  if (!rows[0]) throw new Error("The quotation request could not be saved.");

  const id = String(rows[0].id);
  const quoteNumber = String(rows[0].quote_number);
  const whatsappMessage = [
    "Hi Tona, I'd like a House Blend quotation.",
    `Reference: ${quoteNumber}`,
    `Package: ${input.packageSize === "custom" ? "250g custom" : input.packageSize}`,
    `Format: ${input.format}`,
    `Customer brand: ${input.brandName ?? ""}`,
    `Name: ${input.customerName}`,
    `Company: ${input.company ?? ""}`,
    `Phone: ${input.phone}`,
    `Email: ${input.email ?? ""}`,
    `Monthly volume: ${input.monthlyVolume ?? ""}`,
    `Message: ${input.message ?? ""}`,
  ].join("\n");
  const notifications = await sendSubmissionNotifications({
    title: `New House Blend quotation ${quoteNumber}`,
    subject: `New Tona Coffee quotation ${quoteNumber}`,
    customerEmail: input.email,
    fields: [
      { label: "Reference", value: quoteNumber },
      { label: "Package", value: input.packageSize },
      { label: "Format", value: input.format },
      { label: "Customer brand", value: input.brandName },
      { label: "Name", value: input.customerName },
      { label: "Company", value: input.company },
      { label: "Phone", value: input.phone },
      { label: "Email", value: input.email },
      { label: "Monthly volume", value: input.monthlyVolume },
      { label: "Message", value: input.message },
    ],
    whatsappMessage,
  });

  return { ok: true, id, quoteNumber, whatsappMessage, ...notifications };
}
