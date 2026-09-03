type Props = {
  className?: string;
  markOnly?: boolean;
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg" | "xl";
};

export function TonaMark({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <img
      src="/tona-logo.png"
      alt="Tona Coffee — Stay for Tona, Stay for the Moment"
      width="1024"
      height="1024"
      className={className}
      decoding="async"
    />
  );
}

const logoSizes = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
} as const;

export function TonaLogo({
  className = "",
  markOnly = false,
  tone = "dark",
  size = "md",
}: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center ${className}`}
      data-tone={tone}
      data-mark-only={markOnly || undefined}
    >
      <TonaMark className={`${logoSizes[size]} object-contain`} />
    </span>
  );
}
