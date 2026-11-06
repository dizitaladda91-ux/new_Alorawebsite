import Review from '../models/review.models.js';

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
                : null
        };
    });
};

export const addReviewSummaries = async (products) => {
    if (products.length === 0) return products;

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
