// app/roadmap/page.tsx
import Link from "next/link";
import { getPublicRoadmapItems, RoadmapItem, RoadmapStatus } from "@/lib/roadmap";

export const dynamic = "force-dynamic";

function StatusPill({ status }: { status: RoadmapStatus }) {
  if (status === "done") {
    return (
      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">
        Done
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-200">
        In progress
      </span>
    );
  }
  if (status === "blocked") {
    return (
      <span className="rounded-full border border-red-400/30 bg-red-400/10 px-2 py-1 text-xs text-red-200">
        Blocked
      </span>
    );
  }
  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/70">
      Planned
    </span>
  );
}

function CategoryPill({ c }: { c: RoadmapItem["category"] }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
      {String(c).replace(/_/g, " ")}
    </span>
  );
}

function PriorityPill({ p }: { p: RoadmapItem["priority"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    low: { label: "Low", cls: "border-white/10 bg-white/5 text-white/60" },
    medium: { label: "Medium", cls: "border-white/15 bg-white/5 text-white/70" },
    high: { label: "High", cls: "border-white/20 bg-white/5 text-white/80" },
    critical: { label: "Critical", cls: "border-red-400/30 bg-red-400/10 text-red-200" },
  };
  const m = map[p] ?? map.medium;

  return (
    <span className={`rounded-full border px-2 py-1 text-xs ${m.cls}`}>
      {m.label}
    </span>
  );
}

function groupByStatus(items: RoadmapItem[]): Record<RoadmapStatus, RoadmapItem[]> {
  return items.reduce(
    (acc, it) => {
      acc[it.status].push(it);
      return acc;
    },
    {
      planned: [],
      in_progress: [],
      blocked: [],
      done: [],
    } as Record<RoadmapStatus, RoadmapItem[]>
  );
}

export default async function RoadmapPage() {
  const items = await getPublicRoadmapItems();
  const g = groupByStatus(items);

  const sections: { key: RoadmapStatus; title: string; hint: string }[] = [
    { key: "in_progress", title: "In progress", hint: "Actively being worked on" },
    { key: "planned", title: "Planned", hint: "Planned requests" },
    { key: "blocked", title: "Blocked", hint: "Rejected requests" },
    { key: "done", title: "Done", hint: "Completed requests" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Roadmap</h1>
          <p className="text-white/70 mt-1">
            Planned features and improvements for the BF2 Milsims Directory.
          </p>
        </div>

        <Link
          href="/milsims"
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:border-white/30"
        >
          ← Back to directory
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          No roadmap items yet.
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.key} className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-lg font-semibold">{s.title}</div>
                <div className="text-xs text-white/45">{s.hint}</div>
              </div>

              {g[s.key].length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
                  Nothing here yet.
                </div>
              ) : (
                <div className="grid gap-3">
                  {g[s.key].map((it) => (
                    <div
                      key={it.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-base font-semibold text-white/90">
                              {it.title}
                            </div>
                            <StatusPill status={it.status} />
                          </div>

                          {it.description ? (
                            <div className="mt-2 text-sm text-white/70 whitespace-pre-wrap">
                              {it.description}
                            </div>
                          ) : null}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <CategoryPill c={it.category} />
                            <PriorityPill p={it.priority} />
                          </div>
                        </div>

                        <div className="shrink-0 text-right text-xs text-white/45">
                          Updated:{" "}
                          {it.updated_at
                            ? new Date(it.updated_at).toLocaleDateString("de-DE")
                            : "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-white/40">
        Suggestions welcome — contact the project lead via Discord.
      </div>
    </div>
  );
}