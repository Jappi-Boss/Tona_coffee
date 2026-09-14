import { useEffect, useRef } from "react";

const LOADER_HIDDEN_EVENT = "tona:loader-hidden";

const MOTION_TARGET_SELECTOR = [
  "main section",
  "main section h1",
  "main section h2",
  "main section h3",
  "main section h4",
  "main section p",
  "main section article",
  "main section form",
  "main section img",
  "main section .grid > *",
  "main section a.brand-button",
  "main section button",
].join(",");

type PageMotionProps = {
  pathname: string;
};

export function PageMotion({ pathname }: PageMotionProps) {
  const isFirstPage = useRef(true);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const targets = Array.from(
      main.querySelectorAll<HTMLElement>(MOTION_TARGET_SELECTOR),
    ).filter((target) => !target.closest(".public-hero"));
    let animationFrame: number | undefined;
    let fallbackTimer: number | undefined;
    let observer: IntersectionObserver | undefined;
    let started = false;

    const revealTarget = (target: HTMLElement) => {
      target.classList.add("is-visible", "motion-in");
    };

    const revealAll = () => {
      targets.forEach(revealTarget);
    };

    const startMotion = () => {
      if (started) return;
      started = true;

      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);

      if (reducedMotion || !("IntersectionObserver" in window)) {
        revealAll();
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            revealTarget(entry.target as HTMLElement);
            observer?.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -7%",
        },
      );

      animationFrame = window.requestAnimationFrame(() => {
        targets.forEach((target) => observer?.observe(target));
      });
    };

    if (reducedMotion) {
      startMotion();
    } else {
      window.addEventListener(LOADER_HIDDEN_EVENT, startMotion, { once: true });
      fallbackTimer = window.setTimeout(
        startMotion,
        isFirstPage.current ? 2500 : 1250,
      );
    }

    isFirstPage.current = false;

    return () => {
      window.removeEventListener(LOADER_HIDDEN_EVENT, startMotion);
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
      observer?.disconnect();

      targets.forEach((target) => {
        target.classList.remove("is-visible", "motion-in");
      });
    };
  }, [pathname]);

  return null;
}
