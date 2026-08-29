import { type FormEvent } from "react";
import { ArrowUpRight, Users } from "lucide-react";
import { waLink } from "@/lib/tona";

const EVENT_OPTIONS = [
  "Tona Coffee Ceremony Tasting — September 14",
  "Guji & Gesha Cupping Table — October 5",
  "Second Round Pop-Up — November 22",
];

export function EventRegistrationForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const message = [
      "Hi Tona, I'd like to register for an upcoming event.",
      `Event: ${form.get("event")}`,
      `Name: ${form.get("name")}`,
      `Phone: ${form.get("phone")}`,
      `Email: ${form.get("email") || "Not provided"}`,
      `Guests: ${form.get("guests")}`,
      `Note: ${form.get("note") || "None"}`,
    ].join("\n");

    window.open(waLink(message), "_blank", "noopener,noreferrer");
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-card p-6 text-foreground shadow-sm sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-mono text-primary">Reserve your place</p>
          <h3 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            Event registration
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Complete the form and send your registration directly to the Tona
            team on WhatsApp.
          </p>
        </div>
        <span className="hidden rounded-full bg-primary/10 p-3 text-primary sm:block">
          <Users className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold sm:col-span-2">
          Choose an event
          <select
            name="event"
            required
            className={inputClass}
            defaultValue={EVENT_OPTIONS[0]}
          >
            {EVENT_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Full name
          <input
            name="name"
            required
            autoComplete="name"
            className={inputClass}
            placeholder="Your name"
          />
        </label>
        <label className="text-sm font-semibold">
          Phone / WhatsApp
          <input
            name="phone"
            required
            type="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="+251 ..."
          />
        </label>
        <label className="text-sm font-semibold">
          Email{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
          />
        </label>
        <label className="text-sm font-semibold">
          Number of guests
          <input
            name="guests"
            required
            type="number"
            min="1"
            max="10"
            defaultValue="1"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Note{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
          <textarea
            name="note"
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Accessibility, group, or event questions"
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
      >
        Register on WhatsApp <ArrowUpRight className="h-4 w-4" />
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Registration is confirmed by the Tona team.
      </p>
    </form>
  );
}
