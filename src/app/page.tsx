import Link from "next/link";
import { Badge, Card, PageHeader, Stat } from "@/components/ui";
import { accent, anchorIds, anchors, publishingTargets as t } from "@/lib/anchors";
import { formatTime, totalSeconds, firstEpisode } from "@/lib/scripts";
import { sources, sourcesFor } from "@/lib/sources";

export default function Home() {
  const n = anchorIds.length;

  return (
    <>
      <PageHeader
        eyebrow="Newsroom"
        title="Dashboard"
        description="Daily output and research coverage across both anchors. Every story starts from the shared wire, primary-document and data layer; each anchor then reads their own analysis library."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Episodes / day"
          value={t.episode.perDay * n}
          hint={`${t.episode.minMinutes}-${t.episode.maxMinutes} min each, YouTube`}
        />
        <Stat
          label="Shorts / day"
          value={`${t.shorts.minPerDay * n}-${t.shorts.maxPerDay * n}`}
          hint={`${t.shorts.minPerDay} minimum, ${t.shorts.maxPerDay} cap per anchor`}
        />
        <Stat
          label="Long-form / week"
          value={t.weekly.perWeek * n}
          hint={`${t.weekly.minMinutes}-${t.weekly.maxMinutes} min each`}
        />
        <Stat
          label="Sources monitored"
          value={sources.length}
          hint={`${sources.filter((s) => s.owner === "shared").length} shared`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {anchorIds.map((id) => {
          const a = anchors[id];
          const own = sourcesFor(id).filter((s) => s.owner === id).length;
          return (
            <Card key={id} className={`border-l-4 ${accent[id].border}`}>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className={`text-lg font-semibold ${accent[id].text}`}>{a.name}</h2>
                  <p className="text-sm text-zinc-400">{a.role}</p>
                </div>
                <Link href={`/${id}`} className="text-sm text-zinc-400 hover:text-zinc-100">
                  Open →
                </Link>
              </div>
              <p className="mb-4 text-sm text-zinc-300">{a.worldview}</p>
              <dl className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-zinc-500">Today</dt>
                  <dd className="text-zinc-200">
                    1 episode · {t.shorts.minPerDay}-{t.shorts.maxPerDay} shorts
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Own sources</dt>
                  <dd className="text-zinc-200">{own} + shared</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Episode 1</dt>
                  <dd className="text-zinc-200">
                    {firstEpisode.status} · {formatTime(totalSeconds(firstEpisode.segments))}
                  </dd>
                </div>
              </dl>
            </Card>
          );
        })}
      </div>

      <Card title="Feed monitoring" className="mt-4">
        <p className="mb-3 text-sm text-zinc-400">
          Monitoring is shared between a tool and a researcher per anchor. The tool pulls feeds and alerts; the
          researcher verifies, picks stories and checks sources the tool can&apos;t read well.
        </p>
        <div className="flex flex-wrap gap-2">
          {(["Tool", "Researcher", "Both"] as const).map((m) => (
            <Badge key={m}>
              {m}: {sources.filter((s) => s.monitor === m).length} sources
            </Badge>
          ))}
        </div>
      </Card>
    </>
  );
}
