(() => {
    const config = window.ALORA_DIWALI_CONFIG;
    if (!config || !window.isFestivalActive?.()) return;

    const colors = ["#FFC83D", "#FF9933", "#F5C2E7", "#FFF6E5", "#D98E2B"];
    const particles = [];
    const rockets = [];
    const sparkles = [];
    let canvas;
    let context;
    let animationFrame = 0;
    let animationStartedAt = 0;
    let lastLaunchAt = -Infinity;
    let launches = 0;
    let lastPointerSparkleAt = 0;
    let pointerFrame = 0;
    let sparklesInstalled = false;
    let mobileListenerInstalled = false;
    let mobileQuery = window.matchMedia("(max-width: 640px)");
    let decorativeElements = [];
    let toranContainer;
    let originalToranPosition;
    let originalToranOverflow;
    let heroContainer;
    let originalHeroPosition;
    const cardPositions = new Map();
    let cardObserver;

    function createSvgElement(markup) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = markup;
        return wrapper.firstElementChild;
    }

    function createToran() {
        const nav = document.getElementById("navbar-placeholder");
        if (!nav || document.getElementById("alora-diwali-toran")) return;
        toranContainer = nav;
        originalToranPosition = nav.style.position;
        originalToranOverflow = nav.style.overflow;
        const svg = createSvgElement(`
            <svg id="alora-diwali-toran" class="diwali-site-decor" viewBox="0 0 1200 58" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 4 Q600 30 1200 4" fill="none" stroke="#6B3B20" stroke-width="2"/>
                <path d="M0 9 Q600 35 1200 9" fill="none" stroke="#32704A" stroke-width="3" class="diwali-toran-leaves"/>
                ${Array.from({ length: 25 }, (_, index) => {
                    const x = index * 50 + 25;
                    const y = 10 + Math.sin((x / 1200) * Math.PI) * 25;
                    const bulbColor = colors[index % colors.length];
                    return `<circle class="diwali-light" cx="${x}" cy="${y}" r="2.8" fill="${bulbColor}"/>`;
                }).join("")}
                ${Array.from({ length: 19 }, (_, index) => {
                    const x = index * 66 + 34;
                    const y = 13 + Math.sin((x / 1200) * Math.PI) * 23;
                    return `<g transform="translate(${x} ${y + 11})">
                        <path d="M0 -3 C-8 -15 -15 -13 -10 -3 C-7 2 -3 3 0 4 C3 3 7 2 10 -3 C15 -13 8 -15 0 -3Z" fill="${index % 2 ? "#32704A" : "#477A3E"}"/>
                        <circle cx="0" cy="3" r="5" fill="#FF9933"/>
                        <circle cx="-4" cy="2" r="2.3" fill="#FFC83D"/>
                        <circle cx="4" cy="2" r="2.3" fill="#FFC83D"/>
                        <circle cy="-1" r="2.3" fill="#FFF6E5"/>
                    </g>`;
                }).join("")}
            </svg>
        `);
        nav.style.position = "relative";
        nav.style.overflow = "visible";
        nav.appendChild(svg);
        decorativeElements.push(svg);
    }

    function createFloatingDecorations() {
        document.querySelectorAll(".diwali-floating-decoration").forEach((element) => element.remove());
        decorativeElements = decorativeElements.filter((element) => element.isConnected);
        const isMobile = mobileQuery.matches;
        const petalCount = isMobile ? 7 : 18;
        const diyaCount = isMobile ? 2 : 4;

        for (let index = 0; index < petalCount + diyaCount; index += 1) {
            const isDiya = index >= petalCount;
            const element = document.createElement("span");
            element.className = `diwali-floating-decoration ${isDiya ? "diwali-mini-diya" : "diwali-petal"}`;
            element.setAttribute("aria-hidden", "true");
            element.style.left = `${Math.random() * 100}%`;
            element.style.setProperty("--fall-duration", `${12 + Math.random() * 12}s`);
            element.style.setProperty("--fall-delay", `${-Math.random() * 20}s`);
            element.style.setProperty("--fall-drift", `${Math.round(Math.random() * 150 - 75)}px`);
            if (isDiya) element.textContent = "🪔";
            document.body.appendChild(element);
            decorativeElements.push(element);
        }
    }

    function createRangoli() {
        const hero = document.querySelector(".hero-slider-container");
        if (!hero || document.getElementById("alora-diwali-rangoli")) return;
        if (window.getComputedStyle(hero).position === "static") {
            heroContainer = hero;
            originalHeroPosition = hero.style.position;
            hero.style.position = "relative";
        }
        const rangoli = createSvgElement(`
            <svg id="alora-diwali-rangoli" viewBox="0 0 100 100" aria-hidden="true">
                <g transform="translate(50 50)" fill="none" stroke="#FFC83D" stroke-width="1.5">
                    ${Array.from({ length: 8 }, (_, index) => `<ellipse transform="rotate(${index * 45})" cy="-19" rx="8" ry="17"/>`).join("")}
                    <circle r="26"/>
                    <circle r="12" stroke="#FF9933"/>
                    <circle r="4" fill="#FFC83D"/>
                    ${Array.from({ length: 8 }, (_, index) => `<circle transform="rotate(${index * 45})" cy="-31" r="2.2" fill="#FF9933" stroke="none"/>`).join("")}
                </g>
            </svg>
        `);
        hero.appendChild(rangoli);
        decorativeElements.push(rangoli);
    }

    function decorateProductCards(root = document) {
        const cards = [];
        if (root instanceof Element && root.matches(".product-card")) cards.push(root);
        if (root.querySelectorAll) cards.push(...root.querySelectorAll(".product-card"));

        cards.forEach((card) => {
            if (card.querySelector(":scope > .diwali-product-garland")) return;
            if (window.getComputedStyle(card).position === "static") {
                cardPositions.set(card, card.style.position);
                card.style.position = "relative";
            }
            const garland = createSvgElement(`
                <svg class="diwali-product-garland" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0 2 Q150 17 300 2" fill="none" stroke="#477A3E" stroke-width="2"/>
                    ${Array.from({ length: 19 }, (_, index) => {
                        const x = index * (300 / 18);
                        const y = 2 + Math.sin((x / 300) * Math.PI) * 15;
                        return `<g transform="translate(${x} ${y + 6})">
                            <path d="M0 -1 C-5 -9 -10 -7 -7 -1 C-5 2 -2 3 0 3 C2 3 5 2 7 -1 C10 -7 5 -9 0 -1Z" fill="${index % 2 ? "#32704A" : "#477A3E"}"/>
                            <circle cx="0" cy="2" r="3.7" fill="#FF9933"/>
                            <circle cx="-3" cy="1" r="1.8" fill="#FFC83D"/>
                            <circle cx="3" cy="1" r="1.8" fill="#FFC83D"/>
                            <circle cy="-1" r="1.8" fill="#FFF6E5"/>
                        </g>`;
                    }).join("")}
                </svg>
            `);
            garland.style.cssText = "position:absolute;top:0;left:0;width:100%;height:28px;z-index:11;pointer-events:none";
            card.appendChild(garland);
        });
    }

    function mountDecorations() {
        if (!window.isDiwaliEffectsAllowed?.()) return;
        createToran();
        createFloatingDecorations();
        createRangoli();
        decorateProductCards();
        if (!cardObserver) {
            cardObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof Element) decorateProductCards(node);
                    });
                });
            });
            cardObserver.observe(document.body, { childList: true, subtree: true });
        }
    }

    function createBurst(x, y) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let index = 0; index < 32 && particles.length < 96; index += 1) {
            const angle = (Math.PI * 2 * index) / 32 + Math.random() * 0.06;
            const speed = 1.5 + Math.random() * 2.8;
            const life = 32 + Math.random() * 12;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life,
                maxLife: life,
                color: Math.random() > 0.2 ? color : colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    function cleanupFireworks() {
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        window.removeEventListener("resize", resizeCanvas);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        canvas?.remove();
        canvas = null;
        context = null;
        particles.length = 0;
        rockets.length = 0;
    }

    function resizeCanvas() {
        if (!canvas || !context) return;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(window.innerWidth * pixelRatio);
        canvas.height = Math.round(window.innerHeight * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function launchRocket(width, height) {
        rockets.push({
            x: width * (0.18 + Math.random() * 0.64),
            y: height + 4,
            targetY: height * (0.16 + Math.random() * 0.22),
            speed: Math.max(12, height / 48),
            color: colors[Math.floor(Math.random() * colors.length)]
        });
        launches += 1;
    }

    function animateFireworks(timestamp) {
        if (document.hidden) {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
            return;
        }
        if (!animationStartedAt) animationStartedAt = timestamp;
        const elapsed = timestamp - animationStartedAt;
        const width = window.innerWidth;
        const height = window.innerHeight;
        context.clearRect(0, 0, width, height);

        if (launches < 3 && elapsed - lastLaunchAt >= 360) {
            launchRocket(width, height);
            lastLaunchAt = elapsed;
        }

        for (let index = rockets.length - 1; index >= 0; index -= 1) {
            const rocket = rockets[index];
            const previousY = rocket.y;
            rocket.y -= rocket.speed;
            context.beginPath();
            context.moveTo(rocket.x, previousY + 8);
            context.lineTo(rocket.x, rocket.y);
            context.strokeStyle = rocket.color;
            context.globalAlpha = 0.75;
            context.lineWidth = 2;
            context.stroke();
            if (rocket.y <= rocket.targetY) {
                createBurst(rocket.x, rocket.y);
                rockets.splice(index, 1);
            }
        }

        for (let index = particles.length - 1; index >= 0; index -= 1) {
            const particle = particles[index];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.045;
            particle.vx *= 0.985;
            particle.vy *= 0.985;
            particle.life -= 1;
            if (particle.life <= 0) {
                particles.splice(index, 1);
                continue;
            }
            context.globalAlpha = particle.life / particle.maxLife;
            context.fillStyle = particle.color;
            context.fillRect(particle.x, particle.y, 3, 3);
        }
        context.globalAlpha = 1;

        if (elapsed < 2200 && (launches < 3 || rockets.length || particles.length)) {
            animationFrame = window.requestAnimationFrame(animateFireworks);
        } else {
            cleanupFireworks();
        }
    }

    function playDiwaliFireworks(options = {}) {
        if (!window.isFestivalActive?.() || (!window.isDiwaliEffectsAllowed?.() && options.orderSuccess !== true)) return;
        cleanupFireworks();
        canvas = document.createElement("canvas");
        canvas.id = "alora-diwali-fireworks";
        canvas.setAttribute("aria-hidden", "true");
        canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:40";
        context = canvas.getContext("2d");
        if (!context) {
            canvas.remove();
            canvas = null;
            return;
        }
        document.body.appendChild(canvas);
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        document.addEventListener("visibilitychange", onVisibilityChange);
        animationStartedAt = 0;
        lastLaunchAt = -Infinity;
        launches = 0;
        animationFrame = window.requestAnimationFrame(animateFireworks);
    }

    function onVisibilityChange() {
        if (document.hidden) {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        } else if (canvas && !animationFrame) {
            animationFrame = window.requestAnimationFrame(animateFireworks);
        }
    }

    function shouldIgnoreSparkle(target) {
        return target instanceof Element && Boolean(target.closest(
            "input, textarea, select, button, a, label, iframe, [role='button'], [contenteditable='true'], #alora-diwali-banner, #alora-diwali-toggle"
        ));
    }

    function addSparkle(x, y) {
        if (sparkles.length >= 12) sparkles.shift().remove();
        const sparkle = document.createElement("span");
        sparkle.className = "diwali-click-sparkle";
        sparkle.setAttribute("aria-hidden", "true");
        sparkle.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:7px;height:7px;border-radius:50%;background:#FFC83D;box-shadow:0 0 10px 3px rgba(255,200,61,.7);pointer-events:none;z-index:30;animation:diwali-sparkle-out .55s ease-out forwards`;
        document.body.appendChild(sparkle);
        sparkles.push(sparkle);
        window.setTimeout(() => {
            sparkle.remove();
            const index = sparkles.indexOf(sparkle);
            if (index >= 0) sparkles.splice(index, 1);
        }, 600);
    }

    const sparkleStyles = document.createElement("style");
    sparkleStyles.textContent = "@keyframes diwali-sparkle-out{to{transform:translateY(-8px) scale(.1);opacity:0}}";
    document.head.appendChild(sparkleStyles);

    function onPointerMove(event) {
        if (shouldIgnoreSparkle(event.target) || event.timeStamp - lastPointerSparkleAt < 110) return;
        lastPointerSparkleAt = event.timeStamp;
        if (pointerFrame) return;
        pointerFrame = window.requestAnimationFrame(() => {
            pointerFrame = 0;
            addSparkle(event.clientX, event.clientY);
        });
    }

    function onPointerDown(event) {
        if (!shouldIgnoreSparkle(event.target)) addSparkle(event.clientX, event.clientY);
    }

    function installSparkles() {
        if (sparklesInstalled || !window.matchMedia("(pointer: fine)").matches) return;
        sparklesInstalled = true;
        document.addEventListener("pointermove", onPointerMove, { passive: true });
        document.addEventListener("pointerdown", onPointerDown, { passive: true });
    }

    function removeSparkles() {
        sparklesInstalled = false;
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerdown", onPointerDown);
        if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
        sparkles.splice(0).forEach((sparkle) => sparkle.remove());
    }

    window.mountDiwaliDecorations = mountDecorations;
    window.playDiwaliFireworks = playDiwaliFireworks;
    window.enableDiwaliEffects = () => {
        if (!window.isDiwaliEffectsAllowed?.()) return;
        mountDecorations();
        if (!mobileListenerInstalled && mobileQuery.addEventListener) {
            mobileQuery.addEventListener("change", createFloatingDecorations);
            mobileListenerInstalled = true;
        }
        installSparkles();
    };
    window.disableDiwaliEffects = () => {
        cleanupFireworks();
        removeSparkles();
        if (mobileListenerInstalled) {
            mobileQuery.removeEventListener("change", createFloatingDecorations);
            mobileListenerInstalled = false;
        }
        decorativeElements.forEach((element) => element.remove());
        decorativeElements = [];
        document.querySelectorAll(".diwali-floating-decoration").forEach((element) => element.remove());
        if (toranContainer) {
            toranContainer.style.position = originalToranPosition;
            toranContainer.style.overflow = originalToranOverflow;
            toranContainer = null;
        }
        if (heroContainer) {
            heroContainer.style.position = originalHeroPosition;
            heroContainer = null;
        }
        cardObserver?.disconnect();
        cardObserver = null;
        cardPositions.forEach((position, card) => {
            if (card.isConnected) card.style.position = position;
        });
        cardPositions.clear();
        document.querySelectorAll(".diwali-product-garland").forEach((garland) => garland.remove());
    };

    window.enableDiwaliEffects();

    if (window.aloraDiwaliFireworksPending) {
        const options = window.aloraDiwaliFireworksPending;
        delete window.aloraDiwaliFireworksPending;
        playDiwaliFireworks(options);
    }
})();
