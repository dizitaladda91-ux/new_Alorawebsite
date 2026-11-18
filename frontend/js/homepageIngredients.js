import BASE_URL, { getImageUrl } from "./config.js";

const section = document.getElementById("ingredients-discovery");
const ingredientGrid = document.getElementById("ingredients-discovery-grid");

const slugify = value => String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function createIngredientCard(ingredient) {
    const slug = ingredient.slug || slugify(ingredient.name);
    const card = document.createElement("article");
    card.className = "group relative overflow-hidden rounded-2xl bg-[#E8DEC8]";

    const image = document.createElement("img");
    image.src = getImageUrl(ingredient.imageUrl, "/static/placeholder.png");
    image.alt = ingredient.imageAlt || ingredient.name || "";
    image.loading = "lazy";
    image.decoding = "async";
    image.className = "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105";

    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0";
    overlay.style.background = "linear-gradient(to top, rgba(30, 20, 14, 0.92) 0%, rgba(30, 20, 14, 0.75) 40%, rgba(30, 20, 14, 0.35) 70%, rgba(30, 20, 14, 0.10) 100%)";
    overlay.style.zIndex = "1";

    const content = document.createElement("div");
    content.className = "absolute inset-x-0 bottom-0 p-4 text-white sm:p-6";
    content.style.zIndex = "2";

    const title = document.createElement("h3");
    title.className = "line-clamp-2 font-heading text-xl font-bold leading-tight text-white sm:text-3xl";
    title.style.textShadow = "0 2px 6px rgba(0, 0, 0, 0.4)";
    title.textContent = ingredient.name || "Ingredient";
    const summary = document.createElement("p");
    summary.className = "mt-2 line-clamp-2 text-sm leading-snug";
    summary.style.color = "#F5EDE3";
    summary.style.textShadow = "0 1px 3px rgba(0, 0, 0, 0.45)";
    summary.textContent = ingredient.shortDescription || "";
    const link = document.createElement("a");
    link.href = `/ingredients/${encodeURIComponent(slug)}`;
    link.className = "ingredient-read-more mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
    link.style.backgroundColor = "#E8A33D";
    link.style.color = "#2B1E16";
    link.textContent = "Read More";
    link.setAttribute("aria-label", `Read more about ${ingredient.name || "this ingredient"}`);

    content.append(title, summary, link);
    card.append(image, overlay, content);
    return card;
}

async function loadHomepageIngredients() {
    if (!section || !ingredientGrid) return;

    try {
        const response = await fetch(`${BASE_URL}/api/homepage-ingredients`, { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`Homepage content request failed (${response.status}).`);
        }

        const result = await response.json();
        if (!result.success || !result.data) {
            throw new Error(result.message || "Homepage content was not available.");
        }

        const content = result.data;
        if (content.isEnabled === false) {
            section.hidden = true;
            return;
        }

        const ingredients = Array.isArray(content.ingredients) ? content.ingredients : [];
        document.getElementById("ingredients-discovery-eyebrow").textContent = content.eyebrow || "Discover";
        document.getElementById("ingredients-discovery-heading").textContent = content.heading || "Skin-Saving Actives";
        document.getElementById("ingredients-discovery-link-text").textContent = content.buttonText || "Explore our Ingredients";

        const link = document.getElementById("ingredients-discovery-link");
        if (link && typeof content.buttonUrl === "string") link.href = content.buttonUrl;

        ingredientGrid.replaceChildren(...ingredients.map(createIngredientCard));
        if (!ingredients.length) {
            const emptyState = document.createElement("p");
            emptyState.className = "col-span-full text-sm text-[#3B2418]/65";
            emptyState.textContent = "Ingredient details are coming soon.";
            ingredientGrid.append(emptyState);
        }
    } catch (error) {
        console.error("Could not load homepage ingredient content:", error);
        ingredientGrid.replaceChildren();
    }
}

loadHomepageIngredients();
