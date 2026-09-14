import { createFileRoute } from "@tanstack/react-router";
import { ReferenceCoffeePage } from "@/components/site/ReferenceSite";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Tona Coffee — Our coffee" },
      {
        name: "description",
        content:
          "Four Ethiopian coffee origins, cupped, graded and reserved for international buyers: Yirgacheffe, Sidama, Guji and Jimma.",
      },
    ],
  }),
  component: ReferenceCoffeePage,
});
