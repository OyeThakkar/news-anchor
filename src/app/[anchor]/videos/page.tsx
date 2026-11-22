import { ReviewTable } from "@/components/review-table";
import { PageHeader } from "@/components/ui";
import { anchors, publishingTargets as t, resolveAnchor, type AnchorId } from "@/lib/anchors";
import { mediaStatus } from "@/lib/pipeline";
import { AUTO_APPROVE_MINUTES, isRendering } from "@/lib/review";
import { list } from "@/lib/store";

export default async function VideosPage({ params }: PageProps<"/[anchor]/videos">) {
  const id = await resolveAnchor(params);

  return (
    <>
      <PageHeader
        eyebrow={anchors[id].name}
        title="Videos"
        description={`Long-form YouTube videos: ${t.episode.perDay} daily episode (${t.episode.minMinutes}-${t.episode.maxMinutes} min) and ${t.weekly.perWeek} weekly episode (${t.weekly.minMinutes}-${t.weekly.maxMinutes} min). Each video is generated automatically once its script is approved, and published to YouTube once the video is approved. Videos not reviewed within ${AUTO_APPROVE_MINUTES} minutes are auto-approved.`}
      />
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
      empty="No videos yet. A video is generated as soon as an episode script is approved."
      rows={videos.map((v) => {
        const rendering = isRendering(v);
        return {
          ...v,
          subtitle: v.format === "Weekly" ? "Weekly long-form" : "Daily episode",
          view: rendering ? null : { label: "View video", href: `/${anchor}/videos/${v.id}` },
          statuses: [mediaStatus(v, "Published")],
          generatingUntil: rendering ? v.submittedAt : undefined,
        };
      })}
    />
  );
}
