"use client";

import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui";
import { setSourceActive } from "@/lib/actions";
import { monitorChip, tierChip } from "@/lib/colors";
import { accent, anchors, type AnchorId } from "@/lib/anchors";
import { frequencies, monitors, outputFormats, type CheckFrequency, type Monitor, type OutputFormat } from "@/lib/sources";
import type { SourceRecord } from "@/lib/store";
import { AddSourceForm } from "./add-source-form";

const selectClass =
  "rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-200 focus:border-slate-500 focus:outline-none";

function ToggleButton({ anchor, source }: { anchor: AnchorId; source: SourceRecord }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    if (source.active && source.owner === "shared") {
      const ok = window.confirm(`${source.name} is shared. Deactivating it stops monitoring for both anchors.`);
      if (!ok) return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setSourceActive(anchor, source.id, !source.active);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
          source.active
            ? "border-slate-700 text-slate-300 hover:border-red-600/60 hover:text-red-300"
            : "border-emerald-600/60 text-emerald-300 hover:bg-emerald-500/10"
        }`}
      >
        {source.active ? "Deactivate" : "Reactivate"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export function MonitoringSheet({ anchor, rows, groups }: { anchor: AnchorId; rows: SourceRecord[]; groups: string[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "all">("active");
  const [layer, setLayer] = useState<"all" | "own" | "shared">("all");
  const [format, setFormat] = useState<OutputFormat | "">("");
  const [frequency, setFrequency] = useState<CheckFrequency | "">("");
  const [monitor, setMonitor] = useState<Monitor | "">("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((s) => status === "all" || (status === "active" ? s.active : !s.active))
      .filter((s) => layer === "all" || (layer === "own" ? s.owner === anchor : s.owner === "shared"))
      .filter((s) => !format || s.formats.includes(format))
      .filter((s) => !frequency || s.frequency === frequency)
      .filter((s) => !monitor || s.monitor === monitor)
      .filter((s) => !q || [s.name, s.beat, s.group, s.note ?? ""].some((v) => v.toLowerCase().includes(q)))
      .sort((a, b) => frequencies.indexOf(a.frequency) - frequencies.indexOf(b.frequency));
  }, [rows, anchor, query, status, layer, format, frequency, monitor]);

  return (
    <>
      <AddSourceForm anchor={anchor} groups={groups} />

      <div className="rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 p-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search source or beat"
            aria-label="Search sources"
            className={`${selectClass} w-56`}
          />
          <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={selectClass}>
            <option value="active">Active</option>
            <option value="inactive">Deactivated</option>
            <option value="all">All statuses</option>
          </select>
          <select aria-label="Anchor" value={layer} onChange={(e) => setLayer(e.target.value as typeof layer)} className={selectClass}>
            <option value="all">{anchors[anchor].name} + shared</option>
            <option value="own">{anchors[anchor].name} only</option>
            <option value="shared">Shared only</option>
          </select>
          <select aria-label="Format" value={format} onChange={(e) => setFormat(e.target.value as OutputFormat | "")} className={selectClass}>
            <option value="">All formats</option>
            {outputFormats.map((f) => (
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
          <span className="ml-auto text-xs text-slate-500">{filtered.length} sources</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs text-slate-300">
              <tr>
                <th className="px-4 py-2.5 font-medium">Source</th>
                <th className="px-4 py-2.5 font-medium">Anchor</th>
                <th className="px-4 py-2.5 font-medium">Beat</th>
                <th className="px-4 py-2.5 font-medium">Format</th>
                <th className="px-4 py-2.5 font-medium">Check frequency</th>
                <th className="px-4 py-2.5 font-medium">Monitored by</th>
                <th className="px-4 py-2.5 font-medium">Tier</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((s) => (
                <tr key={s.id} className={`hover:bg-slate-800/40 ${s.active ? "" : "opacity-50"}`}>
                  <td className="px-4 py-2.5">
                    <a href={s.url} target="_blank" rel="noreferrer" className="text-slate-100 hover:underline">
                      {s.name}
                    </a>
                    <span className="block text-xs text-slate-500">{s.note ?? s.group}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    {s.owner === "shared" ? (
                      <span className="text-slate-400">Shared</span>
                    ) : (
                      <span className={accent[s.owner].text}>{anchors[s.owner].name}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">{s.beat}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {s.formats.map((f) => (
                        <Badge key={f}>{f}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">{s.frequency}</td>
                  <td className="px-4 py-2.5">
                    <Badge className={monitorChip(s.monitor)}>{s.monitor}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge className={tierChip(s.tier)}>{s.tier}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <ToggleButton anchor={anchor} source={s} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No sources match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
