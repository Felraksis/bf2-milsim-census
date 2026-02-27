"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Berlin",
});

export default function ClientNow() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set immediately on mount + update every refresh interval-ish
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 5_000);
    return () => window.clearInterval(t);
  }, []);

  return <>{now ? fmt.format(now) : "—"}</>;
}