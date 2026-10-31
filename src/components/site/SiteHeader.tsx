import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const NAV = [
  { to: "home", label: "Home" },
  { to: "story", label: "About" },
  { to: "coffee", label: "Coffee" },
  { to: "business", label: "For business" },
  { to: "stockists", label: "Where to find us" },
  { to: "contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  useEffect(() => {
    const update = () => setActive(window.location.hash.slice(1) || "home");
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <header className="site-header reference-header" id="site-header">
      <Link
        to="/"
        aria-label="Tona Coffee home"
        className="brand"
        onClick={() => setOpen(false)}
      >
        <img
          src="https://tona-coffee-two.vercel.app/website/assets/images/tona-logo-light.png"
          alt="Tona Coffee"
        />
      </Link>

      <button
        className="menu-toggle"
        id="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span>Menu</span>
        <span className="menu-mark" aria-hidden="true">
          {open ? "×" : ""}
        </span>
      </button>

      <nav
        className={"primary-navigation" + (open ? " is-open" : "")}
        id="primary-navigation"
        aria-label="Primary navigation"
      >
        {NAV.map((item) => (
          <a
            key={item.to}
            href={"/#" + item.to}
            className={active === item.to ? "active" : undefined}
            aria-current={active === item.to ? "page" : undefined}
            data-status={active === item.to ? "active" : undefined}
            onClick={() => {
              setActive(item.to);
              setOpen(false);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <a className="header-cta" href="/#orders" onClick={() => setOpen(false)}>
        Order <span aria-hidden="true">↓</span>
      </a>
    </header>
  );
}
