import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || "card-images";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase env missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required",
    );
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return client;
}

function publicUrlFor(path: string): string {
  return getClient().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Idempotently mirror a TCGdex card image into Supabase Storage.
 * Returns the public URL on Supabase. Safe to call repeatedly.
 *
 * `tcgdexBaseUrl` is the bare TCGdex asset path (e.g.
 * "https://assets.tcgdex.net/en/swsh/swsh4/123") — `/high.webp` is appended.
 */
export async function ensureCardImage(
  cardId: string,
  tcgdexBaseUrl: string,
): Promise<string> {
  const path = `cards/${cardId}.webp`;
  const url = publicUrlFor(path);

  // Cheap existence check; avoids re-uploading on every assign.
  const head = await fetch(url, { method: "HEAD" });
  if (head.ok) return url;

  const sourceUrl = `${tcgdexBaseUrl}/high.webp`;
  const source = await fetch(sourceUrl);
  if (!source.ok) {
    throw new Error(
      `TCGdex image fetch failed (${source.status}) for ${sourceUrl}`,
    );
  }
  const buffer = Buffer.from(await source.arrayBuffer());

  const { error } = await getClient()
    .storage.from(BUCKET)
    .upload(path, buffer, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "31536000",
    });
  if (error) {
    throw new Error(`Supabase upload failed for ${path}: ${error.message}`);
  }

  console.log(`[Supabase] uploaded ${path} (${buffer.byteLength} bytes)`);
  return url;
}

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}
