type Props = { className?: string; markOnly?: boolean; tone?: "dark" | "light" };

export function TonaMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Tona Coffee mark">
      <circle cx="24" cy="24" r="23" fill="currentColor" />
      {/* coffee bean / leaf split */}
      <path
        d="M24 9c8.3 0 15 6.7 15 15s-6.7 15-15 15S9 32.3 9 24 15.7 9 24 9Z"
        fill="var(--color-primary-foreground)"
        opacity="0.14"
      />
      <path
        d="M14 30c0-9 7-16 16-16 2.2 0 4 .4 4 .4s.4 1.8.4 4c0 9-7 16-16 16-2.2 0-4-.4-4-.4S14 32.2 14 30Z"
        fill="var(--color-primary-foreground)"
      />
      <path
        d="M15 33.4C21.5 26.9 27.5 21 34.4 14.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function TonaLogo({ className = "", markOnly = false, tone = "dark" }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <TonaMark className="h-9 w-9 text-primary" />
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display text-[1.35rem] font-bold tracking-tight ${
              tone === "light" ? "text-teal-foreground" : "text-foreground"
            }`}
          >
            Tona<span className="text-primary">.</span>
          </span>
          <span
            className={`label-mono mt-1 text-[0.55rem] ${
              tone === "light" ? "text-teal-foreground/60" : "text-muted-foreground"
            }`}
          >
            Coffee
          </span>
        </span>
      )}
    </span>
  );
}
