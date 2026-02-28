// app/milsims/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getVerifiedMilsimBySlug } from "@/lib/milsims";
import ServerIcon from "@/components/ServerIcon";
import CopyMilsimLink from "@/components/CopyMilsimLink";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bf2-milsims.com";

const fmtDate = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeZone: "Europe/Berlin",
});

const fmtDateTime = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Berlin",
});

function buildDescription(m: Awaited<ReturnType<typeof getVerifiedMilsimBySlug>>) {
  if (!m) return "Verified Battlefield 2 milsim directory entry.";

  const parts: string[] = [];

  parts.push(`${m.name} is a verified Battlefield 2 milsim community.`);

  // platforms
  if (m.platforms?.length) parts.push(`Platforms: ${m.platforms.join(", ")}.`);

  // factions/tags (keep short)
  const facets: string[] = [];
  if (m.factions?.length) facets.push(...m.factions.slice(0, 4));
  if (m.tags?.length) facets.push(...m.tags.slice(0, 4));

  if (facets.length) parts.push(`Focus: ${facets.slice(0, 6).join(", ")}.`);

  // stats
  const members =
    typeof m.members_count === "number" ? `${m.members_count}` : null;
  const online =
    typeof m.online_count === "number" ? `${m.online_count}` : null;

  if (members || online) {
    const s: string[] = [];
    if (members) s.push(`${members} members`);
    if (online) s.push(`${online} online`);
    parts.push(`Discord stats: ${s.join(", ")}.`);
  }

  if (m.status === "private") parts.push("Invite link is private.");

  // keep under ~160 chars ideally; but Google will truncate anyway
  return parts.join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const milsim = await getVerifiedMilsimBySlug(slug);

  if (!milsim) {
    return {
      title: "Milsim not found | BF2 Milsims",
      robots: { index: false, follow: false },
    };
  }

  const canonicalSlug = milsim.slug ?? slug;
  const url = `${SITE_URL}/milsims/${canonicalSlug}`;

  const title = `${milsim.name} | BF2 Milsims Directory`;
  const description = buildDescription(milsim);

  const ogImage = milsim.discord_icon_url || undefined;

  return {
    title,
    description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "BF2 Milsims",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },

    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-white/50">
        {label}
      </div>
      <div className="mt-1 text-sm text-white/80">{value}</div>
    </div>
  );
}

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

export default async function MilsimDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const milsim = await getVerifiedMilsimBySlug(slug);
  if (!milsim) return notFound();

  const showDiscordInvite = milsim.status !== "private";

  return (
    <div className="space-y-6">
      {/* top bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/milsims"
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80 hover:border-white/30"
        >
          ← Back to directory
        </Link>

        <div className="flex items-center gap-2">
          <CopyMilsimLink slug={milsim.slug ?? slug} />

          {showDiscordInvite ? (
            <a
              href={milsim.invite_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
              title="Open Discord invite"
            >
              Open in Discord
            </a>
          ) : null}
        </div>
      </div>

      {/* hero card */}
      <div
        className="rounded-2xl border border-white/10 bg-white/5 p-6"
        style={{ borderLeft: `10px solid ${milsim.theme_color ?? "#666"}` }}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <ServerIcon url={milsim.discord_icon_url} name={milsim.name} />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold leading-tight truncate">
                  {milsim.name}
                </h1>

                <ActivityPill status={milsim.activity_status} />
              </div>

              {showDiscordInvite ? (
                <div className="mt-1 text-sm text-white/60 break-all">
                  <span className="text-white/50">Invite:</span>{" "}
                  <a
                    href={milsim.invite_url}
                    className="underline decoration-white/20 hover:decoration-white/40"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {milsim.invite_url}
                  </a>
                </div>
              ) : (
                <div className="mt-1 text-sm text-white/50">
                  Discord invite is private.
                </div>
              )}

              {/* badges */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {(milsim.platforms ?? []).map((p) => (
                  <span
                    key={`plat-${p}`}
                    className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/80"
                    title="Platform"
                  >
                    {p}
                  </span>
                ))}

                {(milsim.factions ?? []).map((x) => (
                  <span
                    key={`fac-${x}`}
                    className="rounded-full border border-white/15 px-2 py-1 text-white/70"
                    title="Faction"
                  >
                    {x}
                  </span>
                ))}

                {(milsim.tags ?? []).map((x) => (
                  <span
                    key={`tag-${x}`}
                    className="rounded-full bg-white/10 px-2 py-1 text-white/70"
                    title="Tag"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* right side meta */}
          <div className="text-xs text-white/55 space-y-1 md:text-right">
            <div>
              <span className="text-white/45">Established:</span>{" "}
              {milsim.server_created_at
                ? fmtDate.format(new Date(milsim.server_created_at))
                : "—"}
            </div>

            <div>
              <span className="text-white/45">Last Discord check:</span>{" "}
              {milsim.last_checked_at
                ? fmtDateTime.format(new Date(milsim.last_checked_at))
                : "—"}
            </div>

            <div>
              <span className="text-white/45">Last activity check:</span>{" "}
              {milsim.activity_checked_at
                ? fmtDateTime.format(new Date(milsim.activity_checked_at))
                : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Members" value={milsim.members_count ?? "—"} />
        <Stat label="Online" value={milsim.online_count ?? "—"} />
        <Stat
          label="Discord Server ID"
          value={
            milsim.discord_server_id ? (
              <span className="break-all">{milsim.discord_server_id}</span>
            ) : (
              "—"
            )
          }
        />
        {showDiscordInvite ? (
          <Stat label="Invite Code" value={milsim.discord_invite_code ?? "—"} />
        ) : null}
      </div>

      {/* optional notes */}
      {milsim.claimed_founded_at || milsim.lineage_notes ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
          <div className="text-lg font-semibold">Notes</div>

          {milsim.claimed_founded_at ? (
            <div className="text-sm text-white/70">
              <span className="text-white/50">Claimed founded:</span>{" "}
              {fmtDate.format(new Date(milsim.claimed_founded_at))}
            </div>
          ) : null}

          {milsim.lineage_notes ? (
            <div className="text-sm text-white/70 whitespace-pre-wrap">
              {milsim.lineage_notes}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}