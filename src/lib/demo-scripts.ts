import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { anchorIds, type AnchorId } from "./anchors";
import type { Review } from "./review";
import { episodeSegments, shortSegments, totalSeconds, type SegmentTemplate } from "./scripts";

// Researched scripts that ship with the repo, one JSON file per day.
const dir = path.join(process.cwd(), "src", "data", "demo-scripts");

type DayFile = {
  date: string;
  stories: { id: string; title: string; factBox: string[]; sources: { label: string; url: string }[] }[];
  scripts: {
    anchor: AnchorId;
    format: "Episode" | "Short";
    storyId: string;
    topic: string;
    segments: { id: string; line: string }[];
  }[];
};

export type DemoScript = {
  id: string;
  anchor: AnchorId;
  serial: number;
  date: string;
  topic: string;
  format: "Episode" | "Short";
  durationSec: number;
  storyId: string;
  storyTitle: string;
  factBox: string[];
  sources: { label: string; url: string }[];
  segments: (SegmentTemplate & { line: string })[];
  submittedAt: string;
  review: Review;
};

function readDays(): DayFile[] {
  let files: string[];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  return files.sort().map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")));
}

function buildSegments(templates: SegmentTemplate[], lines: { id: string; line: string }[], label: string) {
  return templates.map((t) => {
    const line = lines.find((l) => l.id === t.id)?.line;
    if (!line) throw new Error(`Demo script ${label} is missing segment "${t.id}"`);
    return { ...t, line };
  });
}

// Past days are already through review; today's scripts start pending so the review flow can be demoed.
export function demoScripts(now: Date, today: string): DemoScript[] {
  const serials: Record<AnchorId, number> = { reema: 0, siddharth: 0 };
  const records: DemoScript[] = [];

  for (const day of readDays()) {
    for (const anchor of anchorIds) {
      const scripts = day.scripts
        .filter((s) => s.anchor === anchor)
        .sort((a, b) => (a.format === b.format ? 0 : a.format === "Episode" ? -1 : 1));

      for (const s of scripts) {
        const story = day.stories.find((st) => st.id === s.storyId);
        if (!story) throw new Error(`Demo script for ${day.date} references unknown story "${s.storyId}"`);
        const templates = s.format === "Episode" ? episodeSegments : shortSegments;
        const segments = buildSegments(templates, s.segments, `${day.date}/${anchor}/${s.storyId}`);
        const isPast = day.date < today;

        records.push({
          id: `${anchor}-${day.date}-${s.storyId}`,
          anchor,
          serial: ++serials[anchor],
          date: day.date,
          topic: s.topic,
          format: s.format,
          durationSec: totalSeconds(segments),
          storyId: story.id,
          storyTitle: story.title,
          factBox: story.factBox,
          sources: story.sources,
          segments,
          submittedAt: isPast ? `${day.date}T18:00:00+05:30` : now.toISOString(),
          review:
            isPast && s.format === "Episode"
              ? { decision: "approved", at: new Date(`${day.date}T18:25:00+05:30`).toISOString() }
              : null,
        });
      }
    }
  }

  return records;
}
