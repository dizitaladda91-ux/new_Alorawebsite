import BASE_URL, { getImageUrl, safeFetchJson, getProductUrl } from "./config.js";
import "./wishlist.js";
let PRODUCTS_DATABASE = [];
let selectedCategories = [];
let activeSkinType = 'all';
let selectedConcerns = [];
let maxPriceConstraint = 2500;
let ratingFloorFilter = 0;
let activeQuickTag = 'all';
let searchQuery = '';

const PRODUCT_TAG_MAPPING = {
    'purifying-glow-face-wash': {
        skinTypes: ['all', 'oily', 'combination', 'normal', 'sensitive'],
        concerns: ['acne', 'open-pores']
    },
    'brightening-hydrating-face-serum': {
        skinTypes: ['all', 'dry', 'oily', 'combination', 'normal', 'sensitive'],
        concerns: ['pigmentation', 'dark-spots', 'dullness', 'anti-ageing', 'ageing', 'open-pores']
    },
    'soothing-face-scrub': {
        skinTypes: ['all', 'oily', 'combination', 'normal', 'dry'],
        concerns: ['dullness']
    },
    'face-cream-sunscreen-spf-30': {
        skinTypes: ['all', 'dry', 'normal', 'combination', 'sensitive'],
        concerns: ['pigmentation', 'dark-spots', 'tan', 'anti-ageing', 'ageing', 'dryness']
    },
    'soothing-body-lotion': {
        skinTypes: ['all', 'dry', 'normal', 'sensitive', 'combination'],
        concerns: ['dryness']
    },
    'daily-glow-duo': {
        skinTypes: ['all', 'oily', 'combination', 'normal'],
        concerns: []
    },
    'cleanse-protect-duo': {
        skinTypes: ['all', 'oily', 'combination', 'normal', 'dry'],
        concerns: []
    },
    'hydration-duo': {
        skinTypes: ['all', 'dry', 'normal', 'combination'],
        concerns: []
    },
    'radiance-ritual-trio': {
        skinTypes: ['all', 'normal', 'dry', 'combination', 'oily'],
        concerns: []
    },
    'alora-radiance-travel-essentials-kit': {
        skinTypes: ['all', 'oily', 'dry', 'combination', 'sensitive', 'normal'],
        concerns: []
    }
};

const SKIN_TYPE_DISPLAY = {
    all: 'All Skin Types',
    oily: 'Oily Skin',
    dry: 'Dry Skin',
    combination: 'Combination Skin',
    sensitive: 'Sensitive Skin',
    normal: 'Normal Skin'
};

const CONCERN_DISPLAY = {
    acne: 'Acne & Blemishes',
    pigmentation: 'Pigmentation',
    'dark-spots': 'Dark Spots',
    tan: 'Tan Removal',
    dullness: 'Dullness & Glow',
    'anti-ageing': 'Anti-Ageing',
    dryness: 'Dryness & Dehydration',
    'open-pores': 'Open Pores'
};

