import { approvalOf, blockedStatus, isRendering, type Reviewable } from "./review";
import type { Platform, Publication } from "./store";

// Script approved -> video generated -> video approved -> auto-published.

type Media = Reviewable & { publications?: Partial<Record<Platform, Publication>> };

const publicationLabel: Record<Publication["status"], string> = {
  publishing: "Publishing",
  published: "",
  waiting: "Awaiting video file",
  failed: "Publish failed",
};

// With a platform, reports that channel; without, the worst state across channels.
export function mediaStatus(media: Media, published: string, now = new Date(), platform?: Platform) {
  if (isRendering(media, now)) return "Generating";
  const blocked = blockedStatus(approvalOf(media, now).state);
  if (blocked) return blocked;
  const results = platform
    ? [media.publications?.[platform]].filter((p): p is Publication => !!p)
    : Object.values(media.publications ?? {}).filter((p): p is Publication => !!p);
  for (const status of ["failed", "waiting", "publishing"] as const) {
    if (results.some((r) => r.status === status)) return publicationLabel[status];
  }
  return published;
}

// What the Scripts page shows in "Video status": the script's own gate, then the video's progress.
export function scriptVideoStatus(script: Reviewable, media: Reviewable | undefined, now = new Date()) {
  const blocked = blockedStatus(approvalOf(script, now).state);
  if (blocked) return blocked;
  if (!media || isRendering(media, now)) return "Generating video";
  switch (approvalOf(media, now).state) {
    case "pending":
      return "Video awaiting approval";
    case "rework":
      return "Video on hold for rework";
    case "rejected":
      return "Video cancelled";
    default:
      return "Published";
  }
}
