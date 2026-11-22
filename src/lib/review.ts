export const AUTO_APPROVE_MINUTES = 60;
const AUTO_APPROVE_MS = AUTO_APPROVE_MINUTES * 60 * 1000;

export type Decision = "approved" | "rejected" | "rework";
export type ApprovalState = "pending" | "approved" | "auto-approved" | "rejected" | "rework";
export type Review = { decision: Decision; at: string; note?: string } | null;

export type Reviewable = { submittedAt: string; review: Review };

export function deadlineOf(item: Reviewable) {
  return new Date(new Date(item.submittedAt).getTime() + AUTO_APPROVE_MS);
}

// Auto-approval is derived from the submission time, so it applies without a background job.
export function approvalOf(item: Reviewable, now = new Date()): { state: ApprovalState; at?: Date } {
  if (item.review) return { state: item.review.decision, at: new Date(item.review.at) };
  const deadline = deadlineOf(item);
  if (now >= deadline) return { state: "auto-approved", at: deadline };
  return { state: "pending" };
}

export function isApproved(state: ApprovalState) {
  return state === "approved" || state === "auto-approved";
}

// Status shown while an item is not cleared for publication; null once approved.
export function blockedStatus(state: ApprovalState) {
  switch (state) {
    case "pending":
      return "Awaiting approval";
    case "rework":
      return "On hold for rework";
    case "rejected":
      return "Cancelled";
    default:
      return null;
  }
}
