import { Badge, Card, PageHeader } from "@/components/ui";
import { anchors, publishingTargets as t, resolveAnchor } from "@/lib/anchors";
import { firstEpisode, formatTime, withStartTimes } from "@/lib/scripts";

const slots = [
  {
    format: "Daily episode",
    count: `${t.episode.perDay} / day`,
    length: `${t.episode.minMinutes}-${t.episode.maxMinutes} min`,
    platforms: ["YouTube"],
    note: "Deep coverage: what is happening, how did we get here, what we can do next.",
  },
  {
    format: "Shorts",
    count: `${t.shorts.minPerDay}-${t.shorts.maxPerDay} / day`,
    length: "60-90 sec, vertical",
    platforms: ["YouTube Shorts", "Instagram Reels"],
    note: `${t.shorts.minPerDay} is the daily minimum; go up to ${t.shorts.maxPerDay} on heavy news days.`,
  },
  {
    format: "Weekly long-form",
    count: `${t.weekly.perWeek} / week`,
    length: `${t.weekly.minMinutes}-${t.weekly.maxMinutes} min`,
    platforms: ["YouTube"],
    note: "The week's biggest story, with a fact-check pass across the week's episodes.",
  },
];

export default async function VideosPage({ params }: PageProps<"/[anchor]/videos">) {
  const id = await resolveAnchor(params);
  const cuts = withStartTimes(firstEpisode.segments).filter((s) => s.shortsCut);

  return (
    <>
      <PageHeader
        eyebrow={anchors[id].name}
        title="Videos"
        description="Publishing slots and output targets. Videos will appear here once production starts."
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {slots.map((slot) => (
          <Card key={slot.format}>
            <p className="text-xs uppercase tracking-wider text-zinc-500">{slot.format}</p>
            <p className="mt-2 text-xl font-semibold text-zinc-100">{slot.count}</p>
            <p className="text-sm text-zinc-400">{slot.length}</p>
            <p className="mt-3 text-sm text-zinc-400">{slot.note}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {slot.platforms.map((p) => (
                <Badge key={p}>{p}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card title={`Shorts cut from ${firstEpisode.title}`} className="mb-4">
        <p className="mb-4 text-sm text-zinc-400">
          These segments cover the {t.shorts.minPerDay}-short minimum on their own. Extra shorts come from other
          daily stories in the monitoring sheet.
        </p>
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-zinc-500">
            <tr>
              <th className="pb-2 font-medium">Segment</th>
              <th className="pb-2 font-medium">Starts at</th>
              <th className="pb-2 font-medium">Length</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {cuts.map((s) => (
              <tr key={s.id}>
                <td className="py-2 text-zinc-200">{s.title}</td>
                <td className="py-2 font-mono text-zinc-400">{formatTime(s.start)}</td>
                <td className="py-2 font-mono text-zinc-400">{formatTime(s.durationSec)}</td>
                <td className="py-2">
                  <Badge>Awaiting episode</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Published">
        <p className="text-sm text-zinc-500">Nothing published yet.</p>
      </Card>
    </>
  );
}
