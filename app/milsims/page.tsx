import Link from "next/link";
import { getVerifiedMilsims } from "@/lib/milsims";
import ServerIcon from "@/components/ServerIcon";
import AutoRefresh from "@/components/AutoRefresh";
import { slugifyMilsimName } from "@/lib/slug";
import CopyMilsimLink from "@/components/CopyMilsimLink";

export const dynamic = "force-dynamic";

function ActivityDot({
  status,
}: {
  status: "active" | "inactive" | "unknown" | null | undefined;
}) {
  const s = status ?? "unknown";
  if (s === "active") return <span className="inline-block h-3 w-3 rounded-full bg-emerald-400" />;
  if (s === "inactive") return <span className="inline-block h-3 w-3 rounded-full bg-red-400" />;
  return <span className="inline-block h-3 w-3 rounded-full bg-white" />;
}

const PLATFORM_BADGE: Record<string, { dot: string; label: string }> = {
  PC: { dot: "", label: "PC" },
  Xbox: { dot: "", label: "Xbox" },
  PSN: { dot: "", label: "PSN" },
};

const fmtDate = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeZone: "Europe/Berlin",
});

const fmtDateTime = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Berlin",
});

function getLatestCheckedAt(milsims: any[]) {
  const dates = milsims
    .map((m) => (m?.last_checked_at ? new Date(m.last_checked_at).getTime() : 0))
    .filter((t) => Number.isFinite(t) && t > 0);

  if (dates.length === 0) return null;

  const latest = Math.max(...dates);
  return new Date(latest);
}

export default async function MilsimsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; msg?: string }>;
}) {
  const { q, msg } = await searchParams;
  const milsims = await getVerifiedMilsims(q);

  const showMsg =
    msg && msg !== "NEXT_REDIRECT" && msg !== "undefined" && msg !== "null";

  const lastUpdated = getLatestCheckedAt(milsims);

  return (
    <div className="space-y-5">
      {/* client-side periodic refresh */}
      <AutoRefresh intervalMs={60_000} />

      {showMsg ? (
        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">
          {msg}
        </div>
      ) : null}

      {/* top notice */}
      <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-white/80">Last updated:</span>{" "}
          {lastUpdated ? fmtDateTime.format(lastUpdated) : "—"}
          <span className="text-white/40"> ·</span>{" "}
          <span className="text-white/50">Soon: Auto-refreshes every 60s</span>
        </div>

        {q ? (
          <div className="shrink-0 text-xs text-white/50">
            Filter: <span className="text-white/70">{q}</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Milsims Directory</h1>
          <p className="text-sm text-white/70">
            Verified servers only. Missing yours? Submit it.
          </p>
        </div>
        <Link
          href="/submit"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:border-white/40"
        >
          Submit
        </Link>
      </div>

      <form className="flex gap-2" action="/milsims" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name…"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
        />
        <button className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90">
          Search
        </button>
      </form>

      <div className="grid gap-3">
        {milsims.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
            No verified servers yet.
          </div>
        ) : (
          milsims.map((m: any) => {
            const slug = m.slug ?? slugifyMilsimName(m.name);

            return (
              <div
                key={m.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
                style={{ borderLeft: `8px solid ${m.theme_color ?? "#666"}` }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <ServerIcon url={m.discord_icon_url} name={m.name} />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <ActivityDot status={m.activity_status} />
                        <Link
                          href={`/milsims/${slug}`}
                          className="text-lg font-semibold truncate hover:underline"
                          title="Open detail page"
                        >
                          {m.name}
                        </Link>

                        <div className="flex flex-wrap gap-2">
                          {(m.platforms ?? []).map((p: string) => {
                            const b = PLATFORM_BADGE[p] ?? { dot: "⚪", label: p };
                            return (
                              <span
                                key={`plat-${m.id}-${p}`}
                                className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/80"
                                title={`Platform: ${b.label}`}
                              >
                                {b.dot} {b.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <a
                        href={m.invite_url}
                        className="text-sm text-white/70 underline break-all"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {m.invite_url}
                      </a>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                        {(m.factions ?? []).map((x: string) => (
                          <span
                            key={`f-${m.id}-${x}`}
                            className="rounded-full border border-white/15 px-2 py-1"
                          >
                            {x}
                          </span>
                        ))}
                        {(m.tags ?? []).map((x: string) => (
                          <span
                            key={`t-${m.id}-${x}`}
                            className="rounded-full bg-white/10 px-2 py-1"
                          >
                            {x}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-xs text-white/60 space-y-1">
                    <div>Members: {m.members_count ?? "—"}</div>
                    <div>Online: {m.online_count ?? "—"}</div>

                    <div className="pt-1">
                      Est:{" "}
                      {m.server_created_at ? fmtDate.format(new Date(m.server_created_at)) : "—"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}