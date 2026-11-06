import mongoose from "mongoose";
import HomepageIngredients from "../models/homepageIngredients.models.js";
import SimpleProduct from "../models/product.models.js";
import Blog from "../models/blog.models.js";

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
    },
    {
        slug: "salicylic-acid",
        name: "Salicylic Acid",
        seoTitle: "Salicylic Acid in Skincare: How to Use It | Alora Radiance",
        seoDescription: "Learn how salicylic acid is used in skincare, how to introduce it carefully, and what to consider when choosing a cleanser.",
        shortDescription: "A beta hydroxy acid used in cleansers and other targeted skincare formulas.",
        fullDescription: "Salicylic acid is a beta hydroxy acid found in some cleansers and leave-on skincare products. Product strengths and directions differ, so use only as directed and avoid combining new active products all at once.",
        articleIntro: "Salicylic acid is a beta hydroxy acid (BHA) used in a range of skincare formulas, including cleansers. Because products differ in concentration, format, and directions, it is important to follow the label and introduce a new product thoughtfully. This guide covers how salicylic acid is used and what to keep in mind when adding it to a routine.",
        pageSections: [
            { heading: "What is salicylic acid?", body: "Salicylic acid is a beta hydroxy acid used as an ingredient in some skincare products. It may be included in rinse-off cleansers or leave-on formulas. The amount, supporting ingredients, and intended use vary, so check the product label rather than assuming all salicylic acid products are interchangeable." },
            { heading: "Why is it used in skincare?", body: "Salicylic acid is used in formulas intended to exfoliate the surface of the skin and help cleanse pores. Results and tolerability depend on the complete product and how it is used. It is not a guaranteed treatment for acne or other skin conditions." },
            { heading: "How to introduce it into a routine", body: "Follow the directions and frequency printed on the product. If you are new to salicylic acid, start with one product and avoid adding several exfoliating or active products at the same time. Use sunscreen during the day and stop using the product if persistent irritation occurs." },
            { heading: "Who should take extra care?", body: "If you have sensitive or compromised skin, are pregnant or breastfeeding, use prescription skin treatments, or have a diagnosed skin condition, ask a qualified healthcare professional whether the product is appropriate for you. Avoid applying it to irritated or broken skin unless a healthcare professional advises otherwise." },
            { heading: "Choosing a salicylic acid product", body: "Choose a product format that suits your routine and review the full ingredient list, directions, and precautions. A rinse-off cleanser is used differently from a leave-on formula. Do not exceed the recommended use, and consult a dermatologist for ongoing or severe skin concerns." }
        ],
        imageUrl: "/static/hero_banner_facewash.webp",
        imageAlt: "Alora Radiance Purifying Glow Face Wash featuring salicylic acid",
        productSlugs: ["purifying-glow-face-wash"]
    },
    {
        slug: "walnut",
        name: "Walnut",
        seoTitle: "Walnut in Skincare: Exfoliation and Use | Alora Radiance",
        seoDescription: "Learn how walnut-derived ingredients are used in exfoliating skincare and how to use a face scrub gently and as directed.",
        shortDescription: "A plant-derived exfoliating ingredient used in some face scrub formulas.",
        fullDescription: "Walnut shell powder is used in some rinse-off exfoliating products. Scrubs can feel different on different skin, so use gentle pressure, follow the product directions, and avoid using on irritated skin.",
        articleIntro: "Walnut-derived ingredients, such as walnut shell powder, are used in some physical exfoliating products. Scrubs vary in texture and intended use, so gentle application and the product directions matter. This guide explains what to look for and how to use an exfoliating scrub with care.",
        pageSections: [
            { heading: "What does walnut mean in a skincare formula?", body: "In exfoliating skincare, walnut usually refers to walnut shell powder or another walnut-derived ingredient included in a rinse-off formula. Check the ingredient declaration to see exactly which ingredient is used in a particular product." },
            { heading: "Why is walnut used in face scrubs?", body: "Walnut shell powder can provide physical exfoliation as the product is massaged over the skin and rinsed away. The experience depends on particle size, formula, and application. A scrub should not be expected to treat acne or replace advice from a dermatologist." },
            { heading: "How to use a walnut scrub gently", body: "Follow the product label, use light pressure, and rinse thoroughly. Avoid scrubbing for longer or more often than directed, and do not use on broken, irritated, or freshly sensitized skin. Stop if stinging or persistent redness occurs." },
            { heading: "Is a physical scrub right for everyone?", body: "A physical exfoliant may not suit every skin type or routine. If your skin is sensitive, you have an active skin condition, or you use prescription treatments, ask a dermatologist before adding a scrub. Avoid using it at the same time as other exfoliants unless a professional advises you to." },
            { heading: "Choosing an exfoliating scrub", body: "Review the full ingredient list, directions, and warnings before use. Choose a product that feels comfortable when applied gently and use it only as directed. For persistent concerns such as acne or irritation, seek advice from a qualified healthcare professional." }
        ],
        imageUrl: "/static/hero_banner_scrub_desk.webp",
        imageAlt: "Alora Radiance Gentle Exfoliating Walnut Scrub",
        productSlugs: ["gentle-exfoliating-walnut-scrub"]
    }
];

