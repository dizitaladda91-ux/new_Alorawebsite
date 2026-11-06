import Review from '../models/review.models.js';
import { readFile } from 'node:fs/promises';

const sampleCountsByProductId = new Map([
    ['purifying-glow-face-wash', 4],
    ['brightening-hydrating-face-serum', 5],
    ['soothing-face-scrub', 4],
    ['face-cream-sunscreen-spf-30', 5],
    ['soothing-body-lotion', 4],
    ['daily-glow-duo', 5],
    ['cleanse-protect-duo', 4],
    ['hydration-duo', 5],
    ['alora-radiance-travel-essentials-kit', 4],
    ['radiance-ritual-trio', 5]
]);

let sampleReviewsPromise;

const loadSampleReviews = () => {
    if (!sampleReviewsPromise) {
        sampleReviewsPromise = readFile(new URL('../../reviews_seed.json', import.meta.url), 'utf8')
            .then((contents) => JSON.parse(contents));
    }
    return sampleReviewsPromise;
};

export const isLocalReviewPreview = (req) => process.env.NODE_ENV === 'development'
    || ['localhost', '127.0.0.1', '::1'].includes(req.hostname);

export const getSampleReviews = async (productIds) => {
    const seedReviews = await loadSampleReviews();
    const productId = productIds.find((id) => sampleCountsByProductId.has(String(id)));
    if (!productId) return [];

    const normalizedProductId = String(productId);
    const sampleCount = sampleCountsByProductId.get(normalizedProductId);
    return seedReviews
        .filter((review) => review.productId === normalizedProductId)
        .slice(0, sampleCount)
        .map((review, index) => ({
            ...review,
            _id: `sample-${normalizedProductId}-${index + 1}`,
            createdAt: review.createdAt?.$date || review.createdAt,
            isSample: true
        }));
};

export const addSampleReviewSummaries = async (products) => {
    const seedReviews = await loadSampleReviews();
    return products.map((product) => {
        const productIds = [...new Set(
            [product._id, product.slug].filter(Boolean).map(String)
        )];
        const productId = productIds.find((id) => sampleCountsByProductId.has(id));
        if (!productId) {
            return { ...product, reviewsCount: 0, averageReviewRating: null, isSampleReviews: false };
        }

        const sampleCount = sampleCountsByProductId.get(productId);
        const matchingReviews = seedReviews
            .filter((review) => review.productId === productId)
            .slice(0, sampleCount);
        const ratingTotal = matchingReviews.reduce((total, review) => total + Number(review.rating || 0), 0);

        return {
            ...product,
            reviewsCount: matchingReviews.length,
            averageReviewRating: matchingReviews.length
                ? Math.round((ratingTotal / matchingReviews.length) * 10) / 10
                : null,
            isSampleReviews: matchingReviews.length > 0
        };
    });
};

export const applyReviewAggregates = (products, aggregates) => {
    const aggregatesByProductId = new Map(
        aggregates.map((aggregate) => [String(aggregate._id), aggregate])
    );

    return products.map((product) => {
        const productIds = [...new Set(
            [product._id, product.slug].filter(Boolean).map(String)
        )];
        const matchedAggregates = productIds
            .map((productId) => aggregatesByProductId.get(productId))
            .filter(Boolean);
        const reviewsCount = matchedAggregates.reduce(
            (total, aggregate) => total + aggregate.count,
            0
        );
        const ratingTotal = matchedAggregates.reduce(
            (total, aggregate) => total + aggregate.ratingTotal,
            0
        );

        return {
            ...product,
            reviewsCount,
            averageReviewRating: reviewsCount
                ? Math.round((ratingTotal / reviewsCount) * 10) / 10
                : null,
            isSampleReviews: false
        };
    });
};

export const addReviewSummaries = async (products, { useSampleReviews = false } = {}) => {
    if (products.length === 0) return products;
    if (useSampleReviews) return addSampleReviewSummaries(products);

    const productIds = [...new Set(
        products.flatMap((product) => [product._id, product.slug].filter(Boolean).map(String))
    )];
    const aggregates = await Review.aggregate([
        { $match: { productId: { $in: productIds } } },
        {
            $group: {
                _id: '$productId',
                count: { $sum: 1 },
                ratingTotal: { $sum: '$rating' }
            }
        }
    ]);

    return applyReviewAggregates(products, aggregates);
};
