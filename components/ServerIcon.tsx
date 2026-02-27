"use client";

import { useState } from "react";

export default function ServerIcon({
  url,
  name,
}: {
  url: string | null | undefined;
  name: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!url || broken) {
    return (
      <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-xs font-semibold text-white/70">
        {name.trim().slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className="h-10 w-10 rounded-xl border border-white/10 bg-white/5"
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={() => setBroken(true)}
    />
  );
}