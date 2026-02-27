import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { fetchDiscordInvite } from "@/lib/discord";
import { computeIconColorHex } from "@/lib/iconColor";
import { snowflakeToDate } from "@/lib/discordSnowflake";

async function submitAction(formData: FormData) {
  "use server";

  const invite_url = String(formData.get("invite_url") ?? "").trim();
  const submitted_by = String(formData.get("submitted_by") ?? "").trim() || null;

  if (!invite_url) throw new Error("Missing invite URL.");

  // 1) Fetch truth from Discord
  const discord = await fetchDiscordInvite(invite_url);

  // 2) Derive server creation date from snowflake (objective "Est.")
  const server_created_at = snowflakeToDate(discord.guildId).toISOString();

  // 3) Auto theme color from icon (down-weight white/black, first GIF frame)
  const autoColor =
    discord.iconUrl ? await computeIconColorHex(discord.iconUrl) : null;

  const theme_color = autoColor ?? "#666666";

  // 4) Insert (name overridden by Discord)
  const { error } = await supabaseServer.from("milsims").insert({
    name: discord.guildName,
    invite_url,
    discord_server_id: discord.guildId,
    discord_invite_code: discord.inviteCode,

    // icon + computed visuals
    discord_icon_url: discord.iconUrl,
    theme_color,

    // est date
    server_created_at,

    members_count: discord.members,
    online_count: discord.online,
    last_checked_at: new Date().toISOString(),

    submitted_by,
    status: "pending",
  });

  if (error) throw new Error(error.message);

  redirect("/thanks");
}

export default function SubmitPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Submit a Milsim</h1>

      <form
        action={submitAction}
        className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5"
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
            Name, icon, member counts, server creation date, and theme color are pulled automatically from Discord.
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