import mongoose from 'mongoose';
import db from '../config/db.js';
import SimpleProduct from '../models/product.models.js';

// TODO: Verify every slug against the live product catalog before running this script.
// TODO: Confirm all skin-type and concern claims against each product's actual formulation.
const MAPPING = {
    'purifying-glow-face-wash': { productType: 'cleanser', skinTypes: ['all', 'oily'], concerns: ['oil', 'dullness'], badge: 'bestseller' },
    'brightening-hydrating-face-serum': { productType: 'serum', skinTypes: ['all', 'dry'], concerns: ['dullness', 'pigmentation'], badge: 'bestseller' },
    'soothing-face-scrub': { productType: 'scrub', skinTypes: ['normal', 'combination'], concerns: ['dullness', 'uneven-tone'], badge: '' },
    'face-cream-sunscreen-spf-30': { productType: 'sunscreen', skinTypes: ['all'], concerns: ['dryness'], badge: 'new' },
    'soothing-body-lotion': { productType: 'body', skinTypes: ['dry', 'sensitive'], concerns: ['dryness'], badge: '' },
    'daily-glow-duo': { productType: 'combo', skinTypes: ['all'], concerns: ['dullness'], badge: '' },
    'cleanse-protect-duo': { productType: 'combo', skinTypes: ['all'], concerns: ['oil'], badge: '' },
    'hydration-duo': { productType: 'combo', skinTypes: ['dry'], concerns: ['dryness'], badge: '' },
    'radiance-ritual-trio': { productType: 'combo', skinTypes: ['all'], concerns: ['dullness', 'uneven-tone'], badge: '' },
    'alora-radiance-travel-essentials-kit': { productType: 'combo', skinTypes: ['all'], concerns: [], badge: 'new' }
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