function getProductTags(product) {
    const slug = (product.slug || '').toLowerCase().trim();
    const name = (product.name || '').toLowerCase();
    const desc = (product.description || '').toLowerCase();
    if (PRODUCT_TAG_MAPPING[slug]) {
        return {
            skinTypes: [...PRODUCT_TAG_MAPPING[slug].skinTypes],
            concerns: [...PRODUCT_TAG_MAPPING[slug].concerns]
        };
    }
    const skinTypes = ['all'];
    const concerns = [];
    if (name.includes('oil') || desc.includes('oily') || desc.includes('sebum') || name.includes('wash') || name.includes('cleanser')) {
        skinTypes.push('oily');
    }
    if (name.includes('dry') || desc.includes('dry') || desc.includes('nourish') || name.includes('lotion') || name.includes('cream')) {
        skinTypes.push('dry');
    }
    if (name.includes('combination') || desc.includes('combination') || name.includes('serum')) {
        skinTypes.push('combination');
    }
    if (desc.includes('sensitive') || desc.includes('gentle') || desc.includes('soothing')) {
        skinTypes.push('sensitive');
    }
    if (desc.includes('normal')) {
        skinTypes.push('normal');
    }
    if (name.includes('acne') || desc.includes('acne') || desc.includes('blemish') || desc.includes('breakout')) {
        concerns.push('acne');
    }
    if (name.includes('pigment') || desc.includes('pigment') || desc.includes('even tone')) {
        concerns.push('pigmentation');
    }
    if (name.includes('dark spot') || desc.includes('dark spot') || desc.includes('spot')) {
        concerns.push('dark-spots');
    }
    if (name.includes('tan') || desc.includes('tan') || name.includes('sun') || name.includes('spf')) {
        concerns.push('tan');
    }
    if (name.includes('bright') || name.includes('glow') || desc.includes('dull') || desc.includes('radiance')) {
        concerns.push('dullness');
    }
    if (name.includes('age') || desc.includes('age') || desc.includes('wrinkle') || desc.includes('fine line') || desc.includes('firm')) {
        concerns.push('anti-ageing');
    }
    if (name.includes('dry') || desc.includes('dry') || desc.includes('dehydrat') || desc.includes('moisture')) {
        concerns.push('dryness');
    }
    if (name.includes('pore') || desc.includes('pore') || name.includes('scrub')) {
        concerns.push('open-pores');
    }
    return {
        skinTypes: [...new Set(skinTypes)],
        concerns: [...new Set(concerns)]
    };
}
let pendingCatalogProductId = null;
let pendingCatalogCartAction = null;
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    const categoryParam = urlParams.get('category');
    const skinTypeParam = urlParams.get('skinType') || urlParams.get('skintype');
    const concernParam = urlParams.get('concern');
    const searchParam = urlParams.get('search') || urlParams.get('q');

    if (filterParam === 'bestseller') {
        activeQuickTag = 'bestseller';
    }
    if (categoryParam) {
        const cleanCategory = categoryParam.toLowerCase().trim();
        selectedCategories = [cleanCategory];
        const targetCheckbox = document.querySelector(`input[name="category"][value="${cleanCategory}"]`);
        if (targetCheckbox) {
            targetCheckbox.checked = true;
        }
    }
    if (skinTypeParam) {
        const cleanSkin = skinTypeParam.toLowerCase().trim();
        if (cleanSkin) {
            activeSkinType = cleanSkin;
            const targetRadio = document.querySelector(`input[name="skinType"][value="${cleanSkin}"]`);
            if (targetRadio) {
                targetRadio.checked = true;
            }
        }
    }
    if (concernParam) {
        const concerns = concernParam.toLowerCase().split(',').map(c => c.trim()).filter(Boolean);
        selectedConcerns = concerns;
        concerns.forEach(c => {
            const targetCheckbox = document.querySelector(`input[name="concern"][value="${c}"]`);
            if (targetCheckbox) {
                targetCheckbox.checked = true;
            }
        });
    }
    if (searchParam) {
        searchQuery = searchParam.toLowerCase().trim();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = searchParam;
        }
    }

    loadProductsFromBackend();
    syncCartCounterIcon();
    setupMobileMenu();
    setupSearchListeners();
});
async function loadProductsFromBackend() {
    const gridContainer = document.getElementById('product-grid');
    if (!gridContainer) return;
    try {
        const data = await safeFetchJson(`${BASE_URL}/api/product/all`);
        PRODUCTS_DATABASE = normalizeAndAssignBestsellers(data);
        updateQuickFilterUI();
        filterProducts();
        const filterContent = document.getElementById('filter-content');
        if (filterContent) {
            filterContent.classList.remove('hidden');
        }
    } catch (err) {
        console.error("Product fetch failed:", err);
        gridContainer.innerHTML = `<p class="text-ash text-center col-span-full py-10">Could not load products. Please try again later.</p>`;
    }
}
function normalizeAndAssignBestsellers(rawProducts) {
    let normalized = rawProducts.map(product => {
        const sizes = (product.variants && product.variants.length > 0)
            ? product.variants.map(v => ({
                ml: v.volume || "Standard",
                label: v.volume || "",
                price: v.price || 0,
                mrp: v.comparePrice || v.price || 0
              }))
            : [{ ml: product.size || "Standard", label: product.size || "", price: product.price || 0, mrp: product.comparePrice || product.price || 0 }];
        let rawCategory = (product.category || "uncategorized").toLowerCase().trim();
        if (rawCategory === 'skincare') rawCategory = 'skin';
        if (rawCategory === 'bodycare') rawCategory = 'body';
        const imageSrc = getImageUrl(product.imagepath, '');
        const backendIsBestseller = Boolean(
            product.isBestseller === true || 
            product.isBestseller === 'true' || 
            product.bestseller === true || 
            product.bestseller === 'true'
        );
        return {
            id: product._id || product.id,
            slug: product.slug,
            productUrl: getProductUrl(product),
            name: product.name || 'Untitled Product',
            category: rawCategory, 
            isBestseller: backendIsBestseller,
            rating: product.rating || 4,
            reviewsCount: Number(product.reviewsCount) || 0,
            averageReviewRating: Number(product.averageReviewRating) || 0,
            isSampleReviews: product.isSampleReviews === true,
            baseImg: imageSrc,
            galleryImages: (product.galleryImages || []).map(img => getImageUrl(img, '')).filter(Boolean),
            description: product.description || 'No description available', 
            sizes,
            skinTypes: (Array.isArray(product.skinTypes) && product.skinTypes.length > 0)
                ? product.skinTypes.map(s => String(s).toLowerCase().trim())
                : getProductTags(product).skinTypes,
            concerns: PRODUCT_TAG_MAPPING[(product.slug || '').toLowerCase().trim()]
                ? [...PRODUCT_TAG_MAPPING[(product.slug || '').toLowerCase().trim()].concerns]
                : (Array.isArray(product.concerns) && product.concerns.length > 0)
                    ? product.concerns.map(c => String(c).toLowerCase().trim())
                    : getProductTags(product).concerns
        };
    });
    const hasAnyBackendBestseller = normalized.some(p => p.isBestseller);
    if (!hasAnyBackendBestseller && normalized.length > 0) {
        const sortedIndices = [...normalized]
            .map((p, idx) => ({ idx, rating: p.rating }))
            .sort((a, b) => b.rating - a.rating);
        const bestsellerCount = Math.max(2, Math.min(6, Math.ceil(normalized.length * 0.3)));
        for (let i = 0; i < Math.min(bestsellerCount, normalized.length); i++) {
            const targetIdx = sortedIndices[i].idx;
            normalized[targetIdx].isBestseller = true;
        }
    }
    const productOrder = (product) => {
        const name = `${product.name || ""} ${product.slug || ""}`.toLowerCase();
        if (/(purifying|face wash|cleanser)/.test(name)) return 0;
        if (/(brightening|serum)/.test(name)) return 1;
        if (/(body lotion|lotion)/.test(name)) return 2;
        if (/(face scrub|scrub)/.test(name)) return 3;
        if (/(face cream|cream|sunscreen|spf)/.test(name)) return 4;
        return 5;
    };
    return normalized.sort((a, b) => productOrder(a) - productOrder(b));
}
function renderProductCatalog(products) {
    const gridContainer = document.getElementById('product-grid');
    const noProductsPlaceholder = document.getElementById('no-products');
    if (!gridContainer) return;
    if (products.length === 0) {
        gridContainer.innerHTML = "";
        if (noProductsPlaceholder) noProductsPlaceholder.classList.remove('hidden');
        const countEl = document.getElementById('results-count');
        if (countEl) countEl.innerText = `0 Products Found`;
        return;
    }
    if (noProductsPlaceholder) noProductsPlaceholder.classList.add('hidden');
    const countEl = document.getElementById('results-count');
    if (countEl) {
        let filterContext = '';
        if (activeSkinType && activeSkinType !== 'all') {
            filterContext = ` for ${SKIN_TYPE_DISPLAY[activeSkinType] || activeSkinType}`;
        }
        if (selectedConcerns.length === 1) {
            filterContext += ` (${CONCERN_DISPLAY[selectedConcerns[0]] || selectedConcerns[0]})`;
        } else if (selectedConcerns.length > 1) {
            filterContext += ` (${selectedConcerns.length} Concerns)`;
        }
        countEl.innerText = products.length === 0 
            ? `0 Products Found${filterContext}` 
            : `Showing ${products.length} products${filterContext}`;
    }
    gridContainer.innerHTML = products.map(product => {
        const initialSize = product.sizes[0];
        let discountBadgeHTML = '';
        if (initialSize && initialSize.mrp && Number(initialSize.mrp) > Number(initialSize.price)) {
            const pct = Math.round(((Number(initialSize.mrp) - Number(initialSize.price)) / Number(initialSize.mrp)) * 100);
            if (pct > 0) {
                discountBadgeHTML = `<span class="discount-badge text-[9px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-200 uppercase font-mono">${pct}% OFF</span>`;
            }
        }
        const starsHTML = product.reviewsCount > 0
            ? generateStarsHTML(product.averageReviewRating)
            : '';
        const allImages = [product.baseImg, ...(product.galleryImages || [])].filter(Boolean);
        const hasMultipleImages = allImages.length > 1;
        const sizeButtonsHTML = product.sizes.map((sz, idx) => {
            const isActive = idx === 0;
            const activeClasses = isActive 
                ? 'bg-ink text-parchment border-ink font-semibold' 
                : 'border-[#DCD3BA] text-ash hover:border-ink';
            return `
                <button 
                    type="button"
                    onclick="changeCardSize('${sz.ml}', ${sz.price}, ${sz.mrp || 0}, this)"
                    class="size-btn text-[11px] px-2.5 py-1 rounded-full border transition ${activeClasses}"
                >
                    ${sz.ml}
                </button>
            `;
        }).join('');
        const imageAreaHTML = hasMultipleImages ? `
            <div class="mx-4 mt-4 rounded-xl flex justify-center h-[170px] items-center overflow-hidden relative group/card-img" data-images="${encodeURIComponent(JSON.stringify(allImages))}" data-active-idx="0">
                <a href="${product.productUrl}" class="block w-full h-full p-2 flex items-center justify-center">
                    <img src="${allImages[0]}" alt="${product.name}" class="card-active-img max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-110">
                </a>
                <button type="button" onclick="event.preventDefault(); event.stopPropagation(); window.cycleCardImage(this, -1)" class="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] opacity-80 sm:opacity-0 group-hover/card-img:opacity-100 transition hover:bg-black/80 z-20 shadow">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button type="button" onclick="event.preventDefault(); event.stopPropagation(); window.cycleCardImage(this, 1)" class="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] opacity-80 sm:opacity-0 group-hover/card-img:opacity-100 transition hover:bg-black/80 z-20 shadow">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
                <div class="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 z-20 bg-black/20 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                    ${allImages.map((_, i) => `<span class="img-dot w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-clay' : 'bg-white/60'}"></span>`).join('')}
                </div>
            </div>
        ` : `
            <div class="mx-4 mt-4 rounded-xl flex justify-center h-[170px] items-center overflow-hidden relative">
                <a href="${product.productUrl}" class="block w-full h-full p-2 flex items-center justify-center">
                    <img src="${product.baseImg}" alt="${product.name}" class="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-110">
                </a>
            </div>
        `;
        const skinType = product.category ? (product.category.toLowerCase().includes('sun') || product.category.toLowerCase().includes('spf') ? 'All Skin Types' : product.category.toLowerCase().includes('body') ? 'Deep Hydration' : 'All Skin Types') : 'All Skin Types';
        const reviewSummary = product.reviewsCount > 0
            ? `<span class="font-bold text-amber-700 text-xs">${product.averageReviewRating.toFixed(1)}</span>
                <div class="flex gap-0.5 text-xs">${starsHTML}</div>
                <svg class="w-3 h-3 text-stone-400 inline" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                <span class="text-stone-500 text-[11px] font-medium font-sans">(${product.reviewsCount})</span>`
            : '<span class="text-stone-500 text-[11px] font-medium font-sans">No reviews</span>';

        const pct = (initialSize.mrp && Number(initialSize.mrp) > Number(initialSize.price))
            ? Math.round(((Number(initialSize.mrp) - Number(initialSize.price)) / Number(initialSize.mrp)) * 100)
            : 0;

        const sizeText = (initialSize.label || initialSize.ml || '').trim();
        const sizeDisplay = (sizeText && sizeText.toLowerCase() !== 'standard' && sizeText.toLowerCase() !== 'undefined') ? `(${sizeText})` : '';

        return `
        <div data-product-id="${product.id}" class="animate-fade-in relative w-full flex-shrink-0 product-card bg-white rounded-xl shadow-xs hover:shadow-md border border-stone-200/90 flex flex-col justify-between overflow-hidden transition-shadow duration-300">
            <div>
                <!-- Product Image Container -->
                <div class="relative w-full aspect-square overflow-hidden bg-[#FAF7F2] p-2 flex items-center justify-center">
                    <a href="${product.productUrl}" class="w-full h-full block">
                        <img src="${product.baseImg}" alt="${product.name}" class="product-card-img w-full h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105">
                    </a>

                    <!-- Floating Top-Right Wishlist Button -->
                    <button type="button" onclick="window.handleCardWishlistToggle && window.handleCardWishlistToggle('${product.id}', this, event)" class="wishlist-toggle-btn absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-500 hover:text-rose-600 shadow-xs border border-stone-200/60 flex items-center justify-center cursor-pointer transition-colors" title="Add to Wishlist" aria-label="Add to Wishlist">
                        <i class="fa-regular fa-heart text-xs sm:text-sm hover:text-rose-600 transition-colors"></i>
                    </button>
                </div>

                <!-- Product Info Section (Amazon Card Style from Image) -->
                <div class="px-3.5 sm:px-4 pt-3 pb-2 flex flex-col text-left">
                    <!-- Title -->
                    <h3 class="text-sm sm:text-[15px] font-sans font-bold text-[#3B2418] leading-snug line-clamp-2 hover:text-[#205D96] transition-colors mb-1.5 product-name">
                        <a href="${product.productUrl}">${product.name}</a>
                    </h3>

                    <!-- Rating Stars & Review Count -->
                    <div class="flex items-center gap-1.5 text-xs text-[#3B2418] mb-2">
                        ${reviewSummary}
                    </div>

                    <!-- Deal / Promo Badge -->
                    <div class="mb-2">
                        <span class="inline-block bg-[#C43826] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs">
                            ${product.isBestseller ? 'Bestseller Deal' : (pct > 0 ? `${pct}% OFF DEAL` : 'Special Offer')}
                        </span>
                    </div>

                    <!-- Price Row -->
                    <div class="flex items-baseline flex-wrap gap-1 mb-0.5">
                        <span class="text-xs font-semibold text-[#3B2418] align-super">₹</span>
                        <span class="product-price text-2xl font-bold text-[#3B2418] tracking-tight leading-none">${initialSize.price}</span>
                        ${sizeDisplay ? `<span class="unit-size-text text-[11px] text-stone-500 font-normal">${sizeDisplay}</span>` : ''}
                    </div>

                    <!-- MRP & Discount Row -->
                    <div class="text-xs text-stone-600 mb-1.5">
                        ${initialSize.mrp ? `M.R.P.: <span class="product-mrp line-through text-stone-400 font-mono">₹${initialSize.mrp}</span> <span class="discount-badge text-emerald-800 font-bold">(${pct}% off)</span>` : ''}
                    </div>

                    <!-- Size Variant Buttons -->
                    <div class="flex items-center gap-1.5 flex-wrap my-1 size-btn-container">
                        ${sizeButtonsHTML}
                    </div>
                </div>
            </div>

            <!-- Add to Cart Action Bar -->
            <div class="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1">
                <button type="button" onclick="handleCartButtonClick('${product.id}', this)" class="w-full bg-[#E8A33D] hover:bg-[#D48D2A] text-[#2B1E16] font-bold py-2.5 sm:py-3 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer">
                    <svg class="w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    <span>Add to Cart</span>
                </button>
            </div>
        </div>`;
    }).join('');

    if (window.syncWishlistHeartsOnPage) {
        window.syncWishlistHeartsOnPage();
    }
}
function generateStarsHTML(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            html += `<i class="fa-solid fa-star"></i>`;
        } else if (i - 0.5 <= rating) {
            html += `<i class="fa-solid fa-star-half-stroke"></i>`;
        } else {
            html += `<i class="fa-regular fa-star text-gray-300"></i>`;
        }
    }
    return html;
}
function changeCardSize(sizeLabel, exactPrice, exactMrp, element) {
    const currentCard = element.closest('.product-card');
    if (!currentCard) return;
    currentCard.querySelector('.product-price').innerHTML = `<span style="font-family:Arial,'Noto Sans',sans-serif">&#8377;</span>${exactPrice}`;
    const unitSizeEl = currentCard.querySelector('.unit-size-text');
    if (unitSizeEl) {
        const cleanSize = (sizeLabel || '').trim();
        unitSizeEl.textContent = (cleanSize && cleanSize.toLowerCase() !== 'standard' && cleanSize.toLowerCase() !== 'undefined') ? `(${cleanSize})` : '';
    }
    const mrpEl = currentCard.querySelector('.product-mrp');
    if (mrpEl) mrpEl.innerHTML = exactMrp ? `<span style="font-family:Arial,'Noto Sans',sans-serif">&#8377;</span>${exactMrp}` : '';
    const discountBadgeEl = currentCard.querySelector('.discount-badge');
    if (discountBadgeEl) {
        if (exactMrp && Number(exactMrp) > Number(exactPrice)) {
            const pct = Math.round(((Number(exactMrp) - Number(exactPrice)) / Number(exactMrp)) * 100);
            if (pct > 0) {
                discountBadgeEl.innerText = `${pct}% OFF`;
                discountBadgeEl.style.display = 'inline-block';
            } else {
                discountBadgeEl.style.display = 'none';
            }
        } else {
            discountBadgeEl.style.display = 'none';
        }
    }
    currentCard.querySelectorAll('.size-btn').forEach(btn => {
        btn.className = "size-btn text-[11px] px-2.5 py-1 rounded-full border border-[#DCD3BA] text-ash hover:border-ink transition";
    });
    element.className = "size-btn text-[11px] px-2.5 py-1 rounded-full border border-ink bg-ink text-parchment font-semibold transition";
}
function updateQty(change, element) {
    const parentQtyWrapper = element.closest('.qty-container');
    const targetInput = parentQtyWrapper.querySelector('.quantity');
    let currentQty = parseInt(targetInput.value) || 1;
    currentQty += change;
    if (currentQty < 1) currentQty = 1;
    targetInput.value = currentQty;
}
function filterProducts() {
    const checkboxes = document.querySelectorAll('input[name="category"]:checked');
    selectedCategories = Array.from(checkboxes).map(cb => cb.value.toLowerCase().trim());

    const skinRadio = document.querySelector('input[name="skinType"]:checked');
    activeSkinType = skinRadio ? skinRadio.value.toLowerCase().trim() : 'all';

    const concernCheckboxes = document.querySelectorAll('input[name="concern"]:checked');
    selectedConcerns = Array.from(concernCheckboxes).map(cb => cb.value.toLowerCase().trim());

    const priceRangeInput = document.getElementById('price-range');
    if (priceRangeInput) maxPriceConstraint = parseInt(priceRangeInput.value);

    let results = PRODUCTS_DATABASE.filter(item => {
        if (searchQuery) {
            const matchesName = item.name.toLowerCase().includes(searchQuery);
            const matchesDesc = item.description.toLowerCase().includes(searchQuery);
            const matchesCategory = item.category.toLowerCase().includes(searchQuery);
            if (!matchesName && !matchesDesc && !matchesCategory) return false;
        }
        if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) {
            return false;
        }
        if (activeSkinType && activeSkinType !== 'all') {
            const itemSkins = item.skinTypes || ['all'];
            if (!itemSkins.includes(activeSkinType) && !itemSkins.includes('all')) {
                return false;
            }
        }
        if (selectedConcerns.length > 0) {
            const itemConcerns = item.concerns || [];
            const matchesAnyConcern = selectedConcerns.some(c => itemConcerns.includes(c));
            if (!matchesAnyConcern) {
                return false;
            }
        }
        if (item.rating < ratingFloorFilter) return false;
        if (activeQuickTag === 'bestseller' && !item.isBestseller) {
            return false;
        }
        const basePrice = item.sizes[0].price;
        if (basePrice > maxPriceConstraint) return false;
        return true;
    });

    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        const sortSelection = sortFilter.value;
        if (sortSelection === 'price-low-high') {
            results.sort((a, b) => a.sizes[0].price - b.sizes[0].price);
        } else if (sortSelection === 'price-high-low') {
            results.sort((a, b) => b.sizes[0].price - a.sizes[0].price);
        } else if (sortSelection === 'rating-high-low') {
            results.sort((a, b) => b.rating - a.rating);
        }
    }

    renderActiveFilterBadges();
    renderProductCatalog(results);
    syncFilterUrl();
}

