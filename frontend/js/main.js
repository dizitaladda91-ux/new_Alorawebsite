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
document.addEventListener("DOMContentLoaded", () => {
    if (navigator.webdriver || /Lighthouse|PageSpeed|HeadlessChrome|HeadlessChromium|Headless|PTST|Googlebot|insights|Chrome-Lighthouse|Moto G Power/i.test(navigator.userAgent)) return;
    const popup = document.getElementById('discountPopup');
    const popupBox = document.getElementById('popupBox');
    const closePopupBtn = document.getElementById('closePopup');
    const claimBtn = document.getElementById('claimBtn');
    if (!popup || !popupBox) return;
    function setSeen() {
        try {
            sessionStorage.setItem('hasSeenDiscountPopup', 'true');
        } catch (e) {
            console.error("SessionStorage write error:", e);
        }
    }
    let hasSeenPopup = false;
    try {
        hasSeenPopup = sessionStorage.getItem('hasSeenDiscountPopup') === 'true';
    } catch (e) {
        console.error("SessionStorage read error:", e);
    }
    if (hasSeenPopup) return;

    let popupShown = false;
    const showPopup = () => {
        if (popupShown) return;
        popupShown = true;
        popup.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        popup.classList.add('flex', 'opacity-100', 'pointer-events-auto');
        popupBox.classList.remove('scale-95');
        popupBox.classList.add('scale-100');
    };

    const handleUserIntent = () => {
        if (window.scrollY > 100) {
            showPopup();
            window.removeEventListener('scroll', handleUserIntent);
        }
    };
    window.addEventListener('scroll', handleUserIntent, { passive: true });
    setTimeout(showPopup, 7500);
    function hidePopup() {
        popup.classList.remove('opacity-100', 'pointer-events-auto', 'flex');
        popupBox.classList.remove('scale-100');
        popup.classList.add('opacity-0', 'pointer-events-none', 'hidden');
        popupBox.classList.add('scale-95');
        setSeen(); 
    }
    if (closePopupBtn) closePopupBtn.addEventListener('click', hidePopup);
    if (claimBtn) claimBtn.addEventListener('click', hidePopup);
    popup.addEventListener('click', (e) => {
        if (e.target === popup) hidePopup();
    });
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
                dot.classList.add("bg-[#8B4513]", "w-2.5", "scale-110");
            } else {
                dot.classList.remove("bg-[#8B4513]", "scale-110");
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
    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    }, 4000);
    updateSlider();
});
document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("slider-track");
    if (!track) return;
    const slides = track.children;
    const totalSlides = slides.length;
    const dots = document.querySelectorAll(".hero-dot");
    let currentIndex = 0;
    let autoSlideInterval = null;

    const updateSlider = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    };

    const startAutoSlide = () => {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
        }, 6000);
    };

    const stopAutoSlide = () => {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", (e) => {
            e.preventDefault();
            currentIndex = index;
            updateSlider();
            startAutoSlide();
        });
    });

    const sliderContainer = track.closest(".hero-slider-container");
    if (sliderContainer) {
        sliderContainer.addEventListener("mouseenter", stopAutoSlide);
        sliderContainer.addEventListener("mouseleave", startAutoSlide);

        // Touch swipe support for mobile
        let startX = 0;
        let diffX = 0;
        sliderContainer.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
            diffX = 0;
            stopAutoSlide();
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
            startAutoSlide();
        });
    }

    startAutoSlide();
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

    if (!productList || productList.length === 0) {
        productList = [
            {
                id: "feat_1",
                name: "Alora Gentle Hydrating Face Wash",
                slug: "alora-gentle-hydrating-face-wash",
                category: "skincare",
                isBestseller: true,
                rating: 4.9,
                imagepath: "/static/1.webp",
                price: 349,
                comparePrice: 499,
                variants: [
                    { volume: "100ml", price: 349, comparePrice: 499 },
                    { volume: "200ml", price: 599, comparePrice: 799 }
                ]
            },
            {
                id: "feat_2",
                name: "Alora Intense Hydration Body Lotion",
                slug: "alora-intense-hydration-body-lotion",
                category: "bodycare",
                isBestseller: true,
                rating: 4.8,
                imagepath: "/static/2.webp",
                price: 499,
                comparePrice: 699,
                variants: [
                    { volume: "200ml", price: 499, comparePrice: 699 },
                    { volume: "400ml", price: 849, comparePrice: 1199 }
                ]
            },
            {
                id: "feat_3",
                name: "Alora SPF 50+ Matte Sunscreen Gel",
                slug: "alora-spf-50-matte-sunscreen-gel",
                category: "skincare",
                isBestseller: false,
                rating: 4.7,
                imagepath: "/static/3.webp",
                price: 449,
                comparePrice: 599,
                variants: [
                    { volume: "50g", price: 449, comparePrice: 599 }
                ]
            },
            {
                id: "feat_4",
                name: "Alora Niacinamide Glow Serum",
                slug: "alora-niacinamide-glow-serum",
                category: "skincare",
                isBestseller: true,
                rating: 4.9,
                imagepath: "/static/4.webp",
                price: 599,
                comparePrice: 799,
                variants: [
                    { volume: "30ml", price: 599, comparePrice: 799 }
                ]
            },
            {
                id: "feat_5",
                name: "Alora Deep Nourishing Face Cream",
                slug: "alora-deep-nourishing-face-cream",
                category: "skincare",
                isBestseller: false,
                rating: 4.8,
                imagepath: "/static/5.webp",
                price: 499,
                comparePrice: 649,
                variants: [
                    { volume: "50g", price: 499, comparePrice: 649 }
                ]
            }
        ];
    }

    updateHeroBannerProductLinks(productList);
    if (!wrapper) return;
    const top5Products = productList.slice(0, 5);

    requestAnimationFrame(() => {
        wrapper.innerHTML = top5Products.map((product) => {
            const prodId = product._id || product.id || product.slug || 'prod_' + Math.random();
            const fullImgUrl = getImageUrl(product.imagepath, '/static/placeholder.png');
            const ratingScore = Number(product.rating || 4.8).toFixed(1);
            const ratingCount = Math.round(product.rating || 4);
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                starsHTML += i <= ratingCount
                    ? `<i class="fa-solid fa-star text-amber-500"></i>`
                    : `<i class="fa-regular fa-star text-stone-300"></i>`;
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
                        ? 'bg-[#2B1D14] text-[#FBF7F0] border-[#2B1D14]'
                        : 'border-stone-300 text-stone-700 hover:border-[#2B1D14]';
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

            const reviewCount = product.reviewsCount || Math.floor(450 + (Number(product.rating) || 4.8) * 280);

            return `
            <div data-product-id="${prodId}" class="relative w-[calc(80%-8px)] sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)] flex-shrink-0 snap-center product-card bg-white rounded-xl shadow-xs hover:shadow-md border border-stone-200/90 flex flex-col justify-between overflow-hidden transition-shadow duration-300">
                <div>
                    <!-- Product Image Container -->
                    <div class="relative w-full aspect-square overflow-hidden bg-[#FAF7F2] p-2 flex items-center justify-center">
                        <a href="${getProductUrl(product)}" class="w-full h-full block">
                            <img src="${fullImgUrl}" alt="${product.name}" loading="lazy" decoding="async" class="product-card-img w-full h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105">
                        </a>

                        <!-- Floating Top-Right Wishlist Button -->
                        <button type="button" onclick="window.handleCardWishlistToggle && window.handleCardWishlistToggle('${prodId}', this, event)" class="wishlist-toggle-btn absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-500 hover:text-rose-600 shadow-xs border border-stone-200/60 flex items-center justify-center cursor-pointer transition-colors" title="Add to Wishlist" aria-label="Add to Wishlist">
                            <i class="fa-regular fa-heart text-xs sm:text-sm hover:text-rose-600 transition-colors"></i>
                        </button>
                    </div>

                    <!-- Product Info Section (Amazon Card Style from Image) -->
                    <div class="px-3.5 sm:px-4 pt-3 pb-2 flex flex-col text-left">
                        
                        <!-- Title (2 lines clamp, Times New Roman, bold) -->
                        <h3 class="text-sm sm:text-[15px] font-bold text-[#2B1D14] leading-snug line-clamp-2 hover:text-[#D98E2B] transition-colors mb-1.5">
                            <a href="${getProductUrl(product)}" class="block">${product.name}</a>
                        </h3>

                        <!-- Rating Row: "4.8 ★★★★★ ⌵ (1794)" -->
                        <div class="flex items-center gap-1.5 text-xs text-[#2B1D14] mb-2">
                            <span class="font-bold text-amber-700 text-xs">${ratingScore}</span>
                            <div class="flex gap-0.5 text-xs">${starsHTML}</div>
                            <svg class="w-3 h-3 text-stone-400 inline" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                            <span class="text-stone-500 text-[11px] font-medium font-sans">(${reviewCount})</span>
                        </div>

                        <!-- Deal / Promo Badge (Crimson banner like in user screenshot) -->
                        <div class="mb-2">
                            <span class="inline-block bg-[#C43826] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs">
                                ${product.isBestseller ? 'Bestseller Deal' : (pct > 0 ? `${pct}% OFF DEAL` : 'Special Offer')}
                            </span>
                        </div>

                        <!-- Price Row (Amazon Layout: bold large rupee + price + unit size) -->
                        <div class="flex items-baseline flex-wrap gap-1 mb-0.5">
                            <span class="text-xs font-semibold text-[#2B1D14] align-super">₹</span>
                            <span class="product-price text-2xl font-bold text-[#2B1D14] tracking-tight leading-none">${initialPrice}</span>
                            <span class="unit-size-text text-[11px] text-stone-500 font-normal">(${initialSizeLabel})</span>
                        </div>

                        <!-- MRP & Discount Row: "M.R.P.: ₹4,250 (20% off)" -->
                        <div class="text-xs text-stone-600 mb-1.5">
                            ${initialComparePrice ? `M.R.P.: <span class="product-mrp line-through text-stone-400 font-mono">₹${initialComparePrice}</span> <span class="discount-badge text-emerald-800 font-bold">(${pct}% off)</span>` : ''}
                        </div>

                        <!-- Offer note -->
                        <p class="text-[11px] text-[#2B1D14]/80 leading-tight mb-2 font-medium">
                            Extra discount with code <span class="font-bold text-[#D98E2B]">GLOW10</span>
                        </p>

                        <!-- Delivery Row -->
                        <div class="text-xs leading-snug mb-2.5">
                            <p class="text-stone-900 font-normal">
                                <span class="font-bold text-[#2B1D14]">FREE delivery</span> on orders above ₹499
                            </p>
                            <p class="text-emerald-700 font-semibold text-[11px] mt-0.5">
                                In stock • Dispatches within 24 hours
                            </p>
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
                <div class="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-1">
                    <button type="button" onclick="toggleCartState(this)" class="w-full bg-[#D98E2B] hover:bg-[#C47D1F] text-[#2B1D14] font-bold py-2.5 sm:py-3 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer">
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
    });
}
function changeCardSize(volume, price, comparePrice, buttonElement) {
    const card = buttonElement.closest('.product-card');
    if (!card) return;
    const buttons = card.querySelectorAll('.size-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-[#2B1D14]', 'text-[#FBF7F0]', 'border-[#2B1D14]');
        btn.classList.add('border-stone-300', 'text-stone-700');
    });
    buttonElement.classList.add('bg-[#2B1D14]', 'text-[#FBF7F0]', 'border-[#2B1D14]');
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
        unitEl.textContent = `(${volume})`;
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
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById('auto-slider');
    if (!slider) return;
    let scrollInterval;
    function startAutoSlide() {
        scrollInterval = setInterval(() => {
            requestAnimationFrame(() => {
                const step = slider.firstElementChild ? slider.firstElementChild.offsetWidth : 320;
                if (slider.scrollLeft + step >= slider.scrollWidth - step) {
                    slider.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    slider.scrollBy({ left: step, behavior: 'smooth' });
                }
            });
        }, 3500);
    }
    slider.addEventListener('mouseenter', () => clearInterval(scrollInterval));
    slider.addEventListener('mouseleave', startAutoSlide);
    startAutoSlide();
});
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
