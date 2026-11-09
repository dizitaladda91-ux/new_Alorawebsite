import { randomUUID } from "node:crypto";
import { createClient } from "redis";

const QUEUE_WAIT_TIMEOUT_MS = 30_000;
const LOCK_TTL_MS = 120_000;
const STALE_REQUEST_MS = 120_000;
const QUEUE_KEY_TTL_MS = 24 * 60 * 60 * 1000;
const POLL_INTERVAL_MS = 250;
const HEARTBEAT_INTERVAL_MS = 20_000;
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const ENQUEUE_SCRIPT = `
  local redisTime = redis.call("TIME")
  local now = tonumber(redisTime[1]) * 1000 + math.floor(tonumber(redisTime[2]) / 1000)
  local sequence = redis.call("INCR", KEYS[1])
  redis.call("ZADD", KEYS[2], sequence, ARGV[1])
  redis.call("HSET", KEYS[3], ARGV[1], now)
  redis.call("PEXPIRE", KEYS[1], ARGV[2])
  redis.call("PEXPIRE", KEYS[2], ARGV[2])
  redis.call("PEXPIRE", KEYS[3], ARGV[2])
  return sequence
`;

const ACQUIRE_SCRIPT = `
  local redisTime = redis.call("TIME")
  local now = tonumber(redisTime[1]) * 1000 + math.floor(tonumber(redisTime[2]) / 1000)
  local staleAfter = tonumber(ARGV[2])
  local lockTtl = tonumber(ARGV[3])
  local keyTtl = tonumber(ARGV[4])
  local lockHolder = redis.call("GET", KEYS[3])
  local members = redis.call("ZRANGE", KEYS[1], 0, -1)

  for _, member in ipairs(members) do
    local lastSeen = tonumber(redis.call("HGET", KEYS[2], member) or "0")
    if now - lastSeen > staleAfter then
      if member == lockHolder then
        redis.call("DEL", KEYS[3])
        lockHolder = false
      end
      redis.call("ZREM", KEYS[1], member)
      redis.call("HDEL", KEYS[2], member)
    end
  end

  if not redis.call("ZSCORE", KEYS[1], ARGV[1]) then
    return -1
  end

  lockHolder = redis.call("GET", KEYS[3])
  if lockHolder == ARGV[1] then
    redis.call("PEXPIRE", KEYS[3], lockTtl)
    redis.call("HSET", KEYS[2], ARGV[1], now)
    return 1
  end

  local first = redis.call("ZRANGE", KEYS[1], 0, 0)
  if not lockHolder and first[1] == ARGV[1] then
    redis.call("SET", KEYS[3], ARGV[1], "PX", lockTtl)
    redis.call("HSET", KEYS[2], ARGV[1], now)
    redis.call("PEXPIRE", KEYS[1], keyTtl)
    redis.call("PEXPIRE", KEYS[2], keyTtl)
    return 1
  end

  redis.call("HSET", KEYS[2], ARGV[1], now)
  redis.call("PEXPIRE", KEYS[1], keyTtl)
  redis.call("PEXPIRE", KEYS[2], keyTtl)
  return 0
`;

const RENEW_SCRIPT = `
  local redisTime = redis.call("TIME")
  local now = tonumber(redisTime[1]) * 1000 + math.floor(tonumber(redisTime[2]) / 1000)
  if redis.call("GET", KEYS[3]) ~= ARGV[1] then
    return 0
  end
  redis.call("PEXPIRE", KEYS[3], ARGV[2])
  redis.call("HSET", KEYS[2], ARGV[1], now)
  redis.call("PEXPIRE", KEYS[1], ARGV[3])
  redis.call("PEXPIRE", KEYS[2], ARGV[3])
  return 1
`;

const RELEASE_SCRIPT = `
  if redis.call("GET", KEYS[3]) == ARGV[1] then
    redis.call("DEL", KEYS[3])
  end
  redis.call("ZREM", KEYS[1], ARGV[1])
  redis.call("HDEL", KEYS[2], ARGV[1])
  if redis.call("ZCARD", KEYS[1]) == 0 then
    redis.call("DEL", KEYS[1], KEYS[2], KEYS[4])
  end
  return 1
`;

let redisClient;
let redisConnection;

