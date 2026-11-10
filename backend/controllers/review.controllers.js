import Review from '../models/review.models.js';
import SimpleProduct from '../models/product.models.js';
import User from '../models/userAuth.models.js';
import { getSampleReviews, isLocalReviewPreview } from '../services/reviewSummary.service.js';

export const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;

        if (!productId || !rating || !comment || !req.user?.id) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const product = await SimpleProduct.findOne({
            $or: [
                { slug: String(productId) },
                ...(/^[a-f\d]{24}$/i.test(String(productId)) ? [{ _id: productId }] : [])
            ]
        }).select('_id').lean();
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

        const user = await User.findById(req.user.id).select('name').lean();
        if (!user) return res.status(401).json({ success: false, message: 'Authentication required.' });

        const canonicalProductId = String(product._id);
        const existingReview = await Review.findOne({ productId: canonicalProductId, userId: req.user.id }).select('_id').lean();
        if (existingReview) return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });

        const newReview = await Review.create({
            productId: canonicalProductId,
            userId: req.user.id,
            username: user.name,
            rating: Number(rating),
            comment
        });

        res.status(201).json({ success: true, data: newReview });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });
        console.error('Review creation failed:', error);
        res.status(500).json({ success: false, message: 'Could not submit your review.' });
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
        if (isLocalReviewPreview(req)) {
            const sampleReviews = await getSampleReviews(uniqueCandidates);
            return res.status(200).json({
                success: true,
                count: sampleReviews.length,
                data: sampleReviews,
                isSample: true
            });
        }

        const reviews = await Review.find({ productId: { $in: uniqueCandidates } }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        console.error('Review fetch failed:', error);
        res.status(500).json({ success: false, message: 'Could not load reviews.' });
    }
};
