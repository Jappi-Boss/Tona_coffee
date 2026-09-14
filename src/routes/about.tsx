import { createFileRoute } from "@tanstack/react-router";
import { ReferenceAboutPage } from "@/components/site/ReferenceSite";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Tona Coffee — Some conversations need more time." },
      {
        name: "description",
        content:
          "Born from Ethiopia’s coffee culture and inspired by the second round of the coffee ceremony, Tona is an African-led specialty roaster rooted in Ethiopia’s coffee heartlands.",
      },
    ],
  }),
  component: ReferenceAboutPage,
});
