import assert from "node:assert/strict";
import test from "node:test";
import { sanitizePlainText } from "../backend/services/contentSanitizer.service.js";

test("sanitizePlainText strips HTML tags without decoding entity-encoded markup", () => {
  const encodedMarkup = "&lt;img src=x onerror=alert(1)&gt;";
  const sanitized = sanitizePlainText(encodedMarkup);

  assert.equal(sanitized, encodedMarkup);
  assert.doesNotMatch(sanitized, /<\s*img\b/i);
});

test("sanitizePlainText continues to strip actual HTML tags", () => {
  assert.equal(sanitizePlainText("<img src=x onerror=alert(1)>hello"), "hello");
});
