import { PageHeader, Stat } from "@/components/ui";
import { anchors, resolveAnchor } from "@/lib/anchors";
import { sourcesFor } from "@/lib/sources";
import { MonitoringSheet } from "./monitoring-sheet";

export default async function LibraryPage({ params }: PageProps<"/[anchor]/library">) {
  const id = await resolveAnchor(params);
  const rows = sourcesFor(id);

  return (
    <>
      <PageHeader
        eyebrow={anchors[id].name}
        title="Library & Data Sources"
        description="Feed-monitoring sheet. A tool pulls feeds and alerts; a researcher verifies and picks stories. Each story needs one primary source, one wire report and one analysis source."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Sources" value={rows.length} />
        <Stat label="Live / hourly" value={rows.filter((s) => s.frequency === "Live" || s.frequency === "Hourly").length} />
        <Stat label="Researcher checks" value={rows.filter((s) => s.monitor !== "Tool").length} />
        <Stat label="Tool only" value={rows.filter((s) => s.monitor === "Tool").length} />
      </div>

      <MonitoringSheet anchor={id} rows={rows} />
    </>
  );
}
