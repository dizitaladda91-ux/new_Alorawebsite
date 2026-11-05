import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_HOMEPAGE_INGREDIENTS } from "../backend/controllers/homepageIngredients.controllers.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("homepage ingredient defaults include complete, editable guides", () => {
  const ingredients = DEFAULT_HOMEPAGE_INGREDIENTS.ingredients;
  const names = ingredients.map(ingredient => ingredient.name);

  assert.deepEqual(names, [
    "Saffron",
    "Niacinamide",
    "Hyaluronic Acid",
    "Shea Butter",
    "Salicylic Acid",
    "Walnut"
  ]);

  for (const ingredient of ingredients) {
    assert.ok(ingredient.seoTitle);
    assert.ok(ingredient.seoDescription);
    assert.ok(ingredient.shortDescription);
    assert.ok(ingredient.fullDescription);
    assert.ok(ingredient.articleIntro);
    assert.ok(ingredient.pageSections.length >= 5);
    assert.ok(ingredient.imageAlt);
    assert.ok(ingredient.productSlugs.length > 0);

    const imagePath = path.join(projectRoot, "frontend", ingredient.imageUrl.replace(/^\/static\//, "static\\"));
    assert.ok(fs.existsSync(imagePath), `${ingredient.name} image should exist`);
  }
});

test("Vercel routes ingredient guide URLs to the SSR handler", () => {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, "vercel.json"), "utf8"));
  const ingredientRoute = vercelConfig.routes.find(route => route.src === "/ingredients/[^/]+/?");

  assert.equal(ingredientRoute?.dest, "/api/index.js");
});
