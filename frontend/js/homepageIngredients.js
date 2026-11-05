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
    card.className = "group relative aspect-[4/3] min-h-[260px] overflow-hidden rounded-2xl bg-[#F1E6D3]";

    const image = document.createElement("img");
    image.src = getImageUrl(ingredient.imageUrl, "/static/placeholder.png");
    image.alt = ingredient.imageAlt || ingredient.name || "";
    image.loading = "lazy";
    image.decoding = "async";
    image.className = "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105";

    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/5";

    const content = document.createElement("div");
    content.className = "absolute inset-x-0 bottom-0 p-5 text-white sm:p-6";

    const label = document.createElement("span");
    label.className = "text-xs font-medium tracking-wide text-white/90";
    label.textContent = "Ingredient";
    const title = document.createElement("h3");
    title.className = "mt-1 line-clamp-2 font-heading text-2xl font-bold leading-tight text-white sm:text-3xl";
    title.textContent = ingredient.name || "Ingredient";
    const summary = document.createElement("p");
    summary.className = "mt-2 line-clamp-2 text-sm leading-snug text-white/90";
    summary.textContent = ingredient.shortDescription || "";
    const link = document.createElement("a");
    link.href = `/ingredients/${encodeURIComponent(slug)}`;
    link.className = "mt-4 inline-flex rounded-full bg-[#1D4ED8] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#1E40AF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
    link.textContent = "Read More";
    link.setAttribute("aria-label", `Read more about ${ingredient.name || "this ingredient"}`);

    content.append(label, title, summary, link);
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
            emptyState.className = "col-span-full text-sm text-[#2B1D14]/65";
            emptyState.textContent = "Ingredient details are coming soon.";
            ingredientGrid.append(emptyState);
        }
    } catch (error) {
        console.error("Could not load homepage ingredient content:", error);
        ingredientGrid.replaceChildren();
    }
}

loadHomepageIngredients();
