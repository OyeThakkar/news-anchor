import { PageHeader, Stat } from "@/components/ui";
import { anchors, resolveAnchor, type AnchorId } from "@/lib/anchors";
import { getSources } from "@/lib/store";
import { MonitoringSheet } from "./monitoring-sheet";

export default async function LibraryPage({ params }: PageProps<"/[anchor]/library">) {
  const id = await resolveAnchor(params);

  return (
    <>
      <PageHeader
        eyebrow={anchors[id].name}
        title="Library & Data Sources"
        description="Feed-monitoring sheet. A tool pulls feeds and alerts; a researcher verifies and picks stories. Each story needs one primary source, one wire report and one analysis source."
      />
      <Library anchor={id} />
    </>
  );
}

async function Library({ anchor }: { anchor: AnchorId }) {
  const rows = await getSources(anchor);
  const active = rows.filter((s) => s.active);
  const groups = [...new Set(rows.map((s) => s.group))].sort();

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Active sources" value={active.length} hint={`${rows.length - active.length} deactivated`} />
        <Stat label="Live / hourly" value={active.filter((s) => s.frequency === "Live" || s.frequency === "Hourly").length} />
        <Stat label="Researcher checks" value={active.filter((s) => s.monitor !== "Tool").length} />
        <Stat label="Tool only" value={active.filter((s) => s.monitor === "Tool").length} />
      </div>

      <MonitoringSheet anchor={anchor} rows={rows} groups={groups} />
    </>
  );
}
