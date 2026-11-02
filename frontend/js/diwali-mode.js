(() => {
    const config = Object.freeze({
        startDateIST: "2026-10-20T00:00:00+05:30",
        endDateIST: "2026-11-08T23:59:59+05:30",
        preferenceKey: "alora_diwali_preference",
        bannerDismissedKey: "alora_diwali_banner_dismissed",
        offerPlaceholder: "Festive offer details coming soon"
    });
    const startTime = Date.parse(config.startDateIST);
    const endTime = Date.parse(config.endDateIST);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    window.ALORA_DIWALI_CONFIG = config;
    window.isFestivalDateActive = () => {
        const override = new URLSearchParams(location.search).get("festival");
        if (override === "on") return true;
        if (override === "off") return false;
        const now = Date.now();
        return now >= startTime && now <= endTime;
    };

    function isEnvironmentRestricted() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const coreCount = Number(navigator.hardwareConcurrency || 0);
        return mediaQuery.matches || connection?.saveData === true || (coreCount > 0 && coreCount <= 2);
    }

    function isExcludedPage() {
        const path = location.pathname.toLowerCase();
        return /(^|\/)(admin[^/]*|seoadmin[^/]*|login|register|forgot-password|reset-password)(\.html)?$/.test(path);
    }

    function isLightOnlyPage() {
        return /(^|\/)(cart|checkout|payment)(\.html)?$/.test(location.pathname.toLowerCase());
    }

    function getPreference() {
        try {
            return localStorage.getItem(config.preferenceKey);
        } catch (error) {
            console.warn("Diwali preference could not be read.", error);
            return null;
        }
    }

    function setPreference(value) {
        try {
            localStorage.setItem(config.preferenceKey, value);
        } catch (error) {
            console.warn("Diwali preference could not be saved.", error);
        }
    }

    function isFestivalActive() {
        if (isEnvironmentRestricted() || isExcludedPage()) return false;

        const override = new URLSearchParams(location.search).get("festival");
        if (override === "on") return true;
        if (override === "off") return false;
        if (getPreference() === "off") return false;
        return window.isFestivalDateActive();
    }

    window.isFestivalActive = isFestivalActive;
    window.isDiwaliEffectsAllowed = () => isFestivalActive() && !isLightOnlyPage();
    window.triggerDiwaliFireworks = (options = {}) => {
        if (!isFestivalActive()) return;
        if (typeof window.playDiwaliFireworks === "function") {
            window.playDiwaliFireworks(options);
        } else {
            window.aloraDiwaliFireworksPending = options;
            loadEffects();
        }
    };

    const baseStyles = document.createElement("style");
    baseStyles.id = "alora-diwali-base-styles";
    baseStyles.textContent = `
        #alora-diwali-toggle {
            position: fixed;
            left: 14px;
            bottom: 14px;
            z-index: 30;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            min-height: 44px;
            border: 1px solid #D98E2B;
            border-radius: 999px;
            background: #FBF7F0;
            color: #2B1D14;
            box-shadow: 0 3px 14px rgba(43, 29, 20, 0.18);
            cursor: pointer;
            font: 600 20px/1 Manrope, sans-serif;
        }
        #alora-diwali-toggle:focus-visible,
        #alora-diwali-banner button:focus-visible,
        #alora-diwali-banner a:focus-visible {
            outline: 3px solid #D98E2B;
            outline-offset: 3px;
        }
        @media print {
            #alora-diwali-banner, #alora-diwali-toggle, .diwali-site-decor,
            .diwali-floating-decoration, #alora-diwali-rangoli, #alora-diwali-toran {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(baseStyles);

    let activeStyles;
    let toggle;
    let banner;
    let effectsScript;
    let currentActive = false;
    const lightOnly = isLightOnlyPage();

    function installFestivalStyles() {
        if (activeStyles) return;
        const toranImagePath = location.protocol === "file:"
            ? "./static/diwali-marigold-toran.webp"
            : "/static/diwali-marigold-toran.webp";
        activeStyles = document.createElement("style");
        activeStyles.id = "alora-diwali-active-styles";
        activeStyles.textContent = `
            body.diwali-festival-active .hero-slider-container::after {
                content: "";
                position: absolute;
                inset: 0;
                z-index: 2;
                pointer-events: none;
                background: linear-gradient(180deg, rgba(122, 16, 48, 0.07), transparent 30%, rgba(255, 153, 51, 0.035));
            }
            body.diwali-festival-active .product-card {
                border-color: rgba(217, 142, 43, 0.32);
            }
            .diwali-product-lights {
                position: absolute;
                z-index: 11;
                inset: 5px;
                border-radius: inherit;
                pointer-events: none;
            }
            .diwali-product-light-edge {
                position: absolute;
                display: block;
                pointer-events: none;
                animation: diwali-product-lights-twinkle 2.2s ease-in-out infinite alternate;
            }
            .diwali-product-light-top,
            .diwali-product-light-bottom {
                right: 3px;
                left: 3px;
                height: 8px;
                background-image:
                    radial-gradient(circle, #FFF8C7 0 1.15px, #FFC83D 1.6px 2px, rgba(255, 153, 51, 0.52) 2.3px, transparent 4px),
                    linear-gradient(rgba(255, 200, 61, 0.72), rgba(255, 200, 61, 0.72));
                background-size: 15px 8px, 100% 1px;
                background-position: left center, center;
                background-repeat: repeat-x, no-repeat;
                filter: drop-shadow(0 0 2px rgba(255, 200, 61, 0.65));
            }
            .diwali-product-light-top { top: 0; }
            .diwali-product-light-bottom {
                bottom: 0;
                animation-delay: -1.1s;
            }
            .diwali-product-light-left,
            .diwali-product-light-right {
                top: 3px;
                bottom: 3px;
                width: 8px;
                background-image:
                    radial-gradient(circle, #FFF8C7 0 1.15px, #FFC83D 1.6px 2px, rgba(255, 153, 51, 0.52) 2.3px, transparent 4px),
                    linear-gradient(90deg, rgba(255, 200, 61, 0.72), rgba(255, 200, 61, 0.72));
                background-size: 8px 15px, 1px 100%;
                background-position: center top, center;
                background-repeat: repeat-y, no-repeat;
                filter: drop-shadow(0 0 2px rgba(255, 200, 61, 0.65));
            }
            .diwali-product-light-left { left: 0; animation-delay: -1.65s; }
            .diwali-product-light-right { right: 0; animation-delay: -0.55s; }
            body.diwali-light-accent :is(button, input, select, textarea):focus-visible {
                outline: 2px solid #D98E2B;
                outline-offset: 2px;
            }
            #alora-diwali-banner {
                position: relative;
                z-index: 45;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 8px 48px 8px 14px;
                color: #FFF6E5;
                background: linear-gradient(100deg, #481C16, #71311D 52%, #481C16);
                border-bottom: 1px solid rgba(255, 200, 61, 0.65);
                font: 500 12px/1.45 Manrope, sans-serif;
                text-align: center;
            }
            #alora-diwali-banner .diwali-banner-greeting {
                color: #FFD27A;
                font-weight: 800;
            }
            #alora-diwali-banner .diwali-offer-placeholder {
                color: #FFF6E5;
            }
            #alora-diwali-banner button,
            #alora-diwali-banner a {
                min-height: 36px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 6px 12px;
                border: 1px solid #FFC83D;
                border-radius: 999px;
                color: #2B1D14;
                background: #FFC83D;
                font: 700 11px/1.2 Manrope, sans-serif;
                text-decoration: none;
                white-space: nowrap;
                cursor: pointer;
            }
            #alora-diwali-banner .diwali-banner-dismiss {
                position: absolute;
                top: 50%;
                right: 8px;
                width: 36px;
                min-height: 36px;
                padding: 0;
                transform: translateY(-50%);
                color: #FFF6E5;
                border-color: transparent;
                background: transparent;
                font-size: 20px;
            }
            #alora-diwali-toran {
                position: absolute;
                top: calc(100% - 3px);
                left: 0;
                z-index: 45;
                width: 100%;
                height: 84px;
                background-image: url("${toranImagePath}");
                background-repeat: repeat-x;
                background-position: left top;
                background-size: 336px 84px;
                filter: drop-shadow(0 3px 4px rgba(43, 29, 20, 0.22));
                overflow: visible;
                pointer-events: none;
                transform-origin: top center;
                animation: diwali-toran-sway 5s ease-in-out infinite alternate;
            }
            #alora-diwali-toran .diwali-toran-lights {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 34px;
                overflow: visible;
                pointer-events: none;
            }
            #alora-diwali-toran .diwali-light {
                animation: diwali-string-light 1.8s ease-in-out infinite alternate;
            }
            #alora-diwali-toran .diwali-light:nth-of-type(3n) { animation-delay: -0.6s; }
            #alora-diwali-toran .diwali-light:nth-of-type(3n + 1) { animation-delay: -1.2s; }
            .diwali-floating-decoration {
                position: fixed;
                top: -40px;
                z-index: 20;
                pointer-events: none;
                user-select: none;
                will-change: transform, opacity;
                animation: diwali-fall var(--fall-duration) linear var(--fall-delay) infinite;
            }
            .diwali-petal {
                width: 8px;
                height: 13px;
                border-radius: 80% 10% 80% 10%;
                background: linear-gradient(145deg, #FFC83D, #FF9933 68%, #D96B25);
                box-shadow: 0 1px 5px rgba(217, 107, 37, 0.22);
            }
            .diwali-mini-diya {
                font-size: 15px;
                filter: drop-shadow(0 0 5px rgba(255, 153, 51, 0.65));
            }
            #alora-diwali-rangoli {
                position: absolute;
                right: 12px;
                bottom: 12px;
                z-index: 3;
                width: clamp(42px, 6vw, 76px);
                height: auto;
                opacity: 0.42;
                pointer-events: none;
                animation: diwali-rangoli-glow 5s ease-in-out infinite alternate;
            }
            body.diwali-page-hidden .diwali-floating-decoration,
            body.diwali-page-hidden #alora-diwali-toran,
            body.diwali-page-hidden #alora-diwali-toran *,
            body.diwali-page-hidden #alora-diwali-rangoli {
                animation-play-state: paused !important;
            }
            @keyframes diwali-fall {
                0% { transform: translate3d(0, -5vh, 0) rotate(0deg); opacity: 0; }
                8% { opacity: 0.72; }
                90% { opacity: 0.6; }
                100% { transform: translate3d(var(--fall-drift), 110vh, 0) rotate(540deg); opacity: 0; }
            }
            @keyframes diwali-string-light {
                from { opacity: 0.45; filter: drop-shadow(0 0 1px #FFC83D); }
                to { opacity: 1; filter: drop-shadow(0 0 5px #FFC83D); }
            }
            @keyframes diwali-product-lights-twinkle {
                from { opacity: 0.72; }
                to { opacity: 1; }
            }
            @keyframes diwali-toran-sway {
                from { transform: rotate(-1deg); }
                to { transform: rotate(1deg); }
            }
            @keyframes diwali-rangoli-glow {
                from { opacity: 0.3; transform: rotate(-4deg) scale(0.96); }
                to { opacity: 0.52; transform: rotate(4deg) scale(1); }
            }
            @media (max-width: 640px) {
                #alora-diwali-banner { gap: 6px; justify-content: flex-start; font-size: 10px; }
                #alora-diwali-banner .diwali-banner-message { max-width: 52vw; }
                #alora-diwali-banner a { padding-inline: 8px; font-size: 10px; }
                #alora-diwali-toran { height: 60px; background-size: 240px 60px; }
                #alora-diwali-toran .diwali-toran-lights { height: 26px; }
                #alora-diwali-rangoli { right: 6px; bottom: 6px; }
            }
            @media (prefers-reduced-motion: reduce) {
                .diwali-floating-decoration, #alora-diwali-toran, #alora-diwali-toran *,
                #alora-diwali-rangoli, #alora-diwali-banner *,
                .diwali-product-light-edge {
                    animation: none !important;
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(activeStyles);
    }

    function installBanner() {
        if (banner || isLightOnlyPage()) return;
        try {
            if (sessionStorage.getItem(config.bannerDismissedKey) === "true") return;
        } catch (error) {
            console.warn("Diwali banner preference could not be read.", error);
        }

        banner = document.createElement("section");
        banner.id = "alora-diwali-banner";
        banner.setAttribute("aria-label", "Diwali wishes and festive offer");
        banner.innerHTML = `
            <span class="diwali-banner-message">
                <span class="diwali-banner-greeting">Shubh Deepawali! 🪔</span>
                Alora Radiance ki taraf se aapko aur parivar ko Diwali ki shubhkamnayein.
                <span class="diwali-offer-placeholder">${config.offerPlaceholder}.</span>
            </span>
            <a href="/products" aria-label="Explore Alora Radiance festive offers">Explore offers</a>
            <button type="button" class="diwali-celebrate-button" aria-label="Celebrate Diwali with fireworks">Celebrate 🎆</button>
            <button type="button" class="diwali-banner-dismiss" aria-label="Dismiss Diwali banner">&times;</button>
        `;
        const navPlaceholder = document.getElementById("navbar-placeholder");
        if (navPlaceholder) navPlaceholder.before(banner);
        else document.body.prepend(banner);

        banner.querySelector(".diwali-celebrate-button").addEventListener("click", () => {
            window.triggerDiwaliFireworks?.();
        });
        banner.querySelector(".diwali-banner-dismiss").addEventListener("click", () => {
            try {
                sessionStorage.setItem(config.bannerDismissedKey, "true");
            } catch (error) {
                console.warn("Diwali banner preference could not be saved.", error);
            }
            banner.remove();
            banner = null;
        });
        banner.querySelector("a").addEventListener("click", () => {
            window.triggerDiwaliFireworks?.();
        });
    }

    function installToggle() {
        if (lightOnly || isExcludedPage()) return;
        if (isEnvironmentRestricted()) {
            toggle?.remove();
            toggle = null;
            return;
        }
        if (toggle) return;
        const showDuringCampaign = Date.now() >= startTime && Date.now() <= endTime;
        const hasTestOverride = new URLSearchParams(location.search).has("festival");
        if (!showDuringCampaign && !hasTestOverride) return;

        toggle = document.createElement("button");
        toggle.id = "alora-diwali-toggle";
        toggle.type = "button";
        toggle.setAttribute("aria-label", "Turn Diwali festival mode off");
        toggle.setAttribute("aria-pressed", "true");
        toggle.title = "Diwali festival mode";
        toggle.textContent = "🪔";
        document.body.appendChild(toggle);
        toggle.addEventListener("click", () => {
            const enabled = !isFestivalActive();
            const url = new URL(location.href);
            if (url.searchParams.has("festival")) {
                url.searchParams.set("festival", enabled ? "on" : "off");
            }
            history.replaceState(null, "", url);
            setPreference(enabled ? "on" : "off");
            updateMode();
        });
    }

    function loadEffects() {
        if (effectsScript) return;
        effectsScript = document.createElement("script");
        effectsScript.id = "alora-diwali-effects-script";
        effectsScript.src = location.protocol === "file:" ? "./js/diwali-effects.js" : "/js/diwali-effects.js";
        effectsScript.onerror = () => {
            console.error("Diwali effects failed to load.");
            effectsScript?.remove();
            effectsScript = null;
        };
        document.head.appendChild(effectsScript);
    }

    function updateToggle() {
        if (!toggle) return;
        toggle.setAttribute("aria-pressed", String(currentActive));
        toggle.setAttribute("aria-label", currentActive ? "Turn Diwali festival mode off" : "Turn Diwali festival mode on");
        toggle.title = currentActive ? "Diwali mode is on. Click to turn it off." : "Diwali mode is off. Click to turn it on.";
    }

    function updateMode() {
        const active = isFestivalActive();
        currentActive = active;
        installToggle();
        updateToggle();
        document.body.classList.toggle("diwali-festival-active", active && !lightOnly);
        document.body.classList.toggle("diwali-light-accent", active && lightOnly);
        if (active) {
            if (lightOnly) {
                loadEffects();
                return;
            }
            installFestivalStyles();
            installBanner();
            if (typeof window.enableDiwaliEffects === "function") window.enableDiwaliEffects();
            else loadEffects();
        } else {
            banner?.remove();
            banner = null;
            activeStyles?.remove();
            activeStyles = null;
            document.body.classList.remove("diwali-page-hidden");
            window.disableDiwaliEffects?.();
            updateToggle();
        }
    }

    document.addEventListener("visibilitychange", () => {
        document.body.classList.toggle("diwali-page-hidden", document.hidden);
    });
    mediaQuery.addEventListener?.("change", updateMode);
    document.addEventListener("partialsLoaded", () => {
        if (currentActive && !lightOnly) window.mountDiwaliDecorations?.();
    });
    updateMode();
})();
