import { useEffect, useState } from "react";

type LoaderPhase = "showing" | "leaving" | "hidden";

export function SiteLoadingScreen() {
  const [phase, setPhase] = useState<LoaderPhase>("showing");

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const leaveTimer = window.setTimeout(
      () => setPhase("leaving"),
      reducedMotion ? 350 : 1450,
    );
    const hideTimer = window.setTimeout(
      () => setPhase("hidden"),
      reducedMotion ? 500 : 1900,
    );

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (phase === "hidden") document.body.style.overflow = "";
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      className="tona-loader"
      data-phase={phase}
      role="status"
      aria-live="polite"
      aria-label="Loading Tona Coffee"
    >
      <div className="tona-loader__glow" aria-hidden="true" />

      <div className="tona-loader__content">
        <div className="tona-loader__cup" aria-hidden="true">
          <span className="tona-loader__steam tona-loader__steam--one" />
          <span className="tona-loader__steam tona-loader__steam--two" />
          <span className="tona-loader__steam tona-loader__steam--three" />
          <span className="tona-loader__coffee" />
          <span className="tona-loader__handle" />
        </div>

        <img
          src="/tona-logo.png"
          alt="Tona Coffee"
          width="1024"
          height="1024"
          className="tona-loader__logo"
        />

        <div className="tona-loader__copy">
          <p>Stay for Tona</p>
          <span>Stay for the moment</span>
        </div>

        <div className="tona-loader__track" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
