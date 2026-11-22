import Link from "next/link";
import { Badge } from "@/components/ui";
import { ReviewControls } from "@/components/review-controls";
import type { AnchorId } from "@/lib/anchors";
import { formatDate, formatTimeOfDay, statusClass } from "@/lib/format";
import { approvalOf, deadlineOf, type Review } from "@/lib/review";
import { formatTime } from "@/lib/scripts";
import { serialLabel, type Kind } from "@/lib/store";

export type ReviewRow = {
  id: string;
  anchor: AnchorId;
  serial: number;
  date: string;
  topic: string;
  subtitle?: string;
  durationSec: number;
  submittedAt: string;
  review: Review;
  view: { label: string; href: string } | null;
  statuses: string[];
  generatingUntil?: string;
};

export function ReviewTable({
  kind,
  anchor,
  statusHeaders,
  rows,
  empty,
}: {
  kind: Kind;
  anchor: AnchorId;
  statusHeaders: string[];
  rows: ReviewRow[];
  empty: string;
}) {
  const headers = ["Date", "Serial", "Topic", "Duration", "View", ...statusHeaders, "Review"];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-xs text-slate-300">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row) => {
            const approval = approvalOf(row);
            return (
              <tr key={row.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-slate-300">{formatDate(row.date)}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-300">{serialLabel(kind, row)}</td>
                <td className="px-4 py-3">
                  <span className="text-slate-100">{row.topic}</span>
                  {row.subtitle && <span className="block text-xs text-slate-500">{row.subtitle}</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-300">{formatTime(row.durationSec)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {row.view ? (
                    <Link href={row.view.href} className="text-sky-400 hover:underline">
                      {row.view.label}
                    </Link>
                  ) : (
                    <span className="text-slate-500">Not ready</span>
                  )}
                </td>
                {row.statuses.map((status, i) => (
                  <td key={statusHeaders[i]} className="whitespace-nowrap px-4 py-3">
                    <Badge className={statusClass(status)}>{status}</Badge>
                  </td>
                ))}
                <td className="px-4 py-3">
                  <ReviewControls
                    kind={kind}
                    anchor={anchor}
                    id={row.id}
                    state={approval.state}
                    deadline={deadlineOf(row).toISOString()}
                    decidedAt={approval.at && formatTimeOfDay(approval.at)}
                    note={row.review?.note}
                    generatingUntil={row.generatingUntil}
                  />
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-slate-500">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
