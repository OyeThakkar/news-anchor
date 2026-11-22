import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { accent, anchors, type AnchorId } from "@/lib/anchors";

const extensions = ["png", "jpg", "jpeg", "webp"];

// Portraits live in public/anchors/<id>.<ext>; until one exists, show a styled placeholder.
export function portraitSrc(id: AnchorId) {
  const ext = extensions.find((e) => existsSync(path.join(process.cwd(), "public", "anchors", `${id}.${e}`)));
  return ext ? `/anchors/${id}.${ext}` : null;
}

export function AnchorPortrait({
  id,
  size,
  className = "",
}: {
  id: AnchorId;
  size: "sm" | "lg";
  className?: string;
}) {
  const src = portraitSrc(id);
  const shape = size === "sm" ? "h-11 w-11 rounded-full" : "aspect-[4/5] w-full rounded-2xl";

  if (src) {
    return (
      <div className={`relative overflow-hidden ${shape} ${className}`}>
        <Image
          src={src}
          alt={`${anchors[id].name}, AI anchor`}
          fill
          sizes={size === "sm" ? "44px" : "(min-width: 1024px) 360px, 100vw"}
          className="object-cover"
          priority={size === "lg"}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center bg-gradient-to-br ${accent[id].avatar} text-white ${shape} ${className}`}
    >
      <span className={size === "sm" ? "text-lg font-semibold" : "text-8xl font-semibold"}>{anchors[id].name[0]}</span>
      {size === "lg" && <span className="mt-2 text-xs uppercase tracking-widest text-white/80">Portrait coming soon</span>}
    </div>
  );
}
