"use server";

import { randomUUID } from "node:crypto";
import { refresh } from "next/cache";
import { isAnchorId } from "./anchors";
import { approvalOf, type Decision } from "./review";
import { istDate, kinds, update, type Kind, type ShortRecord, type VideoRecord } from "./store";

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

    // Resubmitting restarts the approval window.
    record.submittedAt = new Date().toISOString();
    record.review = null;
    return { ok: true };
  });

  refresh();
  return result;
}

export type AddState = { error?: string; ok?: boolean };

function parseDuration(value: string) {
  const match = /^(\d{1,3}):([0-5]\d)$/.exec(value.trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

function parseUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function addMedia(kind: "videos" | "shorts", anchor: string, _prev: AddState, form: FormData): Promise<AddState> {
  if ((kind !== "videos" && kind !== "shorts") || !isAnchorId(anchor)) return { error: "Invalid request." };

  const topic = String(form.get("topic") ?? "").trim();
  const durationSec = parseDuration(String(form.get("duration") ?? ""));
  const videoUrl = parseUrl(String(form.get("videoUrl") ?? ""));
  const format = form.get("format") === "Weekly" ? "Weekly" : "Episode";

  if (!topic) return { error: "Add a topic." };
  if (!durationSec) return { error: "Duration must be in m:ss, e.g. 8:45." };
  if (kind === "shorts" && durationSec > 180) return { error: "Shorts must be 3:00 or shorter." };
  if (!videoUrl) return { error: "Add a valid video link (http or https)." };

  const now = new Date();
  await update(kind, (records) => {
    const serial = Math.max(0, ...records.filter((r) => r.anchor === anchor).map((r) => r.serial)) + 1;
    const base = {
      id: randomUUID(),
      anchor,
      serial,
      date: istDate(now),
      topic,
      durationSec,
      videoUrl,
      submittedAt: now.toISOString(),
      review: null,
    };
    if (kind === "videos") {
      (records as VideoRecord[]).push({ ...base, format, youtube: "Not published" });
    } else {
      (records as ShortRecord[]).push({ ...base, instagram: "Not posted", youtube: "Not posted" });
    }
  });

  refresh();
  return { ok: true };
}
