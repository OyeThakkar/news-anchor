import { readFile } from "node:fs/promises";
import path from "node:path";
import { after } from "next/server";
import type { AnchorId } from "../anchors";
import { approvalOf, isApproved } from "../review";
import { findById, getConnections, list, update, type Platform, type Publication } from "../store";
import { instagramAccessToken, instagramPublishReel } from "./instagram";
import { youtubeAccessToken, youtubeUpload } from "./youtube";

type MediaKind = "videos" | "shorts";

// Failed or waiting publishes are retried after this long (a file may have arrived, or a token been fixed).
const RETRY_MS = 10 * 60 * 1000;

export const targets: Record<MediaKind, Platform[]> = {
  videos: ["youtube"],
  shorts: ["instagram", "youtube"],
};

async function setPublication(kind: MediaKind, id: string, platform: Platform, publication: Publication) {
  await update(kind, (records) => {
    const record = records.find((r) => r.id === id);
    if (record) record.publications = { ...record.publications, [platform]: publication };
  });
}

// Claims the publish slot atomically so concurrent requests don't publish twice.
async function claim(kind: MediaKind, id: string, platform: Platform) {
  return update(kind, (records) => {
    const record = records.find((r) => r.id === id);
    const current = record?.publications?.[platform]?.status;
    if (!record || current === "publishing" || current === "published") return false;
    record.publications = { ...record.publications, [platform]: { status: "publishing", at: new Date().toISOString() } };
    return true;
  });
}

async function saveToken(anchor: AnchorId, platform: Platform, token: { accessToken: string; expiresAt?: string }) {
  await update("connections", (records) => {
    const record = records.find((r) => r.anchor === anchor && r.platform === platform);
    if (record) Object.assign(record, token);
  });
}

async function videoBytes(fileUrl: string) {
  if (fileUrl.startsWith("/")) return new Uint8Array(await readFile(path.join(process.cwd(), "public", fileUrl)));
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error(`Could not download the video file (${res.status}).`);
  return new Uint8Array(await res.arrayBuffer());
}

function publicVideoUrl(fileUrl: string) {
  const url = fileUrl.startsWith("/") && process.env.APP_URL ? new URL(fileUrl, process.env.APP_URL) : new URL(fileUrl);
  if (url.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(url.hostname)) {
    throw new Error("Instagram needs the video at a public https URL (set APP_URL to the public site address).");
  }
  return url.toString();
}

export async function publishMedia(kind: MediaKind, anchor: AnchorId, id: string, platform: Platform) {
  if (!(await claim(kind, id, platform))) return;
  const now = () => new Date().toISOString();

  try {
    const media = await findById(kind, id);
    const script = media && (await findById("scripts", media.scriptId));
    const connection = (await getConnections(anchor)).find((c) => c.platform === platform);
    if (!media || !script || !connection) throw new Error("Nothing to publish.");

    if (!media.fileUrl) {
      await setPublication(kind, id, platform, { status: "waiting", at: now(), error: "No rendered video file yet." });
      return;
    }

    const sources = (script.sources ?? []).map((s) => `- ${s.label}: ${s.url}`).join("\n");
    const description = [
      script.topic,
      ...(script.factBox ?? []).map((f, i) => `${i + 1}. ${f}`),
      sources && `Sources:\n${sources}`,
      "The Late Edit. Presented by an AI anchor; facts are sourced and shown on screen.",
    ]
      .filter(Boolean)
      .join("\n\n");

    if (platform === "youtube") {
      const token = await youtubeAccessToken(connection);
      if (token.expiresAt) await saveToken(anchor, platform, token);
      const result = await youtubeUpload(token.accessToken, {
        bytes: await videoBytes(media.fileUrl),
        title: media.topic,
        description,
        isShort: kind === "shorts",
      });
      await setPublication(kind, id, platform, { status: "published", at: now(), url: result.url });
    } else {
      const token = await instagramAccessToken(connection);
      if (token.expiresAt) await saveToken(anchor, platform, token);
      const result = await instagramPublishReel(token.accessToken, connection.accountId, {
        videoUrl: publicVideoUrl(media.fileUrl),
        caption: `${media.topic}\n\n${(script.factBox ?? []).join("\n")}\n\n#TheLateEdit #News #AIAnchor`,
      });
      await setPublication(kind, id, platform, { status: "published", at: now(), url: result.url });
    }
  } catch (error) {
    await setPublication(kind, id, platform, {
      status: "failed",
      at: now(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Publish approved media (including auto-approved) to every connected channel it hasn't gone to yet.
// Runs after the response is sent, so pages stay fast.
export async function publishDue(kind: MediaKind, anchor: AnchorId) {
  const connected = new Set((await getConnections(anchor)).map((c) => c.platform));
  if (connected.size === 0) return;

  for (const media of await list(kind, anchor)) {
    if (!isApproved(approvalOf(media).state)) continue;
    for (const platform of targets[kind]) {
      const previous = media.publications?.[platform];
      const retry =
        previous &&
        (previous.status === "failed" || previous.status === "waiting") &&
        Date.now() - new Date(previous.at).getTime() > RETRY_MS;
      if (connected.has(platform) && (!previous || retry)) {
        after(() => publishMedia(kind, anchor, media.id, platform));
      }
    }
  }
}

// After (re)connecting an account, let failed or waiting publishes for that channel run again straight away.
export async function resetRetryable(anchor: AnchorId, platform: Platform) {
  for (const kind of ["videos", "shorts"] as const) {
    await update(kind, (records) => {
      for (const record of records) {
        const status = record.publications?.[platform]?.status;
        if (record.anchor === anchor && (status === "failed" || status === "waiting")) {
          delete record.publications![platform];
        }
      }
    });
  }
}
