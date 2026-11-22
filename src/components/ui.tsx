import type { ReactNode } from "react";

export type Tone = "fuchsia" | "sky" | "amber" | "violet" | "emerald" | "rose";

// Literal class names so Tailwind can see them.
export const tones: Record<Tone, { text: string; bar: string; glow: string; chip: string }> = {
  fuchsia: {
    text: "text-fuchsia-300",
    bar: "from-fuchsia-500 to-orange-400",
    glow: "shadow-[0_0_40px_-12px] shadow-fuchsia-500/40",
    chip: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-200",
  },
  sky: {
    text: "text-sky-300",
    bar: "from-sky-400 to-cyan-300",
    glow: "shadow-[0_0_40px_-12px] shadow-sky-500/40",
    chip: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  },
  amber: {
    text: "text-amber-300",
    bar: "from-amber-400 to-orange-400",
    glow: "shadow-[0_0_40px_-12px] shadow-amber-500/40",
    chip: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  },
  violet: {
    text: "text-violet-300",
    bar: "from-violet-400 to-indigo-400",
    glow: "shadow-[0_0_40px_-12px] shadow-violet-500/40",
    chip: "border-violet-500/40 bg-violet-500/10 text-violet-200",
  },
  emerald: {
    text: "text-emerald-300",
    bar: "from-emerald-400 to-teal-300",
    glow: "shadow-[0_0_40px_-12px] shadow-emerald-500/40",
    chip: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  },
  rose: {
    text: "text-rose-300",
    bar: "from-rose-400 to-pink-400",
    glow: "shadow-[0_0_40px_-12px] shadow-rose-500/40",
    chip: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  },
};

export function PageHeader({
  eyebrow,
  title,
  description,
  tone = "fuchsia",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: Tone;
}) {
  return (
    <header className="mb-8">
      {eyebrow && (
        <p className={`mb-1 text-xs font-semibold uppercase tracking-widest ${tones[tone].text}`}>{eyebrow}</p>
      )}
      <h1 className="text-3xl font-semibold text-white">{title}</h1>
      <div className={`mt-3 h-1 w-16 rounded-full bg-gradient-to-r ${tones[tone].bar}`} />
      {description && <p className="mt-3 max-w-3xl text-sm text-slate-300">{description}</p>}
    </header>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-sm ${className}`}>
      {title && <h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, tone = "violet" }: { label: string; value: ReactNode; hint?: string; tone?: Tone }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/60 p-5 ${tones[tone].glow}`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tones[tone].bar}`} />
      <p className={`text-xs font-medium uppercase tracking-wider ${tones[tone].text}`}>{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md border border-slate-600 px-2 py-0.5 text-xs text-slate-200 ${className}`}>
      {children}
    </span>
  );
}
