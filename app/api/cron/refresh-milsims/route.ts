import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { refreshVerifiedMilsimsBatchFromDiscord } from "@/lib/milsims";

export const runtime = "nodejs";

const LOCK_KEY = "milsims_directory_refresh";

export async function GET(req: Request) {
  const startedAt = new Date();

  console.log("[CRON] Refresh job triggered", {
    at: startedAt.toISOString(),
  });

  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("[CRON] Unauthorized attempt");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await refreshVerifiedMilsimsBatchFromDiscord({
      limit: 10,
      minAgeSeconds: 60,
    });

    const nowIso = new Date().toISOString();

    // heartbeat update
    await supabaseServer
      .from("refresh_locks")
      .upsert(
        { key: LOCK_KEY, last_run_at: nowIso },
        { onConflict: "key" }
      );

    console.log("[CRON] Refresh completed", {
      refreshed: result.refreshed,
      attempted: result.attempted,
      finishedAt: nowIso,
      durationMs: Date.now() - startedAt.getTime(),
    });

    return NextResponse.json({
      ok: true,
      ...result,
      at: nowIso,
    });
  } catch (err: any) {
    console.error("[CRON] Refresh failed", {
      error: err?.message,
      stack: err?.stack,
    });

    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}