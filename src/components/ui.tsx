import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <header className="mb-8">
      {eyebrow && <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">{eyebrow}</p>}
      <h1 className="text-2xl font-semibold text-zinc-100">{title}</h1>
      {description && <p className="mt-2 max-w-3xl text-sm text-zinc-400">{description}</p>}
    </header>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 ${className}`}>
      {title && <h2 className="mb-4 text-sm font-semibold text-zinc-200">{title}</h2>}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300 ${className}`}>
      {children}
    </span>
  );
}
