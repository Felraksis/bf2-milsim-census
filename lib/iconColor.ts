import sharp from "sharp";

type Rgb = { r: number; g: number; b: number };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function luminance01(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

// Down-weight near-black and near-white; favor mid-tones.
// Also slightly down-weight low-saturation grays.
function weightForRgb(r: number, g: number, b: number) {
  const l = luminance01(r, g, b); // 0..1
  const d = Math.abs(l - 0.5) * 2; // 0..1 distance from mid
  const p = 2.2;
  const midWeight = 1 - Math.pow(d, p); // 1 at mid, 0 at extremes

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max; // 0..1
  const satBoost = 0.65 + 0.35 * sat;

  return clamp01(midWeight * satBoost);
}

/**
 * Computes a weighted-average color from an icon URL.
 * - ignores transparent pixels
 * - downweights black/white dominance
 * - for GIFs, uses first frame (page: 0)
 */
export async function computeIconColorHex(iconUrl: string): Promise<string | null> {
  try {
    const res = await fetch(iconUrl, { cache: "no-store" });
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());

    const { data, info } = await sharp(buf, { animated: true, page: 0 })
      .ensureAlpha()
      .resize(32, 32, { fit: "inside" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels = info.channels; // 4 (RGBA)

    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let sumW = 0;

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3] / 255;

      if (a < 0.15) continue;

      const w = weightForRgb(r, g, b) * a;
      if (w <= 0) continue;

      sumR += r * w;
      sumG += g * w;
      sumB += b * w;
      sumW += w;
    }

    if (sumW <= 0) return null;

    return rgbToHex({
      r: Math.round(sumR / sumW),
      g: Math.round(sumG / sumW),
      b: Math.round(sumB / sumW),
    });
  } catch {
    return null;
  }
}