import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";
import { createWriteRequestQueue } from "../backend/services/writeRequestQueue.service.js";

const createResponse = () => {
  const response = new EventEmitter();
  response.destroyed = false;
  response.writableFinished = false;
  response.statusCode = null;
  response.headers = {};
  response.setHeader = (name, value) => {
    response.headers[name] = value;
  };
  response.status = (statusCode) => {
    response.statusCode = statusCode;
    return response;
  };
  response.json = (body) => {
    response.body = body;
    return response;
  };
  return response;
};

test("authenticated write requests acquire and release their Redis queue lock", async () => {
  const scripts = [];
  const middleware = createWriteRequestQueue({
    getRedis: () => ({
      eval: async (script, options) => {
        scripts.push(script);
        return 1;
      }
    })
  });
  const response = createResponse();
  let nextCalled = false;

  await middleware(
    { method: "PATCH", user: { id: "user-123" }, aborted: false },
    response,
    () => {
      nextCalled = true;
    }
  );

  assert.equal(nextCalled, true);
  assert.equal(scripts.length, 2);
  response.writableFinished = true;
  response.emit("finish");
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(scripts.length, 3);
});

test("writes from the same user wait until the active write releases its lock", async () => {
  let sequence = 0;
  let lockHolder = null;
  const queue = new Map();
  const redis = {
    eval: async (script, { arguments: args }) => {
      const requestId = args[0];
      if (script.includes('redis.call("INCR"')) {
        sequence += 1;
        queue.set(requestId, sequence);
        return sequence;
      }
      if (script.includes('local staleAfter =')) {
        if (lockHolder === requestId) return 1;
        const firstRequest = [...queue.entries()].sort((left, right) => left[1] - right[1])[0]?.[0];
        if (!lockHolder && firstRequest === requestId) {
          lockHolder = requestId;
          return 1;
        }
        return 0;
      }
      if (script.includes('redis.call("ZCARD"')) {
        queue.delete(requestId);
        if (lockHolder === requestId) lockHolder = null;
        return 1;
      }
      return lockHolder === requestId ? 1 : 0;
    }
  };
  const middleware = createWriteRequestQueue({
    getRedis: () => redis,
    pollIntervalMs: 1,
    heartbeatIntervalMs: 60_000
  });
  const firstResponse = createResponse();
  const secondResponse = createResponse();
  let firstNextCalled = false;
  let secondNextCalled = false;

  await middleware(
    { method: "POST", user: { id: "shared-user" }, aborted: false },
    firstResponse,
    () => {
      firstNextCalled = true;
    }
  );
  const secondRequest = middleware(
    { method: "DELETE", user: { id: "shared-user" }, aborted: false },
    secondResponse,
    () => {
      secondNextCalled = true;
    }
  );
  await new Promise(resolve => setTimeout(resolve, 5));

  assert.equal(firstNextCalled, true);
  assert.equal(secondNextCalled, false);

  firstResponse.writableFinished = true;
  firstResponse.emit("finish");
  await secondRequest;
  assert.equal(secondNextCalled, true);

  secondResponse.writableFinished = true;
  secondResponse.emit("finish");
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(queue.size, 0);
});

test("read requests bypass the Redis write queue", async () => {
  let redisRequested = false;
  let nextCalled = false;
  const middleware = createWriteRequestQueue({
    getRedis: () => {
      redisRequested = true;
      throw new Error("Redis must not be used for reads");
    }
  });

  await middleware(
    { method: "GET", user: { id: "user-123" } },
    createResponse(),
    () => {
      nextCalled = true;
    }
  );

  assert.equal(redisRequested, false);
  assert.equal(nextCalled, true);
});

test("write requests return an explicit service error when Redis is unavailable", async () => {
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    const middleware = createWriteRequestQueue({
      getRedis: () => {
        throw new Error("Upstash is not configured");
      }
    });
    const response = createResponse();
    let nextCalled = false;

    await middleware(
      { method: "POST", user: { id: "user-123" }, aborted: false },
      response,
      () => {
        nextCalled = true;
      }
    );

    assert.equal(response.statusCode, 503);
    assert.match(response.body.message, /queue is temporarily unavailable/i);
    assert.equal(nextCalled, false);
  } finally {
    console.error = originalConsoleError;
  }
});
