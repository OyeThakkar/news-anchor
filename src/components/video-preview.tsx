"use client";

import { useEffect, useMemo, useState } from "react";

type PreviewSegment = { id: string; title: string; durationSec: number; line: string };

type Cue = { kind: "speech" | "direction"; text: string };

const TICK_MS = 250;

// Splits a segment's script into caption-sized cues; [bracketed] stage directions become on-screen cues.
function toCues(line: string): Cue[] {
  const cues: Cue[] = [];
  for (const part of line.split(/(\[[^\]]+\])/)) {
    const text = part.trim();
    if (!text) continue;
    if (text.startsWith("[")) {
      cues.push({ kind: "direction", text: text.slice(1, -1) });
      continue;
    }
    for (const sentence of text.split(/(?<=[.?!])\s+|\n+/)) {
      const s = sentence.trim();
      if (s) cues.push({ kind: "speech", text: s });
    }
  }
  return cues;
}

function buildTimeline(segments: PreviewSegment[]) {
  const timeline = [];
  let start = 0;
  for (const segment of segments) {
    const cues = toCues(segment.line);
    // Directions get a short beat; speech shares the rest by length.
    const directions = cues.filter((c) => c.kind === "direction").length;
    const speechChars = cues.filter((c) => c.kind === "speech").reduce((n, c) => n + c.text.length, 0) || 1;
    const directionTime = Math.min(1.5, segment.durationSec / Math.max(cues.length, 1));
    const speechTime = Math.max(segment.durationSec - directionTime * directions, 1);
    const timed = [];
    let at = start;
    for (const cue of cues) {
      const length = cue.kind === "direction" ? directionTime : (cue.text.length / speechChars) * speechTime;
      timed.push({ ...cue, start: at, end: at + length });
      at += length;
    }
    timeline.push({ ...segment, start, end: start + segment.durationSec, cues: timed });
    start += segment.durationSec;
  }
  return timeline;
}

function clock(seconds: number) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function VideoPreview({
  anchorName,
  accentText,
  accentBg,
  orientation,
  topic,
  segments,
  factBox,
}: {
  anchorName: string;
  accentText: string;
  accentBg: string;
  orientation: "landscape" | "portrait";
  topic: string;
  segments: PreviewSegment[];
  factBox?: string[];
}) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  const timeline = useMemo(() => buildTimeline(segments), [segments]);

  const total = timeline.at(-1)?.end ?? 0;

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setTime((t) => {
        const next = t + TICK_MS / 1000;
        if (next >= total) {
          setPlaying(false);
          return total;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing, total]);

  const current = timeline.find((s) => time >= s.start && time < s.end) ?? timeline.at(-1);
  const cue = current?.cues.find((c) => time >= c.start && time < c.end) ?? current?.cues.at(-1);
  const lastDirection = current?.cues.filter((c) => c.kind === "direction" && c.start <= time).at(-1);
  const isFacts = (current?.id === "fact-box" || current?.id === "facts") && factBox;
  const portrait = orientation === "portrait";

  return (
    <div className={portrait ? "mx-auto w-full max-w-[380px]" : "w-full max-w-4xl"}>
      <div
        className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black ${
          portrait ? "aspect-[9/16]" : "aspect-video"
        }`}
      >
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${accentBg}`} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">The Late Edit</span>
        </div>
        <span className="absolute right-4 top-4 rounded bg-slate-800/80 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
          Preview render
        </span>

        {lastDirection && !isFacts && (
          <div className="absolute inset-x-6 top-14 rounded-md border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-xs text-slate-300">
            {lastDirection.text}
          </div>
        )}

        {isFacts && (
          <div className="absolute inset-x-6 top-14 rounded-lg border border-slate-700 bg-slate-900/90 p-4">
            <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${accentText}`}>Fact box</p>
            <ol className={`list-decimal space-y-1.5 pl-5 text-slate-100 ${portrait ? "text-xs" : "text-sm"}`}>
              {factBox.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-5 pb-5 pt-16">
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${accentText}`}>
            {anchorName} · {current?.title}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{topic}</p>
          <p className={`mt-3 min-h-[3.5rem] font-medium text-white ${portrait ? "text-base" : "text-lg"}`}>
            {cue?.kind === "speech" ? cue.text : ""}
          </p>
        </div>

        {!playing && time === 0 && (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="Play preview"
            className="absolute inset-0 flex items-center justify-center bg-black/30 text-5xl text-white/90 hover:bg-black/20"
          >
            ▶
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (time >= total) setTime(0);
            setPlaying((p) => !p);
          }}
          className="w-20 rounded-md border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
        >
          {playing ? "Pause" : time >= total ? "Replay" : "Play"}
        </button>
        <span className="font-mono text-xs text-slate-400">
          {clock(time)} / {clock(total)}
        </span>
      </div>

      <div className="mt-2 flex h-2 gap-0.5" role="group" aria-label="Segments">
        {timeline.map((s) => {
          const filled = Math.min(1, Math.max(0, (time - s.start) / (s.end - s.start)));
          return (
            <button
              key={s.id}
              type="button"
              title={s.title}
              aria-label={`Jump to ${s.title}`}
              onClick={() => setTime(s.start)}
              style={{ flexGrow: s.durationSec }}
              className="relative overflow-hidden rounded-sm bg-slate-800"
            >
              <span className={`absolute inset-y-0 left-0 ${accentBg}`} style={{ width: `${filled * 100}%` }} />
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex gap-0.5 text-[10px] text-slate-500">
        {timeline.map((s) => (
          <span key={s.id} style={{ flexGrow: s.durationSec, flexBasis: 0 }} className="truncate">
            {s.title}
          </span>
        ))}
      </div>
    </div>
  );
}
