import assert from 'node:assert/strict';
import test from 'node:test';
import { applyReviewAggregates } from '../backend/services/reviewSummary.service.js';

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
    assert.equal(summarized[1].reviewsCount, 0);
    assert.equal(summarized[1].averageReviewRating, null);
});

