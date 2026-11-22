import { PageHeader } from "@/components/ui";
import { ReviewTable } from "@/components/review-table";
import { anchors, resolveAnchor, type AnchorId } from "@/lib/anchors";
import { AUTO_APPROVE_MINUTES, approvalOf, blockedStatus } from "@/lib/review";
import { list } from "@/lib/store";

export default async function ScriptsPage({ params }: PageProps<"/[anchor]/scripts">) {
  const id = await resolveAnchor(params);

  return (
    <>
      <PageHeader
        eyebrow={anchors[id].name}
        title="Scripts"
        description={`Review each script before it goes to video. Scripts not reviewed within ${AUTO_APPROVE_MINUTES} minutes are auto-approved for video production.`}
      />
      <ScriptsTable anchor={id} />
    </>
  );
}

async function ScriptsTable({ anchor }: { anchor: AnchorId }) {
  const scripts = await list("scripts", anchor);

  return (
    <ReviewTable
      kind="scripts"
      anchor={anchor}
      statusHeaders={["Video status"]}
      empty="No scripts yet."
      rows={scripts.map((s) => ({
        ...s,
        subtitle: s.format,
        view: { label: "View script", href: `/${anchor}/scripts/${s.id}` },
        statuses: [blockedStatus(approvalOf(s).state) ?? "Cleared for video"],
      }))}
    />
  );
}
