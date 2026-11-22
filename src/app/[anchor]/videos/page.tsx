import { AddMediaForm } from "@/components/add-media-form";
import { ReviewTable } from "@/components/review-table";
import { PageHeader } from "@/components/ui";
import { anchors, publishingTargets as t, resolveAnchor, type AnchorId } from "@/lib/anchors";
import { AUTO_APPROVE_MINUTES, approvalOf, blockedStatus } from "@/lib/review";
import { list } from "@/lib/store";

export default async function VideosPage({ params }: PageProps<"/[anchor]/videos">) {
  const id = await resolveAnchor(params);

  return (
    <>
      <PageHeader
        eyebrow={anchors[id].name}
        title="Videos"
        description={`Long-form YouTube videos: ${t.episode.perDay} daily episode (${t.episode.minMinutes}-${t.episode.maxMinutes} min) and ${t.weekly.perWeek} weekly episode (${t.weekly.minMinutes}-${t.weekly.maxMinutes} min). Videos not reviewed within ${AUTO_APPROVE_MINUTES} minutes are auto-approved for publication.`}
      />
      <AddMediaForm kind="videos" anchor={id} />
      <VideosTable anchor={id} />
    </>
  );
}

async function VideosTable({ anchor }: { anchor: AnchorId }) {
  const videos = await list("videos", anchor);

  return (
    <ReviewTable
      kind="videos"
      anchor={anchor}
      statusHeaders={["Video status"]}
      empty="No videos yet."
      rows={videos.map((v) => ({
        ...v,
        subtitle: v.format === "Weekly" ? "Weekly long-form" : "Daily episode",
        view: { label: "View video", href: v.videoUrl, external: true },
        statuses: [
          blockedStatus(approvalOf(v).state) ?? (v.youtube === "Published" ? "Published" : "Ready to publish"),
        ],
      }))}
    />
  );
}