const INGREDIENT_SEED_VERSION = 2;
const NEW_DEFAULT_INGREDIENT_SLUGS = new Set(["salicylic-acid", "walnut"]);

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
        shortDescription: ingredient.shortDescription || fallback?.shortDescription || "",
        fullDescription: ingredient.fullDescription || fallback?.fullDescription || "",
        articleIntro: ingredient.articleIntro || fallback?.articleIntro || ingredient.fullDescription || "",
        pageSections: ingredient.pageSections?.length ? ingredient.pageSections : (fallback?.pageSections || []),
        imageUrl: ingredient.imageUrl || fallback?.imageUrl || "",
        imageAlt: ingredient.imageAlt || fallback?.imageAlt || ""
    };
};

const loadHomepageContentWithSeededIngredients = async () => {
    let content = await HomepageIngredients.findOne({ key: "homepage-ingredients" }).lean();
    if (!content?.ingredients?.length || (content.ingredientSeedVersion || 0) >= INGREDIENT_SEED_VERSION) {
        return content;
    }

    const existingSlugs = new Set(content.ingredients.map(item => item.slug).filter(Boolean));
    const additions = DEFAULT_INGREDIENTS
        .filter(item => NEW_DEFAULT_INGREDIENT_SLUGS.has(item.slug) && !existingSlugs.has(item.slug));
    const seedsNeedingProducts = DEFAULT_INGREDIENTS.filter(seed =>
        additions.some(item => item.slug === seed.slug)
        || content.ingredients.some(item => item.slug === seed.slug && !item.recommendedProducts?.length)
    );
    const productSlugs = [...new Set(seedsNeedingProducts.flatMap(item => item.productSlugs || []))];
    const products = productSlugs.length
        ? await SimpleProduct.find({
            slug: { $in: productSlugs },
            isAvailable: { $ne: false }
        }).select("_id slug").lean()
        : [];
    const productIdsBySlug = new Map(products.map(product => [product.slug, String(product._id)]));
    const existingIngredients = content.ingredients.map(ingredient => {
        const seed = DEFAULT_INGREDIENTS.find(item => item.slug === ingredient.slug);
        if (!seed) return ingredient;
        return {
            ...ingredient,
            seoTitle: ingredient.seoTitle || seed.seoTitle,
            seoDescription: ingredient.seoDescription || seed.seoDescription,
            shortDescription: ingredient.shortDescription || seed.shortDescription,
            fullDescription: ingredient.fullDescription || seed.fullDescription,
            articleIntro: ingredient.articleIntro || seed.articleIntro,
            pageSections: ingredient.pageSections?.length ? ingredient.pageSections : seed.pageSections,
            imageUrl: ingredient.imageUrl || seed.imageUrl,
            imageAlt: ingredient.imageAlt || seed.imageAlt,
            recommendedProducts: ingredient.recommendedProducts?.length
                ? ingredient.recommendedProducts
                : (seed.productSlugs || []).map(slug => productIdsBySlug.get(slug)).filter(Boolean)
        };
    });
    const cardsToAdd = additions.map(({ productSlugs: slugs, ...ingredient }) => ({
        ...ingredient,
        recommendedProducts: (slugs || []).map(slug => productIdsBySlug.get(slug)).filter(Boolean)
    }));

    const migratedContent = await HomepageIngredients.findOneAndUpdate(
        {
            key: "homepage-ingredients",
            $or: [
                { ingredientSeedVersion: { $exists: false } },
                { ingredientSeedVersion: { $lt: INGREDIENT_SEED_VERSION } }
            ]
        },
        {
            $set: {
                ingredientSeedVersion: INGREDIENT_SEED_VERSION,
                ingredients: [...existingIngredients, ...cardsToAdd]
            }
        },
        { new: true, runValidators: true }
    ).lean();

    return migratedContent
        || HomepageIngredients.findOne({ key: "homepage-ingredients" }).lean();
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
        const content = await loadHomepageContentWithSeededIngredients();
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
    const content = await loadHomepageContentWithSeededIngredients();
    const useDefaults = !content?.ingredients?.length;
    const sourceIngredients = (useDefaults ? DEFAULT_INGREDIENTS : content.ingredients).map(enrichIngredient);
    const ingredient = sourceIngredients.find(item => item.slug === slug);
    if (!ingredient) return null;
    const [resolvedIngredient] = await resolveProducts([ingredient], useDefaults);
    if (!resolvedIngredient) return null;

    const searchTerm = String(resolvedIngredient.name || resolvedIngredient.slug || "").trim();
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const relatedBlogs = searchTerm
        ? await Blog.find({
            status: "published",
            $or: ["title", "metaTitle", "keywords", "metaDesc", "category", "content"].map(field => ({
                [field]: { $regex: escapedSearchTerm, $options: "i" }
            }))
        })
            .select("title slug metaDesc coverImage createdAt")
            .sort({ createdAt: -1 })
            .limit(3)
            .lean()
        : [];

    return { ...resolvedIngredient, relatedBlogs };
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
                imageUrl: item.imageUrl === undefined || item.imageUrl === null
                    || (typeof item.imageUrl === "string" && item.imageUrl.trim() === "")
                    ? ""
                    : validateUrl(item.imageUrl, `${label} image URL`),
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
            ingredientSeedVersion: INGREDIENT_SEED_VERSION,
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
