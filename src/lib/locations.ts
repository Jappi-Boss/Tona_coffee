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
  latitude: number | null;
  longitude: number | null;
};

export const STOCKISTS_SETTING_KEY = "stockists";

export const DEFAULT_STOCKISTS: Stockist[] = [
  {
    id: "stockist-emawa-mart",
    number: "01",
    name: "Emawa Mart",
    latitude: 9.007352,
    longitude: 38.7428241,
    logoUrl: "/stockists/emawa-mart.png",
    phone: "",
    instagram: "",
    address: "Mexico, Lideta · Addis Ababa",
    note: "Tona House Blend, retail packs.",
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=9.007352,38.7428241&destination_place_id=ChIJsfBmVwCFSxYRelOY9oGmt18",
  },
  {
    id: "stockist-allmart",
    number: "02",
    name: "Allmart",
    latitude: 8.986868,
    longitude: 38.7213186,
    logoUrl: "/stockists/allmart.png",
    phone: "",
    instagram: "",
    address: "Bisrate Gabriel, Nefas Silk · Addis Ababa",
    note: "Tona House Blend, retail packs.",
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=8.986868,38.7213186&destination_place_id=ChIJ231yVymHSxYRnioIpCNap3Y",
  },
  {
    id: "stockist-mt-super-valu",
    number: "03",
    name: "MT Super Valu",
    latitude: 8.9900508,
    longitude: 38.7826172,
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
    const name = text(record["name"]);
    const address = text(record["address"]);
    if (!name) return [];
    const known = DEFAULT_STOCKISTS.find(
      (stockist) => stockist.id === text(record["id"]),
    );
    const latitude = coordinate(
      record["latitude"] === undefined ? known?.latitude : record["latitude"],
      85,
    );
    const longitude = coordinate(
      record["longitude"] === undefined
        ? known?.longitude
        : record["longitude"],
      180,
    );

    return [
      {
        id: text(record["id"]) || "stockist-" + String(index + 1),
        number: text(record["number"]) || String(index + 1).padStart(2, "0"),
        name,
        latitude: latitude !== null && longitude !== null ? latitude : null,
        longitude: latitude !== null && longitude !== null ? longitude : null,
        address,
        note: text(record["note"]),
        logoUrl: safeLogoUrl(record["logoUrl"]),
        phone: text(record["phone"]),
        instagram: safeInstagramUrl(record["instagram"]),
        directions:
          text(record["directions"]) || fallbackDirections(name, address),
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
  return url.startsWith("https://") || /^\/stockists\/[a-z0-9.-]+$/i.test(url)
    ? url
    : "";
}

export function safeInstagramUrl(value: unknown) {
  const url = text(value);
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" &&
      ["instagram.com", "www.instagram.com"].includes(parsed.hostname)
      ? url
      : "";
  } catch {
    return "";
  }
}

function coordinate(value: unknown, max: number) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= max ? number : null;
}
