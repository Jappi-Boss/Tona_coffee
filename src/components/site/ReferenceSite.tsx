import { referenceSections } from "./reference-sections";
import genericCoffeeImage from "@/assets/beans.jpg";
import { MapPin, Phone, Instagram } from "lucide-react";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Link } from "@tanstack/react-router";
import {
  getPublicCatalog,
  getPublicLocations,
  submitBusinessInquiry,
  emailContactRequest,
  submitFeedback,
  submitLocationRequest,
  submitEventRegistration,
  submitQuotation,
  type PublicEvent,
  type PublicProduct,
  type PublicStockist,
} from "@/lib/public-api";
import { DEFAULT_STOCKISTS } from "@/lib/locations";
import { waLink } from "@/lib/tona";

const REFERENCE_BASE = "https://tona-coffee-two.vercel.app";

export const REFERENCE_IMAGES = {
  hero: REFERENCE_BASE + "/framer-hero-illustration-v5.png",
  about: REFERENCE_BASE + "/tona-ceremony-about-v2.webp",
  business: REFERENCE_BASE + "/assets/tona-partnership-support-v3.webp",
  event: REFERENCE_BASE + "/assets/tona-events-v3.webp",
  yirgacheffe: REFERENCE_BASE + "/assets/origins-v2/yirgacheffe-washed-v3.webp",
  sidama: REFERENCE_BASE + "/assets/origins-v2/sidama-natural-v3.webp",
  guji: REFERENCE_BASE + "/assets/origins-v2/guji-natural-v3.webp",
  jimma: REFERENCE_BASE + "/assets/origins-v2/jimma-natural-v3.webp",
} as const;

const REFERENCE_PRODUCT_IMAGES: Record<string, string> = {
  yirgacheffe: REFERENCE_IMAGES.yirgacheffe,
  yergachef: REFERENCE_IMAGES.yirgacheffe,
  sidama: REFERENCE_IMAGES.sidama,
  guji: REFERENCE_IMAGES.guji,
  jimma: REFERENCE_IMAGES.jimma,
};

type OriginCardData = {
  id: string;
  name: string;
  slug: string;
  image: string;
  fallbackImage: string;
  process: string;
  region: string;
  description: string;
  notes: string[];
  altitude: string | null;
};

function toOriginCardData(product: PublicProduct): OriginCardData {
  const fallbackImage =
    REFERENCE_PRODUCT_IMAGES[product.slug] ?? genericCoffeeImage;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: product.imageUrl ?? fallbackImage,
    fallbackImage,
    process: product.process,
    region: product.region,
    description: product.description,
    notes: product.tastingNotes,
    altitude: product.altitude,
  };
}

const PARTNERS = [
  [
    "Cafés & coffee shops",
    "Coffee supply, brewing guidance, Ethiopian origin storytelling and barista support.",
    "cup",
  ],
  [
    "Supermarkets & retailers",
    "Retail-ready products, promotional and tasting support, and wholesale supply.",
    "store",
  ],
  [
    "Hotels & resorts",
    "Coffee supply, product selection, brewing guidance and coffee experiences for guests.",
    "hotel",
  ],
  [
    "Distributors & international partners",
    "Wholesale supply, product information, brand storytelling and long-term development.",
    "globe",
  ],
  [
    "Corporate & office",
    "Workplace coffee supply, meeting and event solutions, and customized experiences.",
    "office",
  ],
  [
    "Events & collaborations",
    "Coffee supply, tasting experiences, sampling and co-branded activations.",
    "calendar",
  ],
] as const;

const PACKAGES = [
  ["1kg", "For high-volume service and professional coffee programmes."],
  ["500g", "A versatile format for retail, office and hospitality service."],
  ["250g", "A retail-ready format for guests and home coffee drinkers."],
] as const;

const FORMATS = [
  ["M.B", "Medium Bean"],
  ["M.D.B", "Medium Dark Bean"],
  ["M.F", "Medium Filter"],
  ["M.D.F", "Medium Dark Filter"],
  ["M.D.E", "Medium Dark Espresso"],
] as const;

const STOCKISTS = DEFAULT_STOCKISTS;

type SectionHeadingProps = {
  id: string;
  index: string;
  title: ReactNode;
  intro?: string;
  titleLabel?: string;
};

