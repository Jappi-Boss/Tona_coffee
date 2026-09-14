import { createFileRoute } from "@tanstack/react-router";
import { ReferenceContactPage } from "@/components/site/ReferenceSite";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Tona Coffee — Contact" },
      {
        name: "description",
        content:
          "Order, enquire, find Tona Coffee stockists in Addis Ababa, or continue the conversation with feedback.",
      },
    ],
  }),
  component: ReferenceContactPage,
});
