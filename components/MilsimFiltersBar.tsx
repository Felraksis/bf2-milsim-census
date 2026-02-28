"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

export type MilsimSort = "size_desc" | "size_asc" | "age_desc" | "age_asc";
export type ActivityFilter = "active" | "inactive" | "unknown" | "any";

type Props = {
  q: string;
  sort: MilsimSort;

  selectedPlatforms: string[];
  selectedFactions: string[];
  selectedTags: string[];

  activity: ActivityFilter;

  facets: { platforms: string[]; factions: string[]; tags: string[] };
};

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function TogglePill({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <div
        className={cx(
          "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all duration-150",
          "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10",
          "peer-checked:bg-white peer-checked:text-black peer-checked:border-white peer-checked:shadow-md peer-checked:ring-2 peer-checked:ring-white/30"
        )}
      >
        <span>{label}</span>
      </div>
    </label>
  );
}

function SegmentedPills({
  name,
  value,
  options,
}: {
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((o) => (
        <label key={`${name}-${o.value}`} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={o.value}
            defaultChecked={value === o.value}
            className="peer sr-only"
          />
          <div
            className={cx(
              "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all duration-150",
              "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10",
              "peer-checked:bg-white peer-checked:text-black peer-checked:border-white peer-checked:shadow-md peer-checked:ring-2 peer-checked:ring-white/30"
            )}
          >
            <span>{o.label}</span>
          </div>
        </label>
      ))}
    </div>
  );
}

export default function MilsimsFiltersBar({
  q,
  sort,
  selectedPlatforms,
  selectedFactions,
  selectedTags,
  activity,
  facets,
}: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);

  const hasAnyFilter =
    selectedPlatforms.length > 0 ||
    selectedFactions.length > 0 ||
    selectedTags.length > 0 ||
    (activity && activity !== "any");

  const [open, setOpen] = useState<boolean>(hasAnyFilter);

  // keep mounted briefly after close for animation
  const [renderPanel, setRenderPanel] = useState<boolean>(hasAnyFilter);

  const selectedCount = useMemo(() => {
    const base =
      selectedPlatforms.length + selectedFactions.length + selectedTags.length;
    const act = activity && activity !== "any" ? 1 : 0;
    return base + act;
  }, [
    selectedPlatforms.length,
    selectedFactions.length,
    selectedTags.length,
    activity,
  ]);

  const clearHref = q ? `/milsims?q=${encodeURIComponent(q)}` : "/milsims";

  function toggleOpen() {
    if (open) {
      setOpen(false);
      window.setTimeout(() => setRenderPanel(false), 180);
    } else {
      setRenderPanel(true);
      window.requestAnimationFrame(() => setOpen(true));
    }
  }

  return (
    <form ref={formRef} className="space-y-3" action="/milsims" method="get">
      <div className="flex gap-2 items-center">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
        />

        <select
          name="sort"
          defaultValue={sort}
          onChange={() => formRef.current?.requestSubmit()}
          className="shrink-0 rounded-xl border border-white/15 bg-zinc-950 text-white px-3 py-2 text-sm outline-none focus:border-white/30"
          title="Sort"
        >
          <option value="size_desc">Size: largest</option>
          <option value="size_asc">Size: smallest</option>
          <option value="age_asc">Age: newest</option>
          <option value="age_desc">Age: oldest</option>
        </select>

        <button
          type="submit"
          className="shrink-0 rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90"
        >
          Search
        </button>

        <button
          type="button"
          onClick={toggleOpen}
          className={cx(
            "shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
            open
              ? "border-white/40 bg-white/10 text-white"
              : "border-white/20 bg-transparent text-white/80 hover:border-white/40"
          )}
          aria-expanded={open}
          aria-controls="milsims-filters"
        >
          Filters{selectedCount ? ` (${selectedCount})` : ""}
        </button>
      </div>

      {renderPanel ? (
        <div
          id="milsims-filters"
          className={cx(
            "overflow-hidden rounded-xl border border-white/15 bg-white/5 px-3",
            "transition-all duration-200 ease-out",
            open ? "max-h-[1400px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div
            className={cx(
              "py-3 transition-transform duration-200 ease-out",
              open ? "translate-y-0" : "-translate-y-1"
            )}
          >
            <fieldset className="space-y-2">
              <legend className="text-xs text-white/60">Activity</legend>
              <SegmentedPills
                name="activity"
                value={activity ?? "any"}
                options={[
                  { value: "any", label: "Any" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "unknown", label: "Unknown" },
                ]}
              />
            </fieldset>

            {facets.platforms.length ? (
              <fieldset className="space-y-2 mt-4">
                <legend className="text-xs text-white/60">Platform</legend>
                <div className="flex flex-wrap gap-3">
                  {facets.platforms.map((p) => (
                    <TogglePill
                      key={`plat-${p}`}
                      name="platform"
                      value={p}
                      label={p}
                      defaultChecked={selectedPlatforms.includes(p)}
                    />
                  ))}
                </div>
              </fieldset>
            ) : null}

            {facets.factions.length ? (
              <fieldset className="space-y-2 mt-4">
                <legend className="text-xs text-white/60">Faction</legend>
                <div className="flex flex-wrap gap-3">
                  {facets.factions.map((f) => (
                    <TogglePill
                      key={`fac-${f}`}
                      name="faction"
                      value={f}
                      label={f}
                      defaultChecked={selectedFactions.includes(f)}
                    />
                  ))}
                </div>
              </fieldset>
            ) : null}

            {facets.tags.length ? (
              <fieldset className="space-y-2 mt-4">
                <legend className="text-xs text-white/60">Tags</legend>
                <div className="flex flex-wrap gap-3">
                  {facets.tags.map((t) => (
                    <TogglePill
                      key={`tag-${t}`}
                      name="tag"
                      value={t}
                      label={t}
                      defaultChecked={selectedTags.includes(t)}
                    />
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="flex items-center justify-between gap-3 mt-4">
              <Link
                href={clearHref}
                className="text-xs text-white/60 hover:text-white/80 underline underline-offset-4"
                title="Clear filters"
              >
                Clear filters
              </Link>

              <button
                type="submit"
                className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}