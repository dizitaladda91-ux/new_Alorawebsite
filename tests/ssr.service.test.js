import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderBlogArticleSsr, renderIngredientSsr, renderProductListSsr, renderProductSsr } from "../backend/services/ssr.service.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");

test("product SSR replaces every crawlable loading placeholder", () => {
  const template = fs.readFileSync(path.join(projectRoot, "frontend", "product.html"), "utf8");
  const html = renderProductSsr(template, {
    _id: "507f1f77bcf86cd799439011",
    slug: "purifying-glow-face-wash",
    name: "Purifying Glow Face Wash",
    description: "A gentle daily cleanser.",
    ingredients: "Saffron Extract, Salicylic Acid, Niacinamide",
    benefits: "Helps clear excess oil.",
    usageInstructions: "Massage onto damp skin and rinse.",
    category: "face",
    imagepath: "/static/face-wash.png",
    rating: 4.8,
    reviewsCount: 2,
    averageReviewRating: 4.5,
    variants: [{ volume: "200ml", price: 499, comparePrice: 599, stock: 10 }]
  });

  assert.match(html, /Purifying Glow Face Wash/);
  assert.match(html, /₹ 499/);
  assert.match(html, /<span id="reviews-count">2<\/span>/);
  assert.match(html, /"reviewCount": "2"/);
  assert.match(html, /"ratingValue": "4.5"/);
  assert.match(html, /Saffron Extract, Salicylic Acid, Niacinamide/);
  assert.doesNotMatch(html, /Loading product formulation details|Loading details|Loading benefits|Loading usage|Loading ingredients/);
});

test("product SSR omits aggregate ratings when there are no customer reviews", () => {
  const template = fs.readFileSync(path.join(projectRoot, "frontend", "product.html"), "utf8");
  const html = renderProductSsr(template, {
    _id: "507f1f77bcf86cd799439011",
    slug: "purifying-glow-face-wash",
    name: "Purifying Glow Face Wash",
    description: "A gentle daily cleanser.",
    category: "face",
    imagepath: "/static/face-wash.png",
    rating: 4.8,
    totalReviews: 1200,
    reviewsCount: 0,
    averageReviewRating: null,
    variants: [{ volume: "200ml", price: 499, comparePrice: 599, stock: 10 }]
  });

  assert.match(html, /<span id="reviews-count">0<\/span>/);
  assert.doesNotMatch(html, /"@type": "AggregateRating"/);
});

test("product list SSR displays actual review summaries and labels products with no reviews", () => {
  const html = renderProductListSsr(
    '<html><head><title>Products</title></head><body><span id="results-count"></span><div id="product-grid"></div></body></html>',
    [
      {
        _id: "product-1",
        slug: "face-wash",
        name: "Face Wash",
        category: "face",
        imagepath: "/static/face-wash.png",
        rating: 4.9,
        reviewsCount: 3,
        averageReviewRating: 4.7,
        variants: [{ volume: "100ml", price: 349, comparePrice: 499 }]
      },
      {
        _id: "product-2",
        slug: "body-lotion",
        name: "Body Lotion",
        category: "body",
        imagepath: "/static/body-lotion.png",
        rating: 4.8,
        reviewsCount: 0,
        averageReviewRating: null,
        variants: [{ volume: "200ml", price: 499, comparePrice: 699 }]
      }
    ]
  );

  assert.match(html, /4\.7 \(3\)/);
  assert.match(html, /No reviews/);
  assert.doesNotMatch(html, /4\.9/);
});

test("blog SSR includes article copy in the response HTML", () => {
  const template = fs.readFileSync(path.join(projectRoot, "frontend", "post.html"), "utf8");
  const html = renderBlogArticleSsr(template, {
    slug: "salicylic-acid-guide",
    title: "A Salicylic Acid Guide",
    metaDesc: "How salicylic acid helps oily skin.",
    category: "Skincare",
    content: "<h2>What it does</h2><p>It helps unclog pores.</p>",
    createdAt: "2026-01-01T00:00:00.000Z"
  });

  assert.match(html, /A Salicylic Acid Guide/);
  assert.match(html, /It helps unclog pores\./);
  assert.match(html, /href="#heading-1-what-it-does"/);
});

test("ingredient SSR includes the editable guide content and its sections", () => {
  const template = fs.readFileSync(path.join(projectRoot, "frontend", "ingredient.html"), "utf8");
  const html = renderIngredientSsr(template, {
    slug: "walnut",
    name: "Walnut",
    seoTitle: "Walnut in Skincare | Alora Radiance",
    seoDescription: "Learn how walnut-derived ingredients are used in exfoliating skincare.",
    shortDescription: "A plant-derived exfoliating ingredient.",
    articleIntro: "Walnut-derived ingredients are used in some rinse-off exfoliating products.",
    imageUrl: "/static/hero_banner_scrub_desk.webp",
    imageAlt: "Alora Radiance Walnut Scrub",
    pageSections: [
      { heading: "What does walnut mean in skincare?", body: "Walnut shell powder is used in some rinse-off formulas." },
      { heading: "How to use a walnut scrub gently", body: "Use light pressure and follow the product label." }
    ],
    relatedBlogs: [{
      title: "Walnut Scrubs and Gentle Exfoliation",
      slug: "walnut-scrubs-gentle-exfoliation",
      metaDesc: "What to know about walnut in skincare.",
      coverImage: "/static/hero_banner_scrub_desk.webp"
    }],
    recommendedProducts: []
  });

  assert.match(html, /Walnut in Skincare \| Alora Radiance/);
  assert.match(html, /Walnut-derived ingredients are used in some rinse-off exfoliating products/);
  assert.match(html, /What does walnut mean in skincare\?/);
  assert.match(html, /Walnut shell powder is used in some rinse-off formulas/);
  assert.match(html, /href="#ingredient-section-2"/);
  assert.match(html, /Related skincare blogs/);
  assert.match(html, /href="\/blog\/walnut-scrubs-gentle-exfoliation"/);
  assert.match(html, /What to know about walnut in skincare/);
});
