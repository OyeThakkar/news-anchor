"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addSource, type AddState } from "@/lib/actions";
import { anchors, type AnchorId } from "@/lib/anchors";
import { frequencies, monitors, outputFormats, tiers } from "@/lib/sources";

const input =
  "rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-200 focus:border-slate-500 focus:outline-none";
const label = "flex flex-col gap-1 text-xs text-slate-500";

export function AddSourceForm({ anchor, groups }: { anchor: AnchorId; groups: string[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AddState, FormData>(addSource.bind(null, anchor), {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 rounded-md bg-gradient-to-r from-fuchsia-500 to-orange-400 px-3.5 py-1.5 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/20 hover:brightness-110"
      >
        + Add source
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="mb-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className={label}>
          Source name
          <input name="name" required className={input} />
        </label>
        <label className={label}>
          Link
          <input name="url" type="url" required placeholder="https://" className={input} />
        </label>
        <label className={label}>
          Anchor
          <select name="owner" defaultValue={anchor} className={input}>
            <option value={anchor}>{anchors[anchor].name}</option>
            <option value="shared">Shared (both anchors)</option>
          </select>
        </label>
        <label className={label}>
          Category
          <input name="group" required list={`groups-${anchor}`} placeholder="e.g. Markets desk" className={input} />
          <datalist id={`groups-${anchor}`}>
            {groups.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </label>
        <label className={label}>
          Beat
          <input name="beat" required placeholder="e.g. Banking, RBI" className={input} />
        </label>
        <label className={label}>
          Tier
          <select name="tier" defaultValue="Analysis" className={input}>
            {tiers.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Check frequency
          <select name="frequency" defaultValue="Daily" className={input}>
            {frequencies.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Monitored by
          <select name="monitor" defaultValue="Both" className={input}>
            {monitors.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <fieldset className="flex flex-col gap-1 text-xs text-slate-500">
          <legend className="mb-1">Feeds into</legend>
          <div className="flex gap-3 text-sm text-slate-200">
            {outputFormats.map((f) => (
              <label key={f} className="flex items-center gap-1.5">
                <input type="checkbox" name="formats" value={f} defaultChecked className="accent-slate-300" />
                {f}
              </label>
            ))}
          </div>
        </fieldset>
        <label className={`${label} lg:col-span-3`}>
          Note (optional)
          <input name="note" className={input} />
        </label>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gradient-to-r from-fuchsia-500 to-orange-400 px-3.5 py-1.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
        >
          Add source
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-2 py-1.5 text-sm text-slate-400 hover:text-slate-200">
          Close
        </button>
        {state.error && <p className="text-xs text-red-400">{state.error}</p>}
        {state.ok && <p className="text-xs text-emerald-400">Source added and active.</p>}
      </div>
    </form>
  );
}
