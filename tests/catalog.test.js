import test from 'node:test';
import assert from 'node:assert/strict';
import { CONCERNS, PRODUCT_TYPES } from '../backend/config/catalog.js';
import { getAllowedCatalogSlug, parseList } from '../backend/services/catalog.service.js';

test('parseList normalizes allowed array values', () => {
    assert.deepEqual(parseList([' SERUM ', 'cleanser'], PRODUCT_TYPES), ['serum', 'cleanser']);
});

test('parseList accepts comma-separated values and drops invalid entries', () => {
    assert.deepEqual(parseList('Acne, unknown, DULLNESS,', CONCERNS), ['acne', 'dullness']);
});

test('parseList returns an empty list for empty input', () => {
    assert.deepEqual(parseList('', CONCERNS), []);
    assert.deepEqual(parseList(undefined, CONCERNS), []);
});

test('catalog route whitelist accepts a known slug and rejects unknown input', () => {
    assert.equal(getAllowedCatalogSlug('ACNE', CONCERNS), 'acne');
    assert.equal(getAllowedCatalogSlug('acne/$ne', CONCERNS), null);
});