function RevealWords({
  words,
  startAt = 0,
}: {
  words: string[];
  startAt?: number;
}) {
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={word + "-" + index}>
          <span
            className="reveal-word"
            aria-hidden="true"
            style={
              { "--word-delay": (startAt + index) * 38 + "ms" } as CSSProperties
            }
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

function CinematicHeading({ as, text }: { as: "h3" | "h4"; text: string }) {
  const Heading = as;
  const words = text.split(" ");

  return (
    <Heading className="cinematic-copy" aria-label={text}>
      {words.map((word, index) => (
        <Fragment key={word + "-" + index}>
          <span className="cinematic-word-mask">
            <span
              className="cinematic-word"
              aria-hidden="true"
              style={
                { "--cinematic-delay": index * 48 + "ms" } as CSSProperties
              }
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Heading>
  );
}

function AmendIcon({
  type,
  delay,
}: {
  type: "cup" | "store" | "hotel" | "globe" | "office" | "calendar";
  delay: number;
}) {
  let artwork: ReactNode;

  if (type === "cup") {
    artwork = (
      <>
        <path
          data-draw=""
          pathLength={1}
          d="M7 17h25v10a11 11 0 0 1-11 11h-3A11 11 0 0 1 7 27Z"
        />
        <path
          data-draw=""
          pathLength={1}
          d="M32 21h4a5 5 0 0 1 0 10h-5M5 42h34M14 12c-2-4 3-5 1-9M23 12c-2-4 3-5 1-9"
        />
      </>
    );
  } else if (type === "store") {
    artwork = (
      <>
        <path data-draw="" pathLength={1} d="M6 19h36v23H6ZM9 8h30l4 11H5Z" />
        <path
          data-draw=""
          pathLength={1}
          d="M15 42V29h9v13M29 28h8v7h-8M5 19c3 4 6 4 9 0 3 4 6 4 9 0 3 4 6 4 9 0 3 4 6 4 11 0"
        />
      </>
    );
  } else if (type === "hotel") {
    artwork = (
      <path
        data-draw=""
        pathLength={1}
        d="M9 43V8h30v35M4 43h40M16 15h5v5h-5ZM27 15h5v5h-5ZM16 26h5v5h-5ZM27 26h5v5h-5ZM21 43V35h6v8"
      />
    );
  } else if (type === "globe") {
    artwork = (
      <>
        <circle data-draw="" pathLength={1} cx="24" cy="24" r="19" />
        <path
          data-draw=""
          pathLength={1}
          d="M5 24h38M24 5c6 6 9 12 9 19s-3 13-9 19c-6-6-9-12-9-19s3-13 9-19ZM8 15h32M8 33h32"
        />
      </>
    );
  } else if (type === "office") {
    artwork = (
      <path
        data-draw=""
        pathLength={1}
        d="M7 43V13h22v30M29 22h12v21M3 43h42M13 20h5M13 27h5M13 34h5M23 20h1M23 27h1M23 34h1M34 29h3M34 35h3"
      />
    );
  } else {
    artwork = (
      <>
        <rect
          data-draw=""
          pathLength={1}
          x="6"
          y="10"
          width="29"
          height="32"
          rx="2"
        />
        <path
          data-draw=""
          pathLength={1}
          d="M13 5v10M28 5v10M6 20h29M39 28v12M33 34h12"
        />
      </>
    );
  }

  return (
    <span
      className="amend-icon"
      aria-hidden="true"
      style={{ "--icon-delay": delay + "ms" } as CSSProperties}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {artwork}
      </svg>
    </span>
  );
}
function MomentIcon({
  type,
  delay,
}: {
  type: "people" | "briefcase" | "handshake" | "family" | "cup";
  delay: number;
}) {
  let artwork: ReactNode;

  if (type === "people") {
    artwork = (
      <>
        <circle data-draw="" pathLength={1} cx="17" cy="17" r="5" />
        <circle data-draw="" pathLength={1} cx="31" cy="18" r="4" />
        <path
          data-draw=""
          pathLength={1}
          d="M7 38c1.6-7.2 5-10 10-10s8.4 2.8 10 10M27 29c5.7-1.3 10.7 1.7 13 8"
        />
      </>
    );
  } else if (type === "briefcase") {
    artwork = (
      <>
        <rect
          data-draw=""
          pathLength={1}
          x="7"
          y="15"
          width="34"
          height="24"
          rx="2"
        />
        <path
          data-draw=""
          pathLength={1}
          d="M17 15v-4h14v4M7 24h34M20 24v4h8v-4"
        />
      </>
    );
  } else if (type === "handshake") {
    artwork = (
      <path
        data-draw=""
        pathLength={1}
        d="m5 18 8-6 8 6-5 4a3 3 0 0 0 4 4.5l6-4.5 9-10 8 6M6 31l9 8a3 3 0 0 0 4 0l2-2M42 31l-9 8a3 3 0 0 1-4 0L20 31"
      />
    );
  } else if (type === "family") {
    artwork = (
      <>
        <path data-draw="" pathLength={1} d="M6 23 24 8l18 15v18H6Z" />
        <path
          data-draw=""
          pathLength={1}
          d="M17 41V28h14v13M24 25c-5-5-10 2 0 9 10-7 5-14 0-9Z"
        />
      </>
    );
  } else {
    artwork = (
      <>
        <path
          data-draw=""
          pathLength={1}
          d="M9 20h25v9a10 10 0 0 1-10 10h-5A10 10 0 0 1 9 29Z"
        />
        <path
          data-draw=""
          pathLength={1}
          d="M34 23h4a5 5 0 0 1 0 10h-5M6 42h33M17 14c-3-4 3-5 0-9M26 14c-3-4 3-5 0-9"
        />
      </>
    );
  }

  return (
    <span
      className="amend-icon"
      aria-hidden="true"
      style={{ "--icon-delay": delay + "ms" } as CSSProperties}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {artwork}
      </svg>
    </span>
  );
}

function SectionHeading({
  id,
  index,
  title,
  intro,
  titleLabel,
}: SectionHeadingProps) {
  return (
    <div className="section-heading reveal">
      <p className="section-index">{index}</p>
      <h2
        id={id}
        className="display word-reveal motion-heading"
        aria-label={titleLabel}
      >
        {title}
      </h2>
      {intro ? <p className="section-intro motion-copy">{intro}</p> : null}
    </div>
  );
}

function ReferencePage({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function ReferenceHero() {
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero-grid">
        <p className="kicker">African-led specialty coffee roaster</p>
        <h1 id="hero-title" className="display display-hero">
          <span>Stay for Tona.</span>
          <span>Stay for the moment</span>
        </h1>
        <div className="hero-copy">
          <div className="definition">
            <p className="term">
              <strong>Tona /tow-nah/</strong>
              <span>[Noun]</span>
            </p>
            <p className="meaning">
              <b>01/</b>A. The second cup of coffee in Ethiopian coffee
              ceremony. B. A unique coffee brand with the essence of community
              and bringing people together.
            </p>
          </div>
          <div className="hero-intro">
            <p>
              The first cup brings people together. The second round is where
              conversations deepen, ideas take shape, and people stay a little
              longer. This is where Tona belongs.
            </p>
            <div className="button-row">
              <a href="#coffee">
                Explore our coffee <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <figure className="hero-media">
        <img
          src={REFERENCE_IMAGES.hero}
          width="1416"
          height="1341"
          alt="Illustration of two women sharing the Ethiopian coffee ceremony among coffee branches"
          fetchPriority="high"
        />
      </figure>

      <a
        className="original-hero-play"
        href="#story"
        aria-label="Continue to the Tona story"
      >
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <defs>
            <path
              id="watch-circle"
              d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0"
            />
          </defs>
          <text>
            <textPath href="#watch-circle" startOffset="1%">
              Our story · Our story · Our story ·
            </textPath>
          </text>
          <path className="play-triangle" d="M52 43 L82 60 L52 77 Z" />
        </svg>
      </a>
    </section>
  );
}

function ReferenceAboutSection() {
  return (
    <div
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: referenceSections.story }}
    />
  );
}

function OriginCard({ origin }: { origin: OriginCardData }) {
  return (
    <article
      className="origin-card reveal motion-card"
      data-origin={origin.slug}
    >
      <figure className="parallax-media">
        <img
          src={origin.image}
          width="720"
          height="360"
          alt={`${origin.name} ${origin.process} coffee from ${origin.region}`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = origin.fallbackImage;
          }}
        />
      </figure>
      <div className="origin-card-body">
        <div className="origin-meta">
          <span>{origin.process}</span>
          <span>{origin.region}</span>
        </div>
        <CinematicHeading as="h3" text={origin.name} />
        <p>{origin.description}</p>
        <ul
          className="tasting-notes"
          aria-label={origin.name + " tasting notes"}
        >
          {origin.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        {origin.altitude ? (
          <p className="altitude">
            {origin.altitude.toLowerCase().startsWith("altitude")
              ? origin.altitude
              : `Altitude ${origin.altitude}`}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function ReferenceCoffeeSection() {
  const [products, setProducts] = useState<OriginCardData[] | null>(null);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    let mounted = true;

    const refresh = () => {
      void getPublicCatalog()
        .then((catalog) => {
          if (mounted) {
            setProducts(catalog.products.map(toOriginCardData));
            setCatalogError("");
          }
        })
        .catch(() => {
          if (mounted) {
            setProducts([]);
            setCatalogError(
              "The current coffee catalogue could not be loaded. Please try again shortly.",
            );
          }
        });
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      mounted = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return (
    <section
      className="origins section section-dark motion-section section-cinema"
      id="coffee"
      aria-labelledby="coffee-title"
    >
      <div className="section-lead">
        <div className="section-heading reveal">
          <p className="section-index">02 / Our coffee</p>
          <h2 id="coffee-title" className="display coffee-product-title">
            House Blend.
          </h2>
          <p className="coffee-product-subtitle">Ethiopia in every cup.</p>
          <p className="section-intro">
            Our House Blend brings together the best of Ethiopia&rsquo;s coffee
            lands in one roast. It&rsquo;s smooth, balanced, and built for
            everyday moments, your morning start, your work break, your second
            round with the people you love. This is Tona at home.
          </p>
        </div>
        <figure className="section-art reveal">
          <img
            src="https://tona-coffee-two.vercel.app/assets/art/roasting-pan.webp"
            width="1200"
            height="900"
            alt="Tona House Blend being poured into ceremony cups while a bag of House Blend is shown"
            loading="lazy"
            decoding="async"
          />
          <figcaption>Our House Blend, poured for the second round.</figcaption>
        </figure>
      </div>

      <div className="coffee-split">
        <div className="export-block">
          <div className="section-lead section-lead--flip">
            <div className="section-heading reveal">
              <p className="section-index">For export green coffee.</p>
              <h3 className="display coffee-product-title coffee-product-title--split">
                <span className="product-line product-line--sun">
                  Ethiopian coffee.
                </span>{" "}
                <span className="product-line product-line--ember">
                  Sourced for export.
                </span>
              </h3>
              <p className="section-intro">
                We source and export premium Ethiopian green coffee for
                roasters, importers, and traders worldwide. From regions such as{" "}
                <i className="region-name">Yirgacheffe</i>,{" "}
                <i className="region-name">Sidama</i>,{" "}
                <i className="region-name">Guji</i>, and{" "}
                <i className="region-name">Jimma</i>, we source to your quality,
                profile, and volume requirements and deliver to your door.
              </p>
            </div>
            <figure className="section-art reveal">
              <img
                src="https://tona-coffee-two.vercel.app/assets/art/highland-harvest.webp"
                width="1200"
                height="900"
                alt="Harvest in the Ethiopian highlands, with coffee drying on raised beds and sacks of green coffee"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Yirgacheffe, Sidama, Guji and Jimma.</figcaption>
            </figure>
          </div>

          <div className="origin-grid" aria-live="polite">
            {products === null ? (
              <p className="section-intro">
                Loading the current coffee catalogue…
              </p>
            ) : products.length ? (
              products.map((product) => (
                <OriginCard key={product.id} origin={product} />
              ))
            ) : (
              <p className="section-intro">
                {catalogError ||
                  "No published coffees are available right now."}
              </p>
            )}
          </div>

          <div className="export-rail reveal">
            <div>
              <p className="mono-label">Offer list</p>
              <p>
                Current lots are matched to your quality profile, volume and shipping window.
              </p>
            </div>
            <div>
              <p className="mono-label">Lot documents</p>
              <p>
                Origin, process, altitude and cupping notes travel with every
                offer.
              </p>
            </div>
            <div>
              <p className="mono-label">Volume</p>
              <p>
                Quoted per contract, against your shipping window and
                destination.
              </p>
            </div>
            <a
              className="button button-primary"
              href="https://wa.me/251986212224?text=Hi%20Tona%2C%20I%27d%20like%20to%20start%20an%20export%20enquiry%20for%20Ethiopian%20green%20coffee.%20Please%20send%20me%20your%20current%20offer%20list%2C%20lot%20documents%20and%20commercial%20requirements."
              target="_blank"
              rel="noopener noreferrer"
              data-export-whatsapp
            >
              Start an export request on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrincipleIcon({ type }: { type: "handshake" | "eye" | "link" }) {
  if (type === "eye") {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 32s9-14 26-14 26 14 26 14-9 14-26 14S6 32 6 32Z" />
        <circle cx="32" cy="32" r="7" />
      </svg>
    );
  }

  if (type === "link") {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="m27 39-5 5a10 10 0 0 1-14-14l9-9a10 10 0 0 1 14 0" />
        <path d="m37 25 5-5a10 10 0 0 1 14 14l-9 9a10 10 0 0 1-14 0M23 41l18-18" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 19l10-7 10 7-6 5a4 4 0 0 0 5.5 5.8L34 24l13-12 10 7" />
      <path d="M8 37l12 12a4 4 0 0 0 5.5 0l1.5-1.5M56 37 45 48a4 4 0 0 1-5.5 0L27 36" />
    </svg>
  );
}

function ReferenceDifferenceSection() {
  return (
    <div
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: referenceSections.difference }}
    />
  );
}

function ReferenceBusinessSection() {
  return (
    <div
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: referenceSections.business }}
    />
  );
}

function openWhatsAppFromForm(
  event: FormEvent<HTMLFormElement>,
  subject: string,
  setStatus: (message: string) => void,
) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const details = Array.from(data.entries())
    .filter(([, value]) => String(value).trim())
    .map(([key, value]) => key + ": " + String(value).trim());
  window.open(
    waLink([subject, ...details].join("\n")),
    "_blank",
    "noopener,noreferrer",
  );
  setStatus(
    "Your WhatsApp message is ready. The Tona team will confirm the details.",
  );
}

function formText(data: FormData, name: string) {
  return String(data.get(name) ?? "").trim();
}

function optionalFormText(data: FormData, name: string) {
  return formText(data, name) || null;
}

function prepareWhatsAppWindow() {
  const popup = window.open("about:blank", "_blank");
  if (popup) popup.opener = null;
  return popup;
}

function finishWhatsAppWindow(
  popup: Window | null,
  message: string,
  close = false,
) {
  if (close) {
    popup?.close();
    return;
  }
  if (popup) {
    popup.location.href = waLink(message);
  } else {
    window.open(waLink(message), "_blank", "noopener,noreferrer");
  }
}

async function submitQuotationForm(
  event: FormEvent<HTMLFormElement>,
  packageSize: "1kg" | "500g" | "250g" | "custom",
  setStatus: (message: string) => void,
) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const format = formText(data, "format-choice");
  const channel =
    (event.nativeEvent as SubmitEvent).submitter?.getAttribute("data-send") ||
    "whatsapp";
  const popup = channel === "whatsapp" ? prepareWhatsAppWindow() : null;

  try {
    const result = await submitQuotation({
      data: {
        channel: channel === "email" ? "email" : "whatsapp",
        packageSize,
        format,
        brandName: optionalFormText(data, "brand-name"),
        message: optionalFormText(data, "message"),
      },
    });
    if (channel === "whatsapp")
      finishWhatsAppWindow(
        popup,
        result.whatsappMessage,
        Boolean(result.whatsappSent),
      );
    setStatus(
      `Quotation ${result.quoteNumber} saved in our system. ${channel === "email"
        ? result.emailSent ? "Email sent to info@tonacoffee.et." : "The email copy could not be sent. Please contact info@tonacoffee.et with your reference."
        : result.whatsappSent ? "WhatsApp notification sent." : "Continue in WhatsApp to send your quotation."}`,
    );
  } catch (error) {
    popup?.close();
    setStatus(error instanceof Error ? error.message : "Could not save your quotation. Please try again.");
  }
}


async function submitLocationRequestForm(event: FormEvent<HTMLFormElement>, setStatus: (message: string) => void) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (button?.disabled) return;
  const data = new FormData(form);
  const area = formText(data, "area");
  const venue = optionalFormText(data, "venue");
  if (area.length < 2) {
    setStatus("Enter your area or neighbourhood.");
    return;
  }
  const popup = prepareWhatsAppWindow();
  if (button) button.disabled = true;
  setStatus("Saving your location request…");
  try {
    const result = await submitLocationRequest({ data: { area, venue } });
    finishWhatsAppWindow(popup, ["Hi Tona, I would like to find your coffee near me.", `Area: ${area}`, venue ? `Shop or café: ${venue}` : ""].filter(Boolean).join("\n"), Boolean(result.whatsappSent));
    form.reset();
    setStatus("Your location request is saved. Continue in WhatsApp to speak with Tona.");
  } catch (error) {
    popup?.close();
    setStatus(error instanceof Error ? error.message : "Could not save your location request. Please try again.");
  } finally {
    if (button) button.disabled = false;
  }
}

async function submitRequestForm(
  event: FormEvent<HTMLFormElement>,
  setStatus: (message: string) => void,
) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const message = [
    "Hi Tona, I have a request.",
    `Name: ${formText(data, "full-name")}`,
    `Phone: ${formText(data, "phone")}`,
    `Email: ${formText(data, "email")}`,
    `Organization: ${formText(data, "organization")}`,
    `Request type: ${formText(data, "request-type")}`,
    `Coffee interest: ${formText(data, "coffee-interest")}`,
    `Message: ${formText(data, "message")}`,
  ].join("\n");
  const channel =
    (event.nativeEvent as SubmitEvent).submitter?.getAttribute("data-send") ||
    "whatsapp";
  if (channel === "email") {
    setStatus("Sending your email…");
    try {
      await emailContactRequest({ data: {
        fullName: formText(data, "full-name"),
        phone: formText(data, "phone"),
        email: optionalFormText(data, "email"),
        organization: optionalFormText(data, "organization"),
        requestType: formText(data, "request-type"),
        coffeeInterest: optionalFormText(data, "coffee-interest"),
        message: formText(data, "message") || "No additional message.",
      } });
      setStatus("Your enquiry has been emailed to info@tonacoffee.et. Thank you.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send your email. Please try again.");
    }
  } else {
    finishWhatsAppWindow(prepareWhatsAppWindow(), message);
    setStatus("Your WhatsApp message is ready. Continue in WhatsApp to send it.");
  }
}

async function submitHostedEventForm(
  event: FormEvent<HTMLFormElement>,
  setStatus: (message: string) => void,
) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const eventName = formText(data, "event-name");
  const eventType = formText(data, "event-type");
  const eventDate = formText(data, "event-date");
  const eventGuests = formText(data, "event-guests");
  const eventLocation = formText(data, "event-location");
  const serviceFormat = formText(data, "event-service");
  const contactName = formText(data, "event-contact");
  const phone = formText(data, "event-phone");
  const notes = formText(data, "event-notes");
  const message = [
    `Event date: ${eventDate}`,
    `Expected guests: ${eventGuests}`,
    `Location: ${eventLocation}`,
    `Service format: ${serviceFormat}`,
    `Additional details: ${notes}`,
  ].join("\n");
  const whatsappMessage = [
    "Hi Tona, I'd like to submit an event for Tona to host or join.",
    `Event name: ${eventName}`,
    `Event type: ${eventType}`,
    `Date: ${eventDate}`,
    `Expected guests: ${eventGuests}`,
    `Location: ${eventLocation}`,
    `Service format: ${serviceFormat}`,
    `Name: ${contactName}`,
    `Phone: ${phone}`,
    `Notes: ${notes}`,
  ].join("\n");
  const popup = prepareWhatsAppWindow();

  try {
    const result = await submitBusinessInquiry({
      data: {
        organization: eventName,
        contactPerson: contactName,
        phone,
        email: null,
        businessType: eventType,
        coffeeInterest: serviceFormat,
        estimatedQuantity: eventGuests || null,
        message,
      },
    });
    finishWhatsAppWindow(popup, whatsappMessage, Boolean(result.whatsappSent));
    setStatus(
      `Event request saved. ${result.emailSent ? "Email sent. " : ""}${result.whatsappSent ? "WhatsApp notification sent." : "WhatsApp message is ready for you to send."}`,
    );
  } catch (error) {
    finishWhatsAppWindow(popup, whatsappMessage);
    setStatus(
      error instanceof Error && /required|valid/i.test(error.message)
        ? error.message
        : "We could not save the event request online. WhatsApp is ready—please send the message so Tona can help.",
    );
  }
}

