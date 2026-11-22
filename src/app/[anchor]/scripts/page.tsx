import { Badge, Card, PageHeader } from "@/components/ui";
import { accent, anchors, publishingTargets as t, resolveAnchor } from "@/lib/anchors";
import { firstEpisode, formatTime, totalSeconds, withStartTimes } from "@/lib/scripts";

export default async function ScriptsPage({ params }: PageProps<"/[anchor]/scripts">) {
  const id = await resolveAnchor(params);
  const a = anchors[id];
  const other = anchors[id === "reema" ? "siddharth" : "reema"];
  const runtime = totalSeconds(firstEpisode.segments);

  return (
    <>
      <PageHeader
        eyebrow={a.name}
        title="Scripts"
        description={`${firstEpisode.title} structure, John Oliver-style: cold open, chronology, where things stand, and what to do next. Target ${t.episode.minMinutes}-${t.episode.maxMinutes} minutes.`}
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-zinc-500">Script</p>
            <p className="text-zinc-100">{firstEpisode.title}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Topic</p>
            <p className="text-zinc-100">{firstEpisode.topic}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Runtime</p>
            <p className="font-mono text-zinc-100">{formatTime(runtime)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Language</p>
            <p className="text-zinc-100">{firstEpisode.language}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Status</p>
            <Badge className={`${accent[id].soft} ${accent[id].border}`}>{firstEpisode.status}</Badge>
          </div>
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Placeholders in {"{BRACES}"} get filled from sources in the monitoring sheet. The fact box is identical in
          both anchors&apos; episodes; {other.name} appears as a cameo in &quot;The other side&quot;.
        </p>
      </Card>

      <ol className="space-y-4">
        {withStartTimes(firstEpisode.segments).map((s, i) => {
          const end = s.start + s.durationSec;
          return (
            <li key={s.id}>
              <Card>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold text-zinc-100">
                    <span className="mr-2 text-zinc-500">{i + 1}.</span>
                    {s.title}
                  </h2>
                  <p className="font-mono text-xs text-zinc-500">
                    {formatTime(s.start)}-{formatTime(end)} · {formatTime(s.durationSec)}
                  </p>
                </div>
                <p className="mb-3 text-sm text-zinc-400">{s.purpose}</p>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-xs uppercase tracking-wider text-zinc-500">Beats</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
                      {s.beats.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs uppercase tracking-wider text-zinc-500">Draft line</p>
                    <blockquote className={`border-l-2 ${accent[id].border} pl-3 text-sm italic text-zinc-200`}>
                      {s.lines[id]}
                    </blockquote>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.sourceTiers.map((tier) => (
                    <Badge key={tier}>{tier} source</Badge>
                  ))}
                  {s.shortsCut && <Badge className={`${accent[id].soft} ${accent[id].border}`}>Cut as a short</Badge>}
                </div>
              </Card>
            </li>
          );
        })}
      </ol>
    </>
  );
}
