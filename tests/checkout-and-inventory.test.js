import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCouponUsageQuery,
  calculateCheckoutTotals,
  findCheckoutVariant,
  getRequestedCouponCodes,
  isAlora15CouponEligible,
  normalizeCheckoutItems
} from "../backend/controllers/payment.controllers.js";
import { inventoryTrackingEnabled } from "../backend/config/inventory.js";

test("coupon usage query isolates coupons per customer email and does not block other users", () => {
  const queryAlice = buildCouponUsageQuery("alice@example.com", "WINTER20");
  const queryBob = buildCouponUsageQuery("bob@example.com", "WINTER20");

  assert.ok(queryAlice.$and, "Query must use $and to avoid overwriting $or keys");
  assert.equal(queryAlice.$and.length, 2);

  // Check that Alice's query matches Alice (case-insensitive) but not Bob
  const aliceEmailRegex = queryAlice.$and[0].$or[0]["customer.email"].$regex;
  assert.ok(aliceEmailRegex.test("alice@example.com"));
  assert.ok(aliceEmailRegex.test("ALICE@EXAMPLE.COM"));
  assert.equal(aliceEmailRegex.test("bob@example.com"), false);

  // Check that Bob's query matches Bob, not Alice
  const bobEmailRegex = queryBob.$and[0].$or[0]["customer.email"].$regex;
  assert.ok(bobEmailRegex.test("bob@example.com"));
  assert.equal(bobEmailRegex.test("alice@example.com"), false);

  // Check coupon candidates
  assert.deepEqual(queryAlice.$and[1].$or, [
    { appliedCoupons: "WINTER20" },
    { "referral.code": "WINTER20" }
  ]);
});

test("checkout totals are calculated on the server with delivery rules", () => {
  assert.deepEqual(
    calculateCheckoutTotals({ subtotal: 400, discountPercent: 10, founderHandDelivery: false }),
    { affiliateDiscount: 40, deliveryCharge: 40, founderDeliveryCharge: 0, totalAmount: 400 }
  );
  assert.deepEqual(
    calculateCheckoutTotals({ subtotal: 600, discountPercent: 10, founderHandDelivery: true }),
    { affiliateDiscount: 60, deliveryCharge: 0, founderDeliveryCharge: 5000, totalAmount: 5540 }
  );
});

test("coupon codes are normalised, deduplicated, and validated", () => {
  assert.deepEqual(
    getRequestedCouponCodes({ couponCodes: [" winter20 ", "WINTER20"], referral: { code: "ref-123" } }),
    ["WINTER20", "REF-123"]
  );
  assert.throws(() => getRequestedCouponCodes({ couponCode: "not valid!" }), /invalid/);
});

test("ALORA15 requires a subtotal strictly above ₹2,000", () => {
  assert.equal(isAlora15CouponEligible(2000), false);
  assert.equal(isAlora15CouponEligible(2000.01), true);
});

test("ALORA398 applies a ₹398 flat discount", () => {
  assert.deepEqual(
    calculateCheckoutTotals({ subtotal: 600, discountPercent: 0, flatDiscount: 398, founderHandDelivery: false }),
    { affiliateDiscount: 398, deliveryCharge: 0, founderDeliveryCharge: 0, totalAmount: 202 }
  );
  assert.equal(
    calculateCheckoutTotals({ subtotal: 300, discountPercent: 0, flatDiscount: 398, founderHandDelivery: false }).affiliateDiscount,
    300
  );
});

test("checkout item normalisation rejects invalid quantities", () => {
  assert.deepEqual(
    normalizeCheckoutItems([
      { id: "product-one__100ml", size: "100ml", qty: 2 },
      { productId: "product-two", size: "50ml", qty: 1.5 }
    ]),
    [{ productId: "product-one", variant: "100ml", quantity: 2 }]
  );
});

test("checkout item normalisation preserves underscores in product IDs", () => {
  assert.deepEqual(
    normalizeCheckoutItems([{ id: "product_with_underscore__50ml", size: "50ml", qty: 1 }]),
    [{ productId: "product_with_underscore", variant: "50ml", quantity: 1 }]
  );
});

test("checkout item normalisation recovers a variant from a legacy composite cart key", () => {
  assert.deepEqual(
    normalizeCheckoutItems([
      { id: "product_with_underscore__200ml", size: "Standard", qty: 1 },
      { productId: "product-two", id: "product-two__50ml", size: "30ml", qty: 2 }
    ]),
    [
      { productId: "product_with_underscore", variant: "200ml", quantity: 1 },
      { productId: "product-two", variant: "30ml", quantity: 2 }
    ]
  );
});

test("checkout resolves legacy Standard carts to the catalog's default variant", () => {
  const defaultVariant = { volume: "30ml", price: 599 };
  const secondVariant = { volume: "50ml", price: 799 };
  assert.equal(findCheckoutVariant([defaultVariant], "Standard"), defaultVariant);
  assert.equal(findCheckoutVariant([defaultVariant, secondVariant], "Standard"), defaultVariant);
  assert.equal(findCheckoutVariant([defaultVariant, secondVariant], "50ml"), secondVariant);
  assert.equal(findCheckoutVariant([], "Standard"), null);
});

test("inventory tracking remains disabled unless explicitly enabled", () => {
  const original = process.env.INVENTORY_TRACKING_ENABLED;
  delete process.env.INVENTORY_TRACKING_ENABLED;
  assert.equal(inventoryTrackingEnabled(), false);
  process.env.INVENTORY_TRACKING_ENABLED = "true";
  assert.equal(inventoryTrackingEnabled(), true);
  if (original === undefined) delete process.env.INVENTORY_TRACKING_ENABLED;
  else process.env.INVENTORY_TRACKING_ENABLED = original;
});
