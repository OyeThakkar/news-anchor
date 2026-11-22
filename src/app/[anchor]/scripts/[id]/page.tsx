import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { ReviewControls } from "@/components/review-controls";
import { accent, anchors, isAnchorId } from "@/lib/anchors";
import { formatDate, formatTimeOfDay, statusClass } from "@/lib/format";
import { approvalOf, blockedStatus, deadlineOf } from "@/lib/review";
import { formatTime, withStartTimes } from "@/lib/scripts";
import { get, serialLabel } from "@/lib/store";

type Params = Promise<{ anchor: string; id: string }>;

export default function ScriptPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading script…</p>}>
      <ScriptView params={params} />
    </Suspense>
  );
}

async function ScriptView({ params }: { params: Params }) {
  const { anchor, id } = await params;
  if (!isAnchorId(anchor)) notFound();
  const script = await get("scripts", anchor, id);
  if (!script) notFound();

  const approval = approvalOf(script);
  const status = blockedStatus(approval.state) ?? "Cleared for video";
  const other = anchors[anchor === "reema" ? "siddharth" : "reema"];

  return (
    <>
      <Link href={`/${anchor}/scripts`} className="mb-4 inline-block text-sm text-zinc-400 hover:text-zinc-100">
        ← {anchors[anchor].name} scripts
      </Link>

      <header className="mb-6">
        <p className="mb-1 font-mono text-xs text-zinc-500">
          {serialLabel("scripts", script)} · {formatDate(script.date)}
        </p>
        <h1 className="text-2xl font-semibold text-zinc-100">{script.topic}</h1>
      </header>

      <Card className="mb-6">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-4 text-sm">
          <div>
            <p className="text-xs text-zinc-500">Format</p>
            <p className="text-zinc-100">{script.format}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Duration</p>
            <p className="font-mono text-zinc-100">{formatTime(script.durationSec)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Submitted</p>
            <p className="text-zinc-100">{formatTimeOfDay(new Date(script.submittedAt))}</p>
          </div>
          <div>
            <p className="mb-0.5 text-xs text-zinc-500">Video status</p>
            <Badge className={statusClass(status)}>{status}</Badge>
          </div>
          <div className="ml-auto">
            <p className="mb-1 text-xs text-zinc-500">Review</p>
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
        <p className="mt-4 text-xs text-zinc-500">
          Placeholders in {"{BRACES}"} are filled from the monitoring sheet. The fact box matches the other
          anchor&apos;s episode; {other.name} appears as a cameo in &quot;The other side&quot;.
        </p>
      </Card>

      <ol className="space-y-4">
        {withStartTimes(script.segments).map((s, i) => (
          <li key={s.id}>
            <Card>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-zinc-100">
                  <span className="mr-2 text-zinc-500">{i + 1}.</span>
                  {s.title}
                </h2>
                <p className="font-mono text-xs text-zinc-500">
                  {formatTime(s.start)}-{formatTime(s.start + s.durationSec)} · {formatTime(s.durationSec)}
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
                  <p className="mb-1.5 text-xs uppercase tracking-wider text-zinc-500">Script</p>
                  <blockquote className={`border-l-2 ${accent[anchor].border} pl-3 text-sm italic text-zinc-200`}>
                    {s.line}
                  </blockquote>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
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
