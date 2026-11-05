import HomepageIngredients from "../models/homepageIngredients.models.js";

export const DEFAULT_HOMEPAGE_INGREDIENTS = {
    eyebrow: "DISCOVER",
    heading: "Skin-Loving Actives",
    description: "Meet the thoughtful ingredients behind our everyday skincare rituals, chosen to nourish, care for, and bring out your skin's natural radiance.",
    buttonText: "Explore Our Ingredients",
    buttonUrl: "/products",
    imageUrl: "/static/4.webp",
    imageAlt: "Alora Radiance skincare with botanical ingredients",
    isEnabled: true
};

class HomepageContentValidationError extends Error {}

const validateText = (value, field, maxLength, required = true) => {
    if (typeof value !== "string") {
        throw new HomepageContentValidationError(`${field} must be text.`);
    }
    const text = value.trim();
    if (required && !text) {
        throw new HomepageContentValidationError(`${field} is required.`);
    }
    if (text.length > maxLength) {
        throw new HomepageContentValidationError(`${field} must be ${maxLength} characters or fewer.`);
    }
    return text;
};

const validateUrl = (value, field) => {
    const url = validateText(value, field, 1000);
    if (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\") && !/[\u0000-\u0020]/.test(url)) {
        return url;
    }
    try {
        const parsed = new URL(url);
        if (parsed.protocol === "https:" && parsed.hostname) return url;
    } catch {
        // Invalid URLs are reported through the standard validation response.
    }
    throw new HomepageContentValidationError(`${field} must be a site path or an HTTPS URL.`);
};

const getHomepageIngredients = async (req, res) => {
    try {
        const content = await HomepageIngredients.findOne({ key: "homepage-ingredients" }).lean();
        return res.status(200).json({
            success: true,
            data: { ...DEFAULT_HOMEPAGE_INGREDIENTS, ...(content || {}) }
        });
    } catch (error) {
        console.error("Failed to load homepage ingredient section:", error);
        return res.status(500).json({ success: false, message: "Failed to load homepage content." });
    }
};

const updateHomepageIngredients = async (req, res) => {
    try {
        const payload = {
            eyebrow: validateText(req.body.eyebrow, "Eyebrow", 60),
            heading: validateText(req.body.heading, "Heading", 100),
            description: validateText(req.body.description, "Description", 500),
            buttonText: validateText(req.body.buttonText, "Button text", 50),
            buttonUrl: validateUrl(req.body.buttonUrl, "Button URL"),
            imageUrl: validateUrl(req.body.imageUrl, "Image URL"),
            imageAlt: validateText(req.body.imageAlt, "Image alt text", 180),
            isEnabled: req.body.isEnabled
        };
        if (typeof payload.isEnabled !== "boolean") {
            return res.status(400).json({ success: false, message: "Section visibility must be true or false." });
        }

        const content = await HomepageIngredients.findOneAndUpdate(
            { key: "homepage-ingredients" },
            { $set: payload },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        ).lean();

        return res.status(200).json({ success: true, message: "Homepage section saved.", data: content });
    } catch (error) {
        if (error instanceof HomepageContentValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Failed to save homepage ingredient section:", error);
        return res.status(500).json({ success: false, message: "Failed to save homepage content." });
    }
};

const uploadHomepageIngredientsImage = (req, res) => {
    if (!req.file?.path) {
        return res.status(400).json({ success: false, message: "Choose an image to upload." });
    }
    return res.status(200).json({
        success: true,
        imageUrl: req.file.path,
        message: "Homepage image uploaded."
    });
};

export { getHomepageIngredients, updateHomepageIngredients, uploadHomepageIngredientsImage };
