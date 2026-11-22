import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import { anchorIds, type AnchorId } from "./anchors";
import { approvalOf, isApproved, RENDER_MS, type Review } from "./review";
import { demoScripts } from "./demo-scripts";
import { episodeSegments, totalSeconds, type SegmentTemplate } from "./scripts";
import { defaultSources, type Source } from "./sources";

export type Kind = "scripts" | "videos" | "shorts";
export const kinds: Kind[] = ["scripts", "videos", "shorts"];

type BaseRecord = {
  id: string;
  anchor: AnchorId;
  serial: number;
  date: string;
  topic: string;
  durationSec: number;
  submittedAt: string;
  review: Review;
};

export type ScriptSegment = SegmentTemplate & { line: string };

export type ScriptRecord = BaseRecord & {
  format: "Episode" | "Weekly" | "Short";
  segments: ScriptSegment[];
  storyTitle?: string;
  factBox?: string[];
  sources?: { label: string; url: string }[];
};

// Videos and shorts are generated from approved scripts. `submittedAt` is when generation
// finishes and the 60-minute review window opens; approval publishes them.
export type VideoRecord = BaseRecord & {
  scriptId: string;
  format: "Episode" | "Weekly";
};

export type ShortRecord = BaseRecord & {
  scriptId: string;
};

export type SourceRecord = Source & { id: string; active: boolean; addedAt?: string };

// Where each anchor publishes. API connection (OAuth) is not built yet, so publishing is simulated.
export type ChannelRecord = {
  anchor: AnchorId;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  updatedAt?: string;
};

type Collection = Kind | "sources" | "channels";
type RecordOf = {
  scripts: ScriptRecord;
  videos: VideoRecord;
  shorts: ShortRecord;
  sources: SourceRecord;
  channels: ChannelRecord;
};

export function sourceId(source: Pick<Source, "owner" | "name">) {
  return `${source.owner}-${source.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function istDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
}

const seeds: { [K in Collection]: (now: Date) => RecordOf[K][] } = {
  sources: () => defaultSources.map((s) => ({ ...s, id: sourceId(s), active: true })),
  scripts: (now) => {
    const demo = demoScripts(now, istDate(now));
    if (demo.length > 0) return demo;
    return anchorIds.map((anchor) => ({
      id: `${anchor}-1`,
      anchor,
      serial: 1,
      date: istDate(now),
      topic: "Episode 1: pick a story from the monitoring sheet",
      format: "Episode",
      durationSec: totalSeconds(episodeSegments),
      segments: episodeSegments.map(({ lines, ...s }) => ({ ...s, line: lines[anchor] })),
      submittedAt: now.toISOString(),
      review: null,
    }));
  },
  videos: () => [],
  shorts: () => [],
  channels: () => anchorIds.map((anchor) => ({ anchor, youtubeUrl: null, instagramUrl: null })),
};

const fileFor = (kind: Collection) => path.join(process.cwd(), "data", `${kind}.json`);

async function load<K extends Collection>(kind: K): Promise<RecordOf[K][]> {
  try {
    return JSON.parse(await readFile(fileFor(kind), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const records = seeds[kind](new Date());
    await save(kind, records);
    return records;
  }
}

async function save<K extends Collection>(kind: K, records: RecordOf[K][]) {
  await mkdir(path.dirname(fileFor(kind)), { recursive: true });
  await writeFile(fileFor(kind), JSON.stringify(records, null, 2));
}

let queue: Promise<unknown> = Promise.resolve();

// Serialise read-modify-write cycles so concurrent actions don't overwrite each other.
export function update<K extends Collection, T>(kind: K, fn: (records: RecordOf[K][]) => T): Promise<T> {
  const run = queue.then(async () => {
    const records = await load(kind);
    const result = fn(records);
    await save(kind, records);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

// Create the video or short for every approved script that doesn't have one yet. Runs on read,
// so auto-approved scripts get their media without a background job.
async function syncMedia(now = new Date()) {
  const scripts = await load("scripts");
  const approved = scripts
    .map((script) => ({ script, approval: approvalOf(script, now) }))
    .filter(({ approval }) => isApproved(approval.state))
    .sort((a, b) => a.approval.at!.getTime() - b.approval.at!.getTime() || a.script.serial - b.script.serial);

  for (const kind of ["videos", "shorts"] as const) {
    const wanted = approved.filter(({ script }) => (script.format === "Short") === (kind === "shorts"));
    const existing = new Set((await load(kind)).map((r) => r.scriptId));
    if (wanted.every(({ script }) => existing.has(script.id))) continue;

    await update(kind, (records) => {
      const have = new Set(records.map((r) => r.scriptId));
      for (const { script, approval } of wanted) {
        if (have.has(script.id)) continue;
        const serial = Math.max(0, ...records.filter((r) => r.anchor === script.anchor).map((r) => r.serial)) + 1;
        const base = {
          id: `${kind === "videos" ? "v" : "sh"}-${script.id}`,
          anchor: script.anchor,
          serial,
          date: script.date,
          topic: script.topic,
          durationSec: script.durationSec,
          scriptId: script.id,
          submittedAt: new Date(approval.at!.getTime() + RENDER_MS).toISOString(),
          review: null,
        };
        if (kind === "videos") {
          (records as VideoRecord[]).push({ ...base, format: script.format === "Weekly" ? "Weekly" : "Episode" });
        } else {
          (records as ShortRecord[]).push(base);
        }
      }
    });
  }
}

export async function list<K extends Kind>(kind: K, anchor: AnchorId): Promise<RecordOf[K][]> {
  await connection();
  if (kind !== "scripts") await syncMedia();
  const records = await load(kind);
  return records
    .filter((r) => r.anchor === anchor)
    .sort((a, b) => b.date.localeCompare(a.date) || b.serial - a.serial);
}

// All sources, or the ones an anchor monitors (their own plus the shared layer).
export async function getChannels(anchor: AnchorId): Promise<ChannelRecord> {
  await connection();
  const records = await load("channels");
  return records.find((c) => c.anchor === anchor) ?? { anchor, youtubeUrl: null, instagramUrl: null };
}

export async function getSources(anchor?: AnchorId) {
  await connection();
  const records = await load("sources");
  return anchor ? records.filter((s) => s.owner === anchor || s.owner === "shared") : records;
}

export async function get<K extends Kind>(kind: K, anchor: AnchorId, id: string) {
  return (await list(kind, anchor)).find((r) => r.id === id);
}

const kindPrefix: Record<Kind, string> = { scripts: "", videos: "V", shorts: "SH" };

export function serialLabel(kind: Kind, record: Pick<BaseRecord, "anchor" | "serial">) {
  return `${record.anchor === "reema" ? "R" : "S"}-${kindPrefix[kind]}${String(record.serial).padStart(3, "0")}`;
}
