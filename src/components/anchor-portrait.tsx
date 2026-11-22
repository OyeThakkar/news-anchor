import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { accent, anchors, type AnchorId } from "@/lib/anchors";

const imageExtensions = ["png", "jpg", "jpeg", "webp"];

function findAsset(id: AnchorId, extensions: string[]) {
  const ext = extensions.find((e) => existsSync(path.join(process.cwd(), "public", "anchors", `${id}.${e}`)));
  return ext ? `/anchors/${id}.${ext}` : null;
}

// Portraits live in public/anchors/<id>.<ext>; an optional <id>.mp4 plays as a "live" portrait on large views.
export function portraitSrc(id: AnchorId) {
  return findAsset(id, imageExtensions);
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
  const video = size === "lg" ? findAsset(id, ["mp4", "webm"]) : null;
  const shape = size === "sm" ? "h-11 w-11 rounded-full" : "aspect-[4/5] w-full rounded-2xl";
  const alt = `${anchors[id].name}, AI anchor`;

  if (video) {
    return (
      <div className={`relative overflow-hidden ${shape} ${className}`}>
        <video
          src={video}
          poster={src ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          aria-label={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  if (src) {
    return (
      <div className={`relative overflow-hidden ${shape} ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={size === "sm" ? "88px" : "(min-width: 1024px) 360px, 100vw"}
          // Small avatars zoom in on the face, which sits in the upper middle of both portraits.
          className={size === "sm" ? "origin-[50%_38%] scale-[1.7] object-cover" : "object-cover object-top"}
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
