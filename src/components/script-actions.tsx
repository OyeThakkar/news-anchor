"use client";

import { useRef, useState } from "react";

const button =
  "rounded-md border border-white/15 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for browsers that block the async clipboard API.
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

export function ScriptActions({ text, filename }: { text: string; filename: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function copy() {
    await copyText(text);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={copy} className={button} aria-live="polite">
        {copied ? "Copied ✓" : "Copy script"}
      </button>
      <button type="button" onClick={download} className={button}>
        Download .txt
      </button>
    </div>
  );
}
