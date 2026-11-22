import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewControls } from "@/components/review-controls";
import { Badge, Card } from "@/components/ui";
import { VideoPreview } from "@/components/video-preview";
import { accent, anchors, isAnchorId } from "@/lib/anchors";
import { formatDate, formatTimeOfDay, statusClass } from "@/lib/format";
import { mediaStatus } from "@/lib/pipeline";
import { approvalOf, deadlineOf, isApproved, isRendering } from "@/lib/review";
import { formatTime } from "@/lib/scripts";
import { get, serialLabel } from "@/lib/store";

export async function MediaPage({
  kind,
  params,
}: {
  kind: "videos" | "shorts";
  params: Promise<{ anchor: string; id: string }>;
}) {
  const { anchor, id } = await params;
  if (!isAnchorId(anchor)) notFound();
  const media = await get(kind, anchor, id);
  if (!media) notFound();
  const script = await get("scripts", anchor, media.scriptId);
  if (!script) notFound();

  const isShort = kind === "shorts";
  const approval = approvalOf(media);
  const rendering = isRendering(media);
  const status = mediaStatus(media, isShort ? "Posted" : "Published");
  const platforms = isShort ? ["Instagram Reels", "YouTube Shorts"] : ["YouTube"];

  return (
    <>
      <Link href={`/${anchor}/${kind}`} className="mb-4 inline-block text-sm text-slate-400 hover:text-slate-100">
        ← {anchors[anchor].name} {isShort ? "shorts" : "videos"}
      </Link>

      <header className="mb-6">
        <p className="mb-1 font-mono text-xs text-slate-500">
          {serialLabel(kind, media)} · {formatDate(media.date)} · from script{" "}
          <Link href={`/${anchor}/scripts/${script.id}`} className="text-sky-400 hover:underline">
            {serialLabel("scripts", script)}
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-slate-100">{media.topic}</h1>
      </header>

      <div className={`grid gap-6 ${isShort ? "lg:grid-cols-[380px_1fr]" : ""}`}>
        {rendering ? (
          <Card>
            <p className="text-sm text-violet-300">
              Generating video… ready at {formatTimeOfDay(new Date(media.submittedAt))}.
            </p>
          </Card>
        ) : (
          <VideoPreview
            anchorName={anchors[anchor].name}
            accentText={accent[anchor].text}
            accentBg={accent[anchor].bg}
            orientation={isShort ? "portrait" : "landscape"}
            topic={media.topic}
            segments={script.segments}
            factBox={script.factBox}
          />
        )}

        <Card className="self-start">
          <div className="flex flex-wrap items-start gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-500">Duration</p>
              <p className="font-mono text-slate-100">{formatTime(media.durationSec)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Generated</p>
              <p className="text-slate-100">{rendering ? "In progress" : formatTimeOfDay(new Date(media.submittedAt))}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs text-slate-500">Status</p>
              <Badge className={statusClass(status)}>{status}</Badge>
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-500">Review</p>
              <ReviewControls
                kind={kind}
                anchor={anchor}
                id={media.id}
                state={approval.state}
                deadline={deadlineOf(media).toISOString()}
                decidedAt={approval.at && formatTimeOfDay(approval.at)}
                note={media.review?.note}
                generatingUntil={rendering ? media.submittedAt : undefined}
              />
            </div>
          </div>

          <div className="mt-5 border-t border-slate-800 pt-4">
            <p className="mb-2 text-xs text-slate-500">Publishing</p>
            <ul className="space-y-1.5 text-sm">
              {platforms.map((p) => (
                <li key={p} className="flex items-center justify-between gap-4">
                  <span className="text-slate-300">{p}</span>
                  <span className="text-xs text-slate-400">
                    {isApproved(approval.state) && approval.at
                      ? `${isShort ? "Posted" : "Published"} · ${formatTimeOfDay(approval.at)}`
                      : "Publishes automatically on approval"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {script.sources && script.sources.length > 0 && (
            <div className="mt-5 border-t border-slate-800 pt-4">
              <p className="mb-2 text-xs text-slate-500">Sources shown on screen</p>
              <ul className="space-y-1 text-sm">
                {script.sources.slice(0, 5).map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
