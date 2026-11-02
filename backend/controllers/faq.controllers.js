import Faq from "../models/faq.models.js";

const BASE_DEFAULT_FAQS = [
    {
        question: "What is Alora Radiance known for?",
        answer: "Alora Radiance is known for dermatologically tested, toxin-free skincare built around a small set of clinically proven botanical actives like saffron, shea butter, and retinol. The brand is recognized for full ingredient transparency and formulations manufactured in WHO-GMP and FDA-approved facilities.",
        order: 1,
        isActive: true
    },
    {
        question: "What are the 5 basics of a skincare routine?",
        answer: "A complete everyday skincare routine consists of: 1. Cleanser (to remove dirt & pollution), 2. Toner (to balance pH), 3. Serum (concentrated actives targeting specific concerns), 4. Moisturizer/Cream (to lock in hydration), and 5. Sunscreen/SPF (to shield against UV rays and premature ageing).",
        order: 2,
        isActive: true
    },
    {
        question: "What is the difference between a face serum and a toner?",
        answer: "A toner re-balances your skin's natural pH and preps pores after cleansing. A face serum is a high-potency treatment with smaller molecules that penetrate deeper into the dermis to deliver active botanicals like saffron and hyaluronic acid directly to skin cells.",
        order: 3,
        isActive: true
    },
    {
        question: "Does Alora Radiance offer skincare kits or bundles?",
        answer: "Yes! We offer curated value sets including our Saffron Glow Day & Night Kit, Daily Radiance Trio, and Complete Barrier Repair Bundle — designed to work in synergy for visible results with exclusive combo savings.",
        order: 4,
        isActive: true
    },
    {
        question: "Can I use the Alora Radiance Face Wash every day?",
        answer: "Yes! Our Face Wash is dermatologist-formulated to be gentle enough for daily use, morning and night, to remove impurities and excess sebum without stripping your skin's natural moisture barrier.",
        order: 5,
        isActive: true
    },
    {
        question: "Can I use the Face Serum and Day Cream together?",
        answer: "Absolutely. Apply 3-4 drops of Face Serum first onto freshly cleansed skin. Allow 30-60 seconds for absorption, then apply your Saffron Day Cream or Night Elixir to seal in active nutrients and moisture.",
        order: 6,
        isActive: true
    },
    {
        question: "Are Alora Radiance products safe and dermatologically tested?",
        answer: "Yes, 100% of our products undergo rigorous clinical patch-testing. They are certified toxin-free, paraben-free, cruelty-free, and formulated to be safe even for sensitive or acne-prone skin types.",
        order: 7,
        isActive: true
    },
    {
        question: "How often should I use the Face Scrub?",
        answer: "We recommend using the Face Scrub 2 to 3 times a week. Gentle circular massage buffs away dead skin cells and unclogs pores without causing micro-tears or irritation.",
        order: 8,
        isActive: true
    },
    {
        question: "How long does it take to see visible results?",
        answer: "Most customers notice softer, more hydrated skin within 3 to 7 days. Significant improvements in radiance, skin texture, and reduced hyperpigmentation are typically visible after 3 to 4 weeks of consistent routine.",
        order: 9,
        isActive: true
    },
    {
        question: "How can I track my order?",
        answer: "Once dispatched, you receive instant SMS and email updates with a live tracking link. You can also visit our Track Order page anytime and enter your Order ID or mobile number to track delivery in real time.",
        order: 10,
        isActive: true
    }
];

const PAGES = ["Landing Page", "About Us", "Shop / Products", "Blog Page"];

const ensurePageFaqsSeeded = async () => {
    // 1. Migrate legacy categories
    await Faq.updateMany(
        { category: { $in: ["General", "All Pages", "General / Global", "Track Order / Support", null, ""] } },
        { $set: { category: "Landing Page" } }
    );

    // 2. For each of the 4 pages, ensure FAQs exist
    for (const pageName of PAGES) {
        const count = await Faq.countDocuments({ category: pageName });
        if (count === 0) {
            const seedItems = BASE_DEFAULT_FAQS.map((faq, idx) => ({
                ...faq,
                category: pageName,
                order: idx + 1
            }));
            await Faq.insertMany(seedItems);
        }
    }
};

