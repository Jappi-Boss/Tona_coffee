import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { waLink } from "@/lib/tona";

const REFERENCE_BASE = "https://tona-coffee-two.vercel.app";

export const REFERENCE_IMAGES = {
  hero: REFERENCE_BASE + "/framer-hero-illustration.png",
  about: REFERENCE_BASE + "/tona-ceremony-about-v2.webp",
  business: REFERENCE_BASE + "/assets/tona-partnership-support-v3.webp",
  event: REFERENCE_BASE + "/assets/event.jpg",
  yirgacheffe: REFERENCE_BASE + "/assets/origins/yirgacheffe.webp",
  sidama: REFERENCE_BASE + "/assets/origins/sidama.webp",
  guji: REFERENCE_BASE + "/assets/origins/guji.webp",
  jimma: REFERENCE_BASE + "/assets/origins/jimma.webp",
} as const;

export const REFERENCE_ORIGINS = [
  {
    name: "Yirgacheffe",
    image: REFERENCE_IMAGES.yirgacheffe,
    process: "Washed",
    region: "Gedeo, Ethiopia",
    description: "Floral, bright and aromatic Ethiopian coffee.",
    notes: ["Floral", "Citrus", "Sweet"],
    altitude: "Altitude 1,750–2,200m",
  },
  {
    name: "Sidama",
    image: REFERENCE_IMAGES.sidama,
    process: "Natural",
    region: "Sidama, Ethiopia",
    description: "Bright, fruity and expressive Ethiopian coffee.",
    notes: ["Berry", "Cocoa", "Citrus"],
    altitude: "Altitude 1,550–2,200m",
  },
  {
    name: "Guji",
    image: REFERENCE_IMAGES.guji,
    process: "Natural",
    region: "Oromia, Ethiopia",
    description: "Rich, complex and fruit-forward Ethiopian coffee.",
    notes: ["Stone fruit", "Spice", "Sweet"],
    altitude: "Altitude 1,800–2,300m",
  },
  {
    name: "Jimma",
    image: REFERENCE_IMAGES.jimma,
    process: "Natural",
    region: "Jimma, Oromia",
    description: "Full-bodied, earthy and quietly sweet Ethiopian coffee.",
    notes: ["Cocoa", "Spice", "Winey"],
    altitude: "Altitude 1,400–2,000m",
  },
] as const;

const REFERENCE_EVENTS = [
  {
    title: "Tona Coffee Ceremony Tasting",
    date: "2026-09-14",
    month: "Sep",
    day: "14",
    location: "Bole, Addis Ababa · 10:00 AM",
    description: "Traditional ceremony, guided tasting and origin stories.",
  },
  {
    title: "Guji & Jimma Cupping Table",
    date: "2026-10-05",
    month: "Oct",
    day: "05",
    location: "Addis Ababa · 10:00 AM",
    description: "A guided comparison of two distinctive Ethiopian origins.",
  },
  {
    title: "Second Round Pop-Up",
    date: "2026-11-22",
    month: "Nov",
    day: "22",
    location: "Addis Ababa · 10:00 AM",
    description: "Coffee, conversation and the spirit of Tona.",
  },
] as const;

