import { type FormEvent, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, MessageCircle, Users, X } from "lucide-react";
import { waLink } from "@/lib/tona";

export const EVENT_OPTIONS = [
  "Tona Coffee Ceremony Tasting — September 14",
  "Guji & Gesha Cupping Table — October 5",
  "Second Round Pop-Up — November 22",
] as const;

type EventRegistrationFormProps = {
  defaultEvent?: (typeof EVENT_OPTIONS)[number];
  onSubmitted?: () => void;
};

export function EventRegistrationForm({
  defaultEvent = EVENT_OPTIONS[0],
  onSubmitted,
}: EventRegistrationFormProps) {
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
    onSubmitted?.();
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

  return (
    <form onSubmit={handleSubmit} className="text-foreground">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold sm:col-span-2">
          Choose an event
          <select
            name="event"
            required
            className={inputClass}
            defaultValue={defaultEvent}
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
        Continue registration on WhatsApp <ArrowUpRight className="h-4 w-4" />
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Registration is confirmed by the Tona team.
      </p>
    </form>
  );
}

export function EventRegistrationDialog({
  event,
  className,
}: {
  event: (typeof EVENT_OPTIONS)[number];
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={
            className ??
            "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          }
        >
          <MessageCircle className="h-4 w-4" /> Register to attend
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-foreground/65 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[110] max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-border bg-card p-6 text-foreground shadow-2xl focus:outline-none sm:p-8">
          <div className="flex items-start justify-between gap-5 pr-8">
            <div>
              <p className="label-mono text-primary">Reserve your place</p>
              <Dialog.Title className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                Event registration
              </Dialog.Title>
              <Dialog.Description className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Enter your details below. Your selected event is already filled
                in, and the final request is sent directly to Tona on WhatsApp.
              </Dialog.Description>
            </div>
            <span className="hidden rounded-full bg-primary/10 p-3 text-primary sm:block">
              <Users className="h-5 w-5" />
            </span>
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close registration form"
              className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          <div className="mt-7">
            <EventRegistrationForm
              defaultEvent={event}
              onSubmitted={() => setOpen(false)}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
