import Redis from "ioredis";

const DEFAULT_MAX_MEMORY_ENTRIES = 500;

class MemoryTtlCache {
  constructor(maxEntries = DEFAULT_MAX_MEMORY_ENTRIES) {
    this.maxEntries = maxEntries;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    // Refresh insertion order for basic LRU eviction
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key, value, ttlSeconds = 300) {
    const ttlMs = Math.max(1, Number(ttlSeconds) || 300) * 1000;
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  delete(key) {
    return this.store.delete(key);
  }

  deleteByPrefix(prefix) {
    let removed = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

const memoryCache = new MemoryTtlCache();
const inFlightRequests = new Map();

let redisClient = null;
let redisInitialized = false;

function getRedisClient() {
  if (redisInitialized) return redisClient;
  redisInitialized = true;

  const redisUrl = (process.env.REDIS_URL || "").trim();
  if (!redisUrl) return null;

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 1500
    });
    redisClient.on("error", (err) => {
      console.warn("Redis cache warning (falling back to memory):", err.message);
    });
  } catch (err) {
    console.warn("Redis init warning (using memory cache):", err.message);
    redisClient = null;
  }
  return redisClient;
}

export const CACHE_TTL = {
  PRODUCT_DETAIL: 300,      // 5 minutes
  PRODUCT_LIST: 600,        // 10 minutes
  SEARCH_RESULTS: 300,      // 5 minutes
  HOMEPAGE_CONTENT: 900,    // 15 minutes
  BLOG_LIST: 600,           // 10 minutes
  SITE_CONFIG: 1800         // 30 minutes
};

export async function getCache(key) {
  const memVal = memoryCache.get(key);
  if (memVal !== undefined) {
    return memVal;
  }

  const client = getRedisClient();
  if (client) {
    try {
      const raw = await client.get(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        memoryCache.set(key, parsed, 60);
        return parsed;
      }
    } catch {
      // Ignore Redis read failures and fall back to fetcher
    }
  }
  return undefined;
}

export async function setCache(key, value, ttlSeconds = 300) {
  if (value === undefined) return;
  memoryCache.set(key, value, ttlSeconds);

  const client = getRedisClient();
  if (client) {
    try {
      await client.set(key, JSON.stringify(value), "EX", Math.max(1, Math.round(ttlSeconds)));
    } catch {
      // Ignore Redis write failures
    }
  }
}

export async function getOrSetCache(key, ttlSeconds, fetcher) {
  const cached = await getCache(key);
  if (cached !== undefined) {
    return { data: cached, hit: true };
  }

  if (inFlightRequests.has(key)) {
    const data = await inFlightRequests.get(key);
    return { data, hit: true };
  }

  const promise = (async () => {
    const freshData = await fetcher();
    if (freshData !== undefined) {
      await setCache(key, freshData, ttlSeconds);
    }
    return freshData;
  })();

  inFlightRequests.set(key, promise);
  try {
    const data = await promise;
    return { data, hit: false };
  } finally {
    inFlightRequests.delete(key);
  }
}

export async function invalidateCacheKey(key) {
  memoryCache.delete(key);
  const client = getRedisClient();
  if (client) {
    try {
      await client.del(key);
    } catch {}
  }
}

export async function invalidateCachePrefix(prefix) {
  memoryCache.deleteByPrefix(prefix);
  const client = getRedisClient();
  if (client) {
    try {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await client.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } while (cursor !== "0");
    } catch {}
  }
}

export function clearAllMemoryCache() {
  memoryCache.clear();
  inFlightRequests.clear();
}

export function getCacheStats() {
  return {
    memoryEntries: memoryCache.size(),
    inFlight: inFlightRequests.size,
    redisEnabled: Boolean(getRedisClient())
  };
}
