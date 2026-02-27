import { NextResponse } from "next/server";
import { refreshVerifiedMilsimsBatchFromDiscord } from "@/lib/milsims";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await refreshVerifiedMilsimsBatchFromDiscord({
    limit: 10,
    minAgeSeconds: 60,
  });

  return NextResponse.json({
    ok: true,
    ...result,
    at: new Date().toISOString(),
  });
}