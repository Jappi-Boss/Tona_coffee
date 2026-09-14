import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { TonaLogo } from "./TonaLogo";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Coffee" },
  { to: "/for-business", label: "For business" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
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
        <TonaLogo tone="light" />
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
          <Link
            key={item.to}
            to={item.to}
            className={pathname === item.to ? "active" : undefined}
            aria-current={pathname === item.to ? "page" : undefined}
            data-status={pathname === item.to ? "active" : undefined}
            activeOptions={{ exact: true }}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <a className="header-cta" href="/contact#orders" onClick={() => setOpen(false)}>
        Order <span aria-hidden="true">↓</span>
      </a>
    </header>
  );
}
