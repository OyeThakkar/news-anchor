import { notFound } from "next/navigation";

export type AnchorId = "reema" | "siddharth";

export type Anchor = {
  id: AnchorId;
  name: string;
  role: string;
  worldview: string;
  delivery: string;
  look: string;
  comedy: string;
  focus: string[];
};

export const anchors: Record<AnchorId, Anchor> = {
  reema: {
    id: "reema",
    name: "Reema",
    role: "Welfare-first sceptic",
    worldview:
      "Accountability, civil liberties, welfare and inclusion, scepticism of power.",
    delivery: "Crisp, data-led markets-desk delivery. Quick, dry, rising when she catches a contradiction.",
    look: "Structured blazer, clean newsroom set with data screens.",
    comedy: "Deadpan, chart-driven punchlines, on-the-spot fact-checks.",
    focus: ["Markets to household impact", "Budget & welfare outcomes", "Legislative tracking", "Who was accountable"],
  },
  siddharth: {
    id: "siddharth",
    name: "Siddharth",
    role: "Market-first optimist",
    worldview:
      "Continuity, institutions, self-reliance, enterprise, national pride, caution about rapid change.",
    delivery: "Unhurried, warm baritone, courteous, with Hindi/Urdu turns of phrase.",
    look: "Bandhgala or kurta-jacket; set with books, brass lamps, warm lighting.",
    comedy: "Gentle irony, history analogies, proverbs, self-aware \"in my day\" nostalgia.",
    focus: ["Enterprise & reform", "Fiscal & industrial policy", "History analogies", "Did the institution hold?"],
  },
};

export const anchorIds: AnchorId[] = ["reema", "siddharth"];

export function isAnchorId(value: string): value is AnchorId {
  return value === "reema" || value === "siddharth";
}

export async function resolveAnchor(params: Promise<{ anchor: string }>): Promise<AnchorId> {
  const { anchor } = await params;
  if (!isAnchorId(anchor)) notFound();
  return anchor;
}

// Tailwind needs literal class names, so per-anchor accents live here.
export const accent: Record<
  AnchorId,
  { tone: "sky" | "amber"; text: string; bg: string; soft: string; border: string; dot: string; active: string; avatar: string }
> = {
  reema: {
    tone: "sky",
    text: "text-sky-400",
    bg: "bg-sky-500",
    soft: "bg-sky-500/10",
    border: "border-sky-500/40",
    dot: "bg-sky-400",
    active: "bg-sky-500/15 text-sky-100 ring-1 ring-inset ring-sky-400/30",
    avatar: "from-sky-400 to-cyan-600",
  },
  siddharth: {
    tone: "amber",
    text: "text-amber-400",
    bg: "bg-amber-500",
    soft: "bg-amber-500/10",
    border: "border-amber-500/40",
    dot: "bg-amber-400",
    active: "bg-amber-500/15 text-amber-100 ring-1 ring-inset ring-amber-400/30",
    avatar: "from-amber-400 to-orange-600",
  },
};

export const publishingTargets = {
  episode: { label: "Daily episode", perDay: 1, minMinutes: 7, maxMinutes: 10 },
  shorts: { label: "Shorts", minPerDay: 3, maxPerDay: 15 },
  weekly: { label: "Weekly long-form", perWeek: 1, minMinutes: 20, maxMinutes: 24 },
};
