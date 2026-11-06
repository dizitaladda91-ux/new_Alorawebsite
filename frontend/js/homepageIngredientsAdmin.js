import BASE_URL, { getAuthHeaders, getImageUrl } from "./config.js";

const form = document.getElementById("homepage-ingredients-form");
const editorList = document.getElementById("ingredient-editor-list");
const statusEl = document.getElementById("ingredients-form-status");
const saveButton = document.getElementById("ingredients-save-button");
const addButton = document.getElementById("add-ingredient-button");
let ingredients = [];
let products = [];

function showStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.className = `rounded-xl p-3 text-sm ${isError
        ? "bg-rose-50 text-rose-700 border border-rose-200"
        : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`;
}

function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    })[character]);
}

function createEmptyIngredient() {
    return {
        slug: "",
        name: "",
        seoTitle: "",
        seoDescription: "",
        shortDescription: "",
        fullDescription: "",
        articleIntro: "",
        pageSections: [
            { heading: "What is this ingredient?", body: "" },
            { heading: "Why is it used in skincare?", body: "" },
            { heading: "How to use it", body: "" }
        ],
        imageUrl: "",
        imageAlt: "",
        recommendedProducts: []
    };
}

function collectIngredients() {
    return [...editorList.querySelectorAll("[data-ingredient-card]")].map(card => {
        const productIds = [...card.querySelectorAll("[data-product-id]:checked")].map(input => input.value);
        const name = card.querySelector('[data-field="name"]').value.trim();
        const articleIntro = card.querySelector('[data-field="articleIntro"]').value.trim();
        return {
            slug: card.querySelector('[data-field="slug"]').value.trim(),
            name,
            seoTitle: card.querySelector('[data-field="seoTitle"]').value.trim() || `${name} in Skincare | Alora Radiance`,
            seoDescription: card.querySelector('[data-field="seoDescription"]').value.trim() || card.querySelector('[data-field="shortDescription"]').value.trim(),
            shortDescription: card.querySelector('[data-field="shortDescription"]').value.trim(),
            fullDescription: articleIntro,
            articleIntro,
            pageSections: [...card.querySelectorAll("[data-page-section]")].map(section => ({
                heading: section.querySelector("[data-section-heading]").value.trim(),
                body: section.querySelector("[data-section-body]").value.trim()
            })),
            imageUrl: card.querySelector('[data-field="imageUrl"]').value.trim(),
            imageAlt: card.querySelector('[data-field="imageAlt"]').value.trim(),
            recommendedProducts: productIds
        };
    });
}