const PARTNERS = [
  ["Cafés & coffee shops", "Coffee supply, brewing guidance, Ethiopian origin storytelling and barista support."],
  ["Supermarkets & retailers", "Retail-ready products, promotional and tasting support, and wholesale supply."],
  ["Hotels & resorts", "Coffee supply, product selection, brewing guidance and coffee experiences for guests."],
  ["Distributors & international partners", "Wholesale supply, product information, brand storytelling and long-term development."],
  ["Corporate & office", "Workplace coffee supply, meeting and event solutions, and customized experiences."],
  ["Events & collaborations", "Coffee supply, tasting experiences, sampling and co-branded activations."],
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

const STOCKISTS = [
  {
    number: "01",
    name: "Emawa Mart",
    address: "Mexico, Lideta · Addis Ababa",
    note: "Tona House Blend, retail packs.",
    directions: "https://www.google.com/maps/search/?api=1&query=Emawa%20Mart%2C%20Addis%20Ababa%2C%20Ethiopia",
  },
  {
    number: "02",
    name: "Allmart",
    address: "Bisrate Gabriel, Nefas Silk · Addis Ababa",
    note: "Tona House Blend, retail packs.",
    directions: "https://www.google.com/maps/search/?api=1&query=Allmart%20Bisrate%20Gabriel%2C%20Addis%20Ababa%2C%20Ethiopia",
  },
] as const;

const HOSTED_EVENTS = [
  ["Jun 2026", "Second Round Pop-Up", "Bole, Addis Ababa", "Brew bar & sampling"],
  ["Apr 2026", "Origins Cupping Table", "Addis Ababa", "Guided tasting"],
  ["Feb 2026", "Coffee Ceremony Morning", "Addis Ababa", "Ceremony experience"],
] as const;

type SectionHeadingProps = {
  index: string;
  title: ReactNode;
  intro?: string;
};

function SectionHeading({ id, index, title, intro }: SectionHeadingProps) {
  return (
    <div className="section-heading reveal">
      <p className="section-index">{index}</p>
      <h2 id={id} className="display word-reveal motion-heading">{title}</h2>
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
              <b>01/</b>A. The second cup of coffee in Ethiopian coffee ceremony.
              B. A unique coffee brand with the essence of community and bringing
              people together.
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
    <section className="about section motion-section section-cinema" id="story" aria-labelledby="story-title">
      <SectionHeading
        id="story-title"
        index="01 / About Tona"
        title={
          <>
            Some conversations
            <br />
            need more time.
          </>
        }
      />

      <div className="about-layout">
        <div className="about-copy reveal motion-copy">
          <p className="lead">
            Born from Ethiopia’s coffee culture and inspired by the second round
            of the coffee ceremony, Tona is an African-led specialty roaster
            rooted in Ethiopia’s coffee heartlands.
          </p>
          <div className="copy-columns">
            <p>
              The first cup brings people together. The second is where
              formalities fade, ideas deepen, people listen, question, laugh,
              reflect and connect. This is where Tona belongs.
            </p>
            <p>
              It is about more than the coffee in the cup. It is about what
              happens around the cup—origin, careful roasting, hospitality and
              the conversations that shared coffee makes possible.
            </p>
          </div>
        </div>

        <figure className="about-art reveal motion-media parallax-media">
          <img
            src={REFERENCE_IMAGES.about}
            width="1448"
            height="1086"
            alt="Two Ethiopian women sharing the second round of a traditional coffee ceremony"
            loading="lazy"
            decoding="async"
          />
          <figcaption>
            The coffee creates the pause. The moment creates the meaning.
          </figcaption>
        </figure>
      </div>

      <div className="moment-block">
        <div className="moment-intro reveal">
          <p className="mono-label">A moment for everyone</p>
          <h3 className="display">
            Around the cup,
            <br />
            we come closer.
          </h3>
          <p className="section-intro">
            Five reasons people stay for the second round—and what Tona brings to
            each of them.
          </p>
        </div>

        <div className="moment-grid">
          {[
            ["01", "For friends", "Another round is how an evening keeps going.", "Connection"],
            ["02", "For colleagues", "Where a discussion moves past the agenda.", "Quality"],
            ["03", "For partners", "Space for ideas, decisions and the trust behind them.", "Origin"],
            ["04", "For families", "The oldest reason to gather, poured not explained.", "Culture"],
            ["05", "For yourself", "A deliberate pause, and a cup worth the time.", "Craft"],
          ].map(([number, title, text, tag]) => (
            <article className="moment-card reveal" key={number}>
              <span className="moment-no">{number}</span>
              <h4>{title}</h4>
              <p>{text}</p>
              <span className="moment-tag">{tag}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="vision-mission reveal">
        <article>
          <p className="mono-label">Vision</p>
          <p>
            To see African coffee recognized globally for excellence, while
            creating value for communities and inspiring cultural pride.
          </p>
        </article>
        <article>
          <p className="mono-label">Mission</p>
          <p>
            We source responsibly, roast carefully, and create meaningful coffee
            experiences that connect people with Ethiopian coffee, culture and
            origin.
          </p>
        </article>
      </div>
    </section>
  );
}

function OriginCard({
  origin,
}: {
  origin: (typeof REFERENCE_ORIGINS)[number];
}) {
  return (
    <article className="origin-card reveal motion-card" data-origin={origin.name}>
      <figure className="parallax-media">
        <img
          src={origin.image}
          width="720"
          height="360"
          alt={origin.name + " coffee from Ethiopia"}
          loading="lazy"
        />
      </figure>
      <div className="origin-card-body">
        <div className="origin-meta">
          <span>{origin.process}</span>
          <span>{origin.region}</span>
        </div>
        <h3>{origin.name}</h3>
        <p>{origin.description}</p>
        <ul className="tasting-notes" aria-label={origin.name + " tasting notes"}>
          {origin.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className="altitude">{origin.altitude}</p>
      </div>
    </article>
  );
}

function ReferenceCoffeeSection() {
  return (
    <section
      className="origins section section-dark motion-section section-cinema"
      id="coffee"
      aria-labelledby="coffee-title"
    >
      <SectionHeading
        id="coffee-title"
        index="02 / Our coffee"
        title={
          <>
            Four origins.
            <br />
            <span className="ember">Cleared for export.</span>
          </>
        }
        intro="These four lots are cupped, graded and reserved for international buyers—they never reach an Ethiopian shelf. What we pour at home is the House Blend, further down this page."
      />

      <div className="origin-grid">
        {REFERENCE_ORIGINS.map((origin) => (
          <OriginCard key={origin.name} origin={origin} />
        ))}
      </div>

      <div className="export-rail reveal">
        <div>
          <p className="mono-label">Sample first</p>
          <p>Any origin ships as a 100g sample before a single bag is committed.</p>
        </div>
        <div>
          <p className="mono-label">Lot documents</p>
          <p>Origin, process, altitude and cupping notes travel with every offer.</p>
        </div>
        <div>
          <p className="mono-label">Volume</p>
          <p>Quoted per contract, against your shipping window and destination.</p>
        </div>
        <a className="button button-primary" href="#orders">
          Start an export request <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}

function PrincipleIcon({ type }: { type: "handshake" | "eye" | "link" }) {
  if (type === "eye") {
    return (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 32s9-14 26-14 26 14 26 14-9 14-26 14S6 32 6 32Z" />
        <circle cx="32" cy="32" r="7" />
      </svg>
    );
  }

  if (type === "link") {
    return (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="m27 39-5 5a10 10 0 0 1-14-14l9-9a10 10 0 0 1 14 0" />
        <path d="m37 25 5-5a10 10 0 0 1 14 14l-9 9a10 10 0 0 1-14 0M23 41l18-18" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 19l10-7 10 7-6 5a4 4 0 0 0 5.5 5.8L34 24l13-12 10 7" />
      <path d="M8 37l12 12a4 4 0 0 0 5.5 0l1.5-1.5M56 37 45 48a4 4 0 0 1-5.5 0L27 36" />
    </svg>
  );
}

function ReferenceDifferenceSection() {
  const principles = [
    ["01", "handshake", "Dignity in every handshake.", "We build relationships that recognise the knowledge, labour and ambition behind every coffee."],
    ["02", "eye", "Radical transparency.", "Clear conversations, traceable Ethiopian origins, consistent roast profiles and a shared understanding of quality."],
    ["03", "link", "Partnership, not transaction.", "We commit to the relationship before the order — and everything below comes with it."],
  ] as const;

  return (
    <section className="difference section motion-section section-cinema" id="difference" aria-labelledby="difference-title">
      <SectionHeading
        id="difference-title"
        index="03 / The difference"
        title={
          <>
            The code
            <br />
            we live by.
          </>
        }
      />
      <div className="principle-list">
        {principles.map(([number, icon, title, text]) => (
          <article className="principle reveal motion-card" key={number}>
            <span className="principle-no">{number}</span>
            <span className="principle-icon" aria-hidden="true">
              <PrincipleIcon type={icon} />
            </span>
            <h3 className="cinematic-copy">{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReferenceBusinessSection() {
  return (
    <section className="business section motion-section section-cinema" id="business" aria-labelledby="business-title">
      <SectionHeading
        id="business-title"
        index="04 / For business"
        title={
          <>
            Long-term partnerships.
            <br />
            Not one-time orders.
          </>
        }
        intro="We build around each partner—from neighbourhood cafés to international distributors—with supply, guidance and storytelling support included."
      />

      <div className="partner-list">
        {PARTNERS.map(([title, text], index) => (
          <article className="partner-row reveal motion-card" key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3 className="cinematic-copy">{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <div className="sample-layout">
        <figure className="sample-media reveal">
          <img
            src={REFERENCE_IMAGES.business}
            width="1800"
            height="2377"
            alt="Two women sharing Tona coffee during a contemporary Ethiopian coffee ceremony"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div className="sample-statement reveal">
          <p className="mono-label">Samples</p>
          <h3 className="display">
            A hundred grams.
            <br />
            <span className="ember">Enough to know.</span>
          </h3>
          <p>
            Every Tona coffee—each export origin and the House Blend—ships as a
            <strong> 100g sample</strong> before anything is committed. Enough for
            a full cupping, a staff tasting and a second opinion. Tell us which
            one, and it is on its way.
          </p>
          <a
            className="button button-primary"
            href={waLink("Hi Tona, I'd like to request a 100g sample.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Request a 100g sample <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
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
  window.open(waLink([subject, ...details].join("\n")), "_blank", "noopener,noreferrer");
  setStatus("Your WhatsApp message is ready. The Tona team will confirm the details.");
}

function ReferenceEventDialog({
  selected,
  onClose,
}: {
  selected: (typeof REFERENCE_EVENTS)[number];
  onClose: () => void;
}) {
  const [status, setStatus] = useState("");

  return (
    <div className="event-dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="event-dialog" role="dialog" aria-modal="true" aria-labelledby="event-dialog-title">
        <div className="event-dialog-head">
          <div>
            <p className="mono-label">Reserve your place</p>
            <h2 id="event-dialog-title">Event registration</h2>
            <p>Select an event and send your registration directly to Tona on WhatsApp.</p>
          </div>
          <button className="event-dialog-close" type="button" onClick={onClose} aria-label="Close registration form">×</button>
        </div>
        <form onSubmit={(event) => openWhatsAppFromForm(event, "Hi Tona, I'd like to register for a Tona event.", setStatus)}>
          <label>
            <span>Choose an event</span>
            <select name="event" defaultValue={selected.title + " — " + selected.month + " " + selected.day} required>
              {REFERENCE_EVENTS.map((item) => (
                <option key={item.title}>{item.title} — {item.month} {item.day}</option>
              ))}
            </select>
          </label>
          <div className="field-grid">
            <label><span>Full name</span><input name="name" type="text" autoComplete="name" required /></label>
            <label><span>Phone / WhatsApp</span><input name="phone" type="tel" autoComplete="tel" required /></label>
            <label><span>Email <small>(optional)</small></span><input name="email" type="email" autoComplete="email" /></label>
            <label><span>Number of guests</span><input name="guests" type="number" min="1" max="10" defaultValue="1" required /></label>
          </div>
          <label className="message-field"><span>Note <small>(optional)</small></span><textarea name="note" rows={3} placeholder="Accessibility, group, or event questions" /></label>
          <button className="button button-primary" type="submit">Register on WhatsApp <span aria-hidden="true">↗</span></button>
          <p className="form-status" role="status">{status || "Registration is confirmed by the Tona team."}</p>
        </form>
      </div>
    </div>
  );
}

function ReferenceEventsSection() {
  const [selected, setSelected] = useState<(typeof REFERENCE_EVENTS)[number] | null>(null);
  const [status, setStatus] = useState("");

  return (
    <section className="events section section-dark motion-section section-cinema" id="events" aria-labelledby="events-title">
      <SectionHeading
        id="events-title"
        index="05 / Events"
        title={
          <>
            Meet us
            <br />
            <span className="ember">in person.</span>
          </>
        }
        intro="Tastings, pop-ups and coffee-ceremony demonstrations across Addis Ababa—plus Tona experiences hosted at your own event."
      />

      <div className="events-layout">
        <figure className="events-image reveal motion-media parallax-media">
          <img
            src={REFERENCE_IMAGES.event}
            width="1400"
            height="900"
            alt="Guests gathered around a Tona coffee tasting table with a woven basket and cups"
            loading="lazy"
          />
        </figure>
        <div className="event-list">
          {REFERENCE_EVENTS.map((event) => (
            <article className="event-card reveal motion-card" key={event.title}>
              <time dateTime={event.date}><span>{event.month}</span><b>{event.day}</b></time>
              <div>
                <p className="mono-label">{event.location}</p>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <small>Open to the public</small>
              </div>
              <button className="button button-light event-register" type="button" onClick={() => setSelected(event)}>
                Register <span aria-hidden="true">↗</span>
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="host-tona reveal motion-media">
        <div className="host-heading">
          <p className="mono-label">Host Tona</p>
          <h3 className="display word-reveal motion-heading">Bring the second round<br />to your event.</h3>
        </div>
        <div className="host-services">
          <article><h4>Coffee ceremony experience</h4><p>A trained host, jebena service and origin storytelling for your guests.</p></article>
          <article><h4>Brew bar &amp; sampling</h4><p>Filter and espresso service for launches, conferences and markets.</p></article>
          <article><h4>Co-branded activation</h4><p>Custom bags, signage and tasting flights built around your brand.</p></article>
        </div>
      </div>

      <div className="event-submit-layout">
        <div className="event-submit-intro reveal">
          <p className="mono-label">Add an event</p>
          <h3 className="display">Tell us what<br />you’re planning.</h3>
          <p>Send the details and Tona’s events team confirms availability, service format and what the space needs.</p>
          <ul className="host-requirements">
            <li><span>01</span>A 2×2m service area, near a power point</li>
            <li><span>02</span>Access one hour before guests arrive</li>
            <li><span>03</span>Water access, or we bring our own supply</li>
            <li><span>04</span>Final guest count 48 hours ahead</li>
          </ul>
        </div>
        <form className="event-submit-form reveal" onSubmit={(event) => openWhatsAppFromForm(event, "Hi Tona, I'd like to submit an event for Tona to host or join.", setStatus)}>
          <div className="field-grid">
            <label><span>Event name</span><input name="event-name" type="text" required /></label>
            <label><span>Event type</span><select name="event-type"><option>Corporate / office</option><option>Product launch</option><option>Conference or expo</option><option>Wedding or private</option><option>Market or pop-up</option><option>Other</option></select></label>
            <label><span>Date</span><input name="event-date" type="date" required /></label>
            <label><span>Expected guests</span><input name="event-guests" type="number" min="1" step="1" placeholder="e.g. 80" /></label>
            <label><span>Location</span><input name="event-location" type="text" placeholder="Venue, Addis Ababa" required /></label>
            <label><span>Service format</span><select name="event-service"><option>Coffee ceremony experience</option><option>Brew bar &amp; sampling</option><option>Co-branded activation</option><option>Not sure yet</option></select></label>
            <label><span>Your name</span><input name="event-contact" type="text" autoComplete="name" required /></label>
            <label><span>Phone / WhatsApp</span><input name="event-phone" type="tel" autoComplete="tel" required /></label>
          </div>
          <label className="message-field"><span>Anything else about the event?</span><textarea name="event-notes" rows={3} placeholder="Space, timings, brand requirements or guest profile." /></label>
          <button className="button button-primary" type="submit">Submit event on WhatsApp <span aria-hidden="true">↗</span></button>
          <p className="form-status" role="status">{status}</p>
        </form>
      </div>

      <div className="hosted-block">
        <div className="hosted-heading reveal">
          <p className="mono-label">Previously hosted</p>
          <h3 className="display">Where the second<br />round has been.</h3>
        </div>
        <div className="hosted-grid">
          {HOSTED_EVENTS.map(([date, title, place, format]) => (
            <article className="hosted-card reveal" key={title}>
              <time>{date}</time><h4>{title}</h4><p>{place}</p><small>{format}</small>
            </article>
          ))}
        </div>
      </div>

      {selected ? <ReferenceEventDialog selected={selected} onClose={() => setSelected(null)} /> : null}
    </section>
  );
}

function ReferenceOrdersSection() {
  const [selectedPackage, setSelectedPackage] = useState("1kg");
  const [quoteStatus, setQuoteStatus] = useState("");
  const [requestStatus, setRequestStatus] = useState("");

  return (
    <section className="quotation section section-ember motion-section section-cinema" id="orders" aria-labelledby="orders-title">
      <div className="quotation-intro reveal">
        <p className="section-index">06 / Order &amp; enquire</p>
        <h2 id="orders-title" className="display">Tell us what<br />you’re pouring.</h2>
        <p>
          The House Blend is our local-market coffee: one consistent Ethiopian
          blend, in the formats your bar, shelf or hospitality programme needs.
          Pick a package below and build a quotation, or send any other
          request—export, samples, events or feedback—on the right. Pricing is by
          quotation.
        </p>
      </div>

      <div className="package-menu">
        <p className="mono-label">Service packages — choose one</p>
        <div className="pack-grid">
          {PACKAGES.map(([size, description], index) => (
            <article className="pack-card reveal motion-card" key={size}>
              <label className="pack-choice">
                <input type="radio" name="package" value={size + " Tona package"} checked={selectedPackage === size} onChange={() => setSelectedPackage(size)} />
                <span className="pack-choice-body">
                  <span className="pack-card-head"><span className="pack-no">0{index + 1}</span><span>Tona package</span></span>
                  <h3>{size}</h3>
                  <p>{description}</p>
                  <ul aria-label={"Available " + size + " formats"}>
                    {FORMATS.map(([short, label]) => <li key={short}>{short} <span>{label}</span></li>)}
                  </ul>
                </span>
              </label>
            </article>
          ))}
          <article className="pack-card pack-card-custom reveal motion-card">
            <label className="pack-choice">
              <input type="radio" name="package" value="250g custom package" checked={selectedPackage === "custom"} onChange={() => setSelectedPackage("custom")} />
              <span className="pack-choice-body">
                <span className="pack-card-head"><span className="pack-no">04</span><span>Custom package</span></span>
                <h3>250g</h3>
                <p>Tona coffee presented with your customer-facing logo.</p>
                <ul aria-label="Available custom 250 gram formats">
                  {FORMATS.map(([short, label]) => <li key={short}>{short} <span>{label}</span></li>)}
                </ul>
                <span className="custom-badge">Customer logo / Customisable</span>
              </span>
            </label>
          </article>
        </div>
      </div>

      <div className="orders-layout">
        <form className="quote-form reveal motion-card" onSubmit={(event) => openWhatsAppFromForm(event, "Hi Tona, I'd like a House Blend quotation.", setQuoteStatus)}>
          <p className="form-kicker">House Blend quotation</p>
          <fieldset>
            <legend>01 / Choose a format</legend>
            <div className="choice-grid format-choices">
              {FORMATS.map(([short, label], index) => (
                <label className="choice-card" key={short}>
                  <input type="radio" name="format" value={label} defaultChecked={index === 0} />
                  <span><b>{short}</b><small>{label}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
          {selectedPackage === "custom" ? (
            <div className="logo-field">
              <label htmlFor="brand-name">Customer brand or logo name</label>
              <input id="brand-name" name="brand-name" type="text" autoComplete="organization" placeholder="Your brand name" />
            </div>
          ) : null}
          <fieldset className="contact-fields">
            <legend>02 / Your details</legend>
            <div className="field-grid">
              <label><span>Name</span><input name="name" type="text" autoComplete="name" required /></label>
              <label><span>Company</span><input name="company" type="text" autoComplete="organization" /></label>
              <label><span>Email</span><input name="email" type="email" autoComplete="email" /></label>
              <label><span>Monthly volume</span><input name="volume" type="text" placeholder="e.g. 25kg" /></label>
            </div>
          </fieldset>
          <label className="message-field"><span>Anything else we should know?</span><textarea name="message" rows={4} placeholder="Tell us about your café, hotel, office or retail programme." /></label>
          <button className="button button-dark submit-button" type="submit">Prepare WhatsApp quotation <span aria-hidden="true">↗</span></button>
          <p className="form-status" role="status">{quoteStatus}</p>
        </form>

        <form className="request-form reveal motion-card" onSubmit={(event) => openWhatsAppFromForm(event, "Hi Tona, I have a request.", setRequestStatus)}>
          <p className="form-kicker">How can we help?</p>
          <div className="field-grid">
            <label><span>Full name</span><input name="full-name" type="text" autoComplete="name" required /></label>
            <label><span>Phone</span><input name="phone" type="tel" autoComplete="tel" required /></label>
            <label><span>Email</span><input name="email" type="email" autoComplete="email" /></label>
            <label><span>Organization</span><input name="organization" type="text" autoComplete="organization" /></label>
          </div>
          <div className="field-grid">
            <label><span>Request type</span><select name="request-type"><option>Retail order</option><option>Export enquiry</option><option>Wholesale / business supply</option><option>Sample request (100g)</option><option>Event or collaboration</option><option>Feedback</option><option>Something else</option></select></label>
            <label><span>Coffee interest</span><select name="coffee-interest"><option>House Blend</option><option>Export</option></select></label>
          </div>
          <label className="message-field"><span>Message</span><textarea name="message" rows={4} placeholder="How can we help?" /></label>
          <button className="button button-primary" type="submit">Send request on WhatsApp <span aria-hidden="true">↗</span></button>
          <p className="form-status" role="status">{requestStatus}</p>
        </form>
      </div>
    </section>
  );
}

function ReferenceFindUsSection() {
  return (
    <section className="findus section section-dark motion-section section-cinema" id="contact" aria-labelledby="findus-title">
      <SectionHeading
        id="findus-title"
        index="07 / Where to find us"
        title={
          <>
            Tona is already
            <br />
            <span className="ember">on the shelf.</span>
          </>
        }
        intro="Retail stockists across Addis Ababa. More locations are added as they open—ask us on WhatsApp if you want Tona nearer to you."
      />

      <div className="stockist-layout">
        <ul className="stockist-list">
          {STOCKISTS.map((stockist) => (
            <li className="stockist reveal" key={stockist.name}>
              <button type="button" className="stockist-button">
                <span className="stockist-no">{stockist.number}</span>
                <span className="stockist-body">
                  <span className="stockist-name">{stockist.name}</span>
                  <span className="stockist-address">{stockist.address}</span>
                  <span className="stockist-note">{stockist.note}</span>
                </span>
                <span className="stockist-mark" aria-hidden="true">→</span>
              </button>
              <a className="text-link" href={stockist.directions} target="_blank" rel="noopener noreferrer">
                Directions <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="stockist-map reveal">
          <div id="tona-map" role="img" aria-label="Map of Addis Ababa showing Tona Coffee stockists: Emawa Mart in Lideta and Allmart at Bisrate Gabriel">
            <span className="map-route" aria-hidden="true" />
            <span className="map-pin map-pin-one"><b>01</b><small>Emawa</small></span>
            <span className="map-pin map-pin-two"><b>02</b><small>Allmart</small></span>
            <span className="map-label">Addis Ababa</span>
          </div>
        </div>
      </div>

      <div className="contact-details contact-details-expanded reveal">
        <div><p className="mono-label">WhatsApp</p><a href={waLink("Hi Tona, I have an enquiry.")} target="_blank" rel="noopener noreferrer">+251 98 621 2224</a><small>Fastest way to order or ask a question.</small></div>
        <div><p className="mono-label">Email</p><a href="mailto:hello@tonacoffee.com">hello@tonacoffee.com</a></div>
        <div><p className="mono-label">Roastery</p><p>Addis Ababa, Ethiopia</p></div>
        <div><p className="mono-label">Hours</p><p>Mon – Sat, 8:00 AM – 6:00 PM (EAT)</p></div>
      </div>

      <nav className="contact-social-band reveal" aria-label="Follow Tona Coffee">
        <a href="https://www.instagram.com/tona.coffee/" target="_blank" rel="noopener noreferrer" aria-label="Instagram: @tona.coffee (opens in a new tab)"><span className="social-link-top"><span className="social-icon" aria-hidden="true">◎</span><span className="social-name">Instagram</span></span><span className="social-handle">@tona.coffee</span></a>
        <a href="https://www.facebook.com/Tonacoffee" target="_blank" rel="noopener noreferrer" aria-label="Facebook: Tona Coffee (opens in a new tab)"><span className="social-link-top"><span className="social-icon" aria-hidden="true">f</span><span className="social-name">Facebook</span></span><span className="social-handle">Tona Coffee</span></a>
        <a href="https://www.tiktok.com/@tona.coffee4" target="_blank" rel="noopener noreferrer" aria-label="TikTok: @tona.coffee4 (opens in a new tab)"><span className="social-link-top"><span className="social-icon" aria-hidden="true">♪</span><span className="social-name">TikTok</span></span><span className="social-handle">@tona.coffee4</span></a>
      </nav>
    </section>
  );
}

function ReferenceFeedbackSection() {
  const [feedbackType, setFeedbackType] = useState("Rate your coffee");
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState("");

  return (
    <section className="feedback section motion-section section-cinema" id="feedback" aria-labelledby="feedback-title">
      <SectionHeading
        id="feedback-title"
        index="08 / Feedback"
        title={
          <>
            Where the conversation
            <br />
            continues.
          </>
        }
        intro="Rate your coffee, tell us what went wrong, or share an idea. A real person follows up."
      />
      <div className="feedback-layout">
        <div className="feedback-choices">
          {["Rate your coffee", "General feedback", "Report a problem"].map((choice) => (
            <button
              className={"feedback-choice reveal" + (feedbackType === choice ? " is-selected" : "")}
              type="button"
              key={choice}
              aria-pressed={feedbackType === choice}
              onClick={() => setFeedbackType(choice)}
            >
              <span className="feedback-choice-body">
                <span className="feedback-choice-title">{choice === "Rate your coffee" ? "Rate Your Coffee" : choice === "General feedback" ? "Give General Feedback" : "Report a Problem"}</span>
                {choice === "Rate your coffee" ? (
                  <span className="feedback-stars" role="radiogroup" aria-label="Rating out of five">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        className={"feedback-star" + (rating >= star ? " is-rated" : "")}
                        data-star={star}
                        role="radio"
                        aria-label={star + (star === 1 ? " star" : " stars")}
                        aria-checked={rating === star}
                        tabIndex={rating === star || (rating === 0 && star === 1) ? 0 : -1}
                        key={star}
                        onClick={(event) => { event.stopPropagation(); setRating(star); }}
                        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setRating(star); } }}
                      >★</span>
                    ))}
                  </span>
                ) : null}
              </span>
              <span className="feedback-choice-mark" aria-hidden="true">→</span>
            </button>
          ))}
        </div>

        <form className="feedback-form reveal" onSubmit={(event) => openWhatsAppFromForm(event, "Hi Tona, I would like to share feedback.", setStatus)}>
          <p className="form-kicker">Tell us more</p>
          <input type="hidden" name="feedback-type" value={feedbackType} />
          <input type="hidden" name="feedback-rating" value={rating || ""} />
          <div className="field-grid">
            <label><span className="sr-only">Product</span><input name="product" type="text" placeholder="Product" /></label>
            <label><span className="sr-only">Purchase location</span><input name="purchase-location" type="text" placeholder="Purchase location" /></label>
          </div>
          <label className="message-field"><span className="sr-only">Comment or suggestion</span><textarea name="comment" rows={4} placeholder="Comment or suggestion" required /></label>
          <div className="field-grid">
            <label><span className="sr-only">Full name</span><input name="full-name" type="text" autoComplete="name" placeholder="Full name" required /></label>
            <label><span className="sr-only">Phone or email</span><input name="contact" type="text" autoComplete="email" placeholder="Phone or email" required /></label>
          </div>
          <button className="button button-primary feedback-submit" type="submit">Send feedback <span aria-hidden="true">↗</span></button>
          <p className="form-status" role="status">{status}</p>
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
      <ReferenceEventsSection />
      <ReferenceOrdersSection />
      <ReferenceFindUsSection />
      <ReferenceFeedbackSection />
    </ReferencePage>
  );
}

export function ReferenceAboutPage() {
  return <ReferencePage><ReferenceAboutSection /><ReferenceDifferenceSection /></ReferencePage>;
}

export function ReferenceCoffeePage() {
  return <ReferencePage><ReferenceCoffeeSection /></ReferencePage>;
}

export function ReferenceBusinessPage() {
  return <ReferencePage><ReferenceBusinessSection /></ReferencePage>;
}

export function ReferenceEventsPage() {
  return <ReferencePage><ReferenceEventsSection /></ReferencePage>;
}

export function ReferenceContactPage() {
  return <ReferencePage><ReferenceOrdersSection /><ReferenceFindUsSection /><ReferenceFeedbackSection /></ReferencePage>;
}
