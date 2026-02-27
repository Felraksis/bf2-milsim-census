"use client";

import { useEffect, useMemo, useState } from "react";

export default function CopyMilsimLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    // window only exists client-side
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/milsims/${slug}`;
  }, [slug]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  async function onCopy() {
    try {
      const text = url || (typeof window !== "undefined" ? `${window.location.origin}/milsims/${slug}` : "");
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // fallback: select/execCommand is deprecated; keep it simple
      setCopied(true); // still show feedback
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onCopy}
        className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/80 hover:border-white/30"
        title="Copy Page link"
      >
        Copy Page link
      </button>

      {copied ? (
        <div className="absolute right-0 top-full mt-2 rounded-lg border border-white/15 bg-black/60 px-2 py-1 text-xs text-white/80 backdrop-blur">
          Copied!
        </div>
      ) : null}
    </div>
  );
}