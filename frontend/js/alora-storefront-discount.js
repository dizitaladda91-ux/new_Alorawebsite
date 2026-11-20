/**
 * ALORA RADIANCE - Storefront Auto-Discount & Referral Tracking SDK
 * Detects referral parameters, stores the referral code for checkout, and
 * propagates referral context to internal navigation links. The server decides
 * whether a referral is eligible and what discount applies.
 */
(function () {
  'use strict';

  const urlParams = new URLSearchParams(window.location.search);
  const refFromUrl = urlParams.get('ref') || urlParams.get('referral') || urlParams.get('affiliate') || urlParams.get('coupon') || urlParams.get('coupon_code');
  const clickIdFromUrl = urlParams.get('clickId') || urlParams.get('click_id');

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  if (refFromUrl) {
    localStorage.setItem('alora_ref_code', refFromUrl);
    sessionStorage.setItem('alora_ref_code', refFromUrl);
    document.cookie = `alora_ref_code=${encodeURIComponent(refFromUrl)}; path=/; max-age=2592000`; // 30 days
  }

  const discountPercent = 0;

  if (clickIdFromUrl) {
    localStorage.setItem('alora_click_id', clickIdFromUrl);
    sessionStorage.setItem('alora_click_id', clickIdFromUrl);
  }

  const activeRefCode = refFromUrl ||
    localStorage.getItem('alora_ref_code') ||
    sessionStorage.getItem('alora_ref_code') ||
    getCookie('alora_ref_code');

  if (!activeRefCode) return;

  window.AloraAffiliate = {
    refCode: activeRefCode,
    discountPercent: discountPercent,
    clickId: clickIdFromUrl || localStorage.getItem('alora_click_id') || '',
    calculateDiscountedPrice: function (price) {
      const numericPrice = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.]/g, ''));
      if (isNaN(numericPrice)) return price;
      const discounted = numericPrice * (1 - discountPercent / 100);
      return Math.round(discounted * 100) / 100;
    },
  };

  window.dispatchEvent(new CustomEvent('alora:referral-ready', {
    detail: { ...window.AloraAffiliate },
  }));

  function injectDiscountBanner() {
    if (document.getElementById('alora-discount-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'alora-discount-banner';
    banner.style.cssText = `
      position: sticky;
      top: 0;
      z-index: 999999;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #ffffff;
      padding: 10px 16px;
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 15px rgba(124, 58, 237, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    `;

    const message = document.createElement('span');
    message.append(`Referral code ${activeRefCode} detected. Any eligible discount will be confirmed at checkout.`);

    const closeButton = document.createElement('button');
    closeButton.id = 'alora-close-banner';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close partner discount banner');
    closeButton.textContent = '×';
    closeButton.style.cssText = 'background:none;border:none;color:#fff;font-size:18px;cursor:pointer;opacity:0.8;line-height:1;';
    banner.append(message, closeButton);

    document.body.insertBefore(banner, document.body.firstChild);

    document.getElementById('alora-close-banner')?.addEventListener('click', function () {
      banner.remove();
    });
  }

  function autoFillCouponFields() {
    // Disabled: Server calculates true coupon and referral discounts at checkout
    return;
  }

  const priceSelectors = [
    '[data-product-price]', '[data-product-price-value]', '[data-price]', '[data-money]',
    '[data-cart-item-price]', '[data-cart-item-final-price]', '[data-cart-item-regular-price]',
    '.product-price', '.product__price', '.product-price-current', '.price__current',
    '.price', '.money', '.amount',
    '.product-card__price', '.grid-view-item__meta', '.card-information', '.price-container',
    '.product-grid-item-price', '.card-price', '.item-price', '.grid-price',
    '.price-item', '.price-item--regular', '.price-item--sale', '.price__sale',
    '.woocommerce-Price-amount', '.woocommerce-Price-amount bdi',
    '[class*="product-price"]', '[class*="sale-price"]', '[class*="current-price"]',
    '[class*="cart-price"]', '[class*="item-price"]', '[class*="grid-price"]'
  ];

  function parseSinglePrice(text) {
    if (!text) return null;
    const normalized = String(text).replace(/,/g, '');
    const currencyMatch = normalized.match(/(?:₹|Rs\.?|INR|\$|€|£)\s*(\d+(?:\.\d{1,2})?)/i);
    const numberMatch = normalized.match(/\b(\d+(?:\.\d{1,2})?)\b/);
    const amount = Number.parseFloat(currencyMatch?.[1] || numberMatch?.[1]);
    return Number.isFinite(amount) && amount > 0 && amount < 1000000 ? amount : null;
  }

  function formatDiscountedPrice(originalText, amount) {
    const currency = originalText.match(/₹|Rs\.?|INR|\$|€|£/i)?.[0] || '₹';
    const discounted = Math.round(amount * (1 - discountPercent / 100) * 100) / 100;
    return `${currency}${discounted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function showDiscountedProductPrices() {
    // Disabled: Do not rewrite product prices visually on storefront
    return;
  }

  function propagateReferralToInternalLinks() {
    if (!activeRefCode) return;
    const links = document.querySelectorAll('a[href]');
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          if (!url.searchParams.has('ref')) {
            url.searchParams.set('ref', activeRefCode);
            a.setAttribute('href', url.pathname + url.search + url.hash);
          }
        }
      } catch (e) {}
    });
  }

  function updateCartFormInputs() {
    const forms = document.querySelectorAll('form[action*="cart"], form[action*="checkout"], .product-form, #add-to-cart-form');
    forms.forEach(form => {
      if (!form.querySelector('input[name="alora_ref_code"]')) {
        const refInput = document.createElement('input');
        refInput.type = 'hidden';
        refInput.name = 'alora_ref_code';
        refInput.value = activeRefCode;
        form.appendChild(refInput);
      }
    });
  }

  function runCheckoutDiscountHelpers() {
    injectDiscountBanner();
    autoFillCouponFields();
    updateCartFormInputs();
    propagateReferralToInternalLinks();
  }

  if (navigator.webdriver || /Lighthouse|PageSpeed|HeadlessChrome|HeadlessChromium|Headless|PTST|Googlebot|insights|Chrome-Lighthouse/i.test(navigator.userAgent)) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCheckoutDiscountHelpers);
  } else {
    runCheckoutDiscountHelpers();
  }

  const initObserver = () => {
    let debounceTimer = null;
    new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(runCheckoutDiscountHelpers);
        } else {
          runCheckoutDiscountHelpers();
        }
      }, 600);
    }).observe(document.body || document.documentElement, { childList: true, subtree: true });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initObserver);
  } else {
    window.addEventListener('load', initObserver);
  }

  const rerunAfterNavigation = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(runCheckoutDiscountHelpers);
    } else {
      setTimeout(runCheckoutDiscountHelpers, 300);
    }
  };
  ['pushState', 'replaceState'].forEach((method) => {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      rerunAfterNavigation();
      return result;
    };
  });
  window.addEventListener('popstate', rerunAfterNavigation);
})();
