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

  status: "pending" | "verified" | "rejected" | "private";
  submitted_by: string | null;
  moderator_notes: string | null;

  slug: string | null;

  theme_color: string | null;
  discord_icon_url: string | null;

  platforms: string[];
  factions: string[];
  tags: string[];

  activity_status: "active" | "inactive" | "unknown" | null;
  activity_checked_at: string | null;
};

export type MilsimSort = "size_desc" | "size_asc" | "age_desc" | "age_asc";
export type ActivityFilter = "active" | "inactive" | "unknown" | "any";

export type MilsimFilters = {
  q?: string;
  platforms?: string[];
  factions?: string[];
  tags?: string[];
  sort?: MilsimSort;

  // pass only real filter values; page/UI can use "any"
  activity?: Exclude<ActivityFilter, "any">;
};

function jsonArrayToStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string") as string[];
}

function cleanArray(v?: (string | null | undefined)[] | null): string[] {
  return (v ?? []).map((x) => (x ?? "").trim()).filter(Boolean);
}

/**
 * OR-semantics search via SQL RPC using array overlap (&&).
 * Requires:
 * - public.search_milsims_directory(...)
 * - public.get_milsim_directory_facets()
 */
export async function searchVerifiedMilsims(
  filters?: MilsimFilters
): Promise<DirectoryMilsim[]> {
  const payload = {
    p_q: filters?.q?.trim() || null,
    p_platforms: cleanArray(filters?.platforms) || null,
    p_factions: cleanArray(filters?.factions) || null,
    p_tags: cleanArray(filters?.tags) || null,
    p_sort: filters?.sort ?? "age_desc",
    p_activity: filters?.activity ?? "any",
  };

  const { data, error } = await supabaseServer.rpc(
    "search_milsims_directory",
    payload
  );

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    ...row,
    platforms: jsonArrayToStringArray(row.platforms),
    factions: jsonArrayToStringArray(row.factions),
    tags: jsonArrayToStringArray(row.tags),
  })) as DirectoryMilsim[];
}

export async function getMilsimDirectoryFacets(): Promise<{
  platforms: string[];
  factions: string[];
  tags: string[];
}> {
  const { data, error } = await supabaseServer.rpc("get_milsim_directory_facets");
  if (error) throw new Error(error.message);

  const obj = (data ?? {}) as any;

  return {
    platforms: Array.isArray(obj.platforms) ? obj.platforms : [],
    factions: Array.isArray(obj.factions) ? obj.factions : [],
    tags: Array.isArray(obj.tags) ? obj.tags : [],
  };
}

// --- Keep your existing refresh logic (unchanged) ---

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

  const autoColor = discord.iconUrl
    ? await computeIconColorHex(discord.iconUrl)
    : null;

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
    .eq("activity_status", "active")
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
  limit?: number;
  minAgeSeconds?: number;
}): Promise<{ refreshed: number; attempted: number }> {
  const limit = opts?.limit ?? 10;
  const minAgeSeconds = opts?.minAgeSeconds ?? 60;

  const cutoffIso = new Date(Date.now() - minAgeSeconds * 1000).toISOString();

  const { data: candidates, error } = await supabaseServer
    .from("milsims")
    .select("id, last_checked_at")
    .in("status", ["verified", "private"])
    .or(`last_checked_at.is.null,last_checked_at.lt.${cutoffIso}`)
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  let refreshed = 0;
  let attempted = 0;

  for (const row of candidates ?? []) {
    attempted++;
    try {
      await refreshMilsimFromDiscord(row.id);
      refreshed++;
    } catch {
      // ignore per-item errors
    }
  }

  return { refreshed, attempted };
}

export async function getVerifiedMilsimBySlug(
  slug: string
): Promise<DirectoryMilsim | null> {
  const { data, error } = await supabaseServer
    .from("milsim_directory")
    .select("*")
    .in("status", ["verified", "private"])
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

export async function getCronLastRunAt(): Promise<string | null> {
  const { data, error } = await supabaseServer
    .from("refresh_locks")
    .select("last_run_at")
    .eq("key", "milsims_directory_refresh")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.last_run_at ?? null;
}