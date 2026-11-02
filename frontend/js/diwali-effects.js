(() => {
    const campaignEnd = Date.parse("2026-11-08T23:59:59+05:30");
    if (Date.now() > campaignEnd || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let canvas;
    let context;
    let animationFrame;
    let startTime;
    let lastLaunch = -Infinity;
    let launches = 0;
    const rockets = [];
    const particles = [];
    const colors = ["#FFD27A", "#FF8C42", "#F5C2E7", "#FFF4D6", "#D98E2B"];

    function resizeCanvas() {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(window.innerWidth * pixelRatio);
        canvas.height = Math.round(window.innerHeight * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function createBurst(x, y) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const count = 42;
        for (let i = 0; i < count; i += 1) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.08;
            const speed = 1.2 + Math.random() * 3.2;
            const life = 48 + Math.random() * 24;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life,
                maxLife: life,
                color: Math.random() > 0.22 ? color : colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    function launchRocket(width, height) {
        const x = width * (0.16 + Math.random() * 0.68);
        rockets.push({
            x,
            y: height + 4,
            targetY: height * (0.17 + Math.random() * 0.25),
            color: colors[Math.floor(Math.random() * colors.length)]
        });
        launches += 1;
    }

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const width = window.innerWidth;
        const height = window.innerHeight;
        context.clearRect(0, 0, width, height);

        if (launches < 4 && elapsed - lastLaunch >= 520) {
            launchRocket(width, height);
            lastLaunch = elapsed;
        }

        for (let i = rockets.length - 1; i >= 0; i -= 1) {
            const rocket = rockets[i];
            const previousY = rocket.y;
            rocket.y -= 8;
            context.beginPath();
            context.moveTo(rocket.x, previousY + 10);
            context.lineTo(rocket.x, rocket.y);
            context.strokeStyle = rocket.color;
            context.globalAlpha = 0.8;
            context.lineWidth = 2;
            context.stroke();
            if (rocket.y <= rocket.targetY) {
                createBurst(rocket.x, rocket.y);
                rockets.splice(i, 1);
            }
        }

        for (let i = particles.length - 1; i >= 0; i -= 1) {
            const particle = particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.045;
            particle.vx *= 0.985;
            particle.vy *= 0.985;
            particle.life -= 1;
            if (particle.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            context.globalAlpha = particle.life / particle.maxLife;
            context.fillStyle = particle.color;
            context.fillRect(particle.x, particle.y, 3, 3);
        }
        context.globalAlpha = 1;

        if (elapsed < 4800 || rockets.length || particles.length) {
            animationFrame = window.requestAnimationFrame(animate);
        } else {
            cleanup();
        }
    }

    function cleanup() {
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        window.removeEventListener("resize", resizeCanvas);
        canvas?.remove();
        canvas = null;
        context = null;
    }

    window.playDiwaliFireworks = () => {
        if (Date.now() > campaignEnd || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        cleanup();
        rockets.length = 0;
        particles.length = 0;
        launches = 0;
        lastLaunch = -Infinity;
        startTime = 0;
        canvas = document.createElement("canvas");
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
        animationFrame = window.requestAnimationFrame(animate);
    };

    window.playDiwaliFireworks();
    if (window.aloraDiwaliFireworksPending) {
        window.aloraDiwaliFireworksPending = false;
        window.playDiwaliFireworks();
    }
})();
