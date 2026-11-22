import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import { anchorIds, type AnchorId } from "./anchors";
import type { Review } from "./review";
import { episodeSegments, totalSeconds, type Segment } from "./scripts";
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

export type ScriptSegment = Omit<Segment, "lines"> & { line: string };

export type ScriptRecord = BaseRecord & {
  format: "Episode" | "Weekly" | "Short";
  segments: ScriptSegment[];
};

export type PublishStatus = "Not published" | "Published";
export type PlatformStatus = "Not posted" | "Posted" | "Failed";

export type VideoRecord = BaseRecord & {
  format: "Episode" | "Weekly";
  videoUrl: string;
  youtube: PublishStatus;
};

export type ShortRecord = BaseRecord & {
  videoUrl: string;
  instagram: PlatformStatus;
  youtube: PlatformStatus;
};

export type SourceRecord = Source & { id: string; active: boolean; addedAt?: string };

type Collection = Kind | "sources";
type RecordOf = { scripts: ScriptRecord; videos: VideoRecord; shorts: ShortRecord; sources: SourceRecord };

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
  scripts: (now) =>
    anchorIds.map((anchor) => ({
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
    })),
  videos: () => [],
  shorts: () => [],
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

export async function list<K extends Kind>(kind: K, anchor: AnchorId): Promise<RecordOf[K][]> {
  await connection();
  const records = await load(kind);
  return records
    .filter((r) => r.anchor === anchor)
    .sort((a, b) => b.date.localeCompare(a.date) || b.serial - a.serial);
}

// All sources, or the ones an anchor monitors (their own plus the shared layer).
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
