import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Leaf, Coffee, Users, Mountain } from "lucide-react";
import heroImg from "@/assets/hero-ceremony.jpg";
import beansImg from "@/assets/beans.jpg";
import { PRODUCTS, waLink } from "@/lib/tona";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tona Coffee — Stay for Tona, Stay for the Moment" },
      {
        name: "description",
        content:
          "African-led Ethiopian specialty coffee roaster. Yirgacheffe, Sidama, Guji and Gesha — order retail bags or wholesale supply on WhatsApp.",
      },
      { property: "og:title", content: "Tona Coffee — Stay for Tona, Stay for the Moment" },
      {
        property: "og:description",
        content:
          "African-led Ethiopian specialty coffee roaster. Yirgacheffe, Sidama, Guji and Gesha — order on WhatsApp.",
      },
    ],
  }),
  component: Home,
});

const PILLARS = [
  { icon: Mountain, title: "Origin", text: "Ethiopian coffee, and the places where it begins." },
  { icon: Coffee, title: "Quality", text: "Careful selection and roasting for a distinctive cup." },
  { icon: Leaf, title: "Culture", text: "The traditions and hospitality of Ethiopian coffee." },
  { icon: Users, title: "Connection", text: "The conversations that happen around every cup." },
];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-background">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <span className="label-mono inline-flex rounded-full bg-primary/10 px-4 py-2 text-primary">
              African-Led Specialty Coffee Roaster
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold sm:text-6xl lg:text-7xl">
              Stay for Tona.
              <br />
              Stay for the <span className="text-primary">moment.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              The first cup brings people together. The second round is where conversations deepen,
              ideas take shape, and people stay a little longer. This is where Tona belongs.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                Explore our coffee <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={waLink("Hi Tona, I'd like to place an order.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-teal px-6 py-3.5 text-sm font-semibold text-teal transition-colors hover:bg-teal hover:text-teal-foreground"
              >
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
              <Link
                to="/for-business"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-foreground/70 hover:text-primary"
              >
                For business
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImg}
              alt="Ethiopian coffee ceremony: coffee poured from a jebena into small cups"
              width={1408}
              height={1600}
              className="aspect-[4/5] w-full rounded-[2rem] object-cover"
            />
            <div className="absolute -bottom-6 left-4 right-4 rounded-2xl bg-teal p-5 text-teal-foreground sm:left-8 sm:right-auto sm:max-w-xs">
              <p className="label-mono text-teal-foreground/60">Where our name comes from</p>
              <p className="mt-2 font-display text-2xl font-bold">The Second Round</p>
              <p className="mt-2 text-sm text-teal-foreground/75">
                Ethiopian coffee is served in rounds. Tona takes its spirit from the second — where
                a simple coffee moment becomes something deeper.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mt-16 bg-sand py-20 lg:mt-8">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-mono text-primary">What we build on</p>
              <h2 className="mt-3 max-w-xl font-display text-4xl font-bold sm:text-5xl">
                An African-led roaster, rooted in origin.
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Tona Coffee sources, roasts and builds coffee experiences inspired by Ethiopian coffee
              culture — from the coffee heartlands to the cup in front of you.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-6">
                <p className="label-mono text-muted-foreground">0{i + 1}</p>
                <p.icon className="mt-5 h-7 w-7 text-primary" />
                <h3 className="mt-4 text-xl font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS TEASER */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="max-w-xl font-display text-4xl font-bold sm:text-5xl">
              Four origins, one standard.
            </h2>
            <Link to="/products" className="inline-flex items-center gap-2 font-semibold text-primary">
              See all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((p) => (
              <Link
                key={p.slug}
                to="/products"
                className="group rounded-2xl border border-border p-6 transition-colors hover:border-primary"
              >
                <span
                  className={`leaf-field block h-24 rounded-xl ${p.accent === "teal" ? "bg-teal" : "bg-primary"}`}
                />
                <h3 className="mt-5 text-2xl font-bold group-hover:text-primary">{p.name}</h3>
                <p className="label-mono mt-2 text-muted-foreground">{p.process}</p>
                <p className="mt-3 text-sm text-muted-foreground">{p.notes.join(" · ")}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TEAL TRUST BAND */}
      <section className="bg-teal py-20 text-teal-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <img
            src={beansImg}
            alt="Freshly roasted Ethiopian coffee beans with a green coffee leaf"
            width={1400}
            height={900}
            loading="lazy"
            className="rounded-3xl object-cover"
          />
          <div>
            <p className="label-mono text-teal-foreground/60">Why partners choose Tona</p>
            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              Long-term partnerships, not one-time orders.
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Traceable Ethiopian origins",
                "Consistent roast profiles",
                "Samples before you commit",
                "Brewing & barista guidance",
                "Retail-ready packaging",
                "Origin storytelling support",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-teal-foreground/85">
                  <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/for-business"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground"
              >
                Request a sample <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={waLink("Hi Tona, I'd like to discuss a wholesale partnership.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-teal-foreground/35 px-6 py-3.5 text-sm font-semibold"
              >
                <MessageCircle className="h-4 w-4" /> Business WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <p className="label-mono text-primary">The Tona moment</p>
          <p className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            “The coffee creates the pause. The moment creates the meaning.”
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background"
            >
              Read our story
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
