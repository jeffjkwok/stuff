import Redis from "ioredis";

let client: Redis | null;

export function getRedisClient(): Redis {
  if (!client) {
    // Check for Upstash URL first (production)
    if (process.env.UPSTASH_REDIS_REST_URL) {
      // Upstash uses REST API, convert to Redis protocol
      const url = process.env.UPSTASH_REDIS_REST_URL.replace(
        "https://",
        "rediss://",
      );
      client = new Redis(url);
    } else {
      // Local development
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

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const redis = getRedisClient();

  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`[Redis] In Cache: Retrieving ${key} from Cache`);
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    console.warn(`[Redis] Cache unavailable, fallback to API; Error: ${err}`);
  }

  console.log(`[Redis] NOT IN CACHE: Fetching ${key} from API`);

  const data = await fetcher();

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (err) {
    console.warn(`[Redis] Failed to write to cache - ${key}; Error: ${err}`);
  }

  return data;
}
