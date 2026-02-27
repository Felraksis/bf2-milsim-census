const DISCORD_EPOCH_MS = 1420070400000n; // 2015-01-01T00:00:00.000Z

export function snowflakeToDate(snowflake: string): Date {
  const id = BigInt(snowflake);
  const ms = (id >> 22n) + DISCORD_EPOCH_MS;
  return new Date(Number(ms));
}