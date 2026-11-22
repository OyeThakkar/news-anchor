import Link from "next/link";
import { Badge, Card, PageHeader, Stat } from "@/components/ui";
import { accent, anchorIds, anchors, publishingTargets as t } from "@/lib/anchors";
import { AUTO_APPROVE_MINUTES } from "@/lib/review";
import { monitorChip } from "@/lib/colors";
import { getSources } from "@/lib/store";

export default function Home() {
  return (
    <>
      <PageHeader
        eyebrow="Newsroom"
        title="Dashboard"
        description="Daily output and research coverage across both anchors. Every story starts from the shared wire, primary-document and data layer; each anchor then reads their own analysis library."
      />
      <Overview />
    </>
  );
}

async function Overview() {
  const n = anchorIds.length;
  const sources = (await getSources()).filter((s) => s.active);

  return (
    <>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          tone="sky"
          label="Episodes / day"
          value={t.episode.perDay * n}
          hint={`${t.episode.minMinutes}-${t.episode.maxMinutes} min each, YouTube`}
        />
        <Stat
          tone="fuchsia"
          label="Shorts / day"
          value={`${t.shorts.minPerDay * n}-${t.shorts.maxPerDay * n}`}
          hint={`${t.shorts.minPerDay} minimum, ${t.shorts.maxPerDay} cap per anchor`}
        />
        <Stat
          tone="amber"
          label="Long-form / week"
          value={t.weekly.perWeek * n}
          hint={`${t.weekly.minMinutes}-${t.weekly.maxMinutes} min each`}
        />
        <Stat
          tone="emerald"
          label="Active sources"
          value={sources.length}
          hint={`${sources.filter((s) => s.owner === "shared").length} shared`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {anchorIds.map((id) => {
          const a = anchors[id];
          const own = sources.filter((s) => s.owner === id).length;
          return (
            <Card key={id} className={`border-l-4 ${accent[id].border} ${accent[id].soft}`}>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${accent[id].avatar} text-lg font-semibold text-white shadow-lg`}
                  >
                    {a.name[0]}
                  </span>
                  <div>
                    <h2 className={`text-lg font-semibold ${accent[id].text}`}>{a.name}</h2>
                    <p className="text-sm text-slate-300">{a.role}</p>
                  </div>
                </div>
                <Link href={`/${id}`} className={`text-sm font-medium ${accent[id].text} hover:brightness-125`}>
                  Open →
                </Link>
              </div>
              <p className="mb-4 text-sm text-slate-300">{a.worldview}</p>
              <dl className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Today</dt>
                  <dd className="text-slate-200">
                    1 episode · {t.shorts.minPerDay}-{t.shorts.maxPerDay} shorts
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Own sources</dt>
                  <dd className="text-slate-200">{own} + shared</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Script review</dt>
                  <dd className="text-slate-200">Auto-approve after {AUTO_APPROVE_MINUTES} min</dd>
                </div>
              </dl>
            </Card>
          );
        })}
      </div>

      <Card title="Feed monitoring" className="mt-4">
        <p className="mb-3 text-sm text-slate-400">
          Monitoring is shared between a tool and a researcher per anchor. The tool pulls feeds and alerts; the
          researcher verifies, picks stories and checks sources the tool can&apos;t read well.
        </p>
        <div className="flex flex-wrap gap-2">
          {(["Tool", "Researcher", "Both"] as const).map((m) => (
            <Badge key={m} className={monitorChip(m)}>
              {m}: {sources.filter((s) => s.monitor === m).length} sources
            </Badge>
          ))}
        </div>
      </Card>
    </>
  );
}
