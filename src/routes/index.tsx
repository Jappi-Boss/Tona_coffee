import { createFileRoute } from "@tanstack/react-router";
import { ReferenceHome } from "@/components/site/ReferenceSite";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tona Coffee — Stay for Tona, Stay for the Moment" },
      {
        name: "description",
        content:
          "Tona Coffee is an African-led Ethiopian specialty coffee roaster. Four export origins, one local House Blend, wholesale partnerships, 100g samples and coffee experiences in Addis Ababa.",
      },
      {
        property: "og:title",
        content: "Tona Coffee — Stay for Tona, Stay for the Moment",
      },
      {
        property: "og:description",
        content:
          "African-led Ethiopian specialty coffee roaster. Four export origins, one local House Blend, wholesale partnerships, 100g samples and coffee experiences in Addis Ababa.",
      },
    ],
  }),
  component: ReferenceHome,
});