function renderActiveFilterBadges() {
    const chipsContainer = document.getElementById('active-filter-chips');
    if (!chipsContainer) return;
    const chips = [];

    if (activeSkinType && activeSkinType !== 'all') {
        const label = SKIN_TYPE_DISPLAY[activeSkinType] || activeSkinType;
        chips.push(`
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F1FF] text-[#205D96] text-xs font-bold border border-[#8EC5FF]/80 shadow-2xs">
                <span>Skin: ${label}</span>
                <button type="button" onclick="clearSkinTypeFilter()" class="hover:text-rose-600 transition-colors ml-0.5 cursor-pointer font-extrabold text-sm leading-none" aria-label="Clear skin type filter">&times;</button>
            </span>
        `);
    }

    selectedConcerns.forEach(c => {
        const label = CONCERN_DISPLAY[c] || c;
        chips.push(`
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 text-xs font-bold border border-amber-300 shadow-2xs">
                <span>Concern: ${label}</span>
                <button type="button" onclick="removeSingleConcern('${c}')" class="hover:text-rose-600 transition-colors ml-0.5 cursor-pointer font-extrabold text-sm leading-none" aria-label="Remove ${label} filter">&times;</button>
            </span>
        `);
    });

    chipsContainer.innerHTML = chips.join('');
}

