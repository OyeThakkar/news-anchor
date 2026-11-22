import { Suspense } from "react";
import { AddMediaForm } from "@/components/add-media-form";
import { ReviewTable } from "@/components/review-table";
import { PageHeader } from "@/components/ui";
import { anchors, publishingTargets as t, resolveAnchor, type AnchorId } from "@/lib/anchors";
import { AUTO_APPROVE_MINUTES, approvalOf, blockedStatus } from "@/lib/review";
import { list, type PlatformStatus } from "@/lib/store";

function platformStatus(blocked: string | null, status: PlatformStatus) {
  if (blocked) return blocked;
  return status === "Not posted" ? "Ready to post" : status;
}

export default async function ShortsPage({ params }: PageProps<"/[anchor]/shorts">) {
  const id = await resolveAnchor(params);

  return (
    <>
      <PageHeader
        eyebrow={anchors[id].name}
        title="Shorts"
        description={`Vertical shorts for Instagram Reels and YouTube Shorts: ${t.shorts.minPerDay} a day minimum, up to ${t.shorts.maxPerDay}. Shorts not reviewed within ${AUTO_APPROVE_MINUTES} minutes are auto-approved for publication.`}
      />
      <AddMediaForm kind="shorts" anchor={id} />
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading shorts…</p>}>
        <ShortsTable anchor={id} />
      </Suspense>
    </>
  );
}

async function ShortsTable({ anchor }: { anchor: AnchorId }) {
  const shorts = await list("shorts", anchor);

  return (
    <ReviewTable
      kind="shorts"
      anchor={anchor}
      statusHeaders={["IG status", "YT status"]}
      empty="No shorts yet."
      rows={shorts.map((s) => {
        const blocked = blockedStatus(approvalOf(s).state);
        return {
          ...s,
          view: { label: "View video", href: s.videoUrl, external: true },
          statuses: [platformStatus(blocked, s.instagram), platformStatus(blocked, s.youtube)],
        };
      })}
    />
  );
}
