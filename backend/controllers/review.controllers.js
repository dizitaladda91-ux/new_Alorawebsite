import Review from '../models/review.models.js';
import SimpleProduct from '../models/product.models.js';

export const createReview = async (req, res) => {
    try {
        const { productId, username, rating, comment } = req.body;

        if (!username || !rating || !comment) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const newReview = await Review.create({
            productId: productId || "alora-best-seller",
            username,
            rating: Number(rating),
            comment
        });

        res.status(201).json({ success: true, data: newReview });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const candidates = [productId];

        const product = await SimpleProduct.findOne({
            $or: [
                { slug: productId },
                ...(/^[a-f\d]{24}$/i.test(productId) ? [{ _id: productId }] : [])
            ]
        }).select('_id slug').lean();

        if (product) {
            candidates.push(String(product._id));
            if (product.slug) candidates.push(product.slug);
        }

        const uniqueCandidates = [...new Set(candidates)];
        const reviews = await Review.find({ productId: { $in: uniqueCandidates } }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
