/**
 * Byte-bounded LRU for image-proxy responses.
 * Keeps recently fetched images in RAM so the upstream CDN (TCGdex) only
 * sees one request per unique URL per server lifetime.
 */

interface Entry {
  body: Buffer;
  contentType: string;
}

const MAX_BYTES = parseInt(
  process.env.IMAGE_PROXY_CACHE_BYTES || `${200 * 1024 * 1024}`, // 200 MB
  10,
);

const store = new Map<string, Entry>();
let currentBytes = 0;

function size(entry: Entry): number {
  return entry.body.byteLength;
}

export function get(key: string): Entry | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  // Touch: move to most-recently-used end of insertion order.
  store.delete(key);
  store.set(key, entry);
  return entry;
}

export function set(key: string, entry: Entry): void {
  const existing = store.get(key);
  if (existing) {
    currentBytes -= size(existing);
    store.delete(key);
  }
  store.set(key, entry);
  currentBytes += size(entry);

  while (currentBytes > MAX_BYTES && store.size > 0) {
    const oldestKey = store.keys().next().value as string;
    const oldest = store.get(oldestKey)!;
    currentBytes -= size(oldest);
    store.delete(oldestKey);
  }
}

export function stats() {
  return {
    entries: store.size,
    bytes: currentBytes,
    maxBytes: MAX_BYTES,
  };
}

// Coalesce concurrent fetches for the same URL.
const inFlight = new Map<string, Promise<Entry>>();

export async function getOrFetch(
  url: string,
  fetcher: () => Promise<Entry>,
): Promise<{ entry: Entry; hit: boolean }> {
  const cached = get(url);
  if (cached) return { entry: cached, hit: true };

  const existing = inFlight.get(url);
  if (existing) return { entry: await existing, hit: true };

  const promise = (async () => {
    try {
      const entry = await fetcher();
      set(url, entry);
      return entry;
    } finally {
      inFlight.delete(url);
    }
  })();
  inFlight.set(url, promise);
  return { entry: await promise, hit: false };
}
