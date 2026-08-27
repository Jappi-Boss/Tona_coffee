import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import businessImg from "@/assets/business.jpg";
import { PRODUCTS, waLink } from "@/lib/tona";

export const Route = createFileRoute("/for-business")({
  head: () => ({
    meta: [
      { title: "For Business — Tona Coffee Wholesale & Samples" },
      {
        name: "description",
        content:
          "Wholesale Ethiopian coffee for cafés, supermarkets, hotels, offices and distributors. Request a sample pack and long-term partnership support from Tona Coffee.",
      },
      { property: "og:title", content: "For Business — Tona Coffee Wholesale & Samples" },
      {
        property: "og:description",
        content:
          "Wholesale Ethiopian coffee for cafés, retailers, hotels and distributors. Request samples from Tona Coffee.",
      },
    ],
  }),
  component: ForBusiness,
});

const PARTNERS = [
  {
    t: "Cafés & Coffee Shops",
    d: "Coffee supply, brewing guidance, Ethiopian origin storytelling and barista support.",
  },
  {
    t: "Supermarkets & Retailers",
    d: "Retail-ready products, promotional and tasting support, and wholesale supply.",
  },
  {
    t: "Hotels & Resorts",
    d: "Coffee supply, product selection, brewing guidance and coffee experiences for guests.",
  },
  {
    t: "Distributors & International Partners",
    d: "Wholesale supply, product information, brand storytelling and long-term development.",
  },
  {
    t: "Corporate & Office",
    d: "Workplace coffee supply, meeting and event solutions, and customized experiences.",
  },
  {
    t: "Events & Collaborations",
    d: "Coffee supply, tasting experiences, sampling and co-branded activations.",
  },
];

const SUPPORT = [
  "Coffee product supply",
  "Product & brewing guidance",
  "Origin and brand storytelling",
  "Coffee experience development",
  "Barista and staff support",
  "Co-branding, where suitable",
];

const SAMPLE_PACKS = [
  {
    t: "Discovery Pack",
    d: "4 × 100g — Yirgacheffe, Sidama, Guji and Gesha, with tasting notes and brew guide.",
    for: "Cafés and offices deciding on a house coffee.",
  },
  {
    t: "Retail Pack",
    d: "3 × 250g retail bags in your preferred grind, with shelf and pricing information.",
    for: "Supermarkets and retailers testing shelf performance.",
  },
  {
    t: "Volume Pack",
    d: "1kg of a single origin roasted to your target profile, plus a supply proposal.",
    for: "Hotels, distributors and high-volume partners.",
  },
];

function ForBusiness() {
  const [form, setForm] = useState({
    business: "",
    contact: "",
    phone: "",
    email: "",
    type: "Café / Coffee Shop",
    origin: PRODUCTS[0]!.name,
    quantity: "",
    message: "",
  });

  const enquiry = `Hi Tona, business enquiry:
• Business: ${form.business || "-"}
• Contact: ${form.contact || "-"}
• Phone: ${form.phone || "-"}
• Email: ${form.email || "-"}
• Type: ${form.type}
• Interested origin: ${form.origin}
• Estimated quantity: ${form.quantity || "-"}
• Notes: ${form.message || "-"}`;

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const field =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <>
      <PageHero
        eyebrow="For Business"
        title={
          <>
            Long-term partnerships,
            <br />
            not <span className="text-primary">one-time orders.</span>
          </>
        }
        intro="We build relationships around each kind of partner — from neighbourhood cafés to international distributors — with supply, guidance and storytelling support included."
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PARTNERS.map((p) => (
              <div key={p.t} className="rounded-2xl border border-border p-6">
                <h3 className="text-xl font-bold">{p.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-teal py-20 text-teal-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="label-mono text-teal-foreground/60">Partnership support</p>
            <h2 className="mt-4 font-display text-4xl font-bold">
              What a Tona partnership includes.
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {SUPPORT.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-sm text-teal-foreground/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {s}
                </li>
              ))}
            </ul>
            <a
              href={waLink("Hi Tona, I'd like wholesale information for my business.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Business WhatsApp
            </a>
          </div>
          <img
            src={businessImg}
            alt="Barista preparing espresso at a café counter stocked with coffee bags"
            width={1400}
            height={900}
            loading="lazy"
            className="rounded-3xl object-cover"
          />
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="label-mono text-primary">Samples</p>
          <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Taste before you commit.
          </h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {SAMPLE_PACKS.map((s) => (
              <div key={s.t} className="flex flex-col rounded-2xl border border-border bg-card p-6">
                <h3 className="text-xl font-bold">{s.t}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                <p className="label-mono mt-4 text-muted-foreground">{s.for}</p>
                <a
                  href={waLink(`Hi Tona, I'd like to request the ${s.t} sample.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Request this sample
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand py-20" id="enquiry">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Business enquiry</h2>
          <p className="mt-3 text-muted-foreground">
            Fill in the details and we'll open a WhatsApp message pre-filled for our sales team.
          </p>

          <form
            className="mt-8 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              window.open(waLink(enquiry), "_blank", "noopener");
            }}
          >
            <input className={field} placeholder="Business name" value={form.business} onChange={set("business")} required />
            <input className={field} placeholder="Contact person" value={form.contact} onChange={set("contact")} required />
            <input className={field} placeholder="Phone" value={form.phone} onChange={set("phone")} required />
            <input className={field} type="email" placeholder="Email" value={form.email} onChange={set("email")} />
            <select className={field} value={form.type} onChange={set("type")} aria-label="Business type">
              {[
                "Café / Coffee Shop",
                "Supermarket / Retailer",
                "Hotel / Resort",
                "Distributor / International Partner",
                "Corporate / Office",
                "Event / Collaboration",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <select className={field} value={form.origin} onChange={set("origin")} aria-label="Interested origin">
              {PRODUCTS.map((p) => (
                <option key={p.slug}>{p.name}</option>
              ))}
            </select>
            <input
              className={`${field} sm:col-span-2`}
              placeholder="Estimated monthly quantity (kg)"
              value={form.quantity}
              onChange={set("quantity")}
            />
            <textarea
              className={`${field} sm:col-span-2 min-h-28`}
              placeholder="Requirement / message"
              value={form.message}
              onChange={set("message")}
            />
            <button
              type="submit"
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Send enquiry on WhatsApp
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
