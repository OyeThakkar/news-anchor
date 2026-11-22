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
      return "border-sky-600/50 text-sky-300";
    case "Generating":
    case "Generating video":
      return "border-violet-600/50 text-violet-300";
    case "Video awaiting approval":
      return "border-zinc-500 text-zinc-200";
    case "On hold for rework":
    case "Video on hold for rework":
      return "border-amber-600/50 text-amber-300";
    case "Cancelled":
    case "Video cancelled":
      return "border-red-600/50 text-red-300";
    default:
      return "";
  }
}
