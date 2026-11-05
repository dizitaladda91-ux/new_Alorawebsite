import BASE_URL, { getImageUrl } from "./config.js";

const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element && typeof value === "string") element.textContent = value;
};

async function loadHomepageIngredients() {
    const section = document.getElementById("ingredients-discovery");
    if (!section) return;

    try {
        const response = await fetch(`${BASE_URL}/api/homepage-ingredients`, { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`Homepage content request failed (${response.status}).`);
        }

        const result = await response.json();
        if (!result.success || !result.data) {
            throw new Error(result.message || "Homepage content was not available.");
        }

        const content = result.data;
        if (content.isEnabled === false) {
            section.hidden = true;
            return;
        }

        section.hidden = false;
        setText("ingredients-discovery-eyebrow", content.eyebrow);
        setText("ingredients-discovery-heading", content.heading);
        setText("ingredients-discovery-description", content.description);
        setText("ingredients-discovery-link-text", content.buttonText);

        const link = document.getElementById("ingredients-discovery-link");
        if (link && typeof content.buttonUrl === "string") link.href = content.buttonUrl;

        const image = document.getElementById("ingredients-discovery-image");
        if (image && typeof content.imageUrl === "string") {
            image.src = getImageUrl(content.imageUrl);
            image.alt = typeof content.imageAlt === "string" ? content.imageAlt : "";
        }
    } catch (error) {
        console.error("Could not load homepage ingredient content:", error);
    }
}

loadHomepageIngredients();
