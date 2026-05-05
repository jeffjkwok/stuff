import Redis from "ioredis";

let client: Redis | null;

export function getRedisClient(): Redis {
  if (!client) {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      const url = process.env.UPSTASH_REDIS_REST_URL.replace(
        "https://",
        "rediss://",
      );
      client = new Redis(url);
    } else {
      client = new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 200, 1000);
        },
        lazyConnect: true,
      });
    }

    client.on("connect", () => console.log("[Redis] Connected to Redis"));
    client.on("error", (err) => console.error("[Redis] Error:", err.message));
  }

  return client;
}

export async function pingRedis(): Promise<{
  ok: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const reply = await getRedisClient().ping();
    return { ok: reply === "PONG", latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

const STALE_PREFIX = "stale:";
const STALE_TTL = 60 * 60 * 24 * 365; // keep stale copy ~1 year

// Dedupe concurrent fetches for the same key while one is in flight.
const inFlight = new Map<string, Promise<unknown>>();

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const redis = getRedisClient();

  // 1. Fresh cache hit
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`[Redis] HIT ${key}`);
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    console.warn(`[Redis] read failed for ${key}: ${(err as Error).message}`);
  }

  // 2. Coalesce concurrent misses on the same key
  const existing = inFlight.get(key);
  if (existing) {
    console.log(`[Redis] COALESCE ${key}`);
    return existing as Promise<T>;
  }

  // 3. Run the fetcher; on failure, fall back to stale; always clean up.
  const promise = (async (): Promise<T> => {
    try {
      console.log(`[Redis] MISS ${key} -> upstream`);
      const data = await fetcher();

      try {
        await redis
          .multi()
          .setex(key, ttlSeconds, JSON.stringify(data))
          .setex(`${STALE_PREFIX}${key}`, STALE_TTL, JSON.stringify(data))
          .exec();
      } catch (err) {
        console.warn(
          `[Redis] write failed for ${key}: ${(err as Error).message}`,
        );
      }

      return data;
    } catch (fetchErr) {
      try {
        const stale = await redis.get(`${STALE_PREFIX}${key}`);
        if (stale) {
          console.warn(
            `[Redis] STALE ${key} (upstream failed: ${(fetchErr as Error).message})`,
          );
          return JSON.parse(stale) as T;
        }
      } catch (err) {
        console.warn(
          `[Redis] stale read failed for ${key}: ${(err as Error).message}`,
        );
      }
      throw fetchErr;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}
