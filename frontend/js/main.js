import BASE_URL, { getImageUrl, safeFetchJson, getProductUrl } from "./config.js";
import "./wishlist.js";
document.addEventListener("partialsLoaded", () => {
    const mobileDropdownBtn = document.getElementById("mobile-dropdown-btn");
    const mobileDropdownMenu = document.getElementById("mobile-dropdown-menu");
    if (mobileDropdownBtn && mobileDropdownMenu) {
        const dropdownIcon = mobileDropdownBtn.querySelector("i");
        mobileDropdownBtn.addEventListener("click", () => {
            mobileDropdownMenu.classList.toggle("hidden");
            if (dropdownIcon) dropdownIcon.classList.toggle("rotate-180");
        });
    }
    updateHeaderCartCount();
});
window.addEventListener("load", () => {
    const initTreeCounter = () => {
        const counterElement = document.getElementById("tree-counter");
        const sectionElement = document.getElementById("green-initiative-section");
        if (!counterElement || !sectionElement) return;
        const targetCount = 1093966;
        const duration = 2000;
        let animationFrameId = null;
        function formatNumber(num) {
            return num.toLocaleString('en-IN');
        }
        function startCounting() {
            let startTime = null;
            function animate(currentTime) {
                if (!startTime) startTime = currentTime;
                const progress = currentTime - startTime;
                const progressPercentage = Math.min(progress / duration, 1);
                const easeOutQuad = progressPercentage * (2 - progressPercentage);
                const currentCount = Math.floor(easeOutQuad * targetCount);
                counterElement.innerText = formatNumber(currentCount) + "+";
                if (progress < duration) {
                    animationFrameId = requestAnimationFrame(animate);
                } else {
                    counterElement.innerText = formatNumber(targetCount) + "+";
                    counterElement.classList.add("scale-110", "text-white");
                    setTimeout(() => {
                        counterElement.classList.remove("scale-110", "text-white");
                    }, 300);
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    sectionElement.classList.remove("opacity-0", "translate-y-10");
                    sectionElement.classList.add("opacity-100", "translate-y-0");
                    startCounting();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.1 });
        observer.observe(sectionElement);
    };
    if ('requestIdleCallback' in window) {
        requestIdleCallback(initTreeCounter);
    } else {
        setTimeout(initTreeCounter, 2000);
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("testimonialContainer");
    if (!container) return;
    const slides = container.children;
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const dots = document.querySelectorAll(".dot");
    let currentIndex = 0;
    const totalSlides = slides.length;
    function updateSlider() {
        container.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.remove("bg-amber-200");
                dot.classList.add("bg-[#3B2418]", "w-2.5", "scale-110");
            } else {
                dot.classList.remove("bg-[#3B2418]", "scale-110");
                dot.classList.add("bg-amber-200", "w-2.5");
            }
        });
    }
    if (nextBtn) nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    });
    if (prevBtn) prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    });
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            currentIndex = index;
            updateSlider();
        });
    });
    updateSlider();
});
document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("slider-track");
    if (!track) return;
    const slides = track.children;
    const totalSlides = slides.length;
    const prevButton = document.querySelector(".hero-slider-prev");
    const nextButton = document.querySelector(".hero-slider-next");
    if (totalSlides <= 1) {
        if (prevButton) prevButton.style.display = 'none';
        if (nextButton) nextButton.style.display = 'none';
        return;
    }
    let currentIndex = 0;
    const updateSlider = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    const changeSlide = (direction) => {
        currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
        updateSlider();
    };

    if (prevButton) prevButton.addEventListener("click", () => changeSlide(-1));
    if (nextButton) nextButton.addEventListener("click", () => changeSlide(1));

    const sliderContainer = track.closest(".hero-slider-container");
    if (sliderContainer) {
        // Touch swipe support for mobile
        let startX = 0;
        let diffX = 0;
        sliderContainer.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
            diffX = 0;
        }, { passive: true });

        sliderContainer.addEventListener("touchmove", (e) => {
            diffX = e.touches[0].clientX - startX;
        }, { passive: true });

        sliderContainer.addEventListener("touchend", () => {
            if (Math.abs(diffX) > 40) {
                if (diffX < 0) {
                    currentIndex = (currentIndex + 1) % totalSlides;
                } else {
                    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                }
                updateSlider();
            }
        });
    }

    updateSlider();
});
function toggleCartState(button) {
    const card = button.closest('.product-card');
    if (!card) return;
    const activeSizeBtn = card.querySelector('.size-btn.bg-ink') || card.querySelector('.size-btn');
    const sizeText = activeSizeBtn ? activeSizeBtn.innerText.trim() : 'Standard';
    const productId = card.dataset.productId || card.dataset.id || card.querySelector('h3')?.innerText.trim() || 'product';
    const uniqueId = `${productId}__${sizeText}`;
    const nameEl = card.querySelector('h3') || card.querySelector('.product-name');
    const priceEl = card.querySelector('.product-price');
    const mrpEl = card.querySelector('.product-mrp');
    const imgEl = card.querySelector('img');
    const qtyInput = card.querySelector('.quantity');
    const name = nameEl ? nameEl.innerText.trim() : '';
    const priceText = priceEl ? priceEl.innerText.replace(/[^\d.]/g, '') : '0';
    const mrpText = mrpEl ? mrpEl.innerText.replace(/[^\d.]/g, '') : priceText;
    const price = parseFloat(priceText) || 0;
    const mrp = parseFloat(mrpText) || price;
    const img = imgEl ? imgEl.getAttribute('src') : '';
    const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
    addToCart(uniqueId, name, price, img, qty, sizeText, mrp);
    const originalHTML = button.innerHTML;
    button.innerHTML = `<i class="fa-solid fa-circle-check text-xs"></i> Added to Cart`;
    button.disabled = true;
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.disabled = false;
    }, 1200);
}
function getFeaturedCart() {
    try {
        const currentCart = JSON.parse(localStorage.getItem('glowCart') || 'null');
        const legacyCart = JSON.parse(localStorage.getItem('glowRitualCartData') || 'null');
        return Array.isArray(currentCart) ? currentCart : (Array.isArray(legacyCart) ? legacyCart : []);
    } catch (error) {
        console.warn('Unable to read featured product quantities from the cart.', error);
        return [];
    }
}
function getFeaturedCartItemId(card) {
    const activeSizeBtn = Array.from(card.querySelectorAll('.size-btn'))
        .find(button => button.classList.contains('border-[#3B2418]')) || card.querySelector('.size-btn');
    const size = activeSizeBtn ? activeSizeBtn.innerText.trim() : 'Standard';
    const productId = card.dataset.productId || card.dataset.id || card.querySelector('h3')?.innerText.trim() || 'product';
    return `${productId}__${size}`;
}
function renderFeaturedCartControl(card) {
    const control = card.querySelector('.featured-cart-control');
    if (!control) return;
    const itemId = getFeaturedCartItemId(card);
    const item = getFeaturedCart().find(cartItem => cartItem.id === itemId || cartItem.uniqueCartItemKeyId === itemId);
    const quantity = Math.max(0, Number(item?.qty || item?.qtyCountOrderMetric || 0));

    if (quantity > 0) {
        control.innerHTML = `
            <div class="flex w-full items-center justify-between rounded-lg bg-[#8EC5FF] px-3 py-1.5 text-[#3B2418]">
                <button type="button" onclick="changeFeaturedCartQuantity(this, -1)" aria-label="Decrease quantity" class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold">−</button>
                <span class="text-sm font-bold" aria-live="polite">Qty: ${quantity}</span>
                <button type="button" onclick="changeFeaturedCartQuantity(this, 1)" aria-label="Increase quantity" class="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-bold">+</button>
            </div>
        `;
        return;
    }

    control.innerHTML = `
        <button type="button" onclick="addFeaturedProductToCart(this)" class="w-full bg-[#8EC5FF] hover:bg-[#6FB3F5] text-[#3B2418] font-bold py-2.5 sm:py-3 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer">
            <svg class="w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span>Add to Cart</span>
        </button>
    `;
}
function syncFeaturedCartCards() {
    document.querySelectorAll('#productSliderWrapper .product-card').forEach(renderFeaturedCartControl);
}
function addFeaturedProductToCart(button) {
    const card = button.closest('.product-card');
    if (!card) return;
    const activeSizeBtn = Array.from(card.querySelectorAll('.size-btn'))
        .find(sizeButton => sizeButton.classList.contains('border-[#3B2418]')) || card.querySelector('.size-btn');
    const size = activeSizeBtn ? activeSizeBtn.innerText.trim() : 'Standard';
    const name = card.querySelector('h3')?.innerText.trim() || '';
    const priceText = card.querySelector('.product-price')?.innerText.replace(/[^\d.]/g, '') || '0';
    const mrpText = card.querySelector('.product-mrp')?.innerText.replace(/[^\d.]/g, '') || priceText;
    const image = card.querySelector('img')?.getAttribute('src') || '';
    addToCart(
        getFeaturedCartItemId(card),
        name,
        parseFloat(priceText) || 0,
        image,
        1,
        size,
        parseFloat(mrpText) || parseFloat(priceText) || 0
    );
    renderFeaturedCartControl(card);
}
function changeFeaturedCartQuantity(button, change) {
    const card = button.closest('.product-card');
    if (!card) return;
    const itemId = getFeaturedCartItemId(card);
    const cart = getFeaturedCart();
    const itemIndex = cart.findIndex(item => item.id === itemId || item.uniqueCartItemKeyId === itemId);
    if (itemIndex === -1) {
        renderFeaturedCartControl(card);
        return;
    }

    const nextQuantity = Number(cart[itemIndex].qty || cart[itemIndex].qtyCountOrderMetric || 0) + change;
    if (nextQuantity <= 0) {
        cart.splice(itemIndex, 1);
    } else {
        cart[itemIndex].qty = nextQuantity;
        cart[itemIndex].qtyCountOrderMetric = nextQuantity;
    }
    localStorage.setItem('glowCart', JSON.stringify(cart));
    localStorage.setItem('glowRitualCartData', JSON.stringify(cart));
    document.dispatchEvent(new Event('cartUpdated'));
    updateHeaderCartCount();
    renderFeaturedCartControl(card);
}
function addToCart(id, name, price, img, qty = 1, size = 'Standard', mrp = 0) {
    let cart = [];
    try {
        const currentCart = JSON.parse(localStorage.getItem('glowCart') || 'null');
        const legacyCart = JSON.parse(localStorage.getItem('glowRitualCartData') || 'null');
        cart = Array.isArray(currentCart) ? currentCart : (Array.isArray(legacyCart) ? legacyCart : []);
    } catch (error) {
        console.warn('Invalid saved cart data was reset before adding an item.', error);
    }
    let existingProduct = cart.find(item => item.id === id || item.uniqueCartItemKeyId === id);
    if (existingProduct) {
        existingProduct.qty = (existingProduct.qty || existingProduct.qtyCountOrderMetric || 0) + qty;
        existingProduct.qtyCountOrderMetric = existingProduct.qty;
    } else {
        cart.push({ 
            id: id, 
            uniqueCartItemKeyId: id,
            name: name, 
            productName: name,
            price: price, 
            unitPriceItemConfig: price,
            mrp: mrp || price, 
            img: img, 
            baseImg: img,
            qty: qty, 
            qtyCountOrderMetric: qty,
            size: size,
            activeSelectedSizeConfig: size
        });
    }
    localStorage.setItem('glowCart', JSON.stringify(cart));
    localStorage.setItem('glowRitualCartData', JSON.stringify(cart));
    document.dispatchEvent(new Event('cartUpdated'));
    updateHeaderCartCount();
}
function updateHeaderCartCount() {
    let cart = [];
    try {
        const savedCart = JSON.parse(localStorage.getItem('glowCart') || '[]');
        cart = Array.isArray(savedCart) ? savedCart : [];
    } catch (error) {
        console.warn('Unable to read cart count.', error);
    }
    let totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('global-cart-badge');
    if (badge) badge.innerText = totalItems;
    document.querySelectorAll(".cart-badge").forEach(b => {
        b.innerText = totalItems;
    });
}
function selectSize(size, price, mrp, element) {
    const currentCard = element.closest('.product-card');
    if (!currentCard) return;
    const priceElement = currentCard.querySelector('.product-price');
    const mrpElement = currentCard.querySelector('.product-mrp');
    if (priceElement) priceElement.innerHTML = `<span style="font-family:Arial,'Noto Sans',sans-serif">&#8377;</span> ${price}`;
    if (mrpElement) mrpElement.innerHTML = `<span style="font-family:Arial,'Noto Sans',sans-serif">&#8377;</span> ${mrp}`;
    currentCard.querySelectorAll('.size-btn').forEach(btn => {
        btn.className = "size-btn text-xs border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 text-gray-600 font-medium transition";
    });
    element.className = "size-btn text-xs border border-[#0f2c3d] px-3 py-1 rounded bg-[#0f2c3d] text-white font-medium transition shadow-sm";
}
function updateQty(change, element) {
    const currentCard = element.closest('.product-card');
    if (!currentCard) return;
    const qtyInput = currentCard.querySelector('.quantity');
    if (qtyInput) {
        let currentVal = parseInt(qtyInput.value);
        if (isNaN(currentVal)) currentVal = 1;
        currentVal += change;
        if (currentVal < 1) currentVal = 1;
        qtyInput.value = currentVal;
    }
}
window.addEventListener('load', updateHeaderCartCount);
document.addEventListener("partialsLoaded", function () {
    const searchContainer = document.getElementById("search-container");
    const searchInput = document.getElementById("search-input");
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery && (window.location.pathname.includes("moreproduct.html") || window.location.pathname === "/products") && searchContainer && searchInput) {
        searchContainer.classList.remove("hidden");
        searchInput.value = searchQuery;
        setTimeout(() => {
            if (typeof filterProducts === "function") {
                filterProducts(searchQuery.toLowerCase());
            }
        }, 300);
    }
});
function filterProducts(query) {
    const productCards = document.querySelectorAll(".product-card"); 
    productCards.forEach(card => {
        const productNameElement = card.querySelector(".product-name"); 
        if (productNameElement) {
            const productNameText = productNameElement.textContent.toLowerCase();
            if (productNameText.includes(query)) {
                card.style.display = "block"; 
            } else {
                card.style.display = "none";
            }
        }
    });
}
let currentScrollAmount = 0;
async function loadSliderProducts() {
    const wrapper = document.getElementById('productSliderWrapper');
    let productList = [];
    try {
        const products = await safeFetchJson(`${BASE_URL}/api/product/all`);
        productList = Array.isArray(products) ? products : (products?.products || products?.data || []);
    } catch (err) {
        console.warn("Featured products API fetch failed, using default showcase products:", err);
    }

    // Curated 4 Best Seller items requested by user:
    // 1. Facewash (Purifying Glow Face Wash)
    // 2. Serum (Brightening & Hydrating Face Serum)
    // 3. Travel Pack (Alora Radiance Travel Essentials Kit)
    // 4. Combo of Lotion + Cream (Hydration Duo)
    const targetConfigs = [
        {
            key: 'facewash',
            matcher: (p) => {
                const slug = (p.slug || '').toLowerCase();
                const name = (p.name || '').toLowerCase();
                const type = (p.productType || '').toLowerCase();
                return slug === 'purifying-glow-face-wash' || type === 'cleanser' || name.includes('face wash') || name.includes('facewash');
            },
            fallback: {
                id: "feat_facewash",
                _id: "6a77087799c1b5eff8a680cb",
                name: "Alora Purifying Glow Face Wash",
                slug: "purifying-glow-face-wash",
                category: "face",
                productType: "cleanser",
                isBestseller: true,
                rating: 4.8,
                reviewsCount: 48,
                averageReviewRating: 4.8,
                imagepath: "https://res.cloudinary.com/hgefnsjm/image/upload/v1795011183/ecommerce/rlvqxeaj5tfblxeszlbc.webp",
                price: 499,
                comparePrice: 533,
                variants: [
                    { volume: "200ml", price: 499, comparePrice: 533, stock: 10 }
                ]
            }
        },
        {
            key: 'serum',
            matcher: (p) => {
                const slug = (p.slug || '').toLowerCase();
                const name = (p.name || '').toLowerCase();
                const type = (p.productType || '').toLowerCase();
                return slug === 'brightening-hydrating-face-serum' || type === 'serum' || (name.includes('serum') && !name.includes('combo') && !name.includes('trio'));
            },
            fallback: {
                id: "feat_serum",
                _id: "6a770ae64deebd68ab27ded2",
                name: "Alora Brightening & Hydrating Face Serum",
                slug: "brightening-hydrating-face-serum",
                category: "face",
                productType: "serum",
                isBestseller: true,
                rating: 4.9,
                reviewsCount: 52,
                averageReviewRating: 4.9,
                imagepath: "https://res.cloudinary.com/hgefnsjm/image/upload/v1795011203/ecommerce/wcjje7m6zs8f7c1mxqdn.webp",
                price: 649,
                comparePrice: 999,
                variants: [
                    { volume: "30ml", price: 649, comparePrice: 999, stock: 10 }
                ]
            }
        },
        {
            key: 'travel',
            matcher: (p) => {
                const slug = (p.slug || '').toLowerCase();
                const name = (p.name || '').toLowerCase();
                return slug === 'alora-radiance-travel-essentials-kit' || slug.includes('travel') || name.includes('travel');
            },
            fallback: {
                id: "feat_travel",
                _id: "6a6c2d16478a84d9d7169bcf",
                name: "Alora Radiance Travel Essentials Kit",
                slug: "alora-radiance-travel-essentials-kit",
                category: "combo",
                productType: "combo",
                isBestseller: true,
                rating: 4.9,
                reviewsCount: 64,
                averageReviewRating: 4.9,
                imagepath: "https://res.cloudinary.com/hgefnsjm/image/upload/v1795330254/ecommerce/noeipnnyi3113xncgejn.png",
                price: 149,
                comparePrice: 499,
                variants: [
                    { volume: "Combo", price: 149, comparePrice: 499, stock: 10 }
                ]
            }
        },
        {
            key: 'combo_lotion_cream',
            matcher: (p) => {
                const slug = (p.slug || '').toLowerCase();
                const name = (p.name || '').toLowerCase();
                const desc = (p.description || '').toLowerCase();
                return slug === 'hydration-duo' || name.includes('hydration duo') || (name.includes('duo') && (desc.includes('lotion') || name.includes('lotion')) && (desc.includes('cream') || name.includes('cream')));
            },
            fallback: {
                id: "feat_combo",
                _id: "6a6c2c90478a84d9d7169bcb",
                name: "Alora Hydration Duo (Lotion + Cream)",
                slug: "hydration-duo",
                category: "combo",
                productType: "combo",
                isBestseller: true,
                rating: 4.9,
                reviewsCount: 45,
                averageReviewRating: 4.9,
                imagepath: "https://res.cloudinary.com/hgefnsjm/image/upload/v1795167559/ecommerce/wi8jbenmilbmbondlhwe.png",
                price: 1399,
                comparePrice: 1598,
                variants: [
                    { volume: "Combo", price: 1399, comparePrice: 1598, stock: 10 }
                ]
            }
        }
    ];

    const showcaseProducts = targetConfigs.map(cfg => {
        const found = productList.find(cfg.matcher);
        if (found) {
            return { ...found, isBestseller: true };
        }
        return cfg.fallback;
    });

    updateHeroBannerProductLinks(productList);
    if (!wrapper) return;

    requestAnimationFrame(() => {
        wrapper.innerHTML = showcaseProducts.map((product, index) => {
            const prodId = product._id || product.id || product.slug || 'prod_' + Math.random();
            const fullImgUrl = getImageUrl(product.imagepath, '/static/placeholder.png');
            const reviewCount = Number(product.reviewsCount) || 0;
            const ratingScore = Number(product.averageReviewRating) || 0;
            let starsHTML = '';
            if (reviewCount > 0) {
                for (let i = 1; i <= 5; i++) {
                    starsHTML += i <= Math.floor(ratingScore)
                        ? `<i class="fa-solid fa-star text-amber-500"></i>`
                        : i - 0.5 <= ratingScore
                            ? `<i class="fa-solid fa-star-half-stroke text-amber-500"></i>`
                            : `<i class="fa-regular fa-star text-stone-300"></i>`;
                }
            }

            let sizeButtonsHTML = '';
            let initialPrice = 0;
            let initialComparePrice = '';
            let initialSizeLabel = '30ml';

            if (product.variants && product.variants.length > 0) {
                initialPrice = product.variants[0].price;
                initialComparePrice = product.variants[0].comparePrice || '';
                initialSizeLabel = product.variants[0].volume || 'Standard';
                sizeButtonsHTML = product.variants.map((v, vIndex) => {
                    const isActive = vIndex === 0;
                    const activeClasses = isActive
                        ? 'bg-[#3B2418] text-[#F2EBDA] border-[#3B2418]'
                        : 'border-stone-300 text-stone-700 hover:border-[#3B2418]';
                    return `
                        <button
                            type="button"
                            onclick="changeCardSize('${v.volume}', ${v.price}, ${v.comparePrice || 0}, this)"
                            class="size-btn text-[11px] px-2.5 py-0.5 rounded-full border font-semibold transition ${activeClasses}"
                        >
                            ${v.volume}
                        </button>
                    `;
                }).join('');
            } else {
                initialPrice = product.price || 0;
                initialComparePrice = product.comparePrice || product.mrp || '';
                initialSizeLabel = product.size || (product.category && product.category.toLowerCase().includes('wash') ? '100ml' : '30ml');
            }

            const pct = (initialComparePrice && Number(initialComparePrice) > Number(initialPrice))
                ? Math.round(((Number(initialComparePrice) - Number(initialPrice)) / Number(initialComparePrice)) * 100)
                : 0;

            const sizeText = (initialSizeLabel || '').trim();
            const sizeDisplay = (sizeText && !['standard', 'undefined', 'null', 'combo'].includes(sizeText.toLowerCase())) ? `(${sizeText})` : '';

            const reviewSummary = reviewCount > 0
                ? `<span class="font-bold text-amber-700 text-xs">${ratingScore.toFixed(1)}</span>
                    <div class="flex gap-0.5 text-xs">${starsHTML}</div>
                    <svg class="w-3 h-3 text-stone-400 inline" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                    <span class="text-stone-500 text-[11px] font-medium font-sans">(${reviewCount})</span>`
                : '<span class="text-stone-500 text-[11px] font-medium font-sans">No reviews</span>';

            return `
            <div data-product-id="${prodId}" class="relative w-[calc(80%-8px)] sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)] flex-shrink-0 snap-center product-card bg-white rounded-xl shadow-xs hover:shadow-md border border-stone-200/90 flex flex-col justify-between overflow-hidden transition-shadow duration-300">
                <div>
                    <!-- Product Image Container -->
                    <div class="relative w-full aspect-square overflow-hidden bg-[#FAF7F2] p-2 flex items-center justify-center">
                        <a href="${getProductUrl(product)}" class="w-full h-full block">
                            <img src="${fullImgUrl}" alt="${product.name}" loading="${index < 2 ? 'eager' : 'lazy'}" fetchpriority="${index === 0 ? 'high' : 'auto'}" decoding="async" class="product-card-img w-full h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105">
                        </a>

                        <!-- Floating Top-Right Wishlist Button -->
                        <button type="button" onclick="window.handleCardWishlistToggle && window.handleCardWishlistToggle('${prodId}', this, event)" class="wishlist-toggle-btn absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-500 hover:text-rose-600 shadow-xs border border-stone-200/60 flex items-center justify-center cursor-pointer transition-colors" title="Add to Wishlist" aria-label="Add to Wishlist">
                            <i class="fa-regular fa-heart text-xs sm:text-sm hover:text-rose-600 transition-colors"></i>
                        </button>
                    </div>

                    <!-- Product Info Section (Amazon Card Style from Image) -->
                    <div class="px-3.5 sm:px-4 pt-3 pb-2 flex flex-col text-left">
                        
                        <!-- Title (2 lines clamp, Times New Roman, bold) -->
                        <h3 class="text-sm sm:text-[15px] font-bold text-[#3B2418] leading-snug line-clamp-2 hover:text-[#205D96] transition-colors mb-1.5">
                            <a href="${getProductUrl(product)}" class="block">${product.name}</a>
                        </h3>

                        <!-- Rating and review count come from submitted customer reviews. -->
                        <div class="flex items-center gap-1.5 text-xs text-[#3B2418] mb-2">
                            ${reviewSummary}
                        </div>

                        <!-- Deal / Promo Badge (Crimson banner like in user screenshot) -->
                        <div class="mb-2">
                            <span class="inline-block bg-[#C43826] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs">
                                ${product.isBestseller ? 'Bestseller Deal' : (pct > 0 ? `${pct}% OFF DEAL` : 'Special Offer')}
                            </span>
                        </div>

                        <!-- Price Row (Amazon Layout: bold large rupee + price + unit size) -->
                        <div class="flex items-baseline flex-wrap gap-1 mb-0.5">
                            <span class="text-xs font-semibold text-[#3B2418] align-super">₹</span>
                            <span class="product-price text-2xl font-bold text-[#3B2418] tracking-tight leading-none">${initialPrice}</span>
                            ${sizeDisplay ? `<span class="unit-size-text text-[11px] text-stone-500 font-normal">${sizeDisplay}</span>` : ''}
                        </div>

                        <!-- MRP & Discount Row: "M.R.P.: ₹4,250 (20% off)" -->
                        <div class="text-xs text-stone-600 mb-1.5">
                            ${initialComparePrice ? `M.R.P.: <span class="product-mrp line-through text-stone-400 font-mono">₹${initialComparePrice}</span> <span class="discount-badge text-emerald-800 font-bold">(${pct}% off)</span>` : ''}
                        </div>

                        <!-- Size Variant Selection Buttons -->
                        ${sizeButtonsHTML ? `
                        <div class="flex items-center gap-1.5 flex-wrap my-1 size-btn-container">
                            ${sizeButtonsHTML}
                        </div>
                        ` : ''}

                    </div>
                </div>

                <!-- Add to Cart CTA Button -->
                <div class="featured-cart-control px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1">
                    <button type="button" onclick="addFeaturedProductToCart(this)" class="w-full bg-[#8EC5FF] hover:bg-[#6FB3F5] text-[#3B2418] font-bold py-2.5 sm:py-3 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer">
                        <svg class="w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
            `;
        }).join(" ");
        if (window.syncWishlistHeartsOnPage) {
            window.syncWishlistHeartsOnPage();
        }
        syncFeaturedCartCards();
    });
}
function changeCardSize(volume, price, comparePrice, buttonElement) {
    const card = buttonElement.closest('.product-card');
    if (!card) return;
    const buttons = card.querySelectorAll('.size-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-[#3B2418]', 'text-[#F2EBDA]', 'border-[#3B2418]');
        btn.classList.add('border-stone-300', 'text-stone-700');
    });
    buttonElement.classList.add('bg-[#3B2418]', 'text-[#F2EBDA]', 'border-[#3B2418]');
    buttonElement.classList.remove('border-stone-300', 'text-stone-700');

    const priceEl = card.querySelector('.product-price');
    const mrpEl = card.querySelector('.product-mrp');
    const unitEl = card.querySelector('.unit-size-text');
    const discountEl = card.querySelector('.discount-badge');

    if (priceEl) {
        priceEl.textContent = `${price}`;
    }
    if (mrpEl) {
        mrpEl.innerHTML = comparePrice ? `<span style="font-family:Arial,'Noto Sans',sans-serif">&#8377;</span>${comparePrice}` : '';
    }
    if (unitEl) {
        const cleanVol = (volume || '').trim();
        unitEl.textContent = (cleanVol && !['standard', 'undefined', 'null', 'combo'].includes(cleanVol.toLowerCase())) ? `(${cleanVol})` : '';
    }
    if (discountEl) {
        if (comparePrice && Number(comparePrice) > Number(price)) {
            const pct = Math.round(((Number(comparePrice) - Number(price)) / Number(comparePrice)) * 100);
            if (pct > 0) {
                discountEl.textContent = `(${pct}% off)`;
                discountEl.style.display = 'inline-block';
            } else {
                discountEl.style.display = 'none';
            }
        } else {
            discountEl.style.display = 'none';
        }
    }
    renderFeaturedCartControl(card);
}

