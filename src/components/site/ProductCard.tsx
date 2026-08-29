import { useState } from "react";
import { MessageCircle, Minus, Plus } from "lucide-react";
import { FORMATS, SIZES, waLink, type Product } from "@/lib/tona";
import { PRODUCT_IMAGES } from "@/lib/product-images";

export function ProductCard({ product }: { product: Product }) {
  const [size, setSize] = useState<string>(SIZES[0]!);
  const [format, setFormat] = useState<string>(FORMATS[0]!);
  const [qty, setQty] = useState(1);

  const message = `Hi Tona, I'd like to order:\n• ${product.name} (${product.process})\n• Size: ${size}\n• Grind: ${format}\n• Quantity: ${qty}\n\nPlease confirm availability and price.`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden bg-muted">
        <img
          src={PRODUCT_IMAGES[product.slug as keyof typeof PRODUCT_IMAGES]}
          alt={`${product.name} black coffee with roasted coffee beans`}
          width={720}
          height={360}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
        <span className="label-mono absolute left-6 top-5 rounded-full bg-background/90 px-3 py-1.5 text-foreground">
          {product.process}
        </span>
        <span className="absolute bottom-5 left-6 font-display text-3xl font-bold text-primary-foreground">
          {product.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="label-mono text-muted-foreground">{product.region}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {product.blurb}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.notes.map((n) => (
            <span
              key={n}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground/80"
            >
              {n}
            </span>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Altitude {product.altitude}
        </p>

        <div className="mt-6 space-y-4">
          <Choice
            label="Size"
            options={[...SIZES]}
            value={size}
            onChange={setSize}
          />
          <Choice
            label="Grind"
            options={[...FORMATS]}
            value={format}
            onChange={setFormat}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-border p-1">
            <button
              type="button"
              aria-label={`Decrease ${product.name} quantity`}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">{qty}</span>
            <button
              type="button"
              aria-label={`Increase ${product.name} quantity`}
              onClick={() => setQty((q) => q + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <a
            href={waLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <MessageCircle className="h-4 w-4" />
            Order on WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}

function Choice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="label-mono mb-2 text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              value === o
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground/70 hover:border-primary/50"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
