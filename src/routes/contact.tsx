import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/PageHero";
import { PRODUCTS, WHATSAPP_DISPLAY, waLink } from "@/lib/tona";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Tona Coffee — Orders, Wholesale & Enquiries" },
      {
        name: "description",
        content:
          "Contact Tona Coffee in Addis Ababa for retail orders, wholesale supply, samples and event enquiries. Message us on WhatsApp at +251 98 621 2224.",
      },
      { property: "og:title", content: "Contact Tona Coffee — Orders, Wholesale & Enquiries" },
      {
        property: "og:description",
        content: "Retail orders, wholesale supply, samples and event enquiries — reach Tona Coffee on WhatsApp.",
      },
    ],
  }),
  component: Contact,
});

const REASONS = [
  "Retail order",
  "Wholesale / business supply",
  "Sample request",
  "Event or collaboration",
  "Feedback",
  "Something else",
];

function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    reason: REASONS[0]!,
    product: PRODUCTS[0]!.name,
    location: "",
    message: "",
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const text = `Hi Tona, request from the website:
• Name: ${form.name || "-"}
• Phone: ${form.phone || "-"}
• Email: ${form.email || "-"}
• Reason: ${form.reason}
• Product of interest: ${form.product}
• Location / area: ${form.location || "-"}
• Message: ${form.message || "-"}`;

  const field =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary";

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let's start the <span className="text-primary">conversation.</span>
          </>
        }
        intro="Orders, wholesale supply, samples, events or feedback — a real person reads and replies to every message."
      />

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[1fr_1.3fr] lg:px-8">
          <div className="space-y-4">
            <a
              href={waLink("Hi Tona, I have an enquiry.")}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-primary p-6 text-primary-foreground"
            >
              <MessageCircle className="h-6 w-6" />
              <p className="mt-4 text-lg font-bold">WhatsApp</p>
              <p className="mt-1 text-sm text-primary-foreground/85">{WHATSAPP_DISPLAY}</p>
              <p className="mt-3 text-sm text-primary-foreground/75">
                Fastest way to order or ask a question.
              </p>
            </a>

            <div className="rounded-2xl border border-border p-6">
              <Mail className="h-6 w-6 text-teal" />
              <p className="mt-4 text-lg font-bold">Email</p>
              <a href="mailto:hello@tonacoffee.com" className="mt-1 block text-sm text-muted-foreground hover:text-primary">
                hello@tonacoffee.com
              </a>
            </div>

            <div className="rounded-2xl border border-border p-6">
              <MapPin className="h-6 w-6 text-teal" />
              <p className="mt-4 text-lg font-bold">Roastery</p>
              <p className="mt-1 text-sm text-muted-foreground">Addis Ababa, Ethiopia</p>
            </div>

            <div className="rounded-2xl border border-border p-6">
              <Clock className="h-6 w-6 text-teal" />
              <p className="mt-4 text-lg font-bold">Hours</p>
              <p className="mt-1 text-sm text-muted-foreground">Mon – Sat, 8:00 AM – 6:00 PM (EAT)</p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold">Send a request</h2>
            <p className="mt-3 text-muted-foreground">
              Complete the form and we'll open WhatsApp with your details ready to send.
            </p>

            <form
              className="mt-8 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2 sm:p-8"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Opening WhatsApp with your request…");
                window.open(waLink(text), "_blank", "noopener");
              }}
            >
              <input className={field} placeholder="Full name" value={form.name} onChange={set("name")} required />
              <input className={field} placeholder="Phone" value={form.phone} onChange={set("phone")} required />
              <input className={field} type="email" placeholder="Email" value={form.email} onChange={set("email")} />
              <select className={field} value={form.reason} onChange={set("reason")} aria-label="Reason for contact">
                {REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <select className={field} value={form.product} onChange={set("product")} aria-label="Product of interest">
                {PRODUCTS.map((p) => (
                  <option key={p.slug}>{p.name}</option>
                ))}
              </select>
              <input
                className={field}
                placeholder="Your area / city"
                value={form.location}
                onChange={set("location")}
              />
              <textarea
                className={`${field} sm:col-span-2 min-h-32`}
                placeholder="How can we help?"
                value={form.message}
                onChange={set("message")}
              />
              <button
                type="submit"
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
              >
                <MessageCircle className="h-4 w-4" /> Send request on WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
