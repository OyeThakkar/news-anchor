"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { accent, anchorIds, anchors, type AnchorId } from "@/lib/anchors";

const anchorLinks = [
  { label: "Dashboard", path: "" },
  { label: "Videos", path: "/videos" },
  { label: "Shorts", path: "/shorts" },
  { label: "Scripts", path: "/scripts" },
  { label: "Library & Data Sources", path: "/library" },
  { label: "Profile", path: "/profile" },
];

function NavLink({ href, label, active, activeClass }: { href: string; label: string; active: boolean; activeClass: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
        active ? activeClass : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}

export function Sidebar({ portraits }: { portraits: Record<AnchorId, string | null> }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-slate-950/70 px-3 py-5 backdrop-blur">
      <Link href="/" className="mb-7 flex items-center gap-3 px-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-400 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30">
          LE
        </span>
        <span>
          <span className="block bg-gradient-to-r from-fuchsia-300 to-orange-200 bg-clip-text text-base font-semibold text-transparent">
            The Late Edit
          </span>
          <span className="text-xs text-slate-400">Newsroom portal</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-6 overflow-y-auto">
        <NavLink
          href="/"
          label="Dashboard"
          active={pathname === "/"}
          activeClass="bg-fuchsia-500/15 text-fuchsia-100 ring-1 ring-inset ring-fuchsia-400/30"
        />

        {anchorIds.map((id) => (
          <div key={id}>
            <p className={`mb-1.5 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider ${accent[id].text}`}>
              {portraits[id] ? (
                <span className="relative h-6 w-6 overflow-hidden rounded-full ring-1 ring-white/20">
                  <Image
                    src={portraits[id]}
                    alt=""
                    fill
                    sizes="48px"
                    className="origin-[50%_38%] scale-[1.7] object-cover"
                  />
                </span>
              ) : (
                <span className={`h-5 w-5 rounded-full bg-gradient-to-br ${accent[id].avatar} text-center text-[10px] leading-5 text-white`}>
                  {anchors[id].name[0]}
                </span>
              )}
              {anchors[id].name}
            </p>
            <div className="flex flex-col gap-0.5">
              {anchorLinks.map((link) => {
                const href = `/${id}${link.path}`;
                const active = link.path ? pathname.startsWith(href) : pathname === href;
                return <NavLink key={href} href={href} label={link.label} active={active} activeClass={accent[id].active} />;
              })}
            </div>
          </div>
        ))}
      </nav>

      <p className="mt-auto px-3 pt-4 text-[11px] leading-snug text-slate-500">
        Prototype: video generation and YouTube / Instagram publishing are simulated.
      </p>
    </aside>
  );
}
