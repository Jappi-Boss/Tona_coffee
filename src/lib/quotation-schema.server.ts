import { neon } from "@neondatabase/serverless";

let schemaReady: Promise<void> | null = null;

function database() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  return neon(connectionString);
}

/**
 * The production database already owns the rest of the application schema.
 * This additive guard makes the new quotation flow safe on the first request
 * after deployment, while the same definition is also kept in database/schema.sql.
 */
export function ensureQuotationSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = database();
      await sql`
        CREATE SEQUENCE IF NOT EXISTS public.tona_quote_number_seq
          AS bigint
          START WITH 1
          INCREMENT BY 1
          MINVALUE 1
          NO MAXVALUE
          NO CYCLE
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS public.quotation_requests (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          quote_number text NOT NULL UNIQUE DEFAULT (
            'TONA-Q-'::text || to_char(now(), 'YYYY'::text) || '-'::text ||
            lpad(nextval('public.tona_quote_number_seq'::regclass)::text, 6, '0'::text)
          ),
          package_size text NOT NULL,
          format text NOT NULL,
          brand_name text,
          customer_name text NOT NULL,
          company text,
          phone text NOT NULL,
          email text,
          monthly_volume text,
          message text,
          source text NOT NULL DEFAULT 'website',
          status text NOT NULL DEFAULT 'new',
          admin_notes text,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          CONSTRAINT quotation_requests_package_size_check
            CHECK (package_size = ANY (ARRAY['1kg'::text, '500g'::text, '250g'::text, 'custom'::text])),
          CONSTRAINT quotation_requests_source_check
            CHECK (source = ANY (ARRAY['website'::text, 'whatsapp'::text, 'admin'::text])),
          CONSTRAINT quotation_requests_status_check
            CHECK (status = ANY (ARRAY['new'::text, 'contacted'::text, 'quoted'::text, 'won'::text, 'lost'::text, 'cancelled'::text]))
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS quotation_requests_status_created_idx
          ON public.quotation_requests (status, created_at DESC)
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}
