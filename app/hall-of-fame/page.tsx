import Link from "next/link";
import ServerIcon from "@/components/ServerIcon";
import { getHallOfFameAll } from "@/lib/milsims";

export const dynamic = "force-dynamic";

function formatAge(fromIso: string) {
  const from = new Date(fromIso);
  const now = new Date();

  // Y/M/D diff without external libs
  let years = now.getFullYear() - from.getFullYear();
  let months = now.getMonth() - from.getMonth();
  let days = now.getDate() - from.getDate();

  if (days < 0) {
    // borrow days from previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonth;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  years = Math.max(0, years);
  months = Math.max(0, months);
  days = Math.max(0, days);

  return `${years}y ${months}m ${days}d`;
}

function medalClasses(kind: "gold" | "silver" | "bronze") {
  // Neon glow via arbitrary shadows (Tailwind supports arbitrary values). :contentReference[oaicite:0]{index=0}
  if (kind === "gold") {
    return {
      ring: "border-yellow-400/60",
      glow: "shadow-[0_0_22px_rgba(250,204,21,0.35)]",
      badge: "bg-yellow-400/15 text-yellow-200 border-yellow-400/40",
      bar: "bg-yellow-400/70",
    };
  }
  if (kind === "silver") {
    return {
      ring: "border-zinc-200/50",
      glow: "shadow-[0_0_22px_rgba(228,228,231,0.28)]",
      badge: "bg-zinc-200/10 text-zinc-100 border-zinc-200/30",
      bar: "bg-zinc-200/60",
    };
  }
  return {
    ring: "border-amber-500/55",
    glow: "shadow-[0_0_22px_rgba(245,158,11,0.28)]",
    badge: "bg-amber-500/10 text-amber-200 border-amber-500/30",
    bar: "bg-amber-500/60",
  };
}

function PodiumCard({
  rank,
  name,
  iconUrl,
  createdAt,
  kind,
  heightClass,
}: {
  rank: number;
  name: string;
  iconUrl: string | null | undefined;
  createdAt: string;
  kind: "gold" | "silver" | "bronze";
  heightClass: string;
}) {
  const c = medalClasses(kind);
  return (
    <div
      className={[
        "relative flex flex-col justify-between rounded-2xl border bg-white/5 px-5 py-4",
        "backdrop-blur-sm",
        c.ring,
        c.glow,
        heightClass,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <ServerIcon url={iconUrl} name={name} />
          <div className="min-w-0">
            <div className="font-semibold truncate">{name}</div>
          </div>
        </div>

        <div
          className={[
            "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold",
            c.badge,
          ].join(" ")}
        >
          #{rank}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="text-xs text-white/60">
          <div>
            Est: <span className="text-white/80">{new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            Age: <span className="text-white/80">{formatAge(createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/55">Podium</span>
          <span className={"h-2 w-10 rounded-full " + c.bar} />
        </div>
      </div>
    </div>
  );
}

export default async function HallOfFamePage() {
  const all = await getHallOfFameAll();
  const ranked = all.filter((m) => !!m.server_created_at);

  const first = ranked[0];
  const second = ranked[1];
  const third = ranked[2];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hall of Fame</h1>
          <p className="text-sm text-white/70">
            Oldest verified Battlefront II milsims still standing (based on Discord server creation date).
          </p>
        </div>
        <Link
          href="/milsims"
          className="rounded-xl border border-white/20 px-4 py-2 text-sm hover:border-white/40"
        >
          Back to Directory
        </Link>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
        {/* Silver */}
        {second ? (
          <PodiumCard
            rank={2}
            name={second.name}
            iconUrl={second.discord_icon_url}
            createdAt={second.server_created_at!}
            kind="silver"
            heightClass="md:min-h-[170px]"
          />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/60">
            #2 — waiting…
          </div>
        )}

        {/* Gold (center, taller) */}
        {first ? (
          <PodiumCard
            rank={1}
            name={first.name}
            iconUrl={first.discord_icon_url}
            createdAt={first.server_created_at!}
            kind="gold"
            heightClass="md:min-h-[210px]"
          />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/60">
            #1 — waiting…
          </div>
        )}

        {/* Bronze */}
        {third ? (
          <PodiumCard
            rank={3}
            name={third.name}
            iconUrl={third.discord_icon_url}
            createdAt={third.server_created_at!}
            kind="bronze"
            heightClass="md:min-h-[160px]"
          />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/60">
            #3 — waiting…
          </div>
        )}
      </div>

      {/* Full ranking table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <div className="font-semibold">Full Rankings</div>
            <div className="text-xs text-white/60">
              {ranked.length} verified milsims with a known creation date.
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/30 text-white/70">
              <tr className="text-left">
                <th className="px-5 py-3 w-[80px]">Rank</th>
                <th className="px-5 py-3">Milsim</th>
                <th className="px-5 py-3 w-[140px]">Est.</th>
                <th className="px-5 py-3 w-[140px]">Age</th>
                <th className="px-5 py-3 w-[120px] text-right">Members</th>
                <th className="px-5 py-3 w-[120px] text-right">Online</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((m, idx) => (
                <tr
                  key={m.id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-5 py-3 font-semibold text-white/80">
                    #{idx + 1}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ServerIcon url={m.discord_icon_url} name={m.name} />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{m.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white/70">
                    {new Date(m.server_created_at!).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-white/70">
                    {formatAge(m.server_created_at!)}
                  </td>
                  <td className="px-5 py-3 text-right text-white/70">
                    {m.members_count ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-right text-white/70">
                    {m.online_count ?? "—"}
                  </td>
                </tr>
              ))}
              {ranked.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-white/60" colSpan={6}>
                    No verified servers with a known creation date yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 text-xs text-white/50 border-t border-white/10">
        Ranking source: Discord server creation timestamp derived from the guild snowflake.
        </div>
      </div>
    </div>
  );
}