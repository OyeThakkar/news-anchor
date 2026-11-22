import { approvalOf, blockedStatus, isRendering, type Reviewable } from "./review";

// Script approved -> video generated -> video approved -> auto-published.

export function mediaStatus(media: Reviewable, published: string, now = new Date()) {
  if (isRendering(media, now)) return "Generating";
  return blockedStatus(approvalOf(media, now).state) ?? published;
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
