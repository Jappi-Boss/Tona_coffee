import { useEffect } from "react";

const TARGETS = ".reveal, .origin-card, .moment-card, .partner-row, .principle, .pack-card, .step, .stockist-card, .vision-mission article, .section-art, .about-art, .area-request";

export function PageMotion({ pathname }: { pathname: string }) {
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new Set<HTMLElement>();
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    let started = false;
    let sectionObserver: IntersectionObserver | undefined;
    let pulseFrame = 0;
    const sections = Array.from(main.querySelectorAll<HTMLElement>(".section:not(#home)"));
    const updatePulse = () => {
      pulseFrame = 0;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
        const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
        section.style.setProperty("--cinema-track", `${(progress * 110).toFixed(1)}px`);
      }
    };
    const schedulePulse = () => {
      if (!pulseFrame) pulseFrame = requestAnimationFrame(updatePulse);
    };
    const reveal = (target: HTMLElement) => {
      target.classList.add("is-visible", "motion-in", "cinematic-copy-in");
    };
    const discover = () => {
      main.querySelectorAll<HTMLElement>(TARGETS).forEach((target) => {
        if (target.closest(".hero") || seen.has(target)) return;
        seen.add(target);
        const parent = target.parentElement;
        if (parent?.matches(".moment-grid, .origin-grid, .partner-list, .step-list, .pack-grid, .stockist-cards, .feedback-choices")) {
          const index = Array.from(parent.children).indexOf(target);
          target.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 72}ms`);
        }
        if (reduced || !observer) reveal(target);
        else observer.observe(target);
      });
    };
    const start = () => {
      if (started || document.documentElement.classList.contains("tona-intro-on")) return;
      started = true;
      if (!reduced && "IntersectionObserver" in window) {
        observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            reveal(entry.target as HTMLElement);
            observer?.unobserve(entry.target);
          }
        }, { threshold: 0.12, rootMargin: "0px 0px -7%" });
      }
      sections.forEach((section) => section.classList.add("motion-section", "section-cinema"));
      if (!reduced && "IntersectionObserver" in window) {
        sectionObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("cinema-in", entry.isIntersecting);
            if (entry.isIntersecting) entry.target.classList.add("motion-in");
          });
        }, { rootMargin: "-12% 0px -12%", threshold: 0.02 });
        sections.forEach((section) => sectionObserver?.observe(section));
        window.addEventListener("scroll", schedulePulse, { passive: true });
        window.addEventListener("resize", schedulePulse);
        updatePulse();
      } else {
        sections.forEach((section) => section.classList.add("cinema-in", "motion-in"));
      }
      discover();
    };
    if (!reduced) {
      document.body.classList.add("motion-ready");
      frame = requestAnimationFrame(() => document.body.classList.add("motion-loaded"));
    }
    // Observe catalogue cards too: these arrive after the initial page render.
    const mutations = new MutationObserver(() => { if (started) discover(); });
    mutations.observe(main, { childList: true, subtree: true });
    window.addEventListener("tona:loader-hidden", start);
    start();
    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer?.disconnect();
      sectionObserver?.disconnect();
      cancelAnimationFrame(pulseFrame);
      window.removeEventListener("scroll", schedulePulse);
      window.removeEventListener("resize", schedulePulse);
      sections.forEach((section) => {
        section.classList.remove("motion-section", "section-cinema", "cinema-in", "motion-in");
        section.style.removeProperty("--cinema-track");
      });
      window.removeEventListener("tona:loader-hidden", start);
      document.body.classList.remove("motion-ready", "motion-loaded");
      seen.forEach((target) => target.classList.remove("is-visible", "motion-in", "cinematic-copy-in"));
    };
  }, [pathname]);
  return null;
}
