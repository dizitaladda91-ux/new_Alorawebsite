import test from "node:test";
import assert from "node:assert/strict";
import { clearAllMemoryCache } from "../backend/services/cache.service.js";
import {
  createSession,
  getSessionById,
  revokeAllUserSessions,
  revokeSession,
  touchSession
} from "../backend/services/session.service.js";

test("createSession stores session and getSessionById retrieves it", async () => {
  clearAllMemoryCache();
  const session = await createSession({
    userId: "user_123",
    role: "user",
    email: "user@example.com",
    userAgent: "TestBrowser/1.0",
    ip: "127.0.0.1",
    ttlSeconds: 3600
  });

  assert.ok(session.sid);
  const fetched = await getSessionById(session.sid);
  assert.equal(fetched.userId, "user_123");
  assert.equal(fetched.role, "user");
  assert.equal(fetched.email, "user@example.com");
});

test("touchSession updates lastSeenAt without losing user data", async () => {
  clearAllMemoryCache();
  const session = await createSession({ userId: "user_456", role: "admin", ttlSeconds: 3600 });
  await new Promise((r) => setTimeout(r, 10));
  const touched = await touchSession(session.sid, 3600);

  assert.ok(touched.lastSeenAt >= session.lastSeenAt);
  assert.equal(touched.userId, "user_456");
});

test("revokeSession immediately invalidates a single session", async () => {
  clearAllMemoryCache();
  const s1 = await createSession({ userId: "user_789", role: "user", ttlSeconds: 3600 });
  const s2 = await createSession({ userId: "user_789", role: "user", ttlSeconds: 3600 });

  await revokeSession(s1.sid);
  assert.equal(await getSessionById(s1.sid), null);
  assert.equal((await getSessionById(s2.sid)).userId, "user_789");
});

test("revokeAllUserSessions clears all sessions for a user without affecting others", async () => {
  clearAllMemoryCache();
  const u1a = await createSession({ userId: "user_A", role: "user", ttlSeconds: 3600 });
  const u1b = await createSession({ userId: "user_A", role: "user", ttlSeconds: 3600 });
  const u2 = await createSession({ userId: "user_B", role: "user", ttlSeconds: 3600 });

  const revokedCount = await revokeAllUserSessions("user_A");
  assert.equal(revokedCount, 2);
  assert.equal(await getSessionById(u1a.sid), null);
  assert.equal(await getSessionById(u1b.sid), null);
  assert.equal((await getSessionById(u2.sid)).userId, "user_B");
});
