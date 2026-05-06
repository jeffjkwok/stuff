/**
 * Resolve an `image` field stored on a card or collection entry to a usable URL.
 *
 * Handles:
 *  - TCGdex base path (no extension) — appends `/${quality}.webp`.
 *  - Self-hosted full URL (Supabase, R2, etc.) — returned unchanged.
 */
export function resolveCardImageUrl(
  image: string | undefined | null,
  quality: "low" | "high" = "high",
): string | null {
  if (!image) return null;
  if (/\.(webp|png|jpe?g)$/i.test(image)) return image;
  return `${image}/${quality}.webp`;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export function viaImageProxy(url: string | null): string | null {
  if (!url) return null;
  // If the URL is from TCGdex assets, proxy it through our backend to cache it
  if (url.includes("assets.tcgdex.net")) {
    return `${API_BASE}/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}
