import test from "node:test";
import assert from "node:assert/strict";
import {
  CACHE_TTL,
  clearAllMemoryCache,
  getCache,
  getOrSetCache,
  invalidateCacheKey,
  invalidateCachePrefix,
  setCache
} from "../backend/services/cache.service.js";

test("cache stores and retrieves values before TTL expiration", async () => {
  clearAllMemoryCache();
  await setCache("test:item", { name: "Serum" }, 60);
  const val = await getCache("test:item");
  assert.deepEqual(val, { name: "Serum" });
});

test("getOrSetCache deduplicates concurrent fetches and returns HIT on subsequent call", async () => {
  clearAllMemoryCache();
  let dbCalls = 0;
  const fetcher = async () => {
    dbCalls++;
    await new Promise((r) => setTimeout(r, 15));
    return { products: [1, 2, 3] };
  };

  const [first, second] = await Promise.all([
    getOrSetCache("products:all:live", CACHE_TTL.PRODUCT_LIST, fetcher),
    getOrSetCache("products:all:live", CACHE_TTL.PRODUCT_LIST, fetcher)
  ]);

  assert.equal(dbCalls, 1);
  assert.deepEqual(first.data, { products: [1, 2, 3] });
  assert.deepEqual(second.data, { products: [1, 2, 3] });

  const third = await getOrSetCache("products:all:live", CACHE_TTL.PRODUCT_LIST, fetcher);
  assert.equal(third.hit, true);
  assert.equal(dbCalls, 1);
});

test("invalidateCachePrefix and invalidateCacheKey clear matching entries", async () => {
  clearAllMemoryCache();
  await setCache("products:all:live", [1], 60);
  await setCache("products:search:serum", [2], 60);
  await setCache("config:site", { ok: true }, 60);

  await invalidateCachePrefix("products:");
  assert.equal(await getCache("products:all:live"), undefined);
  assert.equal(await getCache("products:search:serum"), undefined);
  assert.deepEqual(await getCache("config:site"), { ok: true });

  await invalidateCacheKey("config:site");
  assert.equal(await getCache("config:site"), undefined);
});
