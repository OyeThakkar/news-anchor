import { tones, type Tone } from "@/components/ui";

const monitorTone: Record<string, Tone> = { Tool: "violet", Researcher: "emerald", Both: "fuchsia" };
const tierTone: Record<string, Tone> = {
  Primary: "rose",
  Wire: "sky",
  Data: "emerald",
  Analysis: "violet",
  "Fact-check": "amber",
};

export const monitorChip = (monitor: string) => tones[monitorTone[monitor] ?? "violet"].chip;
export const tierChip = (tier: string) => tones[tierTone[tier] ?? "violet"].chip;
