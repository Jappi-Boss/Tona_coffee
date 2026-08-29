import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, MapPin, Clock, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import {
  EVENT_OPTIONS,
  EventRegistrationDialog,
} from "@/components/site/EventRegistrationForm";
import eventImg from "@/assets/event.jpg";
import { waLink } from "@/lib/tona";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Tona Coffee Tastings & Ceremony Experiences" },
      {
        name: "description",
        content:
          "Join Tona Coffee for Ethiopian coffee ceremony tastings, pop-ups and cuppings in Addis Ababa — or host a Tona coffee experience at your own event.",
      },
      {
        property: "og:title",
        content: "Events — Tona Coffee Tastings & Ceremony Experiences",
      },
      {
        property: "og:description",
        content:
          "Coffee ceremony tastings, pop-ups and cuppings — plus Tona coffee experiences hosted at your event.",
      },
    ],
  }),
  component: Events,
});

const EVENTS = [
  {
    month: "September",
    day: "14",
    title: "Tona Coffee Ceremony Tasting",
    time: "10:00 AM",
    place: "Bole, Addis Ababa",
    text: "A traditional Ethiopian coffee ceremony pairing Yirgacheffe and Sidama, with scan-to-order on every table.",
  },
  {
    month: "October",
    day: "05",
    title: "Guji & Gesha Cupping Table",
    time: "3:00 PM",
    place: "Kazanchis, Addis Ababa",
    text: "A guided cupping of our Guji and limited Gesha micro-lots, hosted with partner cafés.",
  },
  {
    month: "November",
    day: "22",
    title: "Second Round Pop-Up",
    time: "11:00 AM",
    place: "Piassa, Addis Ababa",
    text: "An open community pop-up: brew bar, retail bags, and conversations that run long.",
  },
];

const HOSTED = [
  {
    t: "Coffee ceremony experience",
    d: "A trained host, jebena service and origin storytelling for your guests.",
  },
  {
    t: "Brew bar & sampling",
    d: "Filter and espresso service for launches, conferences and markets.",
  },
  {
    t: "Co-branded activation",
    d: "Custom bags, signage and tasting flights built around your brand.",
  },
];

function Events() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title={
          <>
            Meet us <span className="text-primary">in person.</span>
          </>
        }
        intro="Tastings, pop-ups and coffee-ceremony demonstrations across Addis Ababa — plus Tona experiences hosted at your own event."
      />

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-6">
            {EVENTS.map((e, index) => (
              <article
                key={e.title}
                className="grid overflow-hidden rounded-3xl border border-border md:grid-cols-[220px_1fr]"
              >
                <div className="leaf-field flex flex-col justify-between bg-teal p-6 text-teal-foreground">
                  <div>
                    <p className="label-mono text-teal-foreground/60">
                      {e.month}
                    </p>
                    <p className="font-display text-6xl font-bold">{e.day}</p>
                  </div>
                  <p className="mt-6 flex items-center gap-2 text-sm text-teal-foreground/80">
                    <MapPin className="h-4 w-4 text-primary" /> {e.place}
                  </p>
                </div>
                <div className="p-6 sm:p-8">
                  <h2 className="font-display text-2xl font-bold sm:text-3xl">
                    {e.title}
                  </h2>
                  <p className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" /> {e.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-primary" /> Open to
                      the public
                    </span>
                  </p>
                  <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                    {e.text}
                  </p>
                  <EventRegistrationDialog
                    event={EVENT_OPTIONS[index]!}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <img
            src={eventImg}
            alt="Guests gathered around a Tona coffee tasting table with a woven basket and cups"
            width={1400}
            height={900}
            loading="lazy"
            className="rounded-3xl object-cover"
          />
          <div>
            <p className="label-mono text-primary">Host Tona</p>
            <h2 className="mt-3 font-display text-4xl font-bold">
              Bring the second round to your event.
            </h2>
            <div className="mt-8 space-y-4">
              {HOSTED.map((h) => (
                <div
                  key={h.t}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <h3 className="text-lg font-bold">{h.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{h.d}</p>
                </div>
              ))}
            </div>
            <a
              href={waLink(
                "Hi Tona, I'd like to host a Tona coffee experience at our event.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" /> Enquire about hosting
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
