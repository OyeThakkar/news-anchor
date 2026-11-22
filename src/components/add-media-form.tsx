"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addMedia, type AddState } from "@/lib/actions";

const input =
  "rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none";

export function AddMediaForm({ kind, anchor }: { kind: "videos" | "shorts"; anchor: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AddState, FormData>(addMedia.bind(null, kind, anchor), {});
  const formRef = useRef<HTMLFormElement>(null);
  const noun = kind === "videos" ? "video" : "short";

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
      >
        + Add {noun}
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Topic
          <input name="topic" required className={`${input} w-72`} />
        </label>
        {kind === "videos" && (
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Format
            <select name="format" className={input} defaultValue="Episode">
              <option value="Episode">Daily episode</option>
              <option value="Weekly">Weekly long-form</option>
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Duration (m:ss)
          <input
            name="duration"
            required
            placeholder={kind === "videos" ? "8:45" : "1:15"}
            pattern="\d{1,3}:[0-5]\d"
            className={`${input} w-24 font-mono`}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Video link
          <input name="videoUrl" type="url" required placeholder="https://" className={`${input} w-72`} />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
        >
          Submit for review
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-2 py-1.5 text-sm text-zinc-400 hover:text-zinc-200">
          Close
        </button>
      </div>
      {state.error && <p className="mt-2 text-xs text-red-400">{state.error}</p>}
      {state.ok && <p className="mt-2 text-xs text-emerald-400">Submitted. The 60-minute review window has started.</p>}
    </form>
  );
}
