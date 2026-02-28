// lib/roadmap.ts
import { supabaseServer } from "@/lib/supabaseServer";

export type RoadmapStatus = "planned" | "in_progress" | "done" | "blocked";
export type RoadmapPriority = "low" | "medium" | "high" | "critical";
export type RoadmapCategory =
  | "directory"
  | "discord_sync"
  | "moderation"
  | "ui_ux"
  | "api"
  | "seo"
  | "infrastructure"
  | "other";

export type RoadmapItem = {
  id: string;
  title: string;
  description: string | null;
  status: RoadmapStatus;
  priority: RoadmapPriority;
  category: RoadmapCategory;
  sort_order: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export async function getPublicRoadmapItems(): Promise<RoadmapItem[]> {
  const { data, error } = await supabaseServer
    .from("roadmap_items")
    .select("*")
    .eq("is_public", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as RoadmapItem[];
}