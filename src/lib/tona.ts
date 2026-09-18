export const WHATSAPP_NUMBER = "251986212224";
export const WHATSAPP_DISPLAY = "+251 98 621 2224";

export function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export type Product = {
  slug: string;
  name: string;
  region: string;
  process: string;
  notes: string[];
  blurb: string;
  altitude: string;
  accent: "orange" | "teal";
};

export const PRODUCTS: Product[] = [
  {
    slug: "yirgacheffe",
    name: "Yirgacheffe",
    region: "Gedeo, Ethiopia",
    process: "Washed",
    notes: ["Floral", "Citrus", "Sweet"],
    blurb: "Floral, bright and aromatic Ethiopian coffee.",
    altitude: "1,750–2,200m",
    accent: "orange",
  },
  {
    slug: "sidama",
    name: "Sidama",
    region: "Sidama, Ethiopia",
    process: "Natural",
    notes: ["Berry", "Cocoa", "Citrus"],
    blurb: "Bright, fruity and expressive Ethiopian coffee.",
    altitude: "1,550–2,200m",
    accent: "teal",
  },
  {
    slug: "guji",
    name: "Guji",
    region: "Oromia, Ethiopia",
    process: "Natural & Washed lots",
    notes: ["Stone fruit", "Spice", "Sweet"],
    blurb: "Rich, complex and fruit-forward Ethiopian coffee.",
    altitude: "1,800–2,300m",
    accent: "teal",
  },
  {
    slug: "jimma",
    name: "Jimma",
    region: "Jimma, Oromia",
    process: "Natural",
    notes: ["Cocoa", "Spice", "Winey"],
    blurb: "Full-bodied, earthy and quietly sweet Ethiopian coffee.",
    altitude: "1,400–2,000m",
    accent: "orange",
  },
];

export const SIZES = ["250g", "500g", "1kg"] as const;
export const FORMATS = ["Whole Bean", "Espresso Grind", "Filter Grind"] as const;
