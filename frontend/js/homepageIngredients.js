import BASE_URL, { getImageUrl, getProductUrl } from "./config.js";

const section = document.getElementById("ingredients-discovery");
const ingredientGrid = document.getElementById("ingredients-discovery-grid");
const dialog = document.getElementById("ingredient-detail-dialog");
const dialogImage = document.getElementById("ingredient-dialog-image");
const dialogTitle = document.getElementById("ingredient-dialog-title");
const dialogDescription = document.getElementById("ingredient-dialog-description");
const dialogProducts = document.getElementById("ingredient-dialog-products");
let ingredients = [];

function createProductCard(product) {
    const link = document.createElement("a");
    link.href = getProductUrl(product);
    link.className = "flex items-center gap-3 rounded-xl border border-[#2B1D14]/10 bg-white p-3 hover:border-[#D98E2B]/60 transition-colors";

    const image = document.createElement("img");
    image.src = getImageUrl(product.imagepath, "/static/placeholder.png");
    image.alt = product.name || "Recommended Alora Radiance product";
    image.loading = "lazy";
    image.className = "h-16 w-16 shrink-0 rounded-lg bg-[#F1E6D3] object-cover";

    const details = document.createElement("span");
    details.className = "min-w-0";
    const name = document.createElement("span");
    name.className = "block text-sm font-semibold leading-snug";
    name.textContent = product.name || "Alora Radiance product";
    const action = document.createElement("span");
    action.className = "mt-1 block text-xs font-semibold text-[#8B5C2A]";
    action.textContent = "View product";
    details.append(name, action);
    link.append(image, details);
    return link;
}

function openIngredientDetails(index) {
    const ingredient = ingredients[index];
    if (!ingredient) return;

    dialogImage.src = getImageUrl(ingredient.imageUrl, "/static/placeholder.png");
    dialogImage.alt = ingredient.imageAlt || ingredient.name || "";
    dialogTitle.textContent = ingredient.name || "Ingredient";
    dialogDescription.textContent = ingredient.fullDescription || ingredient.shortDescription || "";
    dialogProducts.replaceChildren();

    const products = Array.isArray(ingredient.recommendedProducts)
        ? ingredient.recommendedProducts.filter(product => product && product.isAvailable !== false)
        : [];
    if (products.length) {
        products.forEach(product => dialogProducts.append(createProductCard(product)));
    } else {
        const emptyState = document.createElement("p");
        emptyState.className = "text-sm text-[#2B1D14]/65";
        emptyState.textContent = "No products are currently linked to this ingredient.";
        dialogProducts.append(emptyState);
    }

    dialog.showModal();
}

function createIngredientCard(ingredient, index) {
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
    content.className = "absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white";

    const label = document.createElement("span");
    label.className = "text-xs font-medium tracking-wide text-white/90";
    label.textContent = "Ingredient";
    const title = document.createElement("h3");
    title.className = "mt-1 text-2xl sm:text-3xl font-heading font-bold leading-tight text-white line-clamp-2";
    title.textContent = ingredient.name || "Ingredient";
    const summary = document.createElement("p");
    summary.className = "mt-2 text-sm leading-snug text-white/90 line-clamp-2";
    summary.textContent = ingredient.shortDescription || "";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mt-4 rounded-full bg-[#1D4ED8] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#1E40AF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
    button.textContent = "Read More";
    button.setAttribute("aria-label", `Read more about ${ingredient.name || "this ingredient"}`);
    button.addEventListener("click", () => openIngredientDetails(index));

    content.append(label, title, summary, button);
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

        ingredients = Array.isArray(content.ingredients) ? content.ingredients : [];
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

document.getElementById("ingredient-dialog-close")?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
});

loadHomepageIngredients();
