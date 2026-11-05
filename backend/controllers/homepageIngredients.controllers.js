import mongoose from "mongoose";
import HomepageIngredients from "../models/homepageIngredients.models.js";
import SimpleProduct from "../models/product.models.js";

const DEFAULT_INGREDIENTS = [
    {
        slug: "saffron",
        name: "Saffron",
        seoTitle: "Saffron in Skincare: Uses and How to Choose | Alora Radiance",
        seoDescription: "Learn what saffron extract is used for in skincare, how it fits into a routine, and what to look for when choosing a product.",
        shortDescription: "A cherished botanical used in skincare rituals for a radiant-looking complexion.",
        fullDescription: "Saffron is a much-loved botanical in traditional beauty rituals. In skincare, saffron extract is valued for helping skin look fresh and radiant. Learn how it fits into your routine by exploring the ingredients listed on each product.",
        articleIntro: "Saffron has a long history in beauty rituals and is now used in a range of skincare formulas. Its role depends on the extract and the complete formulation. This guide explains how saffron is used in skincare, how to add a saffron-containing product to your routine, and how to choose one that suits your preferences.",
        pageSections: [
            { heading: "What is saffron in skincare?", body: "Saffron is a spice obtained from the Crocus sativus flower. Skincare products may include saffron extract as one part of a broader formula. The exact composition and intended use can vary by product, so check the ingredient list and product directions." },
            { heading: "Why is saffron used in skincare?", body: "Saffron is valued in traditional personal-care practices and is often included in formulas designed to leave skin looking fresh and radiant. A product's overall performance depends on its full formulation, not on one ingredient alone." },
            { heading: "How to use saffron skincare", body: "Follow the directions on the product label and introduce new products one at a time. If you have sensitive skin, consider testing the product on a small area first. Use sunscreen during the day as part of your regular skincare routine." },
            { heading: "Choosing a saffron product", body: "Review the complete ingredient list, directions, and any usage precautions before buying. Choose a format that works for your routine and discontinue use if irritation occurs. If you are comparing products, look at the entire formula and intended use rather than relying on the presence of saffron alone." },
            { heading: "Can saffron be part of a daily routine?", body: "A saffron-containing product may be used as directed on its label. There is no single routine that suits everyone, so consider your existing products, skin preferences, and the product's instructions. Introduce it gradually, avoid using more than directed, and ask a dermatologist if you need advice tailored to your skin." }
        ],
        imageUrl: "/static/4.webp",
        imageAlt: "Alora Radiance saffron face serum",
        productSlugs: ["alora-niacinamide-glow-serum"]
    },
    {
        slug: "niacinamide",
        name: "Niacinamide",
        seoTitle: "Niacinamide for Skin: Uses and Routine Tips | Alora Radiance",
        seoDescription: "Explore niacinamide, a form of vitamin B3 used in skincare, with practical tips for choosing and using a niacinamide product.",
        shortDescription: "A versatile form of vitamin B3 found in everyday skincare routines.",
        fullDescription: "Niacinamide, also known as vitamin B3, is a versatile skincare ingredient used in products designed to support a more even-looking complexion and balanced-feeling skin. Introduce it gradually and follow the directions on your chosen product.",
        articleIntro: "Niacinamide is a form of vitamin B3 used in many kinds of skincare products. It can be found in serums, moisturisers, and cleansers, and is often chosen for routines focused on a more even-looking complexion and comfortable-feeling skin. Here is what to know before adding it to your routine.",
        pageSections: [
            { heading: "What is niacinamide?", body: "Niacinamide, also called nicotinamide, is a water-soluble form of vitamin B3. In skincare it is used in products such as serums, creams, and cleansers. Formulas differ, so use the product as directed rather than assuming every niacinamide product works the same way." },
            { heading: "Why is niacinamide used in skincare?", body: "Niacinamide is a popular ingredient in routines for balanced-feeling skin and a more even-looking complexion. It is often combined with other ingredients in multi-purpose formulas. The finished product and how consistently it is used both matter." },
            { heading: "How to use niacinamide", body: "Start with the product directions and introduce one new product at a time. Apply it in the order recommended on its label. If discomfort or irritation occurs, stop using it and seek professional advice if needed." },
            { heading: "Who can use niacinamide?", body: "People choose niacinamide products for a variety of routines and skin preferences. If you have a skin condition, are using prescribed treatments, or are unsure whether a product is suitable, check with a dermatologist. Check the full product formula as well, since other ingredients and the product format can affect whether it feels right for you." },
            { heading: "Can niacinamide be combined with other products?", body: "Many skincare products combine niacinamide with other ingredients, but how to layer them depends on the specific formulas. Follow the directions for each product and introduce new products separately. If you use prescription skincare or have concerns about combining products, ask a healthcare professional for guidance." }
        ],
        imageUrl: "/static/4.webp",
        imageAlt: "Alora Radiance serum featuring niacinamide",
        productSlugs: ["alora-niacinamide-glow-serum", "alora-gentle-hydrating-face-wash"]
    },
    {
        slug: "hyaluronic-acid",
        name: "Hyaluronic Acid",
        seoTitle: "Hyaluronic Acid in Skincare: A Hydration Guide | Alora Radiance",
        seoDescription: "Learn how hyaluronic acid is used in skincare and how to layer a hydration-focused product in your routine.",
        shortDescription: "A moisture-loving ingredient used to help skin feel hydrated and supple.",
        fullDescription: "Hyaluronic acid is a humectant used in skincare to attract and hold moisture. It is often included in hydration-focused routines and can be layered with a moisturizer. Follow the directions on the product label for best use.",
        articleIntro: "Hyaluronic acid is a well-known skincare humectant used in products designed to support a hydrated, supple feel. It appears in many formats, from lightweight serums to moisturisers. Learn how it works in a formula and how to make it part of a simple routine.",
        pageSections: [
            { heading: "What is hyaluronic acid?", body: "Hyaluronic acid is a humectant: an ingredient used in skincare to attract and retain moisture. It can appear under different names on ingredient lists, including sodium hyaluronate, a form commonly used in formulas." },
            { heading: "Why is it used in skincare?", body: "Hyaluronic acid is included in hydration-focused products to help skin feel moisturised and supple. Its performance depends on the complete formula and how the product is used." },
            { heading: "How to use hyaluronic acid", body: "Apply the product according to its label. Many people use a hydrating serum before moisturiser, but follow the instructions for your specific product. Avoid layering several new products at once if you are trying to identify what suits your skin." },
            { heading: "Choosing a hydration product", body: "Consider the product texture, your routine, and the complete ingredient list. A moisturiser can be used as directed to complement a hydration-focused serum. Stop use if irritation occurs. Serums, creams, and lotions have different textures, so choose a format you are comfortable applying consistently." },
            { heading: "How to add it to a simple routine", body: "Keep the rest of your routine familiar when introducing a new hyaluronic acid product. Use it at the step and frequency indicated on the label, then apply other products in the order recommended by their manufacturers. If your skin feels uncomfortable, pause the new product and review its directions." }
        ],
        imageUrl: "/static/3.webp",
        imageAlt: "Alora Radiance hydration skincare with hyaluronic acid",
        productSlugs: ["alora-intense-hydration-body-lotion", "alora-niacinamide-glow-serum"]
    },
    {
        slug: "shea-butter",
        name: "Shea Butter",
        seoTitle: "Shea Butter in Skincare: Uses and Benefits | Alora Radiance",
        seoDescription: "Find out how shea butter is used as an emollient in skincare and how to choose a moisturising product.",
        shortDescription: "A rich plant-derived emollient used in nourishing skincare formulas.",
        fullDescription: "Shea butter is a plant-derived emollient used to add a nourishing feel to skincare products. It is commonly found in richer creams and lotions for skin that feels soft and moisturized. Check individual product labels for the full ingredient list.",
        articleIntro: "Shea butter is a plant-derived ingredient used in creams, lotions, and other personal-care products. In skincare it is valued as an emollient, contributing to the feel and texture of a formula. This guide covers how it is commonly used and what to consider when choosing a product.",
        pageSections: [
            { heading: "What is shea butter?", body: "Shea butter is a fat obtained from the nuts of the shea tree. In personal-care products it may be used as an emollient and as part of a product's texture. Check the ingredient declaration to see how it appears in a specific formula." },
            { heading: "Why is shea butter used in skincare?", body: "Shea butter is commonly included in moisturising creams and lotions because it contributes a rich, nourishing feel. The experience and suitability of a product depend on the complete formulation." },
            { heading: "How to use shea butter products", body: "Use the product according to its label and choose a texture that feels comfortable for your routine. For a new product, consider a small-area test first, especially if your skin is sensitive." },
            { heading: "Choosing a shea butter product", body: "Look at the full ingredient list, directions, and product format. If you have a known allergy to an ingredient or are uncertain about suitability, consult a healthcare professional before use. A richer texture may feel different from a lightweight lotion, so consider where and when you plan to use the product." },
            { heading: "Is shea butter right for every routine?", body: "Skin preferences vary, and no single ingredient or texture is right for everyone. Consider the complete formula and how it feels on your skin. If you have a known sensitivity, allergy, or ongoing skin concern, check the label carefully and speak with a dermatologist or other qualified professional." }
        ],
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

const slugify = (value) => String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const enrichIngredient = (ingredient) => {
    const slug = ingredient.slug || slugify(ingredient.name);
    const fallback = DEFAULT_INGREDIENTS.find(item => item.slug === slug)
        || DEFAULT_INGREDIENTS.find(item => item.name.toLowerCase() === String(ingredient.name || "").toLowerCase());
    const name = ingredient.name || fallback?.name || "Ingredient";
    return {
        ...(fallback || {}),
        ...ingredient,
        slug,
        seoTitle: ingredient.seoTitle || fallback?.seoTitle || `${name} in Skincare | Alora Radiance`,
        seoDescription: ingredient.seoDescription || fallback?.seoDescription || ingredient.shortDescription || "",
        articleIntro: ingredient.articleIntro || fallback?.articleIntro || ingredient.fullDescription || "",
        pageSections: ingredient.pageSections?.length ? ingredient.pageSections : (fallback?.pageSections || [])
    };
};

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
        const sourceIngredients = (useDefaults ? DEFAULT_INGREDIENTS : content.ingredients).map(enrichIngredient);
        const ingredients = await resolveProducts(
            sourceIngredients,
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

const getHomepageIngredientBySlug = async (slug) => {
    const content = await HomepageIngredients.findOne({ key: "homepage-ingredients" }).lean();
    const useDefaults = !content?.ingredients?.length;
    const sourceIngredients = (useDefaults ? DEFAULT_INGREDIENTS : content.ingredients).map(enrichIngredient);
    const ingredient = sourceIngredients.find(item => item.slug === slug);
    if (!ingredient) return null;
    const [resolvedIngredient] = await resolveProducts([ingredient], useDefaults);
    return resolvedIngredient || null;
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
            const name = validateText(item.name, `${label} name`, 100);
            const slug = validateText(item.slug || slugify(name), `${label} URL slug`, 120).toLowerCase();
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
                throw new HomepageContentValidationError(`${label} URL slug can contain only lowercase letters, numbers, and hyphens.`);
            }
            if (!Array.isArray(item.pageSections) || item.pageSections.length < 2 || item.pageSections.length > 12) {
                throw new HomepageContentValidationError(`${label} needs between 2 and 12 article sections.`);
            }
            return {
                slug,
                name,
                seoTitle: validateText(item.seoTitle, `${label} SEO title`, 160),
                seoDescription: validateText(item.seoDescription, `${label} SEO description`, 320),
                shortDescription: validateText(item.shortDescription, `${label} summary`, 220),
                fullDescription: validateText(item.fullDescription || item.articleIntro, `${label} details`, 5000),
                articleIntro: validateText(item.articleIntro, `${label} article introduction`, 5000),
                pageSections: item.pageSections.map((section, sectionIndex) => {
                    if (!section || typeof section !== "object" || Array.isArray(section)) {
                        throw new HomepageContentValidationError(`${label} section ${sectionIndex + 1} is invalid.`);
                    }
                    return {
                        heading: validateText(section.heading, `${label} section ${sectionIndex + 1} heading`, 120),
                        body: validateText(section.body, `${label} section ${sectionIndex + 1} content`, 5000)
                    };
                }),
                imageUrl: validateUrl(item.imageUrl, `${label} image URL`),
                imageAlt: validateText(item.imageAlt, `${label} image alt text`, 180),
                recommendedProducts
            };
        });

        if (new Set(ingredients.map(item => item.slug)).size !== ingredients.length) {
            throw new HomepageContentValidationError("Each ingredient must have a unique URL slug.");
        }

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

export { getHomepageIngredients, getHomepageIngredientBySlug, updateHomepageIngredients, uploadHomepageIngredientsImage };
