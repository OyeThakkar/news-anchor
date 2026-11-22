"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resubmitItem, reviewItem, type ActionResult } from "@/lib/actions";
import type { ApprovalState, Decision } from "@/lib/review";
import type { Kind } from "@/lib/store";

const button =
  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const styles = {
  approved: `${button} border-emerald-600/60 text-emerald-300 hover:bg-emerald-500/10`,
  rejected: `${button} border-red-600/60 text-red-300 hover:bg-red-500/10`,
  rework: `${button} border-amber-600/60 text-amber-300 hover:bg-amber-500/10`,
  neutral: `${button} border-zinc-700 text-zinc-300 hover:bg-zinc-800`,
};

const stateLabels: Record<Exclude<ApprovalState, "pending">, { label: string; className: string }> = {
  approved: { label: "Approved", className: "text-emerald-300" },
  "auto-approved": { label: "Auto-approved", className: "text-emerald-300" },
  rejected: { label: "Rejected", className: "text-red-300" },
  rework: { label: "Rework requested", className: "text-amber-300" },
};

function Countdown({ deadline }: { deadline: string }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const remaining = new Date(deadline).getTime() - now;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining <= 0) router.refresh();
  }, [remaining, router]);

  const minutes = Math.max(0, Math.ceil(remaining / 60_000));
  return (
    <span className="text-xs text-zinc-500" suppressHydrationWarning>
      Auto-approves in {minutes} min
    </span>
  );
}

function Generating({ until }: { until: string }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const remaining = new Date(until).getTime() - now;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining <= 0) router.refresh();
  }, [remaining, router]);

  const minutes = Math.max(1, Math.ceil(remaining / 60_000));
  return (
    <span className="text-xs text-violet-300" suppressHydrationWarning>
      Generating video… ready in ~{minutes} min
    </span>
  );
}

export function ReviewControls({
  kind,
  anchor,
  id,
  state,
  deadline,
  decidedAt,
  note,
  generatingUntil,
}: {
  kind: Kind;
  anchor: string;
  id: string;
  state: ApprovalState;
  deadline: string;
  decidedAt?: string;
  note?: string;
  generatingUntil?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<Exclude<Decision, "approved"> | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error);
      else {
        setConfirming(null);
        setDraftNote("");
      }
    });
  }

  if (generatingUntil) return <Generating until={generatingUntil} />;

  if (state !== "pending") {
    const { label, className } = stateLabels[state];
    return (
      <div className="flex flex-col items-start gap-1">
        <span className={`text-xs font-medium ${className}`}>
          {label}
          {decidedAt && <span className="font-normal text-zinc-500"> · {decidedAt}</span>}
        </span>
        {note && <span className="max-w-56 text-xs text-zinc-400">&ldquo;{note}&rdquo;</span>}
        {state === "rework" && (
          <button
            type="button"
            className={styles.neutral}
            disabled={pending}
            onClick={() => run(() => resubmitItem(kind, anchor, id))}
          >
            {kind === "scripts" ? "Resubmit for review" : "Regenerate video"}
          </button>
        )}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-start gap-1.5">
        <input
          autoFocus
          value={draftNote}
          onChange={(e) => setDraftNote(e.target.value)}
          placeholder={confirming === "rework" ? "What needs to change?" : "Reason (optional)"}
          aria-label="Review note"
          className="w-56 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
        />
        <div className="flex gap-1.5">
          <button
            type="button"
            className={styles[confirming]}
            disabled={pending || (confirming === "rework" && !draftNote.trim())}
            onClick={() => run(() => reviewItem(kind, anchor, id, confirming, draftNote))}
          >
            Confirm {confirming === "rework" ? "rework" : "reject"}
          </button>
          <button type="button" className={styles.neutral} disabled={pending} onClick={() => setConfirming(null)}>
            Cancel
          </button>
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex gap-1.5">
        <button
          type="button"
          className={styles.approved}
          disabled={pending}
          onClick={() => run(() => reviewItem(kind, anchor, id, "approved"))}
        >
          Approve
        </button>
        <button type="button" className={styles.rejected} disabled={pending} onClick={() => setConfirming("rejected")}>
          Reject
        </button>
        <button type="button" className={styles.rework} disabled={pending} onClick={() => setConfirming("rework")}>
          Rework
        </button>
      </div>
      <Countdown deadline={deadline} />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
