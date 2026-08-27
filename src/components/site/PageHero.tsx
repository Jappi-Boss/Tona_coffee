import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="leaf-field border-b border-border bg-sand">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <p className="label-mono text-primary">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