function formatEventShortDate(value: string) {
  return new Date(value).toLocaleDateString("en-ET", {
    month: "short",
    day: "numeric",
    timeZone: "Africa/Addis_Ababa",
  });
}

function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("en-ET", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Addis_Ababa",
  });
}

function formatEventMonth(value: string) {
  return new Date(value).toLocaleDateString("en-ET", {
    month: "short",
    timeZone: "Africa/Addis_Ababa",
  });
}

function formatEventDay(value: string) {
  return new Date(value).toLocaleDateString("en-ET", {
    day: "2-digit",
    timeZone: "Africa/Addis_Ababa",
  });
}

function formatEventYearMonth(value: string) {
  return new Date(value).toLocaleDateString("en-ET", {
    month: "short",
    year: "numeric",
    timeZone: "Africa/Addis_Ababa",
  });
}

function ReferenceEventDialog({
  selected,
  events,
  onClose,
}: {
  selected: PublicEvent;
  events: PublicEvent[];
  onClose: () => void;
}) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [eventChoice, setEventChoice] = useState(selected.id);
  const chosenEvent =
    events.find((event) => event.id === eventChoice) ?? selected;
  const maxGuests = Math.min(
    10,
    chosenEvent.capacity === null
      ? 10
      : Math.max(1, chosenEvent.capacity - chosenEvent.registrationCount),
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || saved) return;
    const data = new FormData(event.currentTarget);
    const eventId = formText(data, "event");
    const selectedEvent =
      events.find((item) => item.id === eventId) ?? selected;
    const whatsappMessage = [
      "Hi Tona, I'd like to register for a Tona event.",
      `Event: ${selectedEvent.title}`,
      `Date: ${formatEventDate(selectedEvent.eventDate)}`,
      `Name: ${formText(data, "name")}`,
      `Phone: ${formText(data, "phone")}`,
      `Email: ${formText(data, "email")}`,
      `Guests: ${formText(data, "guests")}`,
      `Note: ${formText(data, "note")}`,
    ].join("\n");
    const popup = prepareWhatsAppWindow();
    setBusy(true);

    try {
      const result = await submitEventRegistration({
        data: {
          eventId,
          fullName: formText(data, "name"),
          phone: formText(data, "phone"),
          email: optionalFormText(data, "email"),
          guestCount: Number(formText(data, "guests")),
          notes: optionalFormText(data, "note"),
        },
      });
      setSaved(true);
      finishWhatsAppWindow(
        popup,
        whatsappMessage,
        Boolean(result.whatsappSent),
      );
      setStatus(
        `Registration saved. ${result.emailSent ? "Email sent. " : ""}${result.whatsappSent ? "WhatsApp notification sent." : "WhatsApp message is ready for you to send."}`,
      );
    } catch (error) {
      finishWhatsAppWindow(popup, whatsappMessage);
      setStatus(
        error instanceof Error &&
          /required|valid|closed|full/i.test(error.message)
          ? error.message
          : "We could not save the registration online. WhatsApp is ready—please send the message so Tona can confirm your place.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="event-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="event-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-dialog-title"
      >
        <div className="event-dialog-head">
          <div>
            <p className="mono-label">Reserve your place</p>
            <h2 id="event-dialog-title">Event registration</h2>
            <p>
              Your registration is saved in Tona’s event list and sent to the
              team for confirmation.
            </p>
          </div>
          <button
            className="event-dialog-close"
            type="button"
            onClick={onClose}
            aria-label="Close registration form"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            <span>Choose an event</span>
            <select
              name="event"
              value={eventChoice}
              onChange={(event) => {
                setEventChoice(event.target.value);
                setSaved(false);
              }}
              required
            >
              {events.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} — {formatEventShortDate(item.eventDate)}
                </option>
              ))}
            </select>
          </label>
          <div className="field-grid">
            <label>
              <span>Full name</span>
              <input
                name="name"
                minLength={2}
                maxLength={120}
                type="text"
                autoComplete="name"
                required
              />
            </label>
            <label>
              <span>Phone / WhatsApp</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                minLength={7}
                maxLength={40}
                required
              />
            </label>
            <label>
              <span>
                Email <small>(optional)</small>
              </span>
              <input name="email" type="email" autoComplete="email" />
            </label>
            <label>
              <span>Number of guests</span>
              <input
                name="guests"
                type="number"
                min="1"
                max={maxGuests}
                defaultValue="1"
                required
              />
            </label>
          </div>
          <label className="message-field">
            <span>
              Note <small>(optional)</small>
            </span>
            <textarea
              name="note"
              rows={3}
              placeholder="Accessibility, group, or event questions"
            />
          </label>
          <button
            className="button button-primary"
            type="submit"
            disabled={busy || saved}
          >
            {saved
              ? "Registration saved"
              : busy
                ? "Saving registration…"
                : "Register on WhatsApp"}{" "}
          </button>
          <p className="form-status" role="status">
            {status || "Registration is confirmed by the Tona team."}
          </p>
        </form>
      </div>
    </div>
  );
}

