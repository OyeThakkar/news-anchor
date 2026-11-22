"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui";
import { accent, anchors, type AnchorId } from "@/lib/anchors";
import type { CheckFrequency, Monitor, OutputFormat, Source } from "@/lib/sources";

const frequencies: CheckFrequency[] = ["Live", "Hourly", "Twice daily", "Daily", "On release", "Weekly"];
const monitors: Monitor[] = ["Tool", "Researcher", "Both"];
const formats: OutputFormat[] = ["Shorts", "Episode", "Weekly"];

const selectClass =
  "rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none";

export function MonitoringSheet({ anchor, rows }: { anchor: AnchorId; rows: Source[] }) {
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState<"all" | "own" | "shared">("all");
  const [format, setFormat] = useState<OutputFormat | "">("");
  const [frequency, setFrequency] = useState<CheckFrequency | "">("");
  const [monitor, setMonitor] = useState<Monitor | "">("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((s) => layer === "all" || (layer === "own" ? s.owner === anchor : s.owner === "shared"))
      .filter((s) => !format || s.formats.includes(format))
      .filter((s) => !frequency || s.frequency === frequency)
      .filter((s) => !monitor || s.monitor === monitor)
      .filter((s) => !q || [s.name, s.beat, s.group, s.note ?? ""].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => frequencies.indexOf(a.frequency) - frequencies.indexOf(b.frequency));
  }, [rows, anchor, query, layer, format, frequency, monitor]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 p-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search source or beat"
          aria-label="Search sources"
          className={`${selectClass} w-56`}
        />
        <select aria-label="Anchor" value={layer} onChange={(e) => setLayer(e.target.value as typeof layer)} className={selectClass}>
          <option value="all">{anchors[anchor].name} + shared</option>
          <option value="own">{anchors[anchor].name} only</option>
          <option value="shared">Shared only</option>
        </select>
        <select aria-label="Format" value={format} onChange={(e) => setFormat(e.target.value as OutputFormat | "")} className={selectClass}>
          <option value="">All formats</option>
          {formats.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <select
          aria-label="Check frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as CheckFrequency | "")}
          className={selectClass}
        >
          <option value="">Any frequency</option>
          {frequencies.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <select aria-label="Monitored by" value={monitor} onChange={(e) => setMonitor(e.target.value as Monitor | "")} className={selectClass}>
          <option value="">Any monitor</option>
          {monitors.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-zinc-500">{filtered.length} sources</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-zinc-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Source</th>
              <th className="px-4 py-2.5 font-medium">Anchor</th>
              <th className="px-4 py-2.5 font-medium">Beat</th>
              <th className="px-4 py-2.5 font-medium">Format</th>
              <th className="px-4 py-2.5 font-medium">Check frequency</th>
              <th className="px-4 py-2.5 font-medium">Monitored by</th>
              <th className="px-4 py-2.5 font-medium">Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map((s) => (
              <tr key={`${s.owner}-${s.name}`} className="hover:bg-zinc-800/40">
                <td className="px-4 py-2.5">
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-zinc-100 hover:underline">
                    {s.name}
                  </a>
                  <span className="block text-xs text-zinc-500">{s.note ?? s.group}</span>
                </td>
                <td className="px-4 py-2.5">
                  {s.owner === "shared" ? (
                    <span className="text-zinc-400">Shared</span>
                  ) : (
                    <span className={accent[s.owner].text}>{anchors[s.owner].name}</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-zinc-300">{s.beat}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {s.formats.map((f) => (
                      <Badge key={f}>{f}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-zinc-300">{s.frequency}</td>
                <td className="px-4 py-2.5 text-zinc-300">{s.monitor}</td>
                <td className="px-4 py-2.5 text-zinc-400">{s.tier}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No sources match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
