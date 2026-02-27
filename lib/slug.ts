// lib/slug.ts
export function slugifyMilsimName(name: string): string {
  // "The 168th Legion" -> "The_168th_Legion"
  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_]/g, "") // keep it simple; adjust if you want dashes/unicode
    .replace(/_+/g, "_");
}

export function isProbablySlug(s: string): boolean {
  return /^[A-Za-z0-9_]+$/.test(s);
}