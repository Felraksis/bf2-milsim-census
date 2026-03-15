import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots: /Discordbot|Slackbot|Twitterbot|facebookexternalhit|LinkedInBot|WhatsApp/i,
};

export default nextConfig;
