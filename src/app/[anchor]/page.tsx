import Link from "next/link";
import { Badge, Card, PageHeader, Stat } from "@/components/ui";
import { accent, anchors, publishingTargets as t, resolveAnchor } from "@/lib/anchors";
import { AUTO_APPROVE_MINUTES } from "@/lib/review";
import { episodeSegments, formatTime, totalSeconds } from "@/lib/scripts";
import { sourcesFor } from "@/lib/sources";

export default async function AnchorDashboard({ params }: PageProps<"/[anchor]">) {
  const id = await resolveAnchor(params);
  const a = anchors[id];
  const library = sourcesFor(id);
  const shortsFromEpisode = episodeSegments.filter((s) => s.shortsCut).length;

  return (
    <>
      <PageHeader eyebrow={a.name} title="Dashboard" description={`${a.role}. ${a.worldview}`} />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Daily episode" value="1" hint={`${t.episode.minMinutes}-${t.episode.maxMinutes} min, YouTube`} />
        <Stat
          label="Shorts today"
          value={`${t.shorts.minPerDay}-${t.shorts.maxPerDay}`}
          hint={`${shortsFromEpisode} can be cut from the episode`}
        />
        <Stat label="Weekly long-form" value="1" hint={`${t.weekly.minMinutes}-${t.weekly.maxMinutes} min`} />
        <Stat
          label="Sources"
          value={library.length}
          hint={`${library.filter((s) => s.owner === id).length} own, ${library.filter((s) => s.owner === "shared").length} shared`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Persona" className={`lg:col-span-2 border-l-4 ${accent[id].border}`}>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-zinc-500">Delivery</dt>
              <dd className="mt-1 text-zinc-300">{a.delivery}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Look</dt>
              <dd className="mt-1 text-zinc-300">{a.look}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Comedy</dt>
              <dd className="mt-1 text-zinc-300">{a.comedy}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Story focus</dt>
              <dd className="mt-1 flex flex-wrap gap-1.5">
                {a.focus.map((f) => (
                  <Badge key={f}>{f}</Badge>
                ))}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Next up">
          <ul className="space-y-3 text-sm">
            <li>
              <Link href={`/${id}/scripts`} className="block hover:text-zinc-100">
                <span className="text-zinc-200">Review scripts</span>
                <span className="block text-xs text-zinc-500">
                  Auto-approved after {AUTO_APPROVE_MINUTES} min · episode runs{" "}
                  {formatTime(totalSeconds(episodeSegments))}
                </span>
              </Link>
            </li>
            <li>
              <Link href={`/${id}/library`} className="block hover:text-zinc-100">
                <span className="text-zinc-200">Pick today&apos;s story</span>
                <span className="block text-xs text-zinc-500">
                  {library.filter((s) => s.frequency === "Live" || s.frequency === "Hourly").length} live or hourly
                  feeds
                </span>
              </Link>
            </li>
            <li>
              <Link href={`/${id}/videos`} className="block hover:text-zinc-100">
                <span className="text-zinc-200">Publishing slots</span>
                <span className="block text-xs text-zinc-500">
                  1 episode + {t.shorts.minPerDay} shorts minimum
                </span>
              </Link>
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}
