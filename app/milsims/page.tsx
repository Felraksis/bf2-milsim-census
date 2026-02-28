import Link from "next/link";
import {
  searchVerifiedMilsims,
  getCronLastRunAt,
  getMilsimDirectoryFacets,
  type MilsimSort,
} from "@/lib/milsims";
import ServerIcon from "@/components/ServerIcon";
import AutoRefresh from "@/components/AutoRefresh";
import MilsimsFiltersBar, {
  type ActivityFilter,
} from "@/components/MilsimFiltersBar";
import { slugifyMilsimName } from "@/lib/slug";

export const dynamic = "force-dynamic";

function ActivityPill({
  status,
}: {
  status: "active" | "inactive" | "unknown" | null | undefined;
}) {
  const s = status ?? "unknown";

  if (s === "active") {
    return (
      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">
        Active
      </span>
    );
  }

  if (s === "inactive") {
    return (
      <span className="rounded-full border border-red-400/30 bg-red-400/10 px-2 py-1 text-xs text-red-200">
        Inactive
      </span>
    );
  }

  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/70">
      Unknown
    </span>
  );
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

function asArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v.filter(Boolean) : [v].filter(Boolean);
}

function asActivity(v: string | undefined): ActivityFilter {
  if (v === "active" || v === "inactive" || v === "unknown" || v === "any")
    return v;
  return "any";
}

export default async function MilsimsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    msg?: string;
    platform?: string | string[];
    faction?: string | string[];
    tag?: string | string[];
    sort?: MilsimSort;
    activity?: string;
  }>;
}) {
  const sp = await searchParams;

  const q = sp.q?.trim() || "";
  const msg = sp.msg;

  const selectedPlatforms = asArray(sp.platform);
  const selectedFactions = asArray(sp.faction);
  const selectedTags = asArray(sp.tag);
  const sort: MilsimSort = sp.sort ?? "age_desc";
  const activity = asActivity(sp.activity);

  const [milsims, facets, cronLastRunAt] = await Promise.all([
    searchVerifiedMilsims({
      q: q || undefined,
      platforms: selectedPlatforms,
      factions: selectedFactions,
      tags: selectedTags,
      sort,
      activity: activity === "any" ? undefined : activity,
    }),
    getMilsimDirectoryFacets(),
    getCronLastRunAt(),
  ]);

  const showMsg =
    msg && msg !== "NEXT_REDIRECT" && msg !== "undefined" && msg !== "null";

  return (
    <div className="space-y-5">
      <AutoRefresh intervalMs={60_000} />

      {showMsg ? (
        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80">
          {msg}
        </div>
      ) : null}

      <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-white/80">Last Updated:</span>{" "}
          {cronLastRunAt ? fmtDateTime.format(new Date(cronLastRunAt)) : "—"}
        </div>

        {q ? (
          <div className="shrink-0 text-xs text-white/50">
            Search: <span className="text-white/70">{q}</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Milsims Directory</h1>
          <p className="text-sm text-white/70">
            Verified and private servers. Missing yours? Submit it.
          </p>
        </div>
        <Link
          href="/submit"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:border-white/40"
        >
          Submit
        </Link>
      </div>

      <MilsimsFiltersBar
        q={q}
        sort={sort}
        selectedPlatforms={selectedPlatforms}
        selectedFactions={selectedFactions}
        selectedTags={selectedTags}
        activity={activity}
        facets={facets}
      />

      <div className="grid gap-3">
        {milsims.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
            No matching servers.
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
                        <ActivityPill status={m.activity_status} />

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
                      {m.server_created_at
                        ? fmtDate.format(new Date(m.server_created_at))
                        : "—"}
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