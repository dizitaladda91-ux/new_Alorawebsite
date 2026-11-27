import crypto from "crypto";
import { getCache, invalidateCacheKey, setCache } from "./cache.service.js";

const DEFAULT_SESSION_TTL_SECONDS = 24 * 60 * 60; // 24 hours
const SESSION_PREFIX = "session:";
const USER_SESSIONS_PREFIX = "user_sessions:";

export function getSessionTtlSeconds() {
  const rawExpires = process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || process.env.JWT_EXPIRES;
  if (!rawExpires) return DEFAULT_SESSION_TTL_SECONDS;

  const cleaned = String(rawExpires).trim();
  if (!isNaN(cleaned)) {
    return Math.max(60, Number(cleaned));
  }
  const match = cleaned.match(/^(\d+)([smhdw])$/i);
  if (!match) return DEFAULT_SESSION_TTL_SECONDS;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  return Math.max(60, value * (multipliers[unit] || 86400));
}

export async function createSession({ userId, role, email = "", userAgent = "", ip = "", ttlSeconds } = {}) {
  const sid = crypto.randomBytes(24).toString("hex");
  const ttl = Math.max(60, Number(ttlSeconds) || getSessionTtlSeconds());
  const now = Date.now();
  const normalizedUserId = String(userId);

  const session = {
    sid,
    userId: normalizedUserId,
    role,
    email,
    userAgent: String(userAgent || "").slice(0, 200),
    ip: String(ip || "").slice(0, 64),
    createdAt: now,
    lastSeenAt: now
  };

  await setCache(`${SESSION_PREFIX}${sid}`, session, ttl);

  const userSessionsKey = `${USER_SESSIONS_PREFIX}${normalizedUserId}`;
  const existingSids = (await getCache(userSessionsKey)) || [];
  const nextSids = [...new Set([...existingSids, sid])].slice(-20);
  await setCache(userSessionsKey, nextSids, ttl);

  return session;
}

export async function getSessionById(sid) {
  if (!sid || typeof sid !== "string") return null;
  const session = await getCache(`${SESSION_PREFIX}${sid}`);
  return session || null;
}

export async function touchSession(sid, ttlSeconds) {
  const session = await getSessionById(sid);
  if (!session) return null;

  const ttl = Math.max(60, Number(ttlSeconds) || getSessionTtlSeconds());
  const updated = {
    ...session,
    lastSeenAt: Date.now()
  };
  await setCache(`${SESSION_PREFIX}${sid}`, updated, ttl);
  return updated;
}

export async function revokeSession(sid) {
  if (!sid || typeof sid !== "string") return false;
  const session = await getSessionById(sid);
  await invalidateCacheKey(`${SESSION_PREFIX}${sid}`);

  if (session?.userId) {
    const userSessionsKey = `${USER_SESSIONS_PREFIX}${session.userId}`;
    const existingSids = await getCache(userSessionsKey);
    if (Array.isArray(existingSids)) {
      const remaining = existingSids.filter((id) => id !== sid);
      if (remaining.length > 0) {
        await setCache(userSessionsKey, remaining, getSessionTtlSeconds());
      } else {
        await invalidateCacheKey(userSessionsKey);
      }
    }
  }

  return true;
}

export async function revokeAllUserSessions(userId) {
  if (!userId) return 0;
  const normalizedUserId = String(userId);
  const userSessionsKey = `${USER_SESSIONS_PREFIX}${normalizedUserId}`;
  const existingSids = (await getCache(userSessionsKey)) || [];

  await Promise.all(existingSids.map((sid) => invalidateCacheKey(`${SESSION_PREFIX}${sid}`)));
  await invalidateCacheKey(userSessionsKey);
  return existingSids.length;
}
