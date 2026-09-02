type Props = {
  className?: string;
  markOnly?: boolean;
  tone?: "dark" | "light";
};

export function TonaMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Tona Coffee seal"
    >
      <circle cx="32" cy="32" r="31" fill="currentColor" />
      <circle
        cx="32"
        cy="32"
        r="24.5"
        fill="none"
        stroke="white"
        strokeWidth="1"
        opacity=".8"
      />
      <path
        d="M24 23.5c5.4 0 9 3.7 9 8.5s-3.6 8.5-9 8.5c0-5.5 2.4-11 7.2-15.8"
        fill="none"
        stroke="white"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 23.5c-5.4 0-9 3.7-9 8.5s3.6 8.5 9 8.5c0-5.5-2.4-11-7.2-15.8"
        fill="none"
        stroke="white"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 17.5v29M23 32h18"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="32" cy="13.2" r="1.25" fill="white" />
      <circle cx="32" cy="50.8" r="1.25" fill="white" />
    </svg>
  );
}

export function TonaLogo({
  className = "",
  markOnly = false,
  tone = "dark",
}: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <TonaMark className="h-11 w-11 text-primary" />
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display text-[1.65rem] font-extrabold uppercase leading-[.78] tracking-[.02em] ${
              tone === "light" ? "text-teal-foreground" : "text-foreground"
            }`}
          >
            Tona
          </span>
          <span
            className={`mt-1 text-[0.55rem] font-bold uppercase tracking-[.38em] ${
              tone === "light"
                ? "text-teal-foreground/60"
                : "text-muted-foreground"
            }`}
          >
            Coffee
          </span>
        </span>
      )}
    </span>
  );
}
