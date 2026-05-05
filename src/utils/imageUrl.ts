/**
 * Resolve an `image` field stored on a card or collection entry to a usable URL.
 *
 * Handles:
 *  - TCGdex base path (no extension) — appends `/high.webp`.
 *  - Self-hosted full URL (Supabase, R2, etc.) — returned unchanged.
 */
export function resolveCardImageUrl(
  image: string | undefined | null,
): string | null {
  if (!image) return null;
  if (/\.(webp|png|jpe?g)$/i.test(image)) return image;
  return `${image}/high.webp`;
}
