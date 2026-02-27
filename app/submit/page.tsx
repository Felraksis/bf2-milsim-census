import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { fetchDiscordInvite } from "@/lib/discord";

const PLATFORM_OPTIONS = [
  { code: "pc", label: "PC", dot: "🔴" },
  { code: "xbox", label: "Xbox", dot: "🟢" },
  { code: "psn", label: "PSN", dot: "🔵" },
] as const;

function normalizePlatforms(values: FormDataEntryValue[] | FormDataEntryValue | null): string[] {
  const arr = Array.isArray(values) ? values : values ? [values] : [];
  const cleaned = arr
    .map((v) => String(v).trim().toLowerCase())
    .filter(Boolean);

  // keep only allowed
  const allowed = new Set(PLATFORM_OPTIONS.map((p) => p.code));
  return Array.from(new Set(cleaned.filter((c) => allowed.has(c))));
}

async function submitAction(formData: FormData) {
  "use server";

  const invite_url = String(formData.get("invite_url") ?? "").trim();
  const submitted_by = String(formData.get("submitted_by") ?? "").trim() || null;

  // multi checkbox name="platforms"
  const platforms = normalizePlatforms(formData.getAll("platforms"));

  if (!invite_url) throw new Error("Missing invite URL.");

  // 1) Fetch truth from Discord
  const discord = await fetchDiscordInvite(invite_url);

  // 2) Insert milsim row first
  const { data: inserted, error: insErr } = await supabaseServer
    .from("milsims")
    .insert({
      name: discord.guildName,
      invite_url,
      discord_server_id: discord.guildId,
      discord_invite_code: discord.inviteCode,
      discord_icon_url: discord.iconUrl,

      // counts
      members_count: discord.members,
      online_count: discord.online,
      last_checked_at: new Date().toISOString(),

      // auto theme color is handled in refresh or your insert logic elsewhere
      // if you want it here too, add computeIconColorHex like before.
      // theme_color: ...

      submitted_by,
      status: "pending",
    })
    .select("id")
    .single();

  if (insErr) throw new Error(insErr.message);
  const milsimId = inserted.id as string;

  // 3) Insert platform links (optional)
  if (platforms.length > 0) {
    // fetch platform ids by code
    const { data: platRows, error: platErr } = await supabaseServer
      .from("platforms")
      .select("id, code")
      .in("code", platforms);

    if (platErr) throw new Error(platErr.message);

    const links =
      (platRows ?? []).map((p: any) => ({
        milsim_id: milsimId,
        platform_id: p.id,
      })) ?? [];

    if (links.length > 0) {
      const { error: linkErr } = await supabaseServer.from("milsim_platforms").insert(links);
      if (linkErr) throw new Error(linkErr.message);
    }
  }

  redirect("/thanks");
}

export default function SubmitPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Submit a Milsim</h1>

      <form
        action={submitAction}
        className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5"
      >
        <div>
          <label className="text-xs text-white/60">Permanent invite URL</label>
          <input
            name="invite_url"
            required
            placeholder="https://discord.gg/xxxx"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-white/50">
            Name, icon, and member counts are pulled automatically from Discord.
          </p>
        </div>

        <div>
          <div className="text-xs text-white/60 mb-2">Platforms</div>
          <div className="flex flex-wrap gap-3">
            {PLATFORM_OPTIONS.map((p) => (
              <label
                key={p.code}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:border-white/20 cursor-pointer"
              >
                <input type="checkbox" name="platforms" value={p.code} />
                <span>{p.dot}</span>
                <span>{p.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-white/50">
            Select all platforms your milsim supports.
          </p>
        </div>

        <div>
          <label className="text-xs text-white/60">Contact (optional)</label>
          <input
            name="submitted_by"
            placeholder="Discord: user / @handle"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
          />
        </div>

        <button className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90">
          Submit
        </button>
      </form>
    </div>
  );
}