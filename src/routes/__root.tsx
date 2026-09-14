import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";
import { SiteLoadingScreen } from "../components/site/SiteLoadingScreen";
import { PageMotion } from "../components/site/PageMotion";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back
          home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Tona Coffee — Stay for Tona, Stay for the Moment" },
        {
          name: "description",
          content:
            "Tona Coffee is an African-led Ethiopian specialty coffee roaster. Four export origins, one local House Blend, wholesale partnerships, 100g samples and coffee experiences in Addis Ababa.",
        },
        { name: "author", content: "Tona Coffee" },
        {
          property: "og:title",
          content: "Tona Coffee — Stay for Tona, Stay for the Moment",
        },
        {
          property: "og:description",
          content:
            "African-led specialty coffee roaster. Four export origins, one local House Blend, wholesale partnerships, 100g samples and coffee experiences in Addis Ababa.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600&family=IBM+Plex+Mono:wght@500&family=Inter:wght@400;500;600&display=swap",
        },
        {
          rel: "stylesheet",
          href: "https://tona-coffee-two.vercel.app/styles.css",
        },
        {
          rel: "icon",
          href: "https://raw.githubusercontent.com/Jappi-Boss/Tona_coffee/7247bf6b0bd5bd8d6d21d08d20fb861eb2aeb612/public/favicon.png",
          type: "image/png",
        },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function WhatsAppConcierge() {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className="whatsapp-concierge"
      aria-label="Tona Coffee WhatsApp concierge"
    >
      <section
        className="whatsapp-chat"
        id="whatsapp-chat"
        role="dialog"
        aria-label="Chat with Tona Coffee"
        hidden={!open}
      >
        <div className="whatsapp-chat-head">
          <span className="whatsapp-chat-mark">
            <img
              src="https://tona-coffee-two.vercel.app/website/assets/images/tona-logo-light.png"
              alt=""
            />
          </span>
          <span>
            <strong>Tona Coffee</strong>
            <span>Typically replies on WhatsApp</span>
          </span>
          <button
            className="whatsapp-close"
            type="button"
            aria-label="Close WhatsApp chat"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="whatsapp-chat-body">
          <p className="whatsapp-message">
            Selam—welcome to Tona Coffee. What can we help you arrange?
          </p>
          <nav
            className="whatsapp-options"
            aria-label="Choose a WhatsApp conversation"
          >
            <a
              href="https://wa.me/251986212224?text=Hi%20Tona%2C%20I%E2%80%99d%20like%20to%20place%20a%20retail%20coffee%20order."
              target="_blank"
              rel="noopener noreferrer"
            >
              Retail order <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://wa.me/251986212224?text=Hi%20Tona%2C%20I%E2%80%99d%20like%20to%20discuss%20wholesale%20or%20business%20supply."
              target="_blank"
              rel="noopener noreferrer"
            >
              Wholesale &amp; business <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://wa.me/251986212224?text=Hi%20Tona%2C%20I%E2%80%99d%20like%20to%20request%20a%20100g%20coffee%20sample."
              target="_blank"
              rel="noopener noreferrer"
            >
              Request a 100g sample <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://wa.me/251986212224?text=Hi%20Tona%2C%20I%E2%80%99d%20like%20to%20make%20an%20export%20request%20for%20your%20origin%20coffees%20(Yirgacheffe%2C%20Sidama%2C%20Guji%20or%20Jimma).%20Please%20send%20lot%20details%20and%20pricing."
              target="_blank"
              rel="noopener noreferrer"
            >
              Export request <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://wa.me/251986212224?text=Hi%20Tona%2C%20I%E2%80%99d%20like%20to%20ask%20about%20events%20or%20hosting%20a%20Tona%20experience."
              target="_blank"
              rel="noopener noreferrer"
            >
              Events &amp; experiences <span aria-hidden="true">↗</span>
            </a>
          </nav>
          <p className="whatsapp-note">Continue securely in WhatsApp.</p>
        </div>
      </section>
      <button
        className="whatsapp-launcher"
        type="button"
        aria-label={open ? "Close Tona Coffee WhatsApp chat" : "Open Tona Coffee WhatsApp chat"}
        aria-expanded={open}
        aria-controls="whatsapp-chat"
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" width="29" height="29" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.198-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.372-.011-.57-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.883 9.889-9.883a9.82 9.82 0 0 1 7.021 2.91 9.83 9.83 0 0 1 2.897 7.027c-.003 5.45-4.446 9.899-9.923 9.899m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z" />
        </svg>
      </button>
    </aside>
  );
}

function ScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById("scroll-progress-bar");
    if (!bar) return;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = String(Math.min(100, Math.max(0, progress))) + "%";
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <span id="scroll-progress-bar" style={{ width: "0%" }} />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isAdmin = pathname.startsWith("/admin");
  const isRoutePending = useRouterState({
    select: (state) => state.status === "pending",
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SiteLoadingScreen routePending={isRoutePending} />
      {!isAdmin && <PageMotion pathname={pathname} />}
      <div className="flex min-h-screen flex-col">
        {!isAdmin && <a className="skip-link" href="#main-content">Skip to content</a>}
        {!isAdmin && <ScrollProgress />}
        {!isAdmin && <SiteHeader />}
        <main id="main-content" className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        {!isAdmin && <SiteFooter />}
        {!isAdmin && <WhatsAppConcierge />}
      </div>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
