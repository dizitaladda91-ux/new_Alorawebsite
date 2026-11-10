// Security Middleware for Antigravity Enterprise Protection
import { rateLimit } from "express-rate-limit";
import { createClient } from "redis";

let redisRateLimitClient;
let redisRateLimitConnection;
let nextRateLimiterId = 1;

const getRedisRateLimitClient = async () => {
    const configuredUrl = process.env.REDIS_URL?.trim();
    if (!configuredUrl) return null;
    if (!redisRateLimitClient) {
        redisRateLimitClient = createClient({ url: configuredUrl.replace(/^redis-cli\s+-u\s+/i, "").trim() });
        redisRateLimitClient.on("error", (error) => console.error("Rate limit Redis error:", error.message));
    }
    if (!redisRateLimitClient.isOpen) {
        if (!redisRateLimitConnection) {
            redisRateLimitConnection = redisRateLimitClient.connect().catch((error) => {
                redisRateLimitConnection = null;
                throw error;
            });
        }
        await redisRateLimitConnection;
    }
    return redisRateLimitClient;
};

const createRedisStore = (prefix, windowMs) => ({
    localKeys: false,
    init() {},
    async increment(key) {
        const client = await getRedisRateLimitClient();
        if (!client) throw new Error("Redis rate limit store is not configured.");
        const redisKey = `${prefix}:${key}`;
        const [totalHits, timeToExpire] = await client.eval(
            "local hits = redis.call('INCR', KEYS[1]); local ttl = redis.call('PTTL', KEYS[1]); if hits == 1 or ttl < 0 then redis.call('PEXPIRE', KEYS[1], ARGV[1]); ttl = ARGV[1]; end; return {hits, ttl};",
            { keys: [redisKey], arguments: [String(windowMs)] }
        );
        return { totalHits: Number(totalHits), resetTime: new Date(Date.now() + Number(timeToExpire)) };
    },
    async decrement(key) {
        const client = await getRedisRateLimitClient();
        if (client) await client.decr(`${prefix}:${key}`);
    },
    async resetKey(key) {
        const client = await getRedisRateLimitClient();
        if (client) await client.del(`${prefix}:${key}`);
    },
    async get(key) {
        const client = await getRedisRateLimitClient();
        if (!client) return undefined;
        const redisKey = `${prefix}:${key}`;
        const [count, ttl] = await Promise.all([client.get(redisKey), client.pTTL(redisKey)]);
        if (count === null) return undefined;
        return { totalHits: Number(count), resetTime: new Date(Date.now() + Math.max(0, ttl)) };
    },
    async shutdown() {}
});

// 1. Security Headers Middleware (Clickjacking, XSS, MIME Sniffing Protection)
export const setSecurityHeaders = (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    if (req.secure || req.headers["x-forwarded-proto"] === "https") {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
};

// 2. Anti-NoSQL Query Injection Middleware (Express 5 Compatible)
export const sanitizeNoSql = (req, res, next) => {
    const sanitizeInPlace = (obj) => {
        if (!obj || typeof obj !== "object") return;
        for (const key of Object.keys(obj)) {
            if (key.startsWith("$") || key.includes(".")) {
                const cleanKey = key.replace(/^\$|\./g, "");
                obj[cleanKey] = obj[key];
                delete obj[key];
            }
            if (typeof obj[key] === "object" && obj[key] !== null) {
                sanitizeInPlace(obj[key]);
            }
        }
    };

    try {
        if (req.body) sanitizeInPlace(req.body);
        if (req.query) sanitizeInPlace(req.query);
        if (req.params) sanitizeInPlace(req.params);
    } catch (e) {
        console.warn("Sanitization warning:", e);
    }

    next();
};

// 3. Dynamic Rate Limiter Middleware (Anti-DDoS, Anti-BruteForce - Generous Limits)
export const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 500, message = "Too many requests. Please try again later.", skipLocal = true, skip = null } = {}) => {
    const limiterId = nextRateLimiterId++;
    return rateLimit({
        windowMs,
        limit: max,
        ...(process.env.REDIS_URL?.trim() ? { store: createRedisStore(`rate-limit:${limiterId}`, windowMs) } : {}),
        standardHeaders: "draft-8",
        legacyHeaders: false,
        skip: (req) => {
            if (typeof skip === "function" && skip(req)) return true;
            if (!skipLocal) return false;
            const clientIp = String(req.ip || req.socket?.remoteAddress || "").toLowerCase();
            return ["::1", "127.0.0.1", "::ffff:127.0.0.1", "localhost"].includes(clientIp);
        },
        handler: (req, res) => {
            const retryAfterSeconds = Math.max(1, Math.ceil((req.rateLimit?.resetTime?.getTime?.() - Date.now()) / 1000) || Math.ceil(windowMs / 1000));
            res.setHeader("Retry-After", retryAfterSeconds);
            res.status(429).json({ success: false, message, retryAfterSeconds });
        }
    });
};
