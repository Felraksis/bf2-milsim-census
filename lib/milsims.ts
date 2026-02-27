import { supabaseServer } from "@/lib/supabaseServer";
import { fetchDiscordInvite } from "@/lib/discord";
import { snowflakeToDate } from "@/lib/discordSnowflake";
import { computeIconColorHex } from "@/lib/iconColor";

export type DirectoryMilsim = {
  id: string;
  name: string;
  invite_url: string;
  discord_server_id: string | null;
  discord_invite_code: string | null;

  server_created_at: string | null;
  members_count: number | null;
  online_count: number | null;
  last_checked_at: string | null;

  claimed_founded_at: string | null;
  lineage_notes: string | null;

  status: "pending" | "verified" | "rejected";
  submitted_by: string | null;
  moderator_notes: string | null;

  slug: string | null;

  theme_color: string | null;
  discord_icon_url: string | null;

  platforms: string[];
  factions: string[];
  tags: string[];
};

function jsonArrayToStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string") as string[];
}

export async function getVerifiedMilsims(q?: string): Promise<DirectoryMilsim[]> {
  let query = supabaseServer
    .from("milsim_directory")
    .select("*")
    .eq("status", "verified")
    .order("server_created_at", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (q && q.trim()) query = query.ilike("name", `%${q.trim()}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    ...row,
    platforms: jsonArrayToStringArray(row.platforms),
    factions: jsonArrayToStringArray(row.factions),
    tags: jsonArrayToStringArray(row.tags),
  })) as DirectoryMilsim[];
}

export async function refreshMilsimFromDiscord(milsimId: string): Promise<void> {
  const { data: row, error: readErr } = await supabaseServer
    .from("milsims")
    .select("id, invite_url, last_checked_at")
    .eq("id", milsimId)
    .single();

  if (readErr) throw new Error(readErr.message);
  if (!row?.invite_url) throw new Error("Milsim has no invite_url.");

  // Cooldown (30s)
  if (row.last_checked_at) {
    const last = new Date(row.last_checked_at).getTime();
    const now = Date.now();
    if (now - last < 30 * 1000) {
      throw new Error("Please wait a bit before refreshing again.");
    }
  }

  const discord = await fetchDiscordInvite(row.invite_url);
  const createdAtIso = snowflakeToDate(discord.guildId).toISOString();
  
  const autoColor =
  discord.iconUrl ? await computeIconColorHex(discord.iconUrl) : null;

  const themeColor = autoColor ?? "#666";

  const { error: updErr } = await supabaseServer
    .from("milsims")
    .update({
    name: discord.guildName,
    discord_server_id: discord.guildId,
    discord_invite_code: discord.inviteCode,
    discord_icon_url: discord.iconUrl,
    server_created_at: createdAtIso,
    members_count: discord.members,
    online_count: discord.online,
    last_checked_at: new Date().toISOString(),

    // AUTO
    theme_color: themeColor,
    })
    .eq("id", milsimId);

  if (updErr) throw new Error(updErr.message);
}

export async function getHallOfFameAll(): Promise<DirectoryMilsim[]> {
  const { data, error } = await supabaseServer
    .from("milsim_directory")
    .select("*")
    .eq("status", "verified")
    // oldest first (rank 1 is oldest)
    .order("server_created_at", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    ...row,
    platforms: jsonArrayToStringArray(row.platforms),
    factions: jsonArrayToStringArray(row.factions),
    tags: jsonArrayToStringArray(row.tags),
  })) as DirectoryMilsim[];
}

export async function refreshVerifiedMilsimsBatchFromDiscord(opts?: {
  // how many servers to refresh per cron tick
  limit?: number;
  // only refresh servers that haven't been checked in this many seconds
  minAgeSeconds?: number;
}): Promise<{ refreshed: number; attempted: number }> {
  const limit = opts?.limit ?? 10; // tune this
  const minAgeSeconds = opts?.minAgeSeconds ?? 60;

  const cutoffIso = new Date(Date.now() - minAgeSeconds * 1000).toISOString();

  // Pick candidates from the base table "milsims" (not the view),
  // because refreshMilsimFromDiscord updates "milsims".
  //
  // We want: verified AND (last_checked_at is null OR last_checked_at < cutoff)
  const { data: candidates, error } = await supabaseServer
    .from("milsims")
    .select("id, last_checked_at")
    .eq("status", "verified")
    .or(`last_checked_at.is.null,last_checked_at.lt.${cutoffIso}`)
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  let refreshed = 0;
  let attempted = 0;

  for (const row of candidates ?? []) {
    attempted++;
    try {
      // Reuse your existing logic (includes Discord fetch + icon color + update)
      await refreshMilsimFromDiscord(row.id);
      refreshed++;
    } catch {
      // Ignore individual failures so the batch continues
      // (Discord rate limits / bad invite / transient errors)
    }
  }

  return { refreshed, attempted };
}

export async function getVerifiedMilsimBySlug(slug: string): Promise<DirectoryMilsim | null> {
  const { data, error } = await supabaseServer
    .from("milsim_directory")
    .select("*")
    .eq("status", "verified")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    ...(data as any),
    platforms: jsonArrayToStringArray((data as any).platforms),
    factions: jsonArrayToStringArray((data as any).factions),
    tags: jsonArrayToStringArray((data as any).tags),
  } as DirectoryMilsim;
}