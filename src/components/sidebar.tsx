"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { accent, anchorIds, anchors } from "@/lib/anchors";

const anchorLinks = [
  { label: "Dashboard", path: "" },
  { label: "Videos", path: "/videos" },
  { label: "Shorts", path: "/shorts" },
  { label: "Scripts", path: "/scripts" },
  { label: "Library & Data Sources", path: "/library" },
];

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
        active ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
      }`}
    >
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 px-3 py-5">
      <Link href="/" className="mb-6 px-3">
        <span className="block text-base font-semibold text-zinc-100">The Late Edit</span>
        <span className="text-xs text-zinc-500">Newsroom portal</span>
      </Link>

      <nav className="flex flex-col gap-6 overflow-y-auto">
        <NavLink href="/" label="Dashboard" active={pathname === "/"} />

        {anchorIds.map((id) => (
          <div key={id}>
            <p className="mb-1 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <span className={`h-2 w-2 rounded-full ${accent[id].dot}`} />
              {anchors[id].name}
            </p>
            <div className="flex flex-col gap-0.5">
              {anchorLinks.map((link) => {
                const href = `/${id}${link.path}`;
                return <NavLink key={href} href={href} label={link.label} active={pathname === href} />;
              })}
            </div>
          </div>
        ))}
      </nav>

      <p className="mt-auto px-3 pt-4 text-[11px] leading-snug text-zinc-600">
        Prototype: video generation and YouTube / Instagram publishing are simulated.
      </p>
    </aside>
  );
}
