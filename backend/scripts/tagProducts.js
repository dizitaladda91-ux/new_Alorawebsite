import mongoose from 'mongoose';
import db from '../config/db.js';
import SimpleProduct from '../models/product.models.js';

// TODO: Verify every slug against the live product catalog before running this script.
// TODO: Confirm all skin-type and concern claims against each product's actual formulation.
const MAPPING = {
    'purifying-glow-face-wash': { productType: 'cleanser', skinTypes: ['all', 'oily', 'combination', 'normal', 'sensitive'], concerns: ['acne', 'open-pores'], badge: 'bestseller' },
    'brightening-hydrating-face-serum': { productType: 'serum', skinTypes: ['all', 'dry', 'oily', 'combination', 'normal', 'sensitive'], concerns: ['pigmentation', 'dark-spots', 'dullness', 'anti-ageing', 'ageing', 'open-pores'], badge: 'bestseller' },
    'soothing-face-scrub': { productType: 'scrub', skinTypes: ['all', 'oily', 'combination', 'normal', 'dry'], concerns: ['dullness'], badge: '' },
    'face-cream-sunscreen-spf-30': { productType: 'sunscreen', skinTypes: ['all', 'dry', 'normal', 'combination', 'sensitive'], concerns: ['pigmentation', 'dark-spots', 'tan', 'anti-ageing', 'ageing', 'dryness'], badge: 'new' },
    'soothing-body-lotion': { productType: 'body', skinTypes: ['all', 'dry', 'normal', 'sensitive', 'combination'], concerns: ['dryness'], badge: '' },
    'daily-glow-duo': { productType: 'combo', skinTypes: ['all', 'oily', 'combination', 'normal'], concerns: [], badge: '' },
    'cleanse-protect-duo': { productType: 'combo', skinTypes: ['all', 'oily', 'combination', 'normal', 'dry'], concerns: [], badge: '' },
    'hydration-duo': { productType: 'combo', skinTypes: ['all', 'dry', 'normal', 'combination'], concerns: [], badge: '' },
    'radiance-ritual-trio': { productType: 'combo', skinTypes: ['all', 'normal', 'dry', 'combination', 'oily'], concerns: [], badge: '' },
    'alora-radiance-travel-essentials-kit': { productType: 'combo', skinTypes: ['all', 'oily', 'dry', 'combination', 'sensitive', 'normal'], concerns: [], badge: 'new' }
};

const isDryRun = String(process.env.DRY_RUN || '').toLowerCase() === 'true';

async function tagProducts() {
    await db();
    const missingSlugs = [];

    for (const [slug, tags] of Object.entries(MAPPING)) {
        const product = await SimpleProduct.findOne({ slug });
        if (!product) {
            missingSlugs.push(slug);
            continue;
        }

        if (isDryRun) {
            console.log(`[DRY_RUN] ${slug}: ${JSON.stringify(tags)}`);
            continue;
        }

        Object.assign(product, tags);
        if (tags.badge === 'bestseller') product.isBestseller = true;
        await product.save();
        console.log(`Tagged ${slug}`);
    }

    if (missingSlugs.length) {
        console.warn(`Product slugs not found: ${missingSlugs.join(', ')}`);
    }
}

tagProducts()
    .catch(error => {
        console.error('Product tagging failed:', error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
