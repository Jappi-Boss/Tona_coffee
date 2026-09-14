type Props = {
  className?: string;
  markOnly?: boolean;
  tone?: "dark" | "light";
  size?: "sm" | "md" | "lg" | "xl";
};

const LIGHT_LOGO_URL =
  "https://tona-coffee-two.vercel.app/website/assets/images/tona-logo-light.png";
const DARK_LOGO_URL =
  "https://raw.githubusercontent.com/Jappi-Boss/Tona_coffee/7247bf6b0bd5bd8d6d21d08d20fb861eb2aeb612/public/tona-logo.png";

export function TonaMark({ className = "h-14 w-14", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <img
      src={tone === "light" ? LIGHT_LOGO_URL : DARK_LOGO_URL}
      onError={(event) => {
        if (event.currentTarget.src !== DARK_LOGO_URL) {
          event.currentTarget.src = DARK_LOGO_URL;
        }
      }}
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
      className={"inline-flex shrink-0 items-center " + className}
      data-tone={tone}
      data-mark-only={markOnly || undefined}
    >
      <TonaMark className={logoSizes[size] + " object-contain"} tone={tone} />
    </span>
  );
}