const getRedisClient = async () => {
  if (!redisClient) {
    const configuredUrl = process.env.REDIS_URL?.trim();
    if (!configuredUrl) {
      throw new Error("Redis Cloud is not configured. Set REDIS_URL to your Redis connection string.");
    }

    // Redis Cloud sometimes shows a CLI command (`redis-cli -u <url>`).
    // Environment variables must contain only the URL, but strip the command
    // prefix defensively so a copied command does not cause ERR_INVALID_URL.
    const url = configuredUrl.replace(/^redis-cli\s+-u\s+/i, "").trim();
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error("REDIS_URL must contain only a valid Redis URL, such as rediss://default:<password>@<host>:<port> (without `redis-cli -u`).");
    }
    if (parsedUrl.protocol !== "redis:" && parsedUrl.protocol !== "rediss:") {
      throw new Error("REDIS_URL must use the redis:// or rediss:// protocol.");
    }

    redisClient = createClient({ url });
    redisClient.on("error", (error) => {
      console.error("Redis Cloud connection error:", error);
    });
  }

  if (!redisClient.isOpen) {
    if (!redisConnection) {
      redisConnection = redisClient.connect().catch((error) => {
        redisConnection = null;
        throw error;
      });
    }
    await redisConnection;
  }

  return redisClient;
};

const wait = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));
const evalScript = (redis, script, keys, args) => redis.eval(script, {
  keys,
  arguments: args.map(String)
});

export const createWriteRequestQueue = ({
  getRedis = getRedisClient,
  waitTimeoutMs = QUEUE_WAIT_TIMEOUT_MS,
  pollIntervalMs = POLL_INTERVAL_MS,
  lockTtlMs = LOCK_TTL_MS,
  staleRequestMs = STALE_REQUEST_MS,
  heartbeatIntervalMs = HEARTBEAT_INTERVAL_MS,
  keyTtlMs = QUEUE_KEY_TTL_MS
} = {}) => async (req, res, next) => {
  if (!WRITE_METHODS.has(req.method)) return next();

  const userId = String(req.user?.id || req.user?._id || "");
  if (!userId) {
    return res.status(500).json({ success: false, message: "Could not identify the authenticated user for request queueing." });
  }

  const queueKey = `alora:write-queue:{${userId}}`;
  const heartbeatKey = `${queueKey}:heartbeat`;
  const lockKey = `${queueKey}:lock`;
  const sequenceKey = `${queueKey}:sequence`;
  const requestId = randomUUID();
  const keys = [queueKey, heartbeatKey, lockKey, sequenceKey];
  let redis;
  let queued = false;
  let acquired = false;

  const removeFromQueue = async () => {
    try {
      await evalScript(redis, RELEASE_SCRIPT, keys, [requestId]);
    } catch (error) {
      console.error("Could not release authenticated write request from Redis queue:", error);
    }
  };

  try {
    redis = await getRedis();
    await evalScript(redis, ENQUEUE_SCRIPT, [sequenceKey, queueKey, heartbeatKey], [
      requestId,
      keyTtlMs
    ]);
    queued = true;

    const deadline = Date.now() + waitTimeoutMs;
    while (Date.now() < deadline) {
      if (req.aborted || res.destroyed) {
        await removeFromQueue();
        return;
      }

      const result = Number(await evalScript(redis, ACQUIRE_SCRIPT, keys.slice(0, 3), [
        requestId,
        staleRequestMs,
        lockTtlMs,
        keyTtlMs
      ]));

      if (result === 1) {
        acquired = true;
        break;
      }
      if (result === -1) {
        throw new Error("Request expired from the Redis queue before acquiring its lock.");
      }
      await wait(pollIntervalMs);
    }

    if (!acquired) {
      await removeFromQueue();
      queued = false;
      if (res.destroyed) return;
      res.setHeader("Retry-After", "2");
      return res.status(503).json({
        success: false,
        message: "Your previous request is still processing. Please retry shortly."
      });
    }
  } catch (error) {
    if (queued) await removeFromQueue();
    console.error("Authenticated write request could not be queued:", error);
    if (res.destroyed) return;
    return res.status(503).json({
      success: false,
      message: "The request queue is temporarily unavailable. Please try again shortly."
    });
  }

  let heartbeatFailureLogged = false;
  const heartbeat = setInterval(async () => {
    try {
      const renewed = Number(await evalScript(redis, RENEW_SCRIPT, keys.slice(0, 3), [
        requestId,
        lockTtlMs,
        keyTtlMs
      ]));
      if (!renewed) {
        if (!heartbeatFailureLogged) {
          console.error("Redis request-queue lock was lost while an authenticated write was running.");
          heartbeatFailureLogged = true;
        }
      } else {
        heartbeatFailureLogged = false;
      }
    } catch (error) {
      if (!heartbeatFailureLogged) {
        console.error("Could not renew authenticated write request lock:", error);
        heartbeatFailureLogged = true;
      }
    }
  }, heartbeatIntervalMs);
  heartbeat.unref?.();

  let released = false;
  const release = async () => {
    if (released) return;
    released = true;
    clearInterval(heartbeat);
    await removeFromQueue();
  };

  res.once("finish", release);
  res.once("close", () => {
    if (res.writableFinished) {
      release();
    } else {
      clearInterval(heartbeat);
    }
  });

  return next();
};

export const queueAuthenticatedWrite = createWriteRequestQueue();
