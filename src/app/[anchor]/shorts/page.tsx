import { ReviewTable } from "@/components/review-table";
import { PageHeader } from "@/components/ui";
import { accent, anchors, publishingTargets as t, resolveAnchor, type AnchorId } from "@/lib/anchors";
import { mediaStatus } from "@/lib/pipeline";
import { AUTO_APPROVE_MINUTES, isRendering } from "@/lib/review";
import { publishDue } from "@/lib/integrations/publish";
import { list } from "@/lib/store";

export default async function ShortsPage({ params }: PageProps<"/[anchor]/shorts">) {
  const id = await resolveAnchor(params);

  return (
    <>
      <PageHeader
        eyebrow={anchors[id].name}
        tone={accent[id].tone}
        title="Shorts"
        description={`Vertical shorts for Instagram Reels and YouTube Shorts: ${t.shorts.minPerDay} a day minimum, up to ${t.shorts.maxPerDay}. Each short is generated automatically once its script is approved, and posted to Instagram and YouTube once the short is approved. Shorts not reviewed within ${AUTO_APPROVE_MINUTES} minutes are auto-approved.`}
      />
      <ShortsTable anchor={id} />
    </>
  );
}

async function ShortsTable({ anchor }: { anchor: AnchorId }) {
  await publishDue("shorts", anchor);
  const shorts = await list("shorts", anchor);

  return (
    <ReviewTable
      kind="shorts"
      anchor={anchor}
      statusHeaders={["IG status", "YT status"]}
      empty="No shorts yet. A short is generated as soon as a short script is approved."
      rows={shorts.map((s) => {
        const rendering = isRendering(s);
        return {
          ...s,
          view: rendering ? null : { label: "View video", href: `/${anchor}/shorts/${s.id}` },
          statuses: [mediaStatus(s, "Posted", undefined, "instagram"), mediaStatus(s, "Posted", undefined, "youtube")],
          generatingUntil: rendering ? s.submittedAt : undefined,
        };
      })}
    />
  );
}
