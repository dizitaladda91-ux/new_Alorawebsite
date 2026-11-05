(() => {
    const config = Object.freeze({
        startDateIST: "2026-10-20T00:00:00+05:30",
        diwaliDateIST: "2026-11-08T00:00:00+05:30",
        endDateIST: "2026-11-08T23:59:59+05:30",
        bannerDismissedKey: "alora_diwali_banner_dismissed",
        offerPlaceholder: "Festive offer details coming soon"
    });
    const startTime = Date.parse(config.startDateIST);
    const diwaliTime = Date.parse(config.diwaliDateIST);
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
        return /(^|\/)(admin[^/]*|seoadmin[^/]*|forgot-password|reset-password)(\.html)?$/.test(path);
    }

    function isAuthPage() {
        return /(^|\/)(login|register)(\.html)?$/.test(location.pathname.toLowerCase());
    }

    function isLightOnlyPage() {
        return /(^|\/)(cart|checkout|payment)(\.html)?$/.test(location.pathname.toLowerCase());
    }

    function isFestivalActive() {
        if (isEnvironmentRestricted() || isExcludedPage()) return false;

        const override = new URLSearchParams(location.search).get("festival");
        if (override === "on") return true;
        if (override === "off") return false;
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
        #alora-diwali-banner button:focus-visible,
        #alora-diwali-banner a:focus-visible {
            outline: 3px solid #D98E2B;
            outline-offset: 3px;
        }
        .diwali-countdown {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 3px 8px;
            border: 1px solid rgba(217, 142, 43, 0.55);
            border-radius: 999px;
            background: rgba(217, 142, 43, 0.12) !important;
            font-size: 0.9em;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .diwali-countdown[hidden] {
            display: none;
        }
        .diwali-countdown-label {
            color: #D98E2B !important;
        }
        body.diwali-light-accent #more-products-section {
            border-color: rgba(217, 142, 43, 0.3);
            background: linear-gradient(145deg, #fffaf0, #fff 52%, #fff7e8);
            box-shadow: 0 8px 24px rgba(126, 58, 47, 0.08);
        }
        body.diwali-light-accent #more-products-section .product-card {
            border-color: rgba(217, 142, 43, 0.36);
            background: linear-gradient(155deg, #fffefa, #fff8eb);
            box-shadow: 0 4px 14px rgba(126, 58, 47, 0.08);
        }
        body.diwali-light-accent #more-products-section .product-card-img {
            background: radial-gradient(ellipse at center, #fff 35%, #fff7e8 100%);
        }
        body.diwali-festival-active.diwali-auth-page {
            min-height: 100vh;
            min-height: 100svh;
            overflow-x: hidden;
            background: radial-gradient(ellipse at 50% 35%, #54152f 0%, #390d27 52%, #22091c 100%) !important;
            color: #FFF6E5 !important;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card {
            z-index: 10;
            overflow: hidden;
            border: 1px solid rgba(255, 200, 61, 0.62) !important;
            border-radius: 28px !important;
            background: linear-gradient(155deg, rgba(67, 14, 43, 0.96), rgba(43, 10, 34, 0.97)) !important;
            box-shadow: 0 24px 80px rgba(11, 3, 13, 0.48), inset 0 0 32px rgba(255, 200, 61, 0.035) !important;
            color: #FFF6E5 !important;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-brand {
            color: #FFD27A !important;
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.2em;
            padding-top: 36px;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card h1,
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card h2 {
            color: #FFF6E5 !important;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card p,
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card label {
            color: #E9D7DF !important;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card input {
            border-color: rgba(255, 200, 61, 0.46) !important;
            background-color: rgba(32, 7, 25, 0.72) !important;
            color: #FFF6E5 !important;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card input::placeholder {
            color: #CBB7C1 !important;
            opacity: 0.82;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card input:focus-visible,
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card button:focus-visible,
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card a:focus-visible {
            outline: 3px solid #FFD56A !important;
            outline-offset: 3px;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card button[type="submit"] {
            border: 1px solid #FFC83D !important;
            background: linear-gradient(100deg, #FFD96A, #FF9933) !important;
            color: #43142C !important;
            box-shadow: 0 8px 26px rgba(255, 153, 51, 0.24) !important;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card a,
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card button:not([type="submit"]) {
            color: #FFD56A !important;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card > a[title="Close"] {
            border: 1px solid rgba(255, 200, 61, 0.36) !important;
            background: rgba(255, 246, 229, 0.1) !important;
            color: #FFF6E5 !important;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card .border-t {
            border-color: rgba(255, 200, 61, 0.24) !important;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card .bg-blue-50 {
            border-color: rgba(255, 200, 61, 0.35) !important;
            background: rgba(255, 200, 61, 0.1) !important;
            color: #FFE6A5 !important;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card .bg-blue-50 * {
            color: #FFE6A5 !important;
        }
        body.diwali-festival-active.diwali-auth-page .diwali-auth-card .bg-blue-50 .text-blue-600 {
            color: #FFD56A !important;
        }
        .diwali-auth-rangoli {
            position: fixed;
            z-index: 3;
            width: clamp(82px, 18vw, 150px);
            opacity: 0.52;
            filter: drop-shadow(0 0 8px rgba(255, 200, 61, 0.3));
            pointer-events: none;
        }
        .diwali-auth-rangoli-top-left {
            top: 72px;
            left: -28px;
        }
        .diwali-auth-rangoli-bottom-right {
            right: -24px;
            bottom: 20px;
        }
        body.diwali-page-hidden .diwali-auth-rangoli {
            animation-play-state: paused !important;
        }
        @media (max-width: 640px) {
            body.diwali-festival-active.diwali-auth-page .diwali-auth-card {
                border-radius: 24px !important;
            }
            .diwali-auth-rangoli-top-left { top: 62px; }
        }
        @media (prefers-reduced-motion: reduce) {
            .diwali-auth-rangoli {
                animation: none !important;
            }
        }
        @media print {
            #alora-diwali-banner, .diwali-site-decor, #alora-diwali-rangoli,
            .diwali-auth-rangoli {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(baseStyles);

    let activeStyles;
    let banner;
    let effectsScript;
    let currentActive = false;
    let countdownInterval;
    let countdownObserver;
    let authDecorations = [];
    const lightOnly = isLightOnlyPage();

    function mountAuthDecorations() {
        if (!isAuthPage() || authDecorations.some((element) => element.isConnected)) return;

        ["top-left", "bottom-right"].forEach((position) => {
            const rangoli = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            rangoli.setAttribute("class", `diwali-auth-rangoli diwali-auth-rangoli-${position}`);
            rangoli.setAttribute("viewBox", "0 0 100 100");
            rangoli.setAttribute("aria-hidden", "true");
            const petals = Array.from({ length: 8 }, (_, index) =>
                `<ellipse transform="rotate(${index * 45} 50 50)" cx="50" cy="27" rx="8" ry="19"/>`
            ).join("");
            rangoli.innerHTML = `<g fill="none" stroke="#FFC83D" stroke-width="1.5">${petals}<circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="13" stroke="#FF9933"/><circle cx="50" cy="50" r="3" fill="#FFC83D"/>${Array.from({ length: 8 }, (_, index) => `<circle transform="rotate(${index * 45} 50 50)" cx="50" cy="14" r="2" fill="#FF9933" stroke="none"/>`).join("")}</g>`;
            document.body.appendChild(rangoli);
            authDecorations.push(rangoli);
        });
    }

    function removeAuthDecorations() {
        authDecorations.forEach((element) => element.remove());
        authDecorations = [];
    }

    function updateDiwaliCountdown() {
        const countdowns = document.querySelectorAll(".diwali-countdown-time");
        if (!countdowns.length) return;

        const remaining = diwaliTime - Date.now();
        if (remaining <= 0) {
            const isDiwaliDay = Date.now() <= endTime;
            const message = isDiwaliDay ? "HAPPY DIWALI!" : "";
            countdowns.forEach((countdown) => {
                countdown.textContent = message;
                countdown.parentElement.hidden = !message;
            });
            if (!isDiwaliDay && countdownInterval) {
                window.clearInterval(countdownInterval);
                countdownInterval = null;
            }
            return;
        }

        const totalSeconds = Math.floor(remaining / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const time = `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

        countdowns.forEach((countdown) => {
            countdown.textContent = time;
            countdown.parentElement.hidden = false;
        });
    }

    function mountDiwaliCountdown() {
        const tickerGroups = document.querySelectorAll(".top-ticker-bar .animate-top-ticker > div");
        if (!tickerGroups.length) return;
        tickerGroups.forEach((group) => {
            if (group.querySelector(".diwali-countdown")) return;
            const brandItem = group.firstElementChild;
            if (!brandItem) return;

            const separator = document.createElement("span");
            separator.className = "ticker-star text-[11px] opacity-75";
            separator.setAttribute("aria-hidden", "true");
            separator.textContent = "✦";

            const countdown = document.createElement("span");
            countdown.className = "diwali-countdown";
            countdown.setAttribute("aria-hidden", "true");
            countdown.innerHTML = '<span class="diwali-countdown-label">DIWALI IN</span><span class="diwali-countdown-time"></span>';

            group.insertBefore(separator, brandItem.nextSibling);
            group.insertBefore(countdown, separator.nextSibling);
        });

        if ([...tickerGroups].every((group) => group.querySelector(".diwali-countdown"))) {
            countdownObserver?.disconnect();
            countdownObserver = null;
        }
        if (!countdownInterval && document.querySelector(".diwali-countdown-time")) {
            updateDiwaliCountdown();
            countdownInterval = window.setInterval(updateDiwaliCountdown, 1000);
        }
    }

    function watchForDiwaliTicker() {
        mountDiwaliCountdown();
        const placeholder = document.getElementById("navbar-placeholder");
        const watchTarget = placeholder || (document.readyState === "loading" ? document.documentElement : null);
        if (countdownObserver || !watchTarget || document.querySelector(".top-ticker-bar .animate-top-ticker > div")) return;
        countdownObserver = new MutationObserver(mountDiwaliCountdown);
        countdownObserver.observe(watchTarget, { childList: true, subtree: true });
    }

    function installFestivalStyles() {
        if (activeStyles) return;
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
            #alora-diwali-intro-lights {
                position: fixed;
                inset: 0;
                z-index: 60;
                overflow: hidden;
                pointer-events: none;
                animation: diwali-intro-fade 4.5s ease-out forwards;
            }
            .diwali-intro-string {
                position: absolute;
                top: 16vh;
                height: 68vh;
                width: 16px;
                border-color: rgba(217, 142, 43, 0.68);
                border-style: solid;
                border-width: 0;
            }
            .diwali-intro-string-left {
                left: 12px;
                border-left-width: 1px;
            }
            .diwali-intro-string-right {
                right: 12px;
                border-right-width: 1px;
            }
            .diwali-intro-bulb {
                position: absolute;
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #FFF4C2;
                box-shadow: 0 0 5px 2px rgba(255, 200, 61, 0.78);
                animation: diwali-intro-glow 0.9s ease-in-out infinite alternate;
            }
            .diwali-intro-string-left .diwali-intro-bulb { left: -4px; }
            .diwali-intro-string-right .diwali-intro-bulb { right: -4px; }
            .diwali-intro-sparkle {
                position: absolute;
                color: #FFF2BA;
                text-shadow: 0 0 6px #FFC83D, 0 0 14px rgba(255, 153, 51, 0.86);
                animation: diwali-intro-twinkle 1.8s ease-in-out infinite alternate;
            }
            @keyframes diwali-intro-fade {
                0%, 8% { opacity: 0; }
                18%, 72% { opacity: 1; }
                100% { opacity: 0; }
            }
            @keyframes diwali-intro-glow {
                from { opacity: 0.48; transform: scale(0.75); }
                to { opacity: 1; transform: scale(1.2); }
            }
            @keyframes diwali-intro-twinkle {
                from { opacity: 0.24; transform: scale(0.6) rotate(0deg); }
                to { opacity: 1; transform: scale(1.1) rotate(45deg); }
            }
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
                font: 500 12px/1.45 'Jost', 'Jost-Fallback', Arial, sans-serif;
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
                font: 700 11px/1.2 'Jost', 'Jost-Fallback', Arial, sans-serif;
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
            body.diwali-page-hidden #alora-diwali-rangoli {
                animation-play-state: paused !important;
            }
            @keyframes diwali-rangoli-glow {
                from { opacity: 0.3; transform: rotate(-4deg) scale(0.96); }
                to { opacity: 0.52; transform: rotate(4deg) scale(1); }
            }
            @media (max-width: 640px) {
                .diwali-intro-string-left { left: 7px; }
                .diwali-intro-string-right { right: 7px; }
                #alora-diwali-banner { gap: 6px; justify-content: flex-start; font-size: 10px; }
                #alora-diwali-banner .diwali-banner-message { max-width: 52vw; }
                #alora-diwali-banner a { padding-inline: 8px; font-size: 10px; }
                #alora-diwali-rangoli { right: 6px; bottom: 6px; }
            }
            @media (prefers-reduced-motion: reduce) {
                #alora-diwali-rangoli, #alora-diwali-banner * {
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

    function updateMode() {
        const active = isFestivalActive();
        currentActive = active;
        document.body.classList.toggle("diwali-festival-active", active && !lightOnly);
        document.body.classList.toggle("diwali-light-accent", active && lightOnly);
        if (active) {
            if (lightOnly) {
                loadEffects();
                return;
            }
            installFestivalStyles();
            if (isAuthPage()) {
                removeAuthDecorations();
                mountAuthDecorations();
            } else {
                installBanner();
            }
            if (typeof window.enableDiwaliEffects === "function") window.enableDiwaliEffects();
            else loadEffects();
        } else {
            banner?.remove();
            banner = null;
            removeAuthDecorations();
            activeStyles?.remove();
            activeStyles = null;
            document.body.classList.remove("diwali-page-hidden");
            window.disableDiwaliEffects?.();
        }
    }

    document.addEventListener("visibilitychange", () => {
        document.body.classList.toggle("diwali-page-hidden", document.hidden);
        if (!document.hidden) updateDiwaliCountdown();
    });
    document.addEventListener("DOMContentLoaded", watchForDiwaliTicker, { once: true });
    document.addEventListener("partialsLoaded", watchForDiwaliTicker);
    watchForDiwaliTicker();
    mediaQuery.addEventListener?.("change", updateMode);
    document.addEventListener("partialsLoaded", () => {
        if (currentActive && !lightOnly) window.mountDiwaliDecorations?.();
    });
    updateMode();
})();
