import { PageHeader } from "@/components/ui";
import { ReviewTable } from "@/components/review-table";
import { anchors, resolveAnchor, type AnchorId } from "@/lib/anchors";
import { scriptVideoStatus } from "@/lib/pipeline";
import { AUTO_APPROVE_MINUTES } from "@/lib/review";
import { list } from "@/lib/store";

export default async function ScriptsPage({ params }: PageProps<"/[anchor]/scripts">) {
  const id = await resolveAnchor(params);

  return (
    <>
      <PageHeader
        eyebrow={anchors[id].name}
        title="Scripts"
        description={`Review each script before it goes to video. Approved scripts are turned into videos and shorts automatically. Scripts not reviewed within ${AUTO_APPROVE_MINUTES} minutes are auto-approved.`}
      />
      <ScriptsTable anchor={id} />
    </>
  );
}

async function ScriptsTable({ anchor }: { anchor: AnchorId }) {
  // Loading videos and shorts first also generates media for any newly approved scripts.
  const [videos, shorts] = await Promise.all([list("videos", anchor), list("shorts", anchor)]);
  const scripts = await list("scripts", anchor);
  const media = new Map([...videos, ...shorts].map((m) => [m.scriptId, m]));

  return (
    <ReviewTable
      kind="scripts"
      anchor={anchor}
      statusHeaders={["Video status"]}
      empty="No scripts yet."
      rows={scripts.map((s) => ({
        ...s,
        subtitle: s.storyTitle ? `${s.format} · ${s.storyTitle}` : s.format,
        view: { label: "View script", href: `/${anchor}/scripts/${s.id}` },
        statuses: [scriptVideoStatus(s, media.get(s.id))],
      }))}
    />
  );
}
