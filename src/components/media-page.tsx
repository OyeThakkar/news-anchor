import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewControls } from "@/components/review-controls";
import { ScriptActions } from "@/components/script-actions";
import { Badge, Card } from "@/components/ui";
import { VideoPreview } from "@/components/video-preview";
import { accent, anchors, isAnchorId } from "@/lib/anchors";
import { channelHandle, formatDate, formatTimeOfDay, statusClass } from "@/lib/format";
import { mediaStatus } from "@/lib/pipeline";
import { approvalOf, deadlineOf, isApproved, isRendering } from "@/lib/review";
import { scriptFilename, scriptToText } from "@/lib/script-text";
import { formatTime } from "@/lib/scripts";
import { publishDue } from "@/lib/integrations/publish";
import { get, getChannels, getConnections, serialLabel } from "@/lib/store";

export async function MediaPage({
  kind,
  params,
}: {
  kind: "videos" | "shorts";
  params: Promise<{ anchor: string; id: string }>;
}) {
  const { anchor, id } = await params;
  if (!isAnchorId(anchor)) notFound();
  await publishDue(kind, anchor);
  const media = await get(kind, anchor, id);
  if (!media) notFound();
  const script = await get("scripts", anchor, media.scriptId);
  if (!script) notFound();

  const isShort = kind === "shorts";
  const approval = approvalOf(media);
  const rendering = isRendering(media);
  const status = mediaStatus(media, isShort ? "Posted" : "Published");
  const meta = { anchor: anchors[anchor].name, serial: serialLabel("scripts", script) };
  const scriptText = scriptToText(script, meta);
  const channels = await getChannels(anchor);
  const connected = new Set((await getConnections(anchor)).map((c) => c.platform));
  const platforms = isShort
    ? [
        { platform: "instagram" as const, name: "Instagram Reels", url: channels.instagramUrl },
        { platform: "youtube" as const, name: "YouTube Shorts", url: channels.youtubeUrl },
      ]
    : [{ platform: "youtube" as const, name: "YouTube", url: channels.youtubeUrl }];

  // What to show for each channel: a real API result, a simulated publish, or the pending state.
  const publishState = (platform: "youtube" | "instagram") => {
    const result = media.publications?.[platform];
    if (result?.status === "published") return { text: `Published · ${formatTimeOfDay(new Date(result.at))}`, href: result.url };
    if (result?.status === "publishing") return { text: "Publishing…" };
    if (result) return { text: `${result.status === "waiting" ? "Waiting" : "Failed"}: ${result.error}`, error: true };
    if (!isApproved(approval.state) || !approval.at) return { text: "Publishes automatically on approval" };
    if (connected.has(platform)) return { text: "Queued for publishing" };
    return { text: `${isShort ? "Posted" : "Published"} (simulated) · ${formatTimeOfDay(approval.at)}` };
  };

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

      <div className="grid gap-6">
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
            accentBorder={accent[anchor].border}
            orientation={isShort ? "portrait" : "landscape"}
            topic={media.topic}
            segments={script.segments}
            factBox={script.factBox}
            scriptActions={<ScriptActions text={scriptText} filename={scriptFilename(meta, script)} />}
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
              {platforms.map((p) => {
                const state = publishState(p.platform);
                return (
                  <li key={p.name} className="flex items-center justify-between gap-4">
                    <span className="text-slate-300">
                      {p.name}
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noreferrer" className="ml-2 text-xs text-sky-400 hover:underline">
                          {channelHandle(p.url)} ↗
                        </a>
                      ) : (
                        <Link href={`/${anchor}/profile`} className="ml-2 text-xs text-slate-500 hover:text-slate-300">
                          add channel link
                        </Link>
                      )}
                    </span>
                    {state.href ? (
                      <a href={state.href} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:underline">
                        {state.text} ↗
                      </a>
                    ) : (
                      <span className={`text-right text-xs ${state.error ? "text-red-300" : "text-slate-400"}`}>{state.text}</span>
                    )}
                  </li>
                );
              })}
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