function ReferenceEventsSection() {
  const [events, setEvents] = useState<PublicEvent[] | null>(null);
  const [eventsError, setEventsError] = useState("");
  const [selected, setSelected] = useState<PublicEvent | null>(null);
  const [status, setStatus] = useState("");
  const [hostBusy, setHostBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    const refresh = () => {
      void getPublicCatalog()
        .then((catalog) => {
          if (mounted) {
            setEvents(catalog.events);
            setEventsError("");
          }
        })
        .catch(() => {
          if (mounted) {
            setEvents([]);
            setEventsError(
              "The current events catalogue could not be loaded. Please try again shortly.",
            );
          }
        });
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      mounted = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const publishedEvents = (events ?? []).filter(
    (event) => event.status === "published",
  );
  const completedEvents = (events ?? [])
    .filter((event) => event.status === "completed")
    .sort(
      (left, right) =>
        new Date(right.eventDate).getTime() -
        new Date(left.eventDate).getTime(),
    );
  const eventImage =
    events?.find((event) => event.coverImageUrl)?.coverImageUrl ??
    REFERENCE_IMAGES.event;

  return (
    <section
      className="events section section-dark motion-section section-cinema"
      id="events"
      aria-labelledby="events-title"
    >
      <SectionHeading
        id="events-title"
        index="05 / Events"
        titleLabel="Meet usin person."
        title={
          <>
            <RevealWords words={["Meet", "us"]} />
            <br />
            <span className="ember">
              <RevealWords words={["in", "person."]} startAt={2} />
            </span>
          </>
        }
        intro="Tastings, pop-ups and coffee-ceremony demonstrations across Addis Ababa—plus Tona experiences hosted at your own event."
      />

      <div className="events-layout">
        <figure className="events-image reveal motion-media parallax-media">
          <img
            src={eventImage}
            width="1400"
            height="900"
            alt="Two women enjoying Tona coffee among ripe Ethiopian coffee cherries"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = REFERENCE_IMAGES.event;
            }}
          />
        </figure>
        <div className="event-list">
          {events === null ? (
            <p className="section-intro">
              Loading the current events catalogue…
            </p>
          ) : publishedEvents.length ? (
            publishedEvents.map((event) => (
              <article className="event-card reveal motion-card" key={event.id}>
                <time dateTime={event.eventDate}>
                  <span>{formatEventMonth(event.eventDate)}</span>
                  <b>{formatEventDay(event.eventDate)}</b>
                </time>
                <div>
                  <p className="mono-label">{event.location}</p>
                  <CinematicHeading as="h3" text={event.title} />
                  <p>{event.description || event.summary}</p>
                  <p>
                    {new Date(event.eventDate).toLocaleTimeString("en-ET", {
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Africa/Addis_Ababa",
                    })}{" "}
                    EAT
                    {event.capacity !== null
                      ? ` · ${Math.max(0, event.capacity - event.registrationCount)} places remaining`
                      : ""}
                  </p>
                  <small>
                    {event.registrationOpen
                      ? "Open to the public"
                      : "Registration closed"}
                  </small>
                </div>
                <button
                  className="button button-light event-register"
                  type="button"
                  disabled={!event.registrationOpen}
                  onClick={() => setSelected(event)}
                >
                  {event.registrationOpen ? "Register" : "Closed"}{" "}
                </button>
              </article>
            ))
          ) : (
            <p className="section-intro">
              {eventsError || "No upcoming events are available right now."}
            </p>
          )}
        </div>
      </div>

      <div className="host-tona reveal motion-media">
        <div className="host-heading">
          <p className="mono-label">Host Tona</p>
          <h3
            className="display word-reveal motion-heading"
            aria-label="Bring the second roundto your event."
          >
            <RevealWords words={["Bring", "the", "second", "round"]} />
            <br />
            <RevealWords words={["to", "your", "event."]} startAt={4} />
          </h3>
        </div>
        <div className="host-services">
          <article>
            <CinematicHeading as="h4" text="Coffee ceremony experience" />
            <p>
              A trained host, jebena service and origin storytelling for your
              guests.
            </p>
          </article>
          <article>
            <CinematicHeading as="h4" text="Brew bar & sampling" />
            <p>
              Filter and espresso service for launches, conferences and markets.
            </p>
          </article>
          <article>
            <CinematicHeading as="h4" text="Co-branded activation" />
            <p>
              Custom bags, signage and tasting flights built around your brand.
            </p>
          </article>
        </div>
      </div>

      <div className="event-submit-layout">
        <div className="event-submit-intro reveal">
          <p className="mono-label">Add an event</p>
          <h3 className="display">
            Tell us what
            <br />
            you’re planning.
          </h3>
          <p>
            Send the details and Tona’s events team confirms availability,
            service format and what the space needs.
          </p>
          <ul className="host-requirements">
            <li>
              <span>01</span>A 2×2m service area, near a power point
            </li>
            <li>
              <span>02</span>Access one hour before guests arrive
            </li>
            <li>
              <span>03</span>Water access, or we bring our own supply
            </li>
            <li>
              <span>04</span>Final guest count 48 hours ahead
            </li>
          </ul>
        </div>
        <form
          className="event-submit-form reveal"
          onSubmit={async (event) => {
            event.preventDefault();
            if (hostBusy) return;
            setHostBusy(true);
            try {
              await submitHostedEventForm(event, setStatus);
            } finally {
              setHostBusy(false);
            }
          }}
        >
          <div className="field-grid">
            <label>
              <span>Event name</span>
              <input
                name="event-name"
                minLength={2}
                maxLength={120}
                type="text"
                required
              />
            </label>
            <label>
              <span>Event type</span>
              <select name="event-type">
                <option>Corporate / office</option>
                <option>Product launch</option>
                <option>Conference or expo</option>
                <option>Wedding or private</option>
                <option>Market or pop-up</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              <span>Date</span>
              <input name="event-date" type="date" required />
            </label>
            <label>
              <span>Expected guests</span>
              <input
                name="event-guests"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 80"
              />
            </label>
            <label>
              <span>Location</span>
              <input
                name="event-location"
                type="text"
                placeholder="Venue, Addis Ababa"
                required
              />
            </label>
            <label>
              <span>Service format</span>
              <select name="event-service">
                <option>Coffee ceremony experience</option>
                <option>Brew bar &amp; sampling</option>
                <option>Co-branded activation</option>
                <option>Not sure yet</option>
              </select>
            </label>
            <label>
              <span>Your name</span>
              <input
                name="event-contact"
                minLength={2}
                maxLength={120}
                type="text"
                autoComplete="name"
                required
              />
            </label>
            <label>
              <span>Phone / WhatsApp</span>
              <input
                name="event-phone"
                type="tel"
                autoComplete="tel"
                minLength={7}
                maxLength={40}
                required
              />
            </label>
          </div>
          <label className="message-field">
            <span>Anything else about the event?</span>
            <textarea
              name="event-notes"
              rows={3}
              placeholder="Space, timings, brand requirements or guest profile."
            />
          </label>
          <button
            className="button button-primary"
            type="submit"
            disabled={hostBusy}
          >
            Submit event on WhatsApp
          </button>
          <p className="form-status" role="status">
            {status}
          </p>
        </form>
      </div>

      <div className="hosted-block">
        <div className="hosted-heading reveal">
          <p className="mono-label">Previously hosted</p>
          <h3 className="display">
            Where the second
            <br />
            round has been.
          </h3>
        </div>
        <div className="hosted-grid">
          {events === null ? (
            <p className="section-intro">Loading event history…</p>
          ) : completedEvents.length ? (
            completedEvents.map((event) => (
              <article className="hosted-card reveal" key={event.id}>
                <time>{formatEventYearMonth(event.eventDate)}</time>
                <CinematicHeading as="h4" text={event.title} />
                <p>{event.location}</p>
                <small>{event.summary || event.description}</small>
              </article>
            ))
          ) : (
            <p className="section-intro">
              {eventsError || "Previously hosted events will appear here."}
            </p>
          )}
        </div>
      </div>

      {selected ? (
        <ReferenceEventDialog
          events={publishedEvents.filter((event) => event.registrationOpen)}
          selected={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </section>
  );
}

function ReferenceOrdersSection() {
  const [selectedPackage, setSelectedPackage] = useState<
    "1kg" | "500g" | "250g" | "custom"
  >("1kg");
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [requestBusy, setRequestBusy] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState("");
  const [requestStatus, setRequestStatus] = useState("");

  return (
    <section
      className="quotation section section-ember motion-section section-cinema"
      id="orders"
      aria-labelledby="orders-title"
    >
      <div className="section-lead section-lead--order">
        <div className="quotation-intro reveal">
          <p className="section-index">05 / Order &amp; enquire</p>
          <h2 id="orders-title" className="display">
            Tell us what
            <br />
            you’re pouring.
          </h2>
          <p>
            Our House Blend is Tona’s local-market coffee: a consistent
            Ethiopian variety blend, in the formats your bar, shelf or
            hospitality programme needs. Pick a package below and build a
            quotation, or send an export, local-distribution or feedback request
            on the right. Pricing is by quotation.
          </p>
        </div>
        <figure className="section-art reveal">
          <img
            src="https://tona-coffee-two.vercel.app/assets/art/serving-round.webp"
            width="1200"
            height="900"
            alt="A bag of Tona House Blend handed across the counter to a customer while cups are served"
            loading="lazy"
            decoding="async"
          />
          <figcaption>From our counter to yours.</figcaption>
        </figure>
      </div>

      <div className="package-menu">
        <p className="mono-label">Service packages — choose one</p>
        <div className="pack-grid">
          {PACKAGES.map(([size, description], index) => (
            <article className="pack-card reveal" key={size}>
              <label className="pack-choice">
                <input
                  type="radio"
                  name="package"
                  form="quote-form"
                  value={size + " Tona package"}
                  checked={selectedPackage === size}
                  onChange={() => setSelectedPackage(size)}
                />
                <span className="pack-choice-body">
                  <span className="pack-card-head">
                    <span className="pack-no">0{index + 1}</span>
                    <span>Tona package</span>
                  </span>
                  <h3>{size}</h3>
                  <p>{description}</p>
                  <ul aria-label={"Available " + size + " formats"}>
                    {FORMATS.map(([short, label]) => (
                      <li key={short}>
                        {short} <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </span>
              </label>
            </article>
          ))}
          <article className="pack-card pack-card-custom reveal">
            <label className="pack-choice">
              <input
                type="radio"
                name="package"
                form="quote-form"
                value="250g custom package"
                checked={selectedPackage === "custom"}
                onChange={() => setSelectedPackage("custom")}
              />
              <span className="pack-choice-body">
                <span className="pack-card-head">
                  <span className="pack-no">04</span>
                  <span>Custom package</span>
                </span>
                <h3>250g</h3>
                <p>Tona coffee presented with your customer-facing logo.</p>
                <ul aria-label="Available custom 250 gram formats">
                  {FORMATS.map(([short, label]) => (
                    <li key={short}>
                      {short} <span>{label}</span>
                    </li>
                  ))}
                </ul>
                <span className="custom-badge">
                  Customer logo / Customisable
                </span>
              </span>
            </label>
          </article>
        </div>
      </div>

      <div className="orders-layout">
        <form
          className="quote-form reveal motion-card"
          id="quote-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (quoteBusy) return;
            setQuoteBusy(true);
            try {
              await submitQuotationForm(event, selectedPackage, setQuoteStatus);
            } finally {
              setQuoteBusy(false);
            }
          }}
        >
          <p className="form-kicker">House Blend quotation</p>
          <fieldset>
            <legend>01 / Choose a format</legend>
            <div
              className="choice-grid format-choices"
              id="format-options"
              aria-live="polite"
            >
              {FORMATS.map(([short, label], index) => (
                <label key={short}>
                  <input
                    type="radio"
                    name="format-choice"
                    value={label}
                    defaultChecked={index === 0}
                  />
                  <span>
                    {short} — {label}
                  </span>
                </label>
              ))}
            </div>
            <input type="hidden" id="format-name" name="format" />
          </fieldset>
          <div
            className="logo-field"
            id="logo-field"
            hidden={selectedPackage !== "custom"}
          >
            <label htmlFor="brand-name">Customer brand or logo name</label>
            <input
              id="brand-name"
              name="brand-name"
              type="text"
              autoComplete="organization"
              placeholder="Your brand name"
            />
          </div>
          <label className="message-field">
            <span>Volume and anything else we should know</span>
            <textarea
              name="message"
              rows={4}
              placeholder="Roughly how much per month, and a line about your café, hotel, office or retail programme."
            />
          </label>
          <div className="send-row">
            <button
              className="button button-dark submit-button"
              type="submit"
              data-send="whatsapp"
              disabled={quoteBusy}
            >
              {quoteBusy ? "Saving quotation…" : "Send on WhatsApp"}{" "}
            </button>
            <button
              className="button button-outline"
              type="submit"
              data-send="email"
              disabled={quoteBusy || requestBusy}
            >
              Send by email
            </button>
          </div>
          <p className="send-note">
            WhatsApp reaches the team fastest. Email goes to info@tonacoffee.et.
          </p>
          <p className="form-status" role="status">
            {quoteStatus}
          </p>
        </form>

        <form
          id="contact-request"
          className="request-form reveal motion-card"
          onSubmit={async (event) => {
            event.preventDefault();
            if (requestBusy) return;
            setRequestBusy(true);
            try {
              await submitRequestForm(event, setRequestStatus);
            } finally {
              setRequestBusy(false);
            }
          }}
        >
          <p className="form-kicker">How can we help?</p>
          <div className="field-grid">
            <label>
              <span>Full name</span>
              <input
                name="full-name"
                minLength={2}
                maxLength={120}
                type="text"
                autoComplete="name"
                required
              />
            </label>
            <label>
              <span>Phone</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                minLength={7}
                maxLength={40}
                required
              />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" />
            </label>
            <label>
              <span>Organization</span>
              <input
                name="organization"
                type="text"
                autoComplete="organization"
              />
            </label>
          </div>
          <div className="field-grid">
            <label>
              <span>Request type</span>
              <select name="request-type">
                <option>Retail order</option>
                <option>Export enquiry</option>
                <option>Wholesale / business supply</option>
                <option>Local Distribution</option>
                <option>Feedback</option>
                <option>Something else</option>
              </select>
            </label>
            <label>
              <span>Coffee interest</span>
              <select name="coffee-interest">
                <option>House Blend</option>
                <option>Export</option>
              </select>
            </label>
          </div>
          <label className="message-field">
            <span>Message</span>
            <textarea name="message" rows={4} placeholder="How can we help?" />
          </label>
          <div className="send-row">
            <button
              className="button button-primary"
              type="submit"
              data-send="whatsapp"
              disabled={requestBusy}
            >
              {requestBusy ? "Saving request…" : "Send on WhatsApp"}{" "}
            </button>
            <button
              className="button button-outline"
              type="submit"
              data-send="email"
              disabled={quoteBusy || requestBusy}
            >
              Send by email
            </button>
          </div>
          <p className="send-note">
            WhatsApp reaches the team fastest. Email goes to info@tonacoffee.et.
          </p>
          <p className="form-status" role="status">
            {requestStatus}
          </p>
        </form>
      </div>
    </section>
  );
}

// Store coordinates use the existing map's Web Mercator tile origin.
function projectStockist(latitude: number, longitude: number) {
  const worldSize = 256 * 2 ** 14;
  return {
    x: ((longitude + 180) / 360) * worldSize - 9954 * 256 + 165,
    y:
      ((1 - Math.asinh(Math.tan((latitude * Math.PI) / 180)) / Math.PI) / 2) *
        worldSize -
      7780 * 256 -
      5,
  };
}

function getStockistMapPosition(stockist: PublicStockist) {
  return stockist.latitude !== null && stockist.longitude !== null
    ? projectStockist(stockist.latitude, stockist.longitude)
    : null;
}

function ReferenceMap({ stockists }: { stockists: PublicStockist[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [mapSize, setMapSize] = useState({ width: 676, height: 500 });
  useEffect(() => {
    const element = mapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry)
        setMapSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const changeZoom = (delta: number) => {
    setZoomLevel((value) => Math.max(-1, Math.min(2, value + delta)));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest(".leaflet-control, .tona-pin-wrap")
    )
      return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: mapOffset.x,
      offsetY: mapOffset.y,
    };
    mapRef.current?.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setMapOffset({
      x: drag.offsetX + event.clientX - drag.startX,
      y: drag.offsetY + event.clientY - drag.startY,
    });
  };

  const finishPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId)
      return;
    if (mapRef.current?.hasPointerCapture(event.pointerId)) {
      mapRef.current.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setDragging(false);
  };

  const stockistNames = stockists.map((stockist) => stockist.name).join(", ");
  const points = stockists.flatMap((stockist) => {
    const point = getStockistMapPosition(stockist);
    return point ? [point] : [];
  });
  const minX = points.length ? Math.min(...points.map((point) => point.x)) : 0;
  const maxX = points.length ? Math.max(...points.map((point) => point.x)) : 0;
  const minY = points.length ? Math.min(...points.map((point) => point.y)) : 0;
  const maxY = points.length ? Math.max(...points.map((point) => point.y)) : 0;
  const fitScale = points.length
    ? Math.max(
        0.000001,
        Math.min(
          1,
          (mapSize.width - 90) / Math.max(1, maxX - minX),
          (mapSize.height - 90) / Math.max(1, maxY - minY),
        ),
      )
    : 1;
  const scale = fitScale * Math.pow(2, zoomLevel);
  const offsetX = points.length
    ? mapSize.width / 2 - ((minX + maxX) / 2) * scale
    : 0;
  const offsetY = points.length
    ? mapSize.height / 2 - ((minY + maxY) / 2) * scale
    : 0;
  const mapPaneTransform = `translate3d(${offsetX + mapOffset.x}px, ${offsetY + mapOffset.y}px, 0px) scale(${scale})`;
  const tileZoom = Math.max(1, Math.min(18, 14 + Math.round(Math.log2(scale))));
  const tileSize = 256 * 2 ** (14 - tileZoom);
  const worldOriginX = 9954 * 256 - 165;
  const worldOriginY = 7780 * 256 + 5;
  const firstTileX = Math.floor(
    (worldOriginX - (offsetX + mapOffset.x) / scale) / tileSize,
  );
  const firstTileY = Math.floor(
    (worldOriginY - (offsetY + mapOffset.y) / scale) / tileSize,
  );
  const tiles = Array.from(
    { length: Math.ceil(mapSize.width / scale / tileSize) + 1 },
    (_, column) =>
      Array.from(
        { length: Math.ceil(mapSize.height / scale / tileSize) + 1 },
        (_, row) => {
          const x = firstTileX + column,
            y = firstTileY + row;
          return {
            src: `https://tile.openstreetmap.org/${tileZoom}/${x}/${y}.png`,
            x: x * tileSize - worldOriginX,
            y: y * tileSize - worldOriginY,
          };
        },
      ),
  ).flat();

  return (
    <div
      ref={mapRef}
      id="tona-map"
      role="img"
      aria-label={
        "Map of Addis Ababa showing Tona Coffee stockists: " +
        (stockistNames || "none listed")
      }
      className={
        "leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom" +
        (dragging ? " leaflet-dragging" : "")
      }
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerDrag}
      onPointerCancel={finishPointerDrag}
      onKeyDown={(event) => {
        if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          changeZoom(1);
        } else if (event.key === "-" || event.key === "_") {
          event.preventDefault();
          changeZoom(-1);
        }
      }}
    >
      <div
        className="leaflet-pane leaflet-map-pane"
        style={{
          transform: mapPaneTransform,
          transformOrigin: "0 0",
        }}
      >
        <div className="leaflet-pane leaflet-tile-pane">
          <div className="leaflet-layer" style={{ zIndex: 1, opacity: 1 }}>
            <div
              className="leaflet-tile-container leaflet-zoom-animated"
              style={{
                zIndex: 19,
                transform: "translate3d(0px, 0px, 0px) scale(1)",
              }}
            >
              {tiles.map((tile) => (
                <img
                  key={tile.src}
                  alt=""
                  src={tile.src}
                  className="leaflet-tile leaflet-tile-loaded"
                  style={{
                    width: tileSize,
                    height: tileSize,
                    transform: `translate3d(${tile.x}px, ${tile.y}px, 0px)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="leaflet-pane leaflet-overlay-pane" />
        <div className="leaflet-pane leaflet-shadow-pane" />
        <div className="leaflet-pane leaflet-marker-pane">
          {stockists.map((stockist, index) => {
            const position = getStockistMapPosition(stockist);
            if (!position) return null;
            return (
              <div
                className="leaflet-marker-icon tona-pin-wrap leaflet-zoom-animated leaflet-interactive"
                title={stockist.name}
                data-latitude={stockist.latitude}
                data-longitude={stockist.longitude}
                aria-label={`Open directions to ${stockist.name}`}
                onClick={() =>
                  window.open(
                    stockist.directions,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    window.open(
                      stockist.directions,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }
                }}
                tabIndex={0}
                role="button"
                key={stockist.id}
                style={{
                  marginLeft: "-17px",
                  marginTop: "-44px",
                  width: "34px",
                  height: "44px",
                  transform:
                    "translate3d(" +
                    position.x +
                    "px, " +
                    position.y +
                    `px, 0px) scale(${1 / scale})`,
                  transformOrigin: "17px 44px",
                  zIndex: position.y,
                }}
              >
                <span className="tona-pin">
                  <span className="tona-pin-no">{stockist.number}</span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="leaflet-pane leaflet-tooltip-pane" />
        <div className="leaflet-pane leaflet-popup-pane" />
        <div
          className="leaflet-proxy leaflet-zoom-animated"
          style={{
            transform: "translate3d(2548410px, 1991890px, 0px) scale(8192)",
          }}
        />
      </div>
      <div className="leaflet-control-container">
        <div className="leaflet-top leaflet-left">
          <div className="leaflet-control-zoom leaflet-bar leaflet-control">
            <a
              className="leaflet-control-zoom-in"
              href="#"
              title="Zoom in"
              role="button"
              aria-label="Zoom in"
              aria-disabled={zoomLevel >= 2 ? "true" : "false"}
              onClick={(event) => {
                event.preventDefault();
                changeZoom(1);
              }}
            >
              +
            </a>
            <a
              className="leaflet-control-zoom-out"
              href="#"
              title="Zoom out"
              role="button"
              aria-label="Zoom out"
              aria-disabled={zoomLevel <= -1 ? "true" : "false"}
              onClick={(event) => {
                event.preventDefault();
                changeZoom(-1);
              }}
            >
              −
            </a>
          </div>
        </div>
        <div className="leaflet-top leaflet-right" />
        <div className="leaflet-bottom leaflet-left" />
        <div className="leaflet-bottom leaflet-right">
          <div className="leaflet-control-attribution leaflet-control">
            <a
              href="https://leafletjs.com"
              title="A JavaScript library for interactive maps"
            >
              Leaflet
            </a>{" "}
            <span aria-hidden="true">|</span> ©{" "}
            <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>{" "}
            contributors
          </div>
        </div>
      </div>
    </div>
  );
}
function ReferenceFindUsSection() {
  const [areaStatus, setAreaStatus] = useState("");
  const [stockists, setStockists] = useState<PublicStockist[]>(STOCKISTS);

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      void getPublicLocations()
        .then((locations) => {
          if (mounted) setStockists(locations);
        })
        .catch(() => {
          // Keep the default locations visible if the database request fails.
        });
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => {
      mounted = false;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return (
    <section
      className="findus section section-dark motion-section section-cinema"
      id="stockists"
      aria-labelledby="findus-title"
    >
      <div className="section-lead">
        <div className="section-heading reveal">
          <p className="section-index">06 / Where to find our coffee</p>
          <h2 id="findus-title" className="display">
            Our first
            <br />
            <span className="ember">stockists.</span>
          </h2>
          <p className="section-intro">
            Retail stockists across Addis Ababa. More locations are added as
            they open—ask us on WhatsApp if you want Tona nearer to you.
          </p>
        </div>
        <figure className="section-art reveal">
          <img
            src="https://tona-coffee-two.vercel.app/assets/art/retail-shelf.webp"
            width="1200"
            height="900"
            alt="A shopper choosing Tona House Blend from a stocked retail shelf"
            loading="lazy"
            decoding="async"
          />
          <figcaption>On the shelf in Addis Ababa.</figcaption>
        </figure>
      </div>

      <div className="stockist-layout">
        <ul className="stockist-list stockist-cards">
          {stockists.map((stockist) => (
            <li className="stockist stockist-card reveal" key={stockist.id}>
              <span className="stockist-card-number">{stockist.number}</span>
              <div className="stockist-card-logo">
                {stockist.logoUrl ? (
                  <img
                    src={stockist.logoUrl}
                    alt={`${stockist.name} logo`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span aria-hidden="true">–</span>
                )}
              </div>
              <div className="stockist-card-content">
                <h3>{stockist.name}</h3>
                <dl className="stockist-card-details">
                  <div>
                    <dt>
                      <MapPin aria-hidden="true" />
                      Location
                    </dt>
                    <dd>
                      {stockist.address || (
                        <a
                          href={stockist.directions}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Google Maps
                        </a>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Phone aria-hidden="true" />
                      Phone
                    </dt>
                    <dd>
                      {stockist.phone ? (
                        <a
                          href={`tel:${stockist.phone.replace(/[^+0-9]/g, "")}`}
                        >
                          {stockist.phone}
                        </a>
                      ) : (
                        "–"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <Instagram aria-hidden="true" />
                      Instagram
                    </dt>
                    <dd>
                      {stockist.instagram ? (
                        <a
                          href={stockist.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          @
                          {
                            new URL(stockist.instagram).pathname
                              .split("/")
                              .filter(Boolean)[0]
                          }
                        </a>
                      ) : (
                        "–"
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              <a
                className="stockist-card-directions"
                href={stockist.directions}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Directions to ${stockist.name}`}
              >
                Directions
              </a>
            </li>
          ))}
        </ul>

        <div className="stockist-map reveal">
          {/* Show verified store locations in the existing map style. */}
          <ReferenceMap
            stockists={stockists.filter(
              (stockist) =>
                stockist.latitude !== null && stockist.longitude !== null,
            )}
          />
        </div>
      </div>

      <form
        className="area-request reveal"
        id="area-request"
        onSubmit={(event) => void submitLocationRequestForm(event, setAreaStatus)}
      >
        <div className="area-request-copy">
          <p className="mono-label">Not near you yet?</p>
          <h3>Tell us where we should be.</h3>
          <p>
            Name your area and we will look into getting Tona onto a shelf near
            you.
          </p>
        </div>
        <div className="area-request-fields">
          <label>
            <span>Your area or neighbourhood</span>
            <input
              name="area"
              minLength={2}
              maxLength={180}
              type="text"
              placeholder="e.g. Bole, Addis Ababa"
              required
            />
          </label>
          <label>
            <span>
              Shop or café <small>(optional)</small>
            </span>
            <input
              name="venue"
              maxLength={180}
              type="text"
              placeholder="Somewhere you already shop"
            />
          </label>
          <button className="button button-primary" type="submit">
            Send on WhatsApp
          </button>
        </div>
        <p className="form-status" id="area-status" role="status">
          {areaStatus}
        </p>
      </form>

      <div
        className="contact-details contact-details-expanded reveal"
        id="contact"
      >
        <div>
          <p className="mono-label">WhatsApp</p>
          <a
            href="https://wa.me/251986212224?text=Hi%20Tona%2C%20I%20have%20an%20enquiry."
            target="_blank"
            rel="noopener noreferrer"
          >
            +251 98 621 2224
          </a>
          <small>Fastest way to order or ask a question.</small>
        </div>
        <div>
          <p className="mono-label">Email</p>
          <a href="mailto:info@tonacoffee.et">info@tonacoffee.et</a>
        </div>
        <div>
          <p className="mono-label">Roastery</p>
          <p>Addis Ababa, Ethiopia</p>
        </div>
        <div>
          <p className="mono-label">Hours</p>
          <p className="hours-list">
            <span>Monday–Friday: 8:00 AM – 5:00 PM</span>
            <span>Saturday: 8:00 AM – 12:00 PM</span>
            <span>Sunday: Closed</span>
          </p>
          <small>All times are East Africa Time (EAT).</small>
        </div>
      </div>

      <nav
        className="contact-social-band reveal"
        aria-label="Follow Tona Coffee"
      >
        <a
          href="https://www.instagram.com/tona.coffee/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram: @tona.coffee (opens in a new tab)"
        >
          <span className="social-link-top">
            <span className="social-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="5"></rect>
                <circle cx="12" cy="12" r="4"></circle>
                <circle
                  cx="17.2"
                  cy="6.8"
                  r="1.1"
                  fill="currentColor"
                  stroke="none"
                ></circle>
              </svg>
            </span>
            <span className="social-name">Instagram</span>
          </span>
          <span className="social-handle">@tona.coffee</span>
        </a>
        <a
          href="https://www.linkedin.com/company/tona-coffee-et"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn: Tona Coffee (opens in a new tab)"
        >
          <span className="social-link-top">
            <span className="social-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="3"></rect>
                <path d="M8 10.5V16.5"></path>
                <circle
                  cx="8"
                  cy="7.6"
                  r="0.9"
                  fill="currentColor"
                  stroke="none"
                ></circle>
                <path d="M11.5 16.5v-6M11.5 13.2c0-1.6 1-2.7 2.4-2.7s2.1 1 2.1 2.6v3.4"></path>
              </svg>
            </span>
            <span className="social-name">LinkedIn</span>
          </span>
          <span className="social-handle">Tona Coffee</span>
        </a>
        <a
          href="https://www.tiktok.com/@tonacoffee.et"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok: @tonacoffee.et (opens in a new tab)"
        >
          <span className="social-link-top">
            <span className="social-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15.2 3c.3 2.4 1.9 4 4.3 4.2v3.1a7.4 7.4 0 0 1-4.3-1.5v5.9a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.2a2.6 2.6 0 1 0 1.8 2.4V3Z"></path>
              </svg>
            </span>
            <span className="social-name">TikTok</span>
          </span>
          <span className="social-handle">@tonacoffee.et</span>
        </a>
      </nav>
    </section>
  );
}


async function submitFeedbackForm(event: FormEvent<HTMLFormElement>, setStatus: (message: string) => void) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  if (formText(data, "feedback-type") === "Rate your coffee" && !Number(formText(data, "feedback-rating"))) {
    setStatus("Choose a star rating for your coffee.");
    return;
  }
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (button?.disabled) return;
  if (button) button.disabled = true;
  setStatus("Saving your feedback…");
  try {
    await submitFeedback({ data: {
      fullName: formText(data, "full-name"),
      contact: formText(data, "contact"),
      feedbackType: formText(data, "feedback-type") as "Rate your coffee" | "General feedback" | "Report a problem",
      rating: Number(formText(data, "feedback-rating")) || 0,
      product: optionalFormText(data, "product"),
      purchaseLocation: optionalFormText(data, "purchase-location"),
      comment: formText(data, "comment"),
    } });
    form.reset();
    setStatus("Thank you. Your feedback has been saved for the Tona team.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not save feedback. Please try again.");
  } finally {
    if (button) button.disabled = false;
  }
}

function ReferenceFeedbackSection() {
  const [feedbackType, setFeedbackType] = useState("Rate your coffee");
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState("");

  return (
    <section
      className="feedback section motion-section section-cinema"
      id="feedback"
      aria-labelledby="feedback-title"
    >
      <div className="section-lead">
        <div className="section-heading reveal">
          <p className="section-index">07 / Feedback</p>
          <h2 id="feedback-title" className="display">
            Where the conversation
            <br />
            continues.
          </h2>
          <p className="section-intro">
            Rate your coffee, tell us what went wrong, or share an idea. A real
            person follows up.
          </p>
        </div>
        <figure className="section-art section-art--portrait reveal">
          <img
            src="https://tona-coffee-two.vercel.app/assets/art/ceremony-table.webp"
            width="1200"
            height="1600"
            alt="Two friends sharing Ethiopian coffee from a jebena, with a bag of Tona House Blend on the table"
            loading="lazy"
            decoding="async"
          />
          <figcaption>Every cup starts a conversation.</figcaption>
        </figure>
      </div>
      <div className="feedback-layout">
        <div className="feedback-choices">
          {["Rate your coffee", "General feedback", "Report a problem"].map(
            (choice) => (
              <button
                className={
                  "feedback-choice reveal" +
                  (feedbackType === choice ? " is-selected" : "")
                }
                type="button"
                key={choice}
                aria-pressed={feedbackType === choice}
                onClick={() => setFeedbackType(choice)}
              >
                <span className="feedback-choice-body">
                  <span className="feedback-choice-title">
                    {choice === "Rate your coffee"
                      ? "Rate Your Coffee"
                      : choice === "General feedback"
                        ? "Give General Feedback"
                        : "Report a Problem"}
                  </span>
                  {choice === "Rate your coffee" ? (
                    <span
                      className="feedback-stars"
                      role="radiogroup"
                      aria-label="Rating out of five"
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          className={
                            "feedback-star" +
                            (rating >= star ? " is-rated" : "")
                          }
                          data-star={star}
                          role="radio"
                          aria-label={star + (star === 1 ? " star" : " stars")}
                          aria-checked={rating === star}
                          tabIndex={
                            rating === star || (rating === 0 && star === 1)
                              ? 0
                              : -1
                          }
                          key={star}
                          onClick={(event) => {
                            event.stopPropagation();
                            setRating(star);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setRating(star);
                            }
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
                <span className="feedback-choice-mark" aria-hidden="true">
                  →
                </span>
              </button>
            ),
          )}
        </div>

        <form
          className="feedback-form reveal"
          onSubmit={(event) => void submitFeedbackForm(event, setStatus)}
        >
          <p className="form-kicker">Tell us more</p>
          <input type="hidden" name="feedback-type" value={feedbackType} />
          <input type="hidden" name="feedback-rating" value={rating || ""} />
          <div className="field-grid">
            <label>
              <span className="sr-only">Product</span>
              <input name="product" type="text" placeholder="Product" />
            </label>
            <label>
              <span className="sr-only">Purchase location</span>
              <input
                name="purchase-location"
                type="text"
                placeholder="Purchase location"
              />
            </label>
          </div>
          <label className="message-field">
            <span className="sr-only">Comment or suggestion</span>
            <textarea
              name="comment"
              rows={4}
              placeholder="Comment or suggestion"
              required
            />
          </label>
          <div className="field-grid">
            <label>
              <span className="sr-only">Full name</span>
              <input
                name="full-name"
                minLength={2}
                maxLength={120}
                type="text"
                autoComplete="name"
                placeholder="Full name"
                required
              />
            </label>
            <label>
              <span className="sr-only">Phone or email</span>
              <input
                name="contact"
                type="text"
                autoComplete="email"
                placeholder="Phone or email"
                required
              />
            </label>
          </div>
          <button
            className="button button-primary feedback-submit"
            type="submit"
          >
            Send feedback
          </button>
          <p className="form-status" role="status">
            {status}
          </p>
        </form>
      </div>
    </section>
  );
}

export function ReferenceHome() {
  return (
    <ReferencePage>
      <ReferenceHero />
      <ReferenceAboutSection />
      <ReferenceCoffeeSection />
      <ReferenceDifferenceSection />
      <ReferenceBusinessSection />
      <ReferenceOrdersSection />
      <ReferenceFindUsSection />
      <ReferenceFeedbackSection />
    </ReferencePage>
  );
}

export function ReferenceAboutPage() {
  return (
    <ReferencePage>
      <ReferenceAboutSection />
      <ReferenceDifferenceSection />
    </ReferencePage>
  );
}

export function ReferenceCoffeePage() {
  return (
    <ReferencePage>
      <ReferenceCoffeeSection />
    </ReferencePage>
  );
}

export function ReferenceBusinessPage() {
  return (
    <ReferencePage>
      <ReferenceBusinessSection />
    </ReferencePage>
  );
}

export function ReferenceEventsPage() {
  return (
    <ReferencePage>
      <ReferenceEventsSection />
    </ReferencePage>
  );
}

export function ReferenceContactPage() {
  return (
    <ReferencePage>
      <ReferenceOrdersSection />
      <ReferenceFindUsSection />
      <ReferenceFeedbackSection />
    </ReferencePage>
  );
}
