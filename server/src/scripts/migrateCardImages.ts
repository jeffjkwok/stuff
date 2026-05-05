/**
 * One-shot backfill: walk MyCollection, mirror every TCGdex image into
 * Supabase Storage, and rewrite the image cell to the Supabase URL.
 *
 * Idempotent — safe to re-run. Rows whose image is already a Supabase URL
 * (or empty) are skipped.
 *
 * Usage:  yarn migrate-images
 */
import "dotenv/config";
import { getCollection, updateCell } from "../googleSheets.js";
import { ensureCardImage, isSupabaseConfigured } from "../storage/supabase.js";

async function main() {
  if (!isSupabaseConfigured()) {
    console.error(
      "Supabase env not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    );
    process.exit(1);
  }

  const { collection } = await getCollection();
  const supabaseHost = new URL(process.env.SUPABASE_URL!).host;

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of collection) {
    if (!entry.card_id || !entry.image) {
      skipped++;
      continue;
    }
    if (entry.image.includes(supabaseHost)) {
      skipped++;
      continue;
    }

    try {
      const newUrl = await ensureCardImage(entry.card_id, entry.image);
      await updateCell(entry.dex_number, "H", newUrl);
      console.log(`[OK] #${entry.dex_number} ${entry.card_name} -> ${newUrl}`);
      migrated++;
    } catch (err) {
      console.error(
        `[FAIL] #${entry.dex_number} ${entry.card_name}:`,
        (err as Error).message,
      );
      failed++;
    }
  }

  console.log(
    `\nDone. migrated=${migrated} skipped=${skipped} failed=${failed}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
