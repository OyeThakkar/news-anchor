import { formatTime, withStartTimes } from "./scripts";

type ScriptLike = {
  topic: string;
  format: string;
  date: string;
  durationSec: number;
  storyTitle?: string;
  factBox?: string[];
  sources?: { label: string; url: string }[];
  segments: { title: string; durationSec: number; line: string }[];
};

// Plain-text version of a script for copying or downloading.
export function scriptToText(script: ScriptLike, meta: { anchor: string; serial: string }) {
  const lines = [
    `THE LATE EDIT · ${meta.anchor.toUpperCase()}`,
    script.topic,
    `${meta.serial} · ${script.date} · ${script.format} · ${formatTime(script.durationSec)}`,
  ];
  if (script.storyTitle) lines.push(`Story: ${script.storyTitle}`);

  if (script.factBox?.length) {
    lines.push("", "FACT BOX", ...script.factBox.map((fact, i) => `${i + 1}. ${fact}`));
  }

  for (const segment of withStartTimes(script.segments)) {
    lines.push(
      "",
      `[${formatTime(segment.start)}-${formatTime(segment.start + segment.durationSec)}] ${segment.title.toUpperCase()}`,
      segment.line,
    );
  }

  if (script.sources?.length) {
    lines.push("", "SOURCES", ...script.sources.map((s) => `- ${s.label}: ${s.url}`));
  }

  return `${lines.join("\n")}\n`;
}

export function scriptFilename(meta: { serial: string }, script: { date: string; topic: string }) {
  const slug = script.topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 50)
    .replace(/(^-|-$)/g, "");
  return `${meta.serial}-${script.date}-${slug}.txt`;
}