function slideProducts(direction) {
    const container = document.getElementById('productSliderContainer');
    const wrapper = document.getElementById('productSliderWrapper');
    if (!container || !wrapper) return;
    const firstCard = wrapper.querySelector('.product-card');
    const scrollAmount = firstCard ? (firstCard.offsetWidth + 16) : 300;
    requestAnimationFrame(() => {
        if (direction === 'right') {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    });
}
function updateHeroBannerProductLinks(productList) {
    if (!Array.isArray(productList) || productList.length === 0) return;
    const heroLinks = document.querySelectorAll('.hero-slide-link');
    heroLinks.forEach((linkEl) => {
        const currentHref = linkEl.getAttribute('href') || '';
        const pathMatch = currentHref.match(/\/product\/([^/?#]+)/i);
        if (!pathMatch) return;
        const targetSlug = decodeURIComponent(pathMatch[1]).toLowerCase();
        const matchedProd = productList.find((p) => {
            const pSlug = (p.slug || '').toLowerCase();
            const pNameSlug = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            return pSlug === targetSlug || pNameSlug === targetSlug || pSlug.includes(targetSlug) || targetSlug.includes(pSlug);
        });
        if (matchedProd) {
            linkEl.href = getProductUrl(matchedProd);
        }
    });
}
let sliderProductsInitialized = false;
function safeInitSliderProducts() {
    if (sliderProductsInitialized) return;
    sliderProductsInitialized = true;
    loadSliderProducts();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitSliderProducts);
} else {
    safeInitSliderProducts();
}
document.addEventListener('partialsLoaded', safeInitSliderProducts);
document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-routine-video-btn');
    const containerSlot = document.getElementById('video-container-slot');
    if (!playBtn || !containerSlot) return;
    playBtn.addEventListener('click', () => {
        containerSlot.classList.remove('hidden');
        containerSlot.innerHTML = `
            <video controls autoplay class="w-full h-full object-contain">
                <source src="./static/how-to-use.mp4" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const sliderContainer = document.getElementById("productSliderContainer");
    if (!sliderContainer) return;
    let isDown = false;
    let startX;
    let scrollLeft;

    sliderContainer.addEventListener("mousedown", (e) => {
        isDown = true;
        sliderContainer.classList.add("cursor-grabbing");
        startX = e.pageX - sliderContainer.offsetLeft;
        scrollLeft = sliderContainer.scrollLeft;
    });
    sliderContainer.addEventListener("mouseleave", () => {
        isDown = false;
        sliderContainer.classList.remove("cursor-grabbing");
    });
    sliderContainer.addEventListener("mouseup", () => {
        isDown = false;
        sliderContainer.classList.remove("cursor-grabbing");
    });
    sliderContainer.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - sliderContainer.offsetLeft;
        const walk = (x - startX) * 1.5;
        sliderContainer.scrollLeft = scrollLeft - walk;
    });
});
window.toggleCartState = toggleCartState;
window.selectSize = selectSize;
window.changeCardSize = changeCardSize; 
window.updateQty = updateQty;
window.slideProducts = slideProducts;
window.loadSliderProducts = loadSliderProducts;
window.addFeaturedProductToCart = addFeaturedProductToCart;
window.changeFeaturedCartQuantity = changeFeaturedCartQuantity;
document.addEventListener('cartUpdated', syncFeaturedCartCards);
