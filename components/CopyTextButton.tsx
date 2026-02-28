"use client";

import { useEffect, useState } from "react";

export default function CopyTextButton({
  text,
  label = "Copy",
  copiedLabel = "Copied!",
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(true);
    }
  }

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:border-white/30"
      title="Copy to clipboard"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}