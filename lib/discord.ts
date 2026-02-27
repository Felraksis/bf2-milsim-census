export type DiscordInviteData = {
  inviteCode: string;
  guildId: string;
  guildName: string;
  iconHash: string | null;
  iconUrl: string | null;
  members: number | null;
  online: number | null;
};

function extractInviteCode(inviteUrl: string): string {
  const url = inviteUrl.trim();

  // Supports:
  // - https://discord.gg/CODE
  // - https://discord.com/invite/CODE
  // - https://discordapp.com/invite/CODE
  // - CODE (optional, if someone pastes only the code)
  const m =
    url.match(/discord\.gg\/([a-zA-Z0-9-]+)/i) ||
    url.match(/discord(?:app)?\.com\/invite\/([a-zA-Z0-9-]+)/i) ||
    url.match(/^([a-zA-Z0-9-]+)$/i);

  if (!m) throw new Error("Invalid Discord invite link");
  return m[1];
}

function buildGuildIconUrl(
  guildId: string,
  iconHash: string | null,
  size = 128
): string | null {
  if (!iconHash) return null;

  const ext = iconHash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=${size}`;
}

export async function fetchDiscordInvite(
  inviteUrl: string
): Promise<DiscordInviteData> {
  const inviteCode = extractInviteCode(inviteUrl);

  const res = await fetch(
    `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(
      `Invite lookup failed (HTTP ${res.status}). Is the invite valid/public?`
    );
  }

  const data: any = await res.json();

  const guildId = data.guild?.id;
  const guildName = data.guild?.name;
  const iconHash = data.guild?.icon ?? null;

  if (!guildId || !guildName) {
    throw new Error("Discord returned incomplete guild data.");
  }

  return {
    inviteCode,
    guildId,
    guildName,
    iconHash,
    iconUrl: buildGuildIconUrl(guildId, iconHash, 128),
    members: typeof data.approximate_member_count === "number" ? data.approximate_member_count : null,
    online: typeof data.approximate_presence_count === "number" ? data.approximate_presence_count : null,
  };
}