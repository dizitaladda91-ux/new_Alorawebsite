import Review from '../models/review.models.js';
import { readFile } from 'node:fs/promises';

export const sampleStatsByProductId = new Map([
    ['purifying-glow-face-wash', { count: 48, rating: 4.8 }],
    ['brightening-hydrating-face-serum', { count: 52, rating: 4.9 }],
    ['soothing-face-scrub', { count: 34, rating: 4.7 }],
    ['face-cream-sunscreen-spf-30', { count: 42, rating: 4.9 }],
    ['soothing-body-lotion', { count: 39, rating: 4.8 }],
    ['daily-glow-duo', { count: 26, rating: 5.0 }],
    ['cleanse-protect-duo', { count: 31, rating: 4.8 }],
    ['hydration-duo', { count: 45, rating: 4.9 }],
    ['alora-radiance-travel-essentials-kit', { count: 64, rating: 4.9 }],
    ['radiance-ritual-trio', { count: 22, rating: 5.0 }]
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
    const productId = productIds.find((id) => sampleStatsByProductId.has(String(id)));
    if (!productId) return [];

    const normalizedProductId = String(productId);
    const stats = sampleStatsByProductId.get(normalizedProductId);
    const sampleCount = (stats && stats.count) ? Math.min(stats.count, 10) : 5;
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
    return products.map((product) => {
        const productIds = [...new Set(
            [product._id, product.slug].filter(Boolean).map(String)
        )];
        const productId = productIds.find((id) => sampleStatsByProductId.has(id));
        if (!productId) {
            return { ...product, reviewsCount: 0, averageReviewRating: null, isSampleReviews: false };
        }

        const stats = sampleStatsByProductId.get(productId);
        return {
            ...product,
            reviewsCount: stats.count,
            averageReviewRating: stats.rating,
            isSampleReviews: true
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
        const realReviewsCount = matchedAggregates.reduce(
            (total, aggregate) => total + aggregate.count,
            0
        );
        const realRatingTotal = matchedAggregates.reduce(
            (total, aggregate) => total + aggregate.ratingTotal,
            0
        );

        if (realReviewsCount > 0) {
            return {
                ...product,
                reviewsCount: realReviewsCount,
                averageReviewRating: Math.round((realRatingTotal / realReviewsCount) * 10) / 10,
                isSampleReviews: false
            };
        }

        const sampleId = productIds.find((id) => sampleStatsByProductId.has(id));
        if (sampleId) {
            const stats = sampleStatsByProductId.get(sampleId);
            return {
                ...product,
                reviewsCount: stats.count,
                averageReviewRating: stats.rating,
                isSampleReviews: true
            };
        }

        return {
            ...product,
            reviewsCount: 0,
            averageReviewRating: null,
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
