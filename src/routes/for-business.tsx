import { createFileRoute } from "@tanstack/react-router";
import { ReferenceBusinessPage } from "@/components/site/ReferenceSite";

export const Route = createFileRoute("/for-business")({
  head: () => ({
    meta: [
      { title: "Tona Coffee — For business" },
      {
        name: "description",
        content:
          "Long-term Ethiopian coffee partnerships for cafés, retailers, hotels, distributors, offices and events.",
      },
    ],
  }),
  component: ReferenceBusinessPage,
});
