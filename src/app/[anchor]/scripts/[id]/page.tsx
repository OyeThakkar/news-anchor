import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { ReviewControls } from "@/components/review-controls";
import { accent, anchors, isAnchorId } from "@/lib/anchors";
import { formatDate, formatTimeOfDay, statusClass } from "@/lib/format";
import { scriptVideoStatus } from "@/lib/pipeline";
import { approvalOf, deadlineOf, isRendering } from "@/lib/review";
import { formatTime, withStartTimes } from "@/lib/scripts";
import { get, list, serialLabel } from "@/lib/store";

type Params = Promise<{ anchor: string; id: string }>;

export default function ScriptPage({ params }: { params: Params }) {
  return <ScriptView params={params} />;
}

async function ScriptView({ params }: { params: Params }) {
  const { anchor, id } = await params;
  if (!isAnchorId(anchor)) notFound();
  const script = await get("scripts", anchor, id);
  if (!script) notFound();

  const media = (await list(script.format === "Short" ? "shorts" : "videos", anchor)).find((m) => m.scriptId === script.id);
  const approval = approvalOf(script);
  const status = scriptVideoStatus(script, media);
  const other = anchors[anchor === "reema" ? "siddharth" : "reema"];

  return (
    <>
      <Link href={`/${anchor}/scripts`} className="mb-4 inline-block text-sm text-slate-400 hover:text-slate-100">
        ← {anchors[anchor].name} scripts
      </Link>

      <header className="mb-6">
        <p className="mb-1 font-mono text-xs text-slate-500">
          {serialLabel("scripts", script)} · {formatDate(script.date)}
        </p>
        <h1 className="text-2xl font-semibold text-slate-100">{script.topic}</h1>
      </header>

      <Card className="mb-6">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Format</p>
            <p className="text-slate-100">{script.format}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Duration</p>
            <p className="font-mono text-slate-100">{formatTime(script.durationSec)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Submitted</p>
            <p className="text-slate-100">{formatTimeOfDay(new Date(script.submittedAt))}</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-slate-500">Video status</p>
            <Badge className={statusClass(status)}>{status}</Badge>
            {media && !isRendering(media) && (
              <Link
                href={`/${anchor}/${script.format === "Short" ? "shorts" : "videos"}/${media.id}`}
                className="ml-2 text-xs text-sky-400 hover:underline"
              >
                View video
              </Link>
            )}
          </div>
          <div className="ml-auto">
            <p className="mb-1 text-xs text-slate-500">Review</p>
            <ReviewControls
              kind="scripts"
              anchor={anchor}
              id={script.id}
              state={approval.state}
              deadline={deadlineOf(script).toISOString()}
              decidedAt={approval.at && formatTimeOfDay(approval.at)}
              note={script.review?.note}
            />
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          {script.factBox
            ? `The fact box is shared with ${other.name}'s ${script.format === "Short" ? "short" : "episode"} on the same story.`
            : `Placeholders in {BRACES} are filled from the monitoring sheet. The fact box matches ${other.name}'s episode.`}
          {script.format !== "Short" && ` ${other.name} appears as a cameo in "The other side".`}
        </p>
      </Card>

      {script.factBox && (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <Card title="Fact box">
            {script.storyTitle && <p className="mb-3 text-sm text-slate-400">{script.storyTitle}</p>}
            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-200">
              {script.factBox.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ol>
          </Card>
          <Card title="Sources">
            <ul className="space-y-2 text-sm">
              {script.sources?.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                    {source.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <ol className="space-y-4">
        {withStartTimes(script.segments).map((s, i) => (
          <li key={s.id}>
            <Card>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-100">
                  <span className="mr-2 text-slate-500">{i + 1}.</span>
                  {s.title}
                </h2>
                <p className="font-mono text-xs text-slate-500">
                  {formatTime(s.start)}-{formatTime(s.start + s.durationSec)} · {formatTime(s.durationSec)}
                </p>
              </div>
              <p className="mb-3 text-sm text-slate-400">{s.purpose}</p>

              <blockquote
                className={`whitespace-pre-line border-l-2 ${accent[anchor].border} pl-4 text-[15px] leading-relaxed text-slate-100`}
              >
                {s.line}
              </blockquote>

              <p className="mt-4 text-xs text-slate-500">
                <span className="uppercase tracking-wider">Beats:</span> {s.beats.join(" · ")}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.sourceTiers.map((tier) => (
                  <Badge key={tier}>{tier} source</Badge>
                ))}
                {s.shortsCut && (
                  <Badge className={`${accent[anchor].soft} ${accent[anchor].border}`}>Cut as a short</Badge>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </>
  );
}