function renderIngredients() {
    editorList.replaceChildren();
    ingredients.forEach((ingredient, index) => {
        const card = document.createElement("fieldset");
        card.dataset.ingredientCard = "";
        card.className = "rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 space-y-5";

        const selectedIds = new Set((ingredient.recommendedProducts || []).map(product =>
            String(typeof product === "string" ? product : product?._id || "")
        ));
        const productOptions = products.length
            ? products.map(product => `
                <label class="flex items-center gap-2 rounded-lg bg-white p-2 text-xs text-slate-700 border border-slate-200 cursor-pointer">
                    <input type="checkbox" data-product-id value="${escapeHtml(product._id)}" ${selectedIds.has(String(product._id)) ? "checked" : ""} class="h-4 w-4 accent-amber-600">
                    <span class="min-w-0 flex-1 truncate">${escapeHtml(product.name)}</span>
                </label>
            `).join("")
            : '<p class="text-xs text-rose-600">Product catalog could not be loaded.</p>';
        const articleSections = (ingredient.pageSections || []).map((section, sectionIndex) => `
            <fieldset data-page-section class="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
                <div class="flex items-center justify-between gap-2">
                    <legend class="text-xs font-bold text-slate-700">Article section ${sectionIndex + 1}</legend>
                    <button type="button" data-action="remove-section" data-section-index="${sectionIndex}" class="text-xs font-bold text-rose-700 hover:text-rose-900" ${ingredient.pageSections.length <= 2 ? "disabled" : ""}>Remove section</button>
                </div>
                <label class="block space-y-1">
                    <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Section heading</span>
                    <input data-section-heading type="text" maxlength="120" required value="${escapeHtml(section.heading)}" class="w-full rounded-lg border border-slate-300 p-2.5 text-sm">
                </label>
                <label class="block space-y-1">
                    <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Article text</span>
                    <textarea data-section-body rows="5" maxlength="5000" required class="w-full rounded-lg border border-slate-300 p-2.5 text-sm">${escapeHtml(section.body)}</textarea>
                </label>
            </fieldset>
        `).join("");

        card.innerHTML = `
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <legend class="font-bold text-slate-900">Ingredient ${index + 1}</legend>
                <button type="button" data-action="remove" class="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition" ${ingredients.length <= 1 ? "disabled" : ""}>
                    <i class="fa-solid fa-trash-can mr-1"></i> Remove
                </button>
            </div>

            <div class="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(230px,0.7fr)] gap-5">
                <div class="space-y-4">
                    <label class="block space-y-1.5">
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Ingredient name</span>
                        <input data-field="name" type="text" maxlength="100" required value="${escapeHtml(ingredient.name)}" class="w-full rounded-xl border border-slate-300 p-3 text-sm bg-white">
                    </label>
                    <label class="block space-y-1.5">
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Page URL slug</span>
                        <input data-field="slug" type="text" maxlength="120" required value="${escapeHtml(ingredient.slug || "")}" placeholder="e.g. saffron" class="w-full rounded-xl border border-slate-300 p-3 text-sm bg-white font-mono">
                        <a data-guide-preview href="/ingredients/${encodeURIComponent(ingredient.slug || "")}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900">
                            Preview full guide <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                        </a>
                    </label>
                    <div class="grid md:grid-cols-2 gap-3">
                        <label class="block space-y-1.5">
                            <span class="text-xs font-bold uppercase tracking-wider text-slate-700">SEO title</span>
                            <input data-field="seoTitle" type="text" maxlength="160" required value="${escapeHtml(ingredient.seoTitle || "")}" class="w-full rounded-xl border border-slate-300 p-3 text-sm bg-white">
                        </label>
                        <label class="block space-y-1.5">
                            <span class="text-xs font-bold uppercase tracking-wider text-slate-700">SEO description</span>
                            <textarea data-field="seoDescription" rows="2" maxlength="320" required class="w-full rounded-xl border border-slate-300 p-3 text-sm bg-white">${escapeHtml(ingredient.seoDescription || "")}</textarea>
                        </label>
                    </div>
                    <label class="block space-y-1.5">
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Card summary</span>
                        <textarea data-field="shortDescription" rows="2" maxlength="220" required class="w-full rounded-xl border border-slate-300 p-3 text-sm bg-white">${escapeHtml(ingredient.shortDescription)}</textarea>
                    </label>
                    <label class="block space-y-1.5">
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Article introduction</span>
                        <textarea data-field="articleIntro" rows="5" maxlength="5000" required class="w-full rounded-xl border border-slate-300 p-3 text-sm bg-white">${escapeHtml(ingredient.articleIntro || ingredient.fullDescription || "")}</textarea>
                        <span class="block text-[11px] text-slate-500">This appears at the start of the full ingredient guide.</span>
                    </label>
                </div>

                <div class="space-y-3">
                    <p class="text-xs font-bold uppercase tracking-wider text-slate-700">Ingredient image</p>
                    <div class="aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-[#F1E6D3]">
                        <img data-image-preview src="${escapeHtml(getImageUrl(ingredient.imageUrl || "/static/placeholder.png"))}" alt="${escapeHtml(ingredient.imageAlt)}" class="h-full w-full object-cover">
                    </div>
                    <input data-image-file type="file" accept="image/jpeg,image/png,image/webp" class="block w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white font-medium cursor-pointer">
                    <p class="text-[11px] text-slate-500">JPG, PNG, or WEBP; maximum 5 MB.</p>
                    <button type="button" data-action="upload-image" class="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition">
                        <i class="fa-solid fa-cloud-arrow-up mr-1"></i> Upload Image
                    </button>
                    <label class="block space-y-1.5">
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Image URL</span>
                        <input data-field="imageUrl" type="text" maxlength="1000" required value="${escapeHtml(ingredient.imageUrl)}" class="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white font-mono">
                    </label>
                    <label class="block space-y-1.5">
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Image alt text</span>
                        <input data-field="imageAlt" type="text" maxlength="180" required value="${escapeHtml(ingredient.imageAlt)}" class="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white">
                    </label>
                </div>
            </div>

            <div class="border-t border-slate-200 pt-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">Full ingredient article</h4>
                        <p class="mt-1 text-[11px] text-slate-500">Create at least 2 sections. Each section appears as a heading and long-form content on its own page.</p>
                    </div>
                    <button type="button" data-action="add-section" class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">Add article section</button>
                </div>
                <div data-article-sections class="mt-3 space-y-3">${articleSections}</div>
            </div>

            <div class="border-t border-slate-200 pt-4">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">Recommended products</h4>
                <p class="mt-1 text-[11px] text-slate-500">Choose up to 6 products to feature near the end of this ingredient's guide page.</p>
                <div class="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto">${productOptions}</div>
            </div>
        `;

        card.addEventListener("input", event => {
            if (event.target.matches('[data-field="name"]')) {
                const slugInput = card.querySelector('[data-field="slug"]');
                if (!slugInput.dataset.edited) {
                    slugInput.value = event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                }
                const seoTitle = card.querySelector('[data-field="seoTitle"]');
                if (!seoTitle.dataset.edited) seoTitle.value = event.target.value.trim() ? `${event.target.value.trim()} in Skincare | Alora Radiance` : "";
            }
            if (event.target.matches('[data-field="slug"], [data-field="seoTitle"], [data-field="seoDescription"]')) {
                event.target.dataset.edited = "true";
            }
            if (event.target.matches('[data-field="slug"]')) {
                card.querySelector("[data-guide-preview]").href = `/ingredients/${encodeURIComponent(event.target.value.trim())}`;
            }
            if (event.target.matches('[data-field="imageUrl"]')) {
                const image = card.querySelector("[data-image-preview]");
                image.src = getImageUrl(event.target.value.trim() || "/static/placeholder.png");
            }
            if (event.target.matches('[data-field="imageAlt"]')) {
                card.querySelector("[data-image-preview]").alt = event.target.value;
            }
        });
        card.querySelector("[data-image-file]").addEventListener("change", event => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                showStatus("Image must be 5 MB or smaller.", true);
                event.target.value = "";
                return;
            }

            const reader = new FileReader();
            reader.addEventListener("load", () => {
                if (typeof reader.result !== "string") {
                    showStatus("Could not preview the selected image.", true);
                    return;
                }
                card.querySelector("[data-image-preview]").src = reader.result;
            });
            reader.addEventListener("error", () => {
                showStatus("Could not read the selected image.", true);
            });
            reader.readAsDataURL(file);
        });
        card.querySelector('[data-action="upload-image"]').addEventListener("click", () => {
            uploadIngredientImage(card);
        });
        card.addEventListener("click", event => {
            const action = event.target.closest("[data-action]")?.dataset.action;
            if (action === "remove") {
                if (ingredients.length <= 1) return;
                ingredients = collectIngredients();
                ingredients.splice(index, 1);
                renderIngredients();
            } else if (action === "add-section" || action === "remove-section") {
                ingredients = collectIngredients();
                if (action === "add-section") {
                    if (ingredients[index].pageSections.length >= 12) {
                        showStatus("Each ingredient can have up to 12 article sections.", true);
                        return;
                    }
                    ingredients[index].pageSections.push({ heading: "", body: "" });
                } else {
                    if (ingredients[index].pageSections.length <= 2) return;
                    ingredients[index].pageSections.splice(Number(event.target.closest("[data-action]").dataset.sectionIndex), 1);
                }
                renderIngredients();
            }
        });
        editorList.append(card);
    });
}

