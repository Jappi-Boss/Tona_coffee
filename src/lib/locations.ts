export type Stockist = {
  id: string;
  number: string;
  name: string;
  address: string;
  note: string;
  directions: string;
  logoUrl: string;
  phone: string;
  instagram: string;
};

export const STOCKISTS_SETTING_KEY = "stockists";

export const DEFAULT_STOCKISTS: Stockist[] = [
  {
    id: "stockist-emawa-mart",
    number: "01",
    name: "Emawa Mart",
    logoUrl: "/stockists/emawa-mart.png",
    phone: "",
    instagram: "",
    address: "Mexico, Lideta · Addis Ababa",
    note: "Tona House Blend, retail packs.",
    directions:
      "https://www.google.com/maps/search/?api=1&query=Emawa%20Mart%2C%20Addis%20Ababa%2C%20Ethiopia",
  },
  {
    id: "stockist-allmart",
    number: "02",
    name: "Allmart",
    logoUrl: "/stockists/allmart.png",
    phone: "",
    instagram: "",
    address: "Bisrate Gabriel, Nefas Silk · Addis Ababa",
    note: "Tona House Blend, retail packs.",
    directions:
      "https://www.google.com/maps/search/?api=1&query=Allmart%20Bisrate%20Gabriel%2C%20Addis%20Ababa%2C%20Ethiopia",
  },
  {
    id: "stockist-mt-super-valu",
    number: "03",
    name: "MT Super Valu",
    address: "",
    note: "",
    directions: "https://maps.app.goo.gl/cfMsVfKDRppetFwi6?g_st=it",
    logoUrl: "/stockists/mt-super-valu.jpg",
    phone: "090 376 7778",
    instagram: "https://www.instagram.com/mt_super_valu/",
  },
];

function cloneDefaultStockists() {
  return DEFAULT_STOCKISTS.map((stockist) => ({ ...stockist }));
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function fallbackDirections(name: string, address: string) {
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(name + ", " + address)
  );
}

export function normalizeStockists(value: unknown): Stockist[] {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = null;
    }
  }

  if (!Array.isArray(parsed)) return cloneDefaultStockists();

  return parsed.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const name = text(record.name);
    const address = text(record.address);
    if (!name) return [];

    return [
      {
        id: text(record.id) || "stockist-" + String(index + 1),
        number:
          text(record.number) || String(index + 1).padStart(2, "0"),
        name,
        address,
        note: text(record.note),
        logoUrl: safeLogoUrl(record["logoUrl"]),
        phone: text(record["phone"]),
        instagram: safeInstagramUrl(record["instagram"]),
        directions:
          text(record.directions) || fallbackDirections(name, address),
      },
    ];
  });
}

export function orderStockists(stockists: Stockist[]) {
  return [...stockists].sort((left, right) => {
    const leftNumber = Number.parseInt(left.number, 10);
    const rightNumber = Number.parseInt(right.number, 10);
    const leftHasNumber = !Number.isNaN(leftNumber);
    const rightHasNumber = !Number.isNaN(rightNumber);

    if (leftHasNumber && rightHasNumber && leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }
    if (leftHasNumber !== rightHasNumber) return leftHasNumber ? -1 : 1;
    return left.name.localeCompare(right.name);
  });
}

// Only render supported URL schemes from stored location data.
export function safeLogoUrl(value: unknown) {
  const url = text(value);
  return url.startsWith("https://") || /^\/stockists\/[a-z0-9.-]+$/i.test(url) ? url : "";
}

export function safeInstagramUrl(value: unknown) {
  const url = text(value);
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(parsed.hostname) ? url : "";
  } catch {
    return "";
  }
}
