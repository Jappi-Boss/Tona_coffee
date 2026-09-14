import { createFileRoute } from "@tanstack/react-router";
import { ReferenceEventsPage } from "@/components/site/ReferenceSite";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Tona Coffee — Events" },
      {
        name: "description",
        content:
          "Tastings, pop-ups and Ethiopian coffee-ceremony experiences across Addis Ababa, plus Tona experiences hosted at your own event.",
      },
    ],
  }),
  component: ReferenceEventsPage,
});
