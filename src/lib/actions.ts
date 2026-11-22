"use server";

import { refresh } from "next/cache";
import { isAnchorId } from "./anchors";
import { approvalOf, isRendering, RENDER_MS, type Decision } from "./review";
import { frequencies, monitors, outputFormats, tiers, type OutputFormat } from "./sources";
import { kinds, sourceId, update, type Kind } from "./store";

export type ActionResult = { ok: true } | { ok: false; error: string };

const decisions: Decision[] = ["approved", "rejected", "rework"];

function isKind(value: string): value is Kind {
  return (kinds as string[]).includes(value);
}

export async function reviewItem(kind: string, anchor: string, id: string, decision: Decision, note?: string): Promise<ActionResult> {
  if (!isKind(kind) || !isAnchorId(anchor) || !decisions.includes(decision)) return { ok: false, error: "Invalid request." };
  if (decision === "rework" && !note?.trim()) return { ok: false, error: "Say what needs to change." };

  const result = await update(kind, (records): ActionResult => {
    const record = records.find((r) => r.id === id && r.anchor === anchor);
    if (!record) return { ok: false, error: "Not found." };

    if (isRendering(record)) return { ok: false, error: "The video is still generating." };
    const { state } = approvalOf(record);
    if (state === "auto-approved") return { ok: false, error: "Already auto-approved." };
    if (state !== "pending") return { ok: false, error: "Already reviewed." };

    record.review = { decision, at: new Date().toISOString(), note: note?.trim() || undefined };
    return { ok: true };
  });

  refresh();
  return result;
}

export async function resubmitItem(kind: string, anchor: string, id: string): Promise<ActionResult> {
  if (!isKind(kind) || !isAnchorId(anchor)) return { ok: false, error: "Invalid request." };

  const result = await update(kind, (records): ActionResult => {
    const record = records.find((r) => r.id === id && r.anchor === anchor);
    if (!record) return { ok: false, error: "Not found." };
    if (record.review?.decision !== "rework") return { ok: false, error: "Only items sent for rework can be resubmitted." };

    // Resubmitting restarts the approval window; videos and shorts are regenerated first.
    const restart = kind === "scripts" ? Date.now() : Date.now() + RENDER_MS;
    record.submittedAt = new Date(restart).toISOString();
    record.review = null;
    return { ok: true };
  });

  refresh();
  return result;
}

export type AddState = { error?: string; ok?: boolean };

function parseUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function oneOf<T extends string>(options: readonly T[], value: FormDataEntryValue | null): T | null {
  return options.includes(value as T) ? (value as T) : null;
}

export async function addSource(anchor: string, _prev: AddState, form: FormData): Promise<AddState> {
  if (!isAnchorId(anchor)) return { error: "Invalid request." };

  const name = String(form.get("name") ?? "").trim();
  const url = parseUrl(String(form.get("url") ?? ""));
  const owner = form.get("owner") === "shared" ? "shared" : anchor;
  const group = String(form.get("group") ?? "").trim();
  const beat = String(form.get("beat") ?? "").trim();
  const note = String(form.get("note") ?? "").trim() || undefined;
  const tier = oneOf(tiers, form.get("tier"));
  const frequency = oneOf(frequencies, form.get("frequency"));
  const monitor = oneOf(monitors, form.get("monitor"));
  const formats = form.getAll("formats").filter((f): f is OutputFormat => outputFormats.includes(f as OutputFormat));

  if (!name) return { error: "Add a source name." };
  if (!url) return { error: "Add a valid link (http or https)." };
  if (!group) return { error: "Add a category." };
  if (!beat) return { error: "Add a beat." };
  if (!tier || !frequency || !monitor) return { error: "Pick a tier, check frequency and monitor." };
  if (formats.length === 0) return { error: "Pick at least one format." };

  const id = sourceId({ owner, name });
  const result = await update("sources", (records): AddState => {
    if (records.some((r) => r.id === id)) return { error: `${name} is already in this library.` };
    records.push({
      id,
      name,
      url,
      owner,
      group,
      tier,
      beat,
      formats,
      frequency,
      monitor,
      note,
      active: true,
      addedAt: new Date().toISOString(),
    });
    return { ok: true };
  });

  refresh();
  return result;
}

export async function setSourceActive(anchor: string, id: string, active: boolean): Promise<ActionResult> {
  if (!isAnchorId(anchor)) return { ok: false, error: "Invalid request." };

  const result = await update("sources", (records): ActionResult => {
    const source = records.find((r) => r.id === id && (r.owner === anchor || r.owner === "shared"));
    if (!source) return { ok: false, error: "Source not found." };
    source.active = active;
    return { ok: true };
  });

  refresh();
  return result;
}
