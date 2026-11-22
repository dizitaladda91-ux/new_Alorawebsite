import assert from 'node:assert/strict';
import test from 'node:test';
import { parseList } from '../backend/controllers/product.controllers.js';
import { CONCERNS, isCatalogValue } from '../backend/config/catalog.js';
import SimpleProduct from '../backend/models/product.models.js';
import { renderProductListSsr } from '../backend/services/ssr.service.js';

test('parseList accepts array values and normalizes them', () => {
    assert.deepEqual(parseList([' OILY ', 'Dry'], ['dry', 'oily']), ['oily', 'dry']);
});

test('parseList accepts comma-separated values', () => {
    assert.deepEqual(parseList('acne, uneven-tone, ', CONCERNS), ['acne', 'uneven-tone']);
});

test('parseList drops values outside the allowed list', () => {
    assert.deepEqual(parseList(['acne', 'invalid'], CONCERNS), ['acne']);
});

test('parseList returns an empty list for empty input', () => {
    assert.deepEqual(parseList('', CONCERNS), []);
    assert.deepEqual(parseList(undefined, CONCERNS), []);
});

test('catalog route whitelist accepts valid slugs and rejects invalid slugs', () => {
    assert.equal(isCatalogValue('acne', CONCERNS), true);
    assert.equal(isCatalogValue('not-a-concern', CONCERNS), false);
});

test('catalog fields remain optional for existing product data', async () => {
    const product = new SimpleProduct({
        name: 'Existing product',
        description: 'Existing product description',
        category: 'face',
        imagepath: '/static/product.png',
        variants: [{ volume: '50ml', price: 100 }]
    });

    await assert.doesNotReject(() => product.validate());
    assert.deepEqual(product.skinTypes, ['all']);
    assert.deepEqual(product.concerns, []);
});

test('product listing SSR escapes supplied metadata and renders an empty-state link', () => {
    const template = '<title>Shop</title><meta name="description" content="Default"><link rel="canonical" href="https://aloraradiance.com/products" /><h1 id="product-list-heading">Shop</h1><span id="results-count">Count</span><div id="product-grid"></div><div id="no-products" class="hidden"><p>Empty</p></div>';
    const html = renderProductListSsr(template, [], {
        heading: '<img src=x>',
        title: '<script>alert(1)</script>',
        description: 'Safe & sound',
        canonicalPath: '/concern/acne'
    });

    assert.match(html, /&lt;img src=x&gt;/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.match(html, /Safe &amp; sound/);
    assert.match(html, /No products found/);
    assert.match(html, /href="\/products"/);
    assert.match(html, /https:\/\/aloraradiance\.com\/concern\/acne/);
});
