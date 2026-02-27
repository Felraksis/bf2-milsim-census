// app/milsims/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVerifiedMilsimBySlug } from "@/lib/milsims";
import ServerIcon from "@/components/ServerIcon";
import CopyMilsimLink from "@/components/CopyMilsimLink";

export const dynamic = "force-dynamic";

const fmtDate = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeZone: "Europe/Berlin",
});

const fmtDateTime = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Berlin",
});

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-white/50">{label}</div>
      <div className="mt-1 text-sm text-white/80">{value}</div>
    </div>
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
          <a
            href={milsim.invite_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
            title="Open Discord invite"
          >
            Open in Discord
          </a>
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
              <h1 className="text-3xl font-bold leading-tight truncate">
                {milsim.name}
              </h1>

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

          {/* right side: small meta */}
          <div className="text-xs text-white/55 space-y-1 md:text-right">
            <div>
              <span className="text-white/45">Established:</span>{" "}
              {milsim.server_created_at
                ? fmtDate.format(new Date(milsim.server_created_at))
                : "—"}
            </div>
            <div>
              <span className="text-white/45">Last checked:</span>{" "}
              {milsim.last_checked_at
                ? fmtDateTime.format(new Date(milsim.last_checked_at))
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
          value={milsim.discord_server_id ? <span className="break-all">{milsim.discord_server_id}</span> : "—"}
        />
        <Stat
          label="Invite Code"
          value={milsim.discord_invite_code ?? "—"}
        />
      </div>

      {/* optional extra info blocks */}
      {(milsim.claimed_founded_at || milsim.lineage_notes) ? (
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