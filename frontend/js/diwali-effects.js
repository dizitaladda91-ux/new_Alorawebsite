(() => {
    const config = window.ALORA_DIWALI_CONFIG;
    if (!config || !window.isFestivalActive?.()) return;

    const colors = ["var(--accent)", "var(--accent)", "var(--accent)", "var(--bg)", "var(--accent)"];
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
    let decorativeElements = [];
    let heroContainer;
    let originalHeroPosition;
    let introLightsTimer;
    let introLightsPlayed = false;

    function createSvgElement(markup) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = markup;
        return wrapper.firstElementChild;
    }

    function createIntroLights() {
        if (introLightsPlayed) return;
        introLightsPlayed = true;

        const intro = document.createElement("div");
        intro.id = "alora-diwali-intro-lights";
        intro.setAttribute("aria-hidden", "true");

        ["left", "right"].forEach((side) => {
            const string = document.createElement("div");
            string.className = `diwali-intro-string diwali-intro-string-${side}`;
            for (let index = 1; index <= 9; index += 1) {
                const bulb = document.createElement("span");
                bulb.className = "diwali-intro-bulb";
                bulb.style.top = `${index * 10}%`;
                bulb.style.animationDelay = `${(index % 4) * -0.3}s`;
                string.appendChild(bulb);
            }
            intro.appendChild(string);
        });

        for (let index = 0; index < 26; index += 1) {
            const sparkle = document.createElement("span");
            sparkle.className = "diwali-intro-sparkle";
            sparkle.textContent = "✦";
            sparkle.style.left = `${5 + Math.random() * 90}%`;
            sparkle.style.top = `${5 + Math.random() * 90}%`;
            sparkle.style.animationDelay = `${Math.random() * -1.8}s`;
            sparkle.style.fontSize = `${8 + Math.random() * 12}px`;
            intro.appendChild(sparkle);
        }

        document.body.appendChild(intro);
        decorativeElements.push(intro);
        introLightsTimer = window.setTimeout(() => {
            intro.remove();
            decorativeElements = decorativeElements.filter((element) => element !== intro);
            introLightsTimer = null;
        }, 4600);
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
                <g transform="translate(50 50)" fill="none" stroke="var(--accent)" stroke-width="1.5">
                    ${Array.from({ length: 8 }, (_, index) => `<ellipse transform="rotate(${index * 45})" cy="-19" rx="8" ry="17"/>`).join("")}
                    <circle r="26"/>
                    <circle r="12" stroke="var(--accent)"/>
                    <circle r="4" fill="var(--accent)"/>
                    ${Array.from({ length: 8 }, (_, index) => `<circle transform="rotate(${index * 45})" cy="-31" r="2.2" fill="var(--accent)" stroke="none"/>`).join("")}
                </g>
            </svg>
        `);
        hero.appendChild(rangoli);
        decorativeElements.push(rangoli);
    }

    function mountDecorations() {
        if (!window.isDiwaliEffectsAllowed?.()) return;
        createIntroLights();
        createRangoli();
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
            "input, textarea, select, button, a, label, iframe, [role='button'], [contenteditable='true'], #alora-diwali-banner"
        ));
    }

    function addSparkle(x, y) {
        if (sparkles.length >= 12) sparkles.shift().remove();
        const sparkle = document.createElement("span");
        sparkle.className = "diwali-click-sparkle";
        sparkle.setAttribute("aria-hidden", "true");
        sparkle.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 10px 3px rgb(var(--accent-rgb) / .7);pointer-events:none;z-index:30;animation:diwali-sparkle-out .55s ease-out forwards`;
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
        installSparkles();
    };
    window.disableDiwaliEffects = () => {
        cleanupFireworks();
        removeSparkles();
        if (introLightsTimer) window.clearTimeout(introLightsTimer);
        introLightsTimer = null;
        decorativeElements.forEach((element) => element.remove());
        decorativeElements = [];
        if (heroContainer) {
            heroContainer.style.position = originalHeroPosition;
            heroContainer = null;
        }
    };

    window.enableDiwaliEffects();

    if (window.aloraDiwaliFireworksPending) {
        const options = window.aloraDiwaliFireworksPending;
        delete window.aloraDiwaliFireworksPending;
        playDiwaliFireworks(options);
    }
})();
