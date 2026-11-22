"use client";

import { useActionState, useState } from "react";
import { saveChannels, type AddState } from "@/lib/actions";
import { channelHandle } from "@/lib/format";

const input =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-200 focus:border-slate-500 focus:outline-none";

const platforms = [
  {
    key: "youtubeUrl" as const,
    name: "YouTube",
    mark: "bg-red-600",
    icon: "▶",
    publishes: "Daily episodes, weekly long-form and YouTube Shorts",
    api: "YouTube Data API",
    placeholder: "https://www.youtube.com/@handle",
  },
  {
    key: "instagramUrl" as const,
    name: "Instagram",
    mark: "bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600",
    icon: "◎",
    publishes: "Shorts as Reels",
    api: "Instagram Graph API",
    placeholder: "https://www.instagram.com/handle",
  },
];

export function ChannelsCard({
  anchor,
  youtubeUrl,
  instagramUrl,
}: {
  anchor: string;
  youtubeUrl: string | null;
  instagramUrl: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<AddState, FormData>(async (prev, form) => {
    const result = await saveChannels(anchor, prev, form);
    if (result.ok) setEditing(false);
    return result;
  }, {});
  const values = { youtubeUrl, instagramUrl };

  return (
    <section className="rounded-xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">Publishing channels</h2>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-slate-200 hover:bg-white/10"
          >
            {youtubeUrl || instagramUrl ? "Edit links" : "Add links"}
          </button>
        )}
      </div>

      {editing ? (
        <form action={formAction} className="space-y-3">
          {platforms.map((p) => (
            <label key={p.key} className="block text-xs text-slate-400">
              {p.name} {p.key === "youtubeUrl" ? "channel" : "account"} link
              <input
                name={p.key}
                defaultValue={values[p.key] ?? ""}
                placeholder={p.placeholder}
                inputMode="url"
                className={`${input} mt-1`}
              />
            </label>
          ))}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-gradient-to-r from-fuchsia-500 to-orange-400 px-3.5 py-1.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
            >
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-sm text-slate-400 hover:text-slate-200">
              Cancel
            </button>
          </div>
          {state.error && <p className="text-xs text-red-400">{state.error}</p>}
        </form>
      ) : (
        <ul className="space-y-3">
          {platforms.map((p) => {
            const url = values[p.key];
            return (
              <li key={p.key} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm text-white ${p.mark}`}>
                  {p.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-medium text-white">{p.name}</span>
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer" className="truncate text-sm text-sky-400 hover:underline">
                        {channelHandle(url)} ↗
                      </a>
                    ) : (
                      <span className="text-sm text-slate-500">No link yet</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Publishes: {p.publishes} · via {p.api}
                  </p>
                </div>
                <span className="shrink-0 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200">
                  API not connected
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Approved videos publish to these channels automatically. Until the API connection (OAuth) is set up, publishing
        is simulated.
      </p>
    </section>
  );
}
