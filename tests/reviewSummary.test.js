import assert from 'node:assert/strict';
import test from 'node:test';
import {
    addSampleReviewSummaries,
    applyReviewAggregates,
    getSampleReviews,
    isLocalReviewPreview
} from '../backend/services/reviewSummary.service.js';

test('review summaries combine reviews saved by product ID and slug', () => {
    const products = [
        { _id: 'product-1', slug: 'face-wash', rating: 4.8 },
        { _id: 'product-2', slug: 'body-lotion' }
    ];
    const aggregates = [
        { _id: 'product-1', count: 2, ratingTotal: 9 },
        { _id: 'face-wash', count: 1, ratingTotal: 5 }
    ];

    const summarized = applyReviewAggregates(products, aggregates);

    assert.deepEqual(summarized[0], {
        _id: 'product-1',
        slug: 'face-wash',
        rating: 4.8,
        reviewsCount: 3,
        averageReviewRating: 4.7
    });

    test('local sample review counts vary from four to five and sample content is labeled', async () => {
        const products = await addSampleReviewSummaries([
            { slug: 'purifying-glow-face-wash' },
            { slug: 'brightening-hydrating-face-serum' },
            { slug: 'soothing-body-lotion' }
        ]);

        assert.deepEqual(products.map((product) => product.reviewsCount), [4, 5, 4]);
        assert.ok(products.every((product) => product.isSampleReviews));
        assert.ok(products.every((product) => product.reviewsCount >= 4));

        const sampleReviews = await getSampleReviews(['purifying-glow-face-wash']);
        assert.equal(sampleReviews.length, 4);
        assert.ok(sampleReviews.every((review) => review.isSample));
    });

    test('sample reviews are enabled only in development or for local hostnames', () => {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        try {
            assert.equal(isLocalReviewPreview({ hostname: 'aloraradiance.com' }), false);
            assert.equal(isLocalReviewPreview({ hostname: 'localhost' }), true);
        } finally {
            if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
            else process.env.NODE_ENV = originalNodeEnv;
        }
    });
    assert.equal(summarized[1].reviewsCount, 0);
    assert.equal(summarized[1].averageReviewRating, null);
});