// 🟢 1. GET ALL ACTIVE FAQS (Public Endpoint, Supports ?page=)
export const getAllFaqs = async (req, res) => {
    try {
        await ensurePageFaqsSeeded();

        const { category, page } = req.query;
        let query = { isActive: true };
        
        const targetPage = (page || category || "").trim();
        if (targetPage) {
            query.category = new RegExp(`^${targetPage}$`, "i");
        }

        let faqs = await Faq.find(query).sort({ order: 1, createdAt: 1 }).lean();

        return res.status(200).json({
            success: true,
            count: faqs.length,
            data: faqs
        });
    } catch (error) {
        console.error("Error fetching FAQs:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load FAQs",
            error: error.message
        });
    }
};

// 🟢 2. GET ALL FAQS FOR ADMIN (Protected Endpoint)
export const getAdminFaqs = async (req, res) => {
    try {
        await ensurePageFaqsSeeded();

        let faqs = await Faq.find().sort({ category: 1, order: 1, createdAt: 1 }).lean();

        return res.status(200).json({
            success: true,
            count: faqs.length,
            data: faqs
        });
    } catch (error) {
        console.error("Error fetching admin FAQs:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load FAQs for admin",
            error: error.message
        });
    }
};

// 🟢 3. CREATE NEW FAQ (Admin / SEO Admin)
export const createFaq = async (req, res) => {
    try {
        const { question, answer, category, order, isActive } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({ success: false, message: "Question is required." });
        }
        if (!answer || !answer.trim()) {
            return res.status(400).json({ success: false, message: "Answer is required." });
        }

        const chosenCategory = category && category.trim() ? category.trim() : "Landing Page";

        let nextOrder = order;
        if (nextOrder === undefined || nextOrder === null) {
            const lastFaq = await Faq.findOne({ category: chosenCategory }).sort({ order: -1 }).lean();
            nextOrder = lastFaq ? (lastFaq.order || 0) + 1 : 1;
        }

        const newFaq = new Faq({
            question: question.trim(),
            answer: answer.trim(),
            category: chosenCategory,
            order: Number(nextOrder) || 0,
            isActive: isActive !== undefined ? Boolean(isActive) : true
        });

        await newFaq.save();

        return res.status(201).json({
            success: true,
            message: "FAQ created successfully",
            data: newFaq
        });
    } catch (error) {
        console.error("Error creating FAQ:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create FAQ",
            error: error.message
        });
    }
};

// 🟢 4. UPDATE EXISTING FAQ (Admin / SEO Admin)
export const updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, category, order, isActive } = req.body;

        const faq = await Faq.findById(id);
        if (!faq) {
            return res.status(404).json({ success: false, message: "FAQ not found." });
        }

        if (question !== undefined) faq.question = question.trim();
        if (answer !== undefined) faq.answer = answer.trim();
        if (category !== undefined) faq.category = category.trim();
        if (order !== undefined) faq.order = Number(order) || 0;
        if (isActive !== undefined) faq.isActive = Boolean(isActive);

        await faq.save();

        return res.status(200).json({
            success: true,
            message: "FAQ updated successfully",
            data: faq
        });
    } catch (error) {
        console.error("Error updating FAQ:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update FAQ",
            error: error.message
        });
    }
};

// 🟢 5. DELETE FAQ (Admin / SEO Admin)
export const deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFaq = await Faq.findByIdAndDelete(id);

        if (!deletedFaq) {
            return res.status(404).json({ success: false, message: "FAQ not found." });
        }

        return res.status(200).json({
            success: true,
            message: "FAQ deleted successfully",
            data: deletedFaq
        });
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete FAQ",
            error: error.message
        });
    }
};
