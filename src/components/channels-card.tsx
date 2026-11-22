"use client";

import { useActionState, useState, useTransition } from "react";
import { disconnectChannel, saveChannels, type AddState } from "@/lib/actions";
import { channelHandle } from "@/lib/format";

const input =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-200 focus:border-slate-500 focus:outline-none";

const platforms = [
  {
    key: "youtubeUrl" as const,
    platform: "youtube" as const,
    name: "YouTube",
    mark: "bg-red-600",
    icon: "▶",
    publishes: "Daily episodes, weekly long-form and YouTube Shorts",
    api: "YouTube Data API",
    placeholder: "https://www.youtube.com/@handle",
  },
  {
    key: "instagramUrl" as const,
    platform: "instagram" as const,
    name: "Instagram",
    mark: "bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600",
    icon: "◎",
    publishes: "Shorts as Reels",
    api: "Instagram Graph API",
    placeholder: "https://www.instagram.com/handle",
  },
];

export type ApiStatus = {
  configured: boolean;
  missing: string;
  connection: { accountName: string; connectedAt: string } | null;
};

function ApiControls({ anchor, platform, status }: { anchor: string; platform: "youtube" | "instagram"; status: ApiStatus }) {
  const [pending, startTransition] = useTransition();
  const chip = "shrink-0 rounded-md border px-2 py-0.5 text-[11px]";

  if (status.connection) {
    return (
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={`${chip} border-emerald-500/40 bg-emerald-500/10 text-emerald-200`}>
          API connected · {status.connection.accountName}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => void (await disconnectChannel(anchor, platform)))}
          className="text-[11px] text-slate-400 hover:text-red-300 disabled:opacity-50"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (!status.configured) {
    return (
      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        <span className={`${chip} border-slate-500/40 bg-slate-500/10 text-slate-300`}>API keys not set</span>
        <span className="max-w-48 text-[11px] text-slate-500">Set {status.missing} on the server</span>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <a
        href={`/api/oauth/${platform}/start?anchor=${anchor}`}
        className="rounded-md bg-gradient-to-r from-fuchsia-500 to-orange-400 px-3 py-1 text-xs font-medium text-white hover:brightness-110"
      >
        Connect API
      </a>
      <span className="text-[11px] text-amber-200/80">Not connected</span>
    </div>
  );
}

export function ChannelsCard({
  anchor,
  youtubeUrl,
  instagramUrl,
  api,
}: {
  anchor: string;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  api: Record<"youtube" | "instagram", ApiStatus>;
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
                <ApiControls anchor={anchor} platform={p.platform} status={api[p.platform]} />
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Approved videos publish automatically to every connected channel. Channels without a connected API are
        simulated. Instagram needs a professional (Business or Creator) account.
      </p>
    </section>
  );
}
