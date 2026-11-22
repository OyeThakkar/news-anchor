import type { AnchorId } from "./anchors";
import type { SourceTier } from "./sources";

export type Segment = {
  id: string;
  title: string;
  durationSec: number;
  purpose: string;
  beats: string[];
  sourceTiers: SourceTier[];
  shortsCut: boolean;
  lines: Record<AnchorId, string>;
};

// Placeholders in {BRACES} are filled once the story is picked from the monitoring sheet.
export const episodeSegments: Segment[] = [
  {
    id: "cold-open",
    title: "Cold open",
    durationSec: 30,
    purpose: "Hook the viewer with one joke that sets up the story.",
    beats: ["One-line setup", "Punchline that names the story", "Title card"],
    sourceTiers: [],
    shortsCut: true,
    lines: {
      reema:
        "Namaste, main hoon Reema. Aaj ki kahani mein ek number hai jo sarkar ko pasand hai, aur ek number jo aapke ghar ke budget ko pasand hai. Spoiler: dono same nahi hain.",
      siddharth:
        "Namaskar, main Siddharth. Aaj ki khabar sunke meri daadi kehti, \"beta, jo cheez jaldi mein banti hai, woh jaldi mein tootti bhi hai.\" Chaliye dekhte hain kaun sahi tha: daadi ya headline.",
    },
  },
  {
    id: "fact-box",
    title: "Headline & fact box",
    durationSec: 45,
    purpose: "Lay out the agreed facts on screen. Identical for both anchors.",
    beats: ["What happened, in one sentence", "3 sourced facts on screen", "Why it matters to the viewer"],
    sourceTiers: ["Wire", "Primary"],
    shortsCut: false,
    lines: {
      reema: "Pehle facts. Opinions baad mein, unki mere paas koi kami nahi hai. {FACT 1}. {FACT 2}. {FACT 3}. Source screen pe hai.",
      siddharth: "Pehle tathya, phir tark. Yeh rahe aaj ke facts, screen pe, source ke saath: {FACT 1}. {FACT 2}. {FACT 3}.",
    },
  },
  {
    id: "chronology",
    title: "How did we get here?",
    durationSec: 165,
    purpose: "Build the chronology. The John Oliver core: rewind to the origin and walk forward.",
    beats: [
      "Origin: the first decision or event",
      "2-3 turning points with dates",
      "The moment it went wrong (or right)",
      "Running gag or callback planted here",
    ],
    sourceTiers: ["Primary", "Wire", "Analysis"],
    shortsCut: true,
    lines: {
      reema:
        "Toh yeh shuru kahan se hua? Rewind karte hain. {YEAR}: ek announcement. {YEAR}: ek deadline. {YEAR}: woh deadline extend. Pattern notice kiya? Maine bhi kiya.",
      siddharth:
        "Har kahani ki ek jad hoti hai. Yeh kahani {YEAR} mein shuru hui, jab {EVENT}. Tab bhi log yahi keh rahe the. Aur tab bhi galat the. Ya shayad nahi. Dekhte hain.",
    },
  },
  {
    id: "now",
    title: "What is happening now",
    durationSec: 120,
    purpose: "Explain the current situation with data, and who it affects.",
    beats: ["The official claim", "What the data says", "Who is affected, with a real-world example", "Chart or visual"],
    sourceTiers: ["Data", "Primary", "Analysis"],
    shortsCut: true,
    lines: {
      reema:
        "Ab aaj ka scene. Press release kehti hai {CLAIM}. Data kehta hai {STAT}. Ek graph dikhati hoon. Yeh line upar ja rahi hai. Aur yeh wali... nahi.",
      siddharth:
        "Aaj ki sthiti yeh hai: {CURRENT STATE}. Institution ne apna kaam kiya. Ya kam se kam form toh bhar diya.",
    },
  },
  {
    id: "cross-talk",
    title: "The other side",
    durationSec: 60,
    purpose: "Cameo from the other anchor. Steelman their view, then a jab each way.",
    beats: ["Other anchor's strongest argument", "Rebuttal", "One point they agree on, if any"],
    sourceTiers: ["Analysis"],
    shortsCut: true,
    lines: {
      reema:
        "SIDDHARTH (cameo): \"Reema, sudhaar mein waqt lagta hai.\" REEMA: \"Siddharth ji, waqt toh lag gaya. Result kahan hai?\" SIDDHARTH: \"Chart toh nahi hai, par paanch hazaar saal ka context hai.\"",
      siddharth:
        "REEMA (cameo): \"Siddharth ji, aapka data kahan hai?\" SIDDHARTH: \"Data aapke paas, dhairya mere paas.\" REEMA: \"Dhairya se EMI nahi bharti.\"",
    },
  },
  {
    id: "forward",
    title: "What we can do moving forward",
    durationSec: 105,
    purpose: "Practical, specific next steps for viewers and institutions.",
    beats: ["What should change (policy or institution)", "What the viewer can do today", "What to watch for next"],
    sourceTiers: ["Analysis", "Primary"],
    shortsCut: false,
    lines: {
      reema:
        "Toh hum kya kar sakte hain? Teen cheezein. Ek: {ACTION}. Do: {ACTION}. Teen: agli baar koi forward aaye, source poochiye.",
      siddharth:
        "Aage ka raasta: {ACTION}. Sudhaar dheere hota hai, par hota hai. Bas usse roz thoda dhakka dena padta hai.",
    },
  },
  {
    id: "big-finish",
    title: "The big finish",
    durationSec: 45,
    purpose: "Payoff the running gag with a stunt or callback, then sign off.",
    beats: ["Callback to the cold open", "Stunt or visual gag", "Sign-off and \"who won today?\" vote"],
    sourceTiers: [],
    shortsCut: true,
    lines: {
      reema: "{CALLBACK}. Good night, aur apni EMI check kar lijiye. Aaj kaun jeeta? App mein vote kariye.",
      siddharth: "{CALLBACK}. Shubh ratri. Aur haan, daadi sahi thi. Aaj kaun jeeta? App mein vote kariye.",
    },
  },
];

export function totalSeconds(segments: { durationSec: number }[]) {
  return segments.reduce((sum, s) => sum + s.durationSec, 0);
}

export function withStartTimes<T extends { durationSec: number }>(segments: T[]) {
  return segments.map((segment, i) => ({
    ...segment,
    start: totalSeconds(segments.slice(0, i)),
  }));
}

export function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