function clearSkinTypeFilter() {
    activeSkinType = 'all';
    const allRadio = document.querySelector('input[name="skinType"][value="all"]');
    if (allRadio) allRadio.checked = true;
    filterProducts();
}

function removeSingleConcern(c) {
    const cb = document.querySelector(`input[name="concern"][value="${c}"]`);
    if (cb) cb.checked = false;
    filterProducts();
}

function clearConcernFilter() {
    selectedConcerns = [];
    document.querySelectorAll('input[name="concern"]').forEach(cb => cb.checked = false);
    filterProducts();
}

function syncFilterUrl() {
    try {
        const params = new URLSearchParams();
        if (activeQuickTag === 'bestseller') params.set('filter', 'bestseller');
        if (selectedCategories.length === 1) params.set('category', selectedCategories[0]);
        if (activeSkinType && activeSkinType !== 'all') params.set('skinType', activeSkinType);
        if (selectedConcerns.length > 0) params.set('concern', selectedConcerns.join(','));
        if (searchQuery) params.set('search', searchQuery);
        const query = params.toString();
        const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
    } catch (_) {}
}
function updateQuickFilterUI() {
    const bestsellerBadge = document.getElementById('badge-bestseller');
    if (bestsellerBadge) {
        if (activeQuickTag === 'bestseller') bestsellerBadge.classList.remove('hidden');
        else bestsellerBadge.classList.add('hidden');
    }
    const buttons = document.querySelectorAll('[onclick*="applyQuickFilter"]');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(activeQuickTag)) {
            btn.classList.add('border-[#E3D9BC]', 'bg-clay/10', 'font-bold');
        } else {
            btn.classList.remove('border-[#E3D9BC]', 'bg-clay/10', 'font-bold');
        }
    });
}
function applyQuickFilter(mode) {
    activeQuickTag = mode;
    updateQuickFilterUI();
    filterProducts();
}
function updatePriceLabel(value) {
    const label = document.getElementById('price-max-label');
    if (label) label.innerText = `₹${value}`;
}
function setRatingFilter(minStars) {
    ratingFloorFilter = minStars;
    filterProducts();
}
function resetFilters() {
    document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[name="concern"]').forEach(cb => cb.checked = false);
    const allRadio = document.querySelector('input[name="skinType"][value="all"]');
    if (allRadio) allRadio.checked = true;
    activeSkinType = 'all';
    selectedConcerns = [];
    const range = document.getElementById('price-range');
    if (range) range.value = 2500;
    const sort = document.getElementById('sort-filter');
    if (sort) sort.value = 'featured';
    updatePriceLabel(2500);
    ratingFloorFilter = 0;
    activeQuickTag = 'all';
    searchQuery = '';
    document.querySelectorAll('#search-input, .search-bar').forEach(input => input.value = '');
    updateQuickFilterUI();
    filterProducts();
}
function setupSearchListeners() {
    document.addEventListener('input', async (e) => {
        const input = e.target;
        if (!input || (input.id !== 'search-input' && !input.classList.contains('search-bar') && input.type !== 'search')) {
            return;
        }
        const query = input.value.toLowerCase().trim();
        searchQuery = query;
        filterProducts();
        await fetchAndShowSuggestions(query);
    });
}
async function fetchAndShowSuggestions(query) {
    const searchContainer = document.getElementById('search-container');
    if (!searchContainer) return;
    let suggestionsBox = document.getElementById('search-suggestions-box') || document.getElementById('search-suggestions');
    if (!suggestionsBox) {
        suggestionsBox = document.createElement('div');
        suggestionsBox.id = 'search-suggestions-box';
        suggestionsBox.className = 'absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-2xl max-h-80 overflow-y-auto z-50 mt-1';
        searchContainer.appendChild(suggestionsBox);
    }
    if (!query) {
        suggestionsBox.innerHTML = '';
        suggestionsBox.classList.add('hidden');
        return;
    }
    try {
        const data = await safeFetchJson(`${BASE_URL}/api/product/all`);
        const matches = data.filter(item => {
            const name = (item.name || '').toLowerCase();
            const cat = (item.category || '').toLowerCase();
            return name.includes(query) || cat.includes(query);
        });
        if (matches.length === 0) {
            suggestionsBox.innerHTML = `<div class="p-4 text-center text-sm text-gray-400">No matching products found</div>`;
            suggestionsBox.classList.remove('hidden');
            return;
        }
        suggestionsBox.innerHTML = matches.map(prod => {
            const imgSrc = getImageUrl(prod.imagepath, '');
            const rawPrice = (prod.variants && prod.variants.length > 0 && prod.variants[0] && prod.variants[0].price != null)
                ? prod.variants[0].price
                : (prod.price ?? prod.discountprice ?? prod.productPrice ?? 'N/A');
            const cleanedPrice = (rawPrice === 'N/A' || rawPrice == null) ? '' : String(rawPrice).replace(/[^\d.]/g, '').trim();
            const displayPrice = cleanedPrice ? `₹ ${cleanedPrice}` : '';
            return `
                <a href="${getProductUrl(prod)}" class="flex items-center gap-3 p-3 hover:bg-[#E3F1FF] transition border-b border-gray-100 last:border-none group">
                    <img src="${imgSrc}" alt="${prod.name}" class="w-10 h-10 object-contain rounded bg-white border p-1">
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800 truncate group-hover:text-amber-700">${prod.name}</p>
                        ${displayPrice ? `<p class="text-xs text-amber-800 font-semibold" style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Segoe UI Symbol', sans-serif;">${displayPrice}</p>` : ''}
                    </div>
                    <i class="fa-solid fa-chevron-right text-xs text-gray-300 group-hover:text-amber-700"></i>
                </a>
            `;
        }).join('');
        suggestionsBox.classList.remove('hidden');
    } catch (err) {
        console.error("Error fetching suggestions:", err);
    }
}
function handleCartButtonClick(productId, buttonElement) {
    commitProductToCart(productId, buttonElement);
}
function commitProductToCart(productId, actionBtnElement) {
    const cardElement = actionBtnElement.closest('.product-card');
    if (!cardElement) return;
    const activeSelectedSizeBtn = cardElement.querySelector('.size-btn-container .bg-ink');
    const targetSizeText = activeSelectedSizeBtn ? activeSelectedSizeBtn.innerText.trim() : "Standard";
    const selectedRawPriceText = cardElement.querySelector('.product-price').innerText;
    const parsedPriceVal = parseInt(selectedRawPriceText.replace(/[^\d.]/g, '').trim()) || 0;
    const currentQtyVal = parseInt(cardElement.querySelector('.quantity')?.value) || 1;
    const targetNameText = cardElement.querySelector('.product-name')?.innerText || cardElement.querySelector('h3')?.innerText || 'Product';
    const descriptionElement = cardElement.querySelector('.product-desc-text');
    const targetDescText = descriptionElement ? descriptionElement.innerText.trim() : 'No description available';
    const imgElement = cardElement.querySelector('img');
    const targetImgSrc = imgElement ? imgElement.getAttribute('src') : '';
    let localCartArr = [];
    try {
        const currentCart = JSON.parse(localStorage.getItem('glowCart') || 'null');
        const legacyCart = JSON.parse(localStorage.getItem('glowRitualCartData') || 'null');
        localCartArr = Array.isArray(currentCart) ? currentCart : (Array.isArray(legacyCart) ? legacyCart : []);
    } catch (error) {
        console.warn('Invalid saved cart data was reset before adding an item.', error);
    }
    const uniqueCartKey = `${productId}__${targetSizeText}`;
    let matchingItem = localCartArr.find(cartItem => cartItem.id === uniqueCartKey || cartItem.uniqueCartItemKeyId === uniqueCartKey);
    if (matchingItem) {
        matchingItem.qty = (matchingItem.qty || matchingItem.qtyCountOrderMetric || 0) + currentQtyVal;
        matchingItem.qtyCountOrderMetric = matchingItem.qty;
    } else {
        localCartArr.push({
            id: uniqueCartKey,
            uniqueCartItemKeyId: uniqueCartKey,
            productId: productId,
            name: targetNameText,
            productName: targetNameText,
            productDescription: targetDescText,
            size: targetSizeText,
            activeSelectedSizeConfig: targetSizeText,
            price: parsedPriceVal,
            unitPriceItemConfig: parsedPriceVal,
            mrp: parsedPriceVal,
            qty: currentQtyVal,
            qtyCountOrderMetric: currentQtyVal,
            img: targetImgSrc,
            baseImg: targetImgSrc
        });
    }
    localStorage.setItem('glowCart', JSON.stringify(localCartArr));
    localStorage.setItem('glowRitualCartData', JSON.stringify(localCartArr));
    document.dispatchEvent(new Event('cartUpdated'));
    const primary = JSON.parse(localStorage.getItem('glowCart') || '[]');
    const legacy = JSON.parse(localStorage.getItem('glowRitualCartData') || '[]');
    const total = (Array.isArray(primary) && primary.length > 0 ? primary : legacy).reduce((t, it) => t + (parseInt(it.qty || it.qtyCountOrderMetric || 0) || 0), 0);
    document.querySelectorAll('#global-cart-badge, .cart-badge, #cart-count').forEach(b => { if (b) b.innerText = String(total); });
    localStorage.setItem('cartCount', String(total));
    syncCartCounterIcon();
    const cardImg = cardElement ? cardElement.querySelector("img") : null;
    if (cardImg && typeof window.flyToCartAnimation === "function") {
        window.flyToCartAnimation(cardImg);
    } else if (typeof window.updateHeaderCartCount === 'function') {
        window.updateHeaderCartCount();
    }
    const backupText = actionBtnElement.innerHTML;
    actionBtnElement.innerHTML = `<i class="fa-solid fa-circle-check text-xs"></i> Item Added!`;
    actionBtnElement.classList.replace('bg-[#A0522D]', 'bg-green-600');
    setTimeout(() => {
        actionBtnElement.innerHTML = backupText;
        actionBtnElement.classList.replace('bg-green-600', 'bg-[#A0522D]');
        const inputQty = cardElement.querySelector('.quantity');
        if (inputQty) inputQty.value = 1;
    }, 1200);
}
function syncCartCounterIcon() {
    const countDisplay = document.getElementById('cart-count');
    let netSum = 0;
    try {
        const primary = JSON.parse(localStorage.getItem('glowCart') || '[]');
        if (Array.isArray(primary) && primary.length > 0) {
            netSum = primary.reduce((total, item) => total + (parseInt(item.qty || item.qtyCountOrderMetric || 0) || 0), 0);
        } else {
            const legacy = JSON.parse(localStorage.getItem('glowRitualCartData') || '[]');
            if (Array.isArray(legacy) && legacy.length > 0) {
                netSum = legacy.reduce((total, item) => total + (parseInt(item.qtyCountOrderMetric || item.qty || 0) || 0), 0);
            }
        }
    } catch (err) {
        console.warn('Error reading cart for syncCartCounterIcon:', err);
    }
    if (countDisplay) countDisplay.innerText = netSum;
    document.querySelectorAll('#global-cart-badge, .cart-badge').forEach(b => { if (b) b.innerText = String(netSum); });
    localStorage.setItem('cartCount', String(netSum));
}
document.addEventListener('cartUpdated', () => {
    try { syncCartCounterIcon(); } catch (e) { console.warn('cartUpdated handler failed', e); }
});
function setupMobileMenu() {
    document.addEventListener("click", (e) => {
        const toggleFilterBtn = e.target.closest("#toggle-filter-btn");
        const closeFilterBtn = e.target.closest("#close-filter-btn");
        const backdrop = document.getElementById("filter-backdrop");
        const sidebar = document.getElementById("filter-sidebar");
        if (toggleFilterBtn && sidebar) {
            e.preventDefault();
            sidebar.classList.remove("hidden");
            if (backdrop) backdrop.classList.remove("hidden");
            requestAnimationFrame(() => {
                sidebar.classList.remove("translate-y-full");
                if (backdrop) backdrop.classList.remove("opacity-0");
            });
            document.body.style.overflow = "hidden";
            return;
        }
        if ((closeFilterBtn || e.target === backdrop) && sidebar) {
            e.preventDefault();
            sidebar.classList.add("translate-y-full");
            if (backdrop) backdrop.classList.add("opacity-0");
            setTimeout(() => {
                if (backdrop) backdrop.classList.add("hidden");
                document.body.style.overflow = "auto";
            }, 300);
            return;
        }
    });
}
document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('#search-open-btn');
    if (openBtn) {
        e.preventDefault();
        const searchContainer = document.getElementById('search-container');
        if (searchContainer) {
            searchContainer.classList.remove('hidden');
            const input = document.getElementById('search-input');
            if (input) input.focus();
        }
        return;
    }
    const closeBtn = e.target.closest('#search-close-btn');
    if (closeBtn) {
        e.preventDefault();
        const searchContainer = document.getElementById('search-container');
        if (searchContainer) {
            searchContainer.classList.add('hidden');
        }
        return;
    }
});
window.cycleCardImage = function(btnElement, direction) {
    const container = btnElement.closest('[data-images]');
    if (!container) return;
    try {
        const rawImages = JSON.parse(decodeURIComponent(container.dataset.images || "[]"));
        if (!rawImages.length) return;
        let currentIdx = parseInt(container.dataset.activeIdx || "0");
        currentIdx = (currentIdx + direction + rawImages.length) % rawImages.length;
        container.dataset.activeIdx = String(currentIdx);
        const imgEl = container.querySelector('.card-active-img');
        if (imgEl) imgEl.src = rawImages[currentIdx];
        const dots = container.querySelectorAll('.img-dot');
        dots.forEach((dot, idx) => {
            if (idx === currentIdx) {
                dot.className = "img-dot w-1.5 h-1.5 rounded-full bg-clay";
            } else {
                dot.className = "img-dot w-1.5 h-1.5 rounded-full bg-white/60";
            }
        });
    } catch (e) {
        console.error("Image cycle error:", e);
    }
};
let touchStartX = 0;
let touchEndX = 0;
document.addEventListener('touchstart', (e) => {
    const cardImgBox = e.target.closest('[data-images]');
    if (cardImgBox) {
        touchStartX = e.changedTouches[0].screenX;
    }
}, { passive: true });
document.addEventListener('touchend', (e) => {
    const cardImgBox = e.target.closest('[data-images]');
    if (cardImgBox) {
        touchEndX = e.changedTouches[0].screenX;
        const diffX = touchEndX - touchStartX;
        if (Math.abs(diffX) > 35) {
            const direction = diffX < 0 ? 1 : -1;
            const nextBtn = cardImgBox.querySelector(direction === 1 ? 'button:nth-of-type(2)' : 'button:nth-of-type(1)');
            if (nextBtn) window.cycleCardImage(nextBtn, direction);
        }
    }
}, { passive: true });
window.changeCardSize = changeCardSize;
window.updateQty = updateQty;
window.filterProducts = filterProducts;
window.updatePriceLabel = updatePriceLabel;
window.setRatingFilter = setRatingFilter;
window.applyQuickFilter = applyQuickFilter;
window.resetFilters = resetFilters;
window.commitProductToCart = commitProductToCart;
window.handleCartButtonClick = handleCartButtonClick;
document.addEventListener('partialsLoaded', () => {
    try { syncCartCounterIcon(); } catch (e) { console.warn('partialsLoaded sync failed', e); }
    if (typeof window.updateHeaderCartCount === 'function') {
        try { window.updateHeaderCartCount(); } catch (e) { console.warn('updateHeaderCartCount failed', e); }
    }
});

window.clearSkinTypeFilter = clearSkinTypeFilter;
window.clearConcernFilter = clearConcernFilter;
window.removeSingleConcern = removeSingleConcern;