async function uploadIngredientImage(card) {
    const file = card.querySelector("[data-image-file]").files?.[0];
    if (!file) {
        showStatus("Choose an image file for this ingredient first.", true);
        return;
    }

    const button = card.querySelector('[data-action="upload-image"]');
    const originalText = button.innerHTML;
    button.disabled = true;
    button.textContent = "Uploading...";
    try {
        const body = new FormData();
        body.append("image", file);
        const response = await fetch(`${BASE_URL}/api/homepage-ingredients/upload-image`, {
            method: "POST",
            headers: getAuthHeaders({}, false),
            credentials: "include",
            body
        });
        const result = await response.json();
        if (!response.ok || !result.success || !result.imageUrl) {
            throw new Error(result.message || "Image upload failed.");
        }

        card.querySelector('[data-field="imageUrl"]').value = result.imageUrl;
        card.querySelector("[data-image-preview]").src = getImageUrl(result.imageUrl);
        showStatus("Ingredient image uploaded. Save the section to publish it.");
    } catch (error) {
        console.error("Ingredient image upload failed:", error);
        showStatus(error.message, true);
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

async function loadSection() {
    try {
        const [contentResponse, productsResponse] = await Promise.all([
            fetch(`${BASE_URL}/api/homepage-ingredients`, { cache: "no-cache" }),
            fetch(`${BASE_URL}/api/product/all`, { cache: "no-cache" })
        ]);
        const [contentResult, productResult] = await Promise.all([
            contentResponse.json(),
            productsResponse.json()
        ]);
        if (!contentResponse.ok || !contentResult.success || !contentResult.data) {
            throw new Error(contentResult.message || "Could not load homepage section settings.");
        }
        if (!productsResponse.ok) {
            throw new Error(productResult.message || productResult.error || "Could not load the product catalog.");
        }

        ingredients = Array.isArray(contentResult.data.ingredients) ? contentResult.data.ingredients : [];
        products = Array.isArray(productResult) ? productResult : (productResult.products || productResult.data || []);
        products = products.filter(product => product?._id && product.isAvailable !== false);
        if (!ingredients.length) ingredients = [createEmptyIngredient()];

        form.elements.eyebrow.value = contentResult.data.eyebrow || "Discover";
        form.elements.heading.value = contentResult.data.heading || "Skin-Saving Actives";
        form.elements.buttonText.value = contentResult.data.buttonText || "Explore our Ingredients";
        form.elements.buttonUrl.value = contentResult.data.buttonUrl || "/products";
        form.elements.isEnabled.checked = contentResult.data.isEnabled !== false;
        renderIngredients();
    } catch (error) {
        console.error("Could not load homepage section settings:", error);
        showStatus(error.message, true);
    }
}

addButton.addEventListener("click", () => {
    ingredients = collectIngredients();
    if (ingredients.length >= 12) {
        showStatus("You can add up to 12 ingredient cards.", true);
        return;
    }
    ingredients.push(createEmptyIngredient());
    renderIngredients();
});

form.addEventListener("submit", async event => {
    event.preventDefault();
    ingredients = collectIngredients();
    if (ingredients.length < 1 || ingredients.length > 12) {
        showStatus("Keep between 1 and 12 ingredient cards.", true);
        return;
    }
    if (ingredients.some(ingredient => ingredient.recommendedProducts.length > 6)) {
        showStatus("Each ingredient can have up to 6 recommended products.", true);
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
    const payload = {
        eyebrow: form.elements.eyebrow.value.trim(),
        heading: form.elements.heading.value.trim(),
        buttonText: form.elements.buttonText.value.trim(),
        buttonUrl: form.elements.buttonUrl.value.trim(),
        isEnabled: form.elements.isEnabled.checked,
        ingredients
    };

    try {
        const response = await fetch(`${BASE_URL}/api/homepage-ingredients`, {
            method: "PUT",
            headers: getAuthHeaders(),
            credentials: "include",
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "Could not save homepage section.");
        }
        showStatus("Homepage ingredient cards saved successfully.");
    } catch (error) {
        console.error("Homepage ingredient cards save failed:", error);
        showStatus(error.message, true);
    } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk mr-1.5"></i> Save Homepage Section';
    }
});

loadSection();
