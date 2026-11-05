import mongoose from "mongoose";
import HomepageIngredients from "../models/homepageIngredients.models.js";
import SimpleProduct from "../models/product.models.js";

const DEFAULT_INGREDIENTS = [
    {
        name: "Saffron",
        shortDescription: "A cherished botanical used in skincare rituals for a radiant-looking complexion.",
        fullDescription: "Saffron is a much-loved botanical in traditional beauty rituals. In skincare, saffron extract is valued for helping skin look fresh and radiant. Learn how it fits into your routine by exploring the ingredients listed on each product.",
        imageUrl: "/static/4.webp",
        imageAlt: "Alora Radiance saffron face serum",
        productSlugs: ["alora-niacinamide-glow-serum"]
    },
    {
        name: "Niacinamide",
        shortDescription: "A versatile form of vitamin B3 found in everyday skincare routines.",
        fullDescription: "Niacinamide, also known as vitamin B3, is a versatile skincare ingredient used in products designed to support a more even-looking complexion and balanced-feeling skin. Introduce it gradually and follow the directions on your chosen product.",
        imageUrl: "/static/4.webp",
        imageAlt: "Alora Radiance serum featuring niacinamide",
        productSlugs: ["alora-niacinamide-glow-serum", "alora-gentle-hydrating-face-wash"]
    },
    {
        name: "Hyaluronic Acid",
        shortDescription: "A moisture-loving ingredient used to help skin feel hydrated and supple.",
        fullDescription: "Hyaluronic acid is a humectant used in skincare to attract and hold moisture. It is often included in hydration-focused routines and can be layered with a moisturizer. Follow the directions on the product label for best use.",
        imageUrl: "/static/3.webp",
        imageAlt: "Alora Radiance hydration skincare with hyaluronic acid",
        productSlugs: ["alora-intense-hydration-body-lotion", "alora-niacinamide-glow-serum"]
    },
    {
        name: "Shea Butter",
        shortDescription: "A rich plant-derived emollient used in nourishing skincare formulas.",
        fullDescription: "Shea butter is a plant-derived emollient used to add a nourishing feel to skincare products. It is commonly found in richer creams and lotions for skin that feels soft and moisturized. Check individual product labels for the full ingredient list.",
        imageUrl: "/static/3.webp",
        imageAlt: "Alora Radiance face cream with nourishing ingredients",
        productSlugs: ["alora-intense-hydration-body-lotion", "alora-deep-nourishing-face-cream"]
    }
];

export const DEFAULT_HOMEPAGE_INGREDIENTS = {
    eyebrow: "Discover",
    heading: "Skin-Saving Actives",
    buttonText: "Explore our Ingredients",
    buttonUrl: "/products",
    ingredients: DEFAULT_INGREDIENTS,
    isEnabled: true
};

class HomepageContentValidationError extends Error {}

const validateText = (value, field, maxLength) => {
    if (typeof value !== "string") {
        throw new HomepageContentValidationError(`${field} must be text.`);
    }
    const text = value.trim();
    if (!text) {
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

const getProductSummary = (product) => ({
    _id: String(product._id),
    name: product.name,
    slug: product.slug || "",
    imagepath: product.imagepath || "",
    price: product.variants?.[0]?.price ?? product.price ?? null,
    isAvailable: product.isAvailable !== false
});

const resolveProducts = async (ingredients, useDefaults = false) => {
    if (useDefaults) {
        const productSlugs = [...new Set(ingredients.flatMap(item => item.productSlugs || []))];
        const products = await SimpleProduct.find({ slug: { $in: productSlugs }, isAvailable: { $ne: false } })
            .select("name slug imagepath variants price isAvailable")
            .lean();
        const productsBySlug = new Map(products.map(product => [product.slug, getProductSummary(product)]));
        return ingredients.map(({ productSlugs: slugs, ...ingredient }) => ({
            ...ingredient,
            recommendedProducts: (slugs || []).map(slug => productsBySlug.get(slug)).filter(Boolean)
        }));
    }

    const productIds = [...new Set(ingredients.flatMap(item => (item.recommendedProducts || []).map(String)))];
    const products = productIds.length
        ? await SimpleProduct.find({ _id: { $in: productIds }, isAvailable: { $ne: false } })
            .select("name slug imagepath variants price isAvailable")
            .lean()
        : [];
    const productsById = new Map(products.map(product => [String(product._id), getProductSummary(product)]));
    return ingredients.map(ingredient => ({
        ...ingredient,
        recommendedProducts: (ingredient.recommendedProducts || [])
            .map(product => productsById.get(String(product?._id || product)))
            .filter(Boolean)
    }));
};

const getHomepageIngredients = async (req, res) => {
    try {
        const content = await HomepageIngredients.findOne({ key: "homepage-ingredients" }).lean();
        const useDefaults = !content?.ingredients?.length;
        const ingredients = await resolveProducts(
            useDefaults ? DEFAULT_INGREDIENTS : content.ingredients,
            useDefaults
        );
        return res.status(200).json({
            success: true,
            data: {
                ...DEFAULT_HOMEPAGE_INGREDIENTS,
                ...(content || {}),
                ingredients
            }
        });
    } catch (error) {
        console.error("Failed to load homepage ingredient section:", error);
        return res.status(500).json({ success: false, message: "Failed to load homepage content." });
    }
};

const updateHomepageIngredients = async (req, res) => {
    try {
        if (!Array.isArray(req.body.ingredients) || req.body.ingredients.length < 1 || req.body.ingredients.length > 12) {
            throw new HomepageContentValidationError("Add between 1 and 12 ingredient cards.");
        }

        const ingredients = req.body.ingredients.map((item, index) => {
            const label = `Ingredient ${index + 1}`;
            if (!item || typeof item !== "object" || Array.isArray(item)) {
                throw new HomepageContentValidationError(`${label} is invalid.`);
            }
            if (!Array.isArray(item.recommendedProducts) || item.recommendedProducts.length > 6) {
                throw new HomepageContentValidationError(`${label} can have up to 6 recommended products.`);
            }
            const recommendedProducts = [...new Set(item.recommendedProducts.map(id => String(id)))];
            if (recommendedProducts.some(id => !mongoose.Types.ObjectId.isValid(id))) {
                throw new HomepageContentValidationError(`${label} has an invalid recommended product.`);
            }
            return {
                name: validateText(item.name, `${label} name`, 100),
                shortDescription: validateText(item.shortDescription, `${label} summary`, 220),
                fullDescription: validateText(item.fullDescription, `${label} details`, 3000),
                imageUrl: validateUrl(item.imageUrl, `${label} image URL`),
                imageAlt: validateText(item.imageAlt, `${label} image alt text`, 180),
                recommendedProducts
            };
        });

        const productIds = [...new Set(ingredients.flatMap(item => item.recommendedProducts))];
        if (productIds.length) {
            const foundProducts = await SimpleProduct.countDocuments({
                _id: { $in: productIds },
                isAvailable: { $ne: false }
            });
            if (foundProducts !== productIds.length) {
                throw new HomepageContentValidationError("One or more recommended products are unavailable. Reload the product list and try again.");
            }
        }

        const payload = {
            eyebrow: validateText(req.body.eyebrow, "Eyebrow", 60),
            heading: validateText(req.body.heading, "Heading", 100),
            buttonText: validateText(req.body.buttonText, "Button text", 50),
            buttonUrl: validateUrl(req.body.buttonUrl, "Button URL"),
            ingredients,
            isEnabled: req.body.isEnabled
        };
        if (typeof payload.isEnabled !== "boolean") {
            throw new HomepageContentValidationError("Section visibility must be true or false.");
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
