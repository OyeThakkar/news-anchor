"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type PreviewSegment = { id: string; title: string; durationSec: number; line: string };

type Cue = { kind: "speech" | "direction"; text: string; breakBefore?: boolean };

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
    // Keep paragraph and dialogue-line breaks so the script panel reads like the written script.
    text.split(/\n+/).forEach((paragraph, p) => {
      paragraph
        .split(/(?<=[.?!])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .forEach((sentence, i) => cues.push({ kind: "speech", text: sentence, breakBefore: p > 0 && i === 0 }));
    });
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
  accentBorder,
  orientation,
  topic,
  segments,
  factBox,
  scriptActions,
}: {
  anchorName: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  orientation: "landscape" | "portrait";
  topic: string;
  segments: PreviewSegment[];
  factBox?: string[];
  scriptActions?: ReactNode;
}) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Keep the spoken line in view inside the script panel while playing (without scrolling the page).
  useEffect(() => {
    const panel = panelRef.current;
    const line = panel?.querySelector<HTMLElement>('[data-active="true"]');
    if (!playing || !panel || !line) return;
    const top = line.offsetTop - panel.clientHeight / 3;
    if (Math.abs(panel.scrollTop - top) > panel.clientHeight / 4) panel.scrollTop = top;
  }, [cue, playing]);

  return (
    <div
      className={`grid gap-6 ${portrait ? "lg:grid-cols-[380px_minmax(0,1fr)]" : "xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"}`}
    >
      <div className={portrait ? "mx-auto w-full max-w-[380px]" : "w-full"}>
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

      <section className={`flex flex-col rounded-xl border border-white/10 bg-slate-900/60 ${portrait ? "max-h-[760px]" : "max-h-[640px]"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Script</h2>
            <p className="text-xs text-slate-400">Click any line to jump to it</p>
          </div>
          {scriptActions}
        </div>
        <div ref={panelRef} className="relative flex-1 overflow-y-auto px-4 py-3">
          {timeline.map((s) => {
            const active = s === current;
            return (
              <div key={s.id} className={`mb-5 border-l-2 pl-3 ${active ? accentBorder : "border-transparent"}`}>
                <button
                  type="button"
                  onClick={() => setTime(s.start)}
                  className="mb-1.5 flex w-full items-baseline justify-between gap-2 text-left"
                >
                  <span className={`text-xs font-semibold uppercase tracking-wider ${active ? accentText : "text-slate-400"}`}>
                    {s.title}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{clock(s.start)}</span>
                </button>
                <div className="text-sm leading-relaxed">
                  {s.cues.map((c, i) =>
                    c.kind === "direction" ? (
                      <span key={i} className="my-1 block w-fit rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-400">
                        {c.text}
                      </span>
                    ) : (
                      <span key={i}>
                        {c.breakBefore && <span className="block h-2" />}
                        <button
                          type="button"
                          data-active={c === cue}
                          onClick={() => setTime(c.start)}
                          className={`rounded px-0.5 text-left transition-colors hover:text-white ${
                            c === cue ? "bg-white/10 text-white" : active ? "text-slate-200" : "text-slate-400"
                          }`}
                        >
                          {c.text}
                        </button>{" "}
                      </span>
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
