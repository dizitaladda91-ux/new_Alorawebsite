/**
 * Alora Radiance - Google Analytics 4 (GA4) & Cookie Consent Tracker
 * Handles visitor analytics, page views, CTA interactions, and GDPR/Privacy consent.
 */

(function () {
  const CONSENT_KEY = 'alora_cookie_consent';

  // Global helper function for manual event tracking
  window.trackEvent = function (eventName, eventParams = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        console.log(`[GA4 Event] ${eventName}`, eventParams);
      }
    }
  };

  /**
   * Inject Google Analytics 4 script tag and configure measurement ID
   */
  function loadGa4(measurementId) {
    if (!measurementId || measurementId === '[MEASUREMENT_ID]') return;
    if (window._ga4Initialized) return;
    window._ga4Initialized = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());

    // Configure GA4
    gtag('config', measurementId, {
      send_page_view: true,
      page_path: window.location.pathname + window.location.search,
      page_title: document.title,
    });

    // Inject remote script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    attachAutoInteractions();
  }

  /**
   * Automatic tracking for high-value user actions (Cart, Tracking, Checkout, Contact)
   */
  function attachAutoInteractions() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, a');
      if (!target) return;

      const text = (target.textContent || '').trim().toLowerCase();
      const id = target.id || '';
      const classes = target.className || '';

      // 1. Add to Cart
      if (
        id.includes('add-to-cart') ||
        classes.includes('add-to-cart') ||
        classes.includes('btn-add-to-cart') ||
        text.includes('add to bag') ||
        text.includes('add to cart')
      ) {
        const productTitle = document.querySelector('h1')?.textContent?.trim() || 'Product';
        window.trackEvent('add_to_cart', {
          item_name: productTitle,
          page_location: window.location.href,
        });
      }

      // 2. Buy Now / Checkout
      if (
        id.includes('buy-now') ||
        classes.includes('buy-now') ||
        text.includes('buy now') ||
        text.includes('proceed to checkout')
      ) {
        window.trackEvent('begin_checkout', {
          page_location: window.location.href,
        });
      }

      // 3. Order Tracking Click
      if (id === 'track-btn' || text.includes('track status') || text.includes('track order')) {
        const trackInput = document.getElementById('track-input');
        window.trackEvent('track_order_lookup', {
          has_query: Boolean(trackInput && trackInput.value.trim()),
        });
      }

      // 4. WhatsApp / Phone Contact Click
      const href = target.getAttribute('href') || '';
      if (href.startsWith('https://wa.me') || href.includes('whatsapp.com')) {
        window.trackEvent('contact_whatsapp', {
          source_page: window.location.pathname,
        });
      } else if (href.startsWith('tel:')) {
        window.trackEvent('contact_phone_call', {
          phone: href.replace('tel:', ''),
        });
      }
    }, { passive: true });
  }

  /**
   * Render stylish, lightweight cookie consent banner
   */
  function showCookieConsentBanner(onAccept) {
    if (document.getElementById('alora-cookie-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'alora-cookie-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      max-width: 480px;
      margin: 0 auto;
      background: #2A2A24;
      color: #FAF7EE;
      padding: 16px 20px;
      border-radius: 16px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      border: 1px solid rgba(236, 228, 206, 0.2);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    banner.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <span style="font-size: 18px; line-height: 1;">✨</span>
          <div>
            <strong style="display: block; font-size: 13px; color: #FAF7EE; margin-bottom: 2px;">Privacy & Analytics</strong>
            <span style="color: #D3CEBF; font-size: 12px;">Hum behtar experience aur visitor insights ke liye analytics cookies use karte hain.</span>
          </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; align-items: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
          <button id="alora-cookie-decline" style="background: transparent; color: #D3CEBF; border: 1px solid #555; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; transition: background 0.2s;">Decline</button>
          <button id="alora-cookie-accept" style="background: #C5A880; color: #2A2A24; border: none; padding: 6px 18px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 12px; transition: opacity 0.2s;">Accept</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Smooth entrance
    requestAnimationFrame(() => {
      banner.style.transform = 'translateY(0)';
      banner.style.opacity = '1';
    });

    const removeBanner = () => {
      banner.style.transform = 'translateY(100px)';
      banner.style.opacity = '0';
      setTimeout(() => banner.remove(), 400);
    };

    document.getElementById('alora-cookie-accept')?.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'granted');
      removeBanner();
      if (typeof onAccept === 'function') onAccept();
    });

    document.getElementById('alora-cookie-decline')?.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'denied');
      removeBanner();
    });
  }

  /**
   * Main initializer: fetches measurement ID, checks consent, and starts tracking
   */
  async function initAnalytics() {
    // 1. Get Measurement ID (from window or backend config)
    let measurementId = window.GA_MEASUREMENT_ID || '';

    if (!measurementId) {
      const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
      const baseUrl = (window.BASE_URL !== undefined && window.BASE_URL !== null)
        ? window.BASE_URL
        : (isLocal ? 'http://localhost:5000' : '');

      try {
        const res = await fetch(`${baseUrl}/api/config/gtm`);
        if (res.ok) {
          const data = await res.json();
          measurementId = data.gaMeasurementId || '';
        }
      } catch (err) {
        // Silently fail if offline or config endpoint fails
      }
    }

    if (!measurementId) return;

    // 2. Check Cookie Consent
    const consent = localStorage.getItem(CONSENT_KEY);

    if (consent === 'granted') {
      loadGa4(measurementId);
    } else if (consent === 'denied') {
      // User declined cookies
      return;
    } else {
      // First-time visitor: Show banner, load GA4 upon acceptance
      showCookieConsentBanner(() => {
        loadGa4(measurementId);
      });
    }
  }

  // Expose to window
  window.initAnalytics = initAnalytics;
  window.loadGa4 = loadGa4;

  // Auto-init on page load or idle
  if (document.readyState === 'complete') {
    initAnalytics();
  } else {
    window.addEventListener('load', () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(initAnalytics);
      } else {
        setTimeout(initAnalytics, 500);
      }
    });
  }
})();
