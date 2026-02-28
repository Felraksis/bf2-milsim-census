import { NextResponse } from "next/server";
import {
  refreshVerifiedMilsimsBatchFromDiscord,
  refreshMilsimFromDiscord,
} from "@/lib/milsims";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);

  // Optional: refresh a specific milsim by id
  const milsimId = url.searchParams.get("id");

  // Optional overrides (safe parsing)
  const limit = Number(url.searchParams.get("limit") ?? "10");
  const minAgeSeconds = Number(url.searchParams.get("minAgeSeconds") ?? "60");

  // Optional shortcut: ?force=1 will ignore age gating by setting minAgeSeconds=0
  const force = url.searchParams.get("force") === "1";
  const effectiveMinAgeSeconds = force ? 0 : minAgeSeconds;

  try {
    if (milsimId) {
      await refreshMilsimFromDiscord(milsimId);
      return NextResponse.json({
        ok: true,
        mode: "single",
        id: milsimId,
        at: new Date().toISOString(),
      });
    }

    const result = await refreshVerifiedMilsimsBatchFromDiscord({
      limit: Number.isFinite(limit) ? Math.max(1, Math.min(limit, 200)) : 10,
      minAgeSeconds: Number.isFinite(effectiveMinAgeSeconds)
        ? Math.max(0, effectiveMinAgeSeconds)
        : 60,
    });

    return NextResponse.json({
      ok: true,
      mode: "batch",
      ...result,
      limit,
      minAgeSeconds: effectiveMinAgeSeconds,
      at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error", at: new Date().toISOString() },
      { status: 500 }
    );
  }
}