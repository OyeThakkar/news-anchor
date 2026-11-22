export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}

export function formatTimeOfDay(date: Date) {
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(date);
  return `${time} IST`;
}

export function statusClass(status: string) {
  switch (status) {
    case "Published":
    case "Posted":
      return "border-sky-500/50 bg-sky-500/10 text-sky-200";
    case "Awaiting approval":
      return "border-indigo-400/50 bg-indigo-500/10 text-indigo-200";
    case "Publishing":
    case "Generating":
    case "Generating video":
      return "border-violet-500/50 bg-violet-500/10 text-violet-200";
    case "Video awaiting approval":
      return "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-200";
    case "Awaiting video file":
    case "On hold for rework":
    case "Video on hold for rework":
      return "border-amber-500/50 bg-amber-500/10 text-amber-200";
    case "Publish failed":
    case "Cancelled":
    case "Video cancelled":
      return "border-red-500/50 bg-red-500/10 text-red-200";
    default:
      return "";
  }
}

// "https://www.youtube.com/@reema" -> "@reema"; "https://www.instagram.com/reema/" -> "@reema"
export function channelHandle(url: string) {
  const path = new URL(url).pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const last = path.at(-1) ?? new URL(url).hostname;
  return last.startsWith("@") ? last : `@${last}`;
}
