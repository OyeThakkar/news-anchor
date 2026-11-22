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
    case "Cleared for video":
    case "Ready to publish":
    case "Ready to post":
      return "border-emerald-600/50 text-emerald-300";
    case "Published":
    case "Posted":
      return "border-sky-600/50 text-sky-300";
    case "On hold for rework":
      return "border-amber-600/50 text-amber-300";
    case "Cancelled":
    case "Failed":
      return "border-red-600/50 text-red-300";
    default:
      return "";
  }
}
