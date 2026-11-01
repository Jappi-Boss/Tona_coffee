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
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 20);
      const marker = window.innerHeight * 0.3;
      let current = "home";
      for (const item of NAV) {
        const section = document.getElementById(item.to);
        if (section && section.getBoundingClientRect().top <= marker) current = item.to;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, [pathname]);

  return (
    <header className={"site-header reference-header" + (scrolled ? " is-scrolled" : "")} id="site-header">
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
