import 'dotenv/config';
import mongoose from 'mongoose';
import db from '../config/db.js';
import Product from '../models/product.models.js';

// TODO: Verify these placeholder slugs against the real catalog before running.
// TODO: Only add concern tags when the claims match each product's actual formulation.
const MAPPING = {
    'purifying-glow-face-wash': { productType: 'cleanser', skinTypes: ['all'], concerns: [], badge: '' },
    'brightening-hydrating-face-serum': { productType: 'serum', skinTypes: ['all'], concerns: [], badge: '' },
    'soothing-face-scrub': { productType: 'scrub', skinTypes: ['all'], concerns: [], badge: '' },
    'face-cream-sunscreen-spf-30': { productType: 'sunscreen', skinTypes: ['all'], concerns: [], badge: '' },
    'soothing-body-lotion': { productType: 'body', skinTypes: ['all'], concerns: [], badge: '' },
    'daily-glow-duo': { productType: 'combo', skinTypes: ['all'], concerns: [], badge: '' },
    'cleanse-protect-duo': { productType: 'combo', skinTypes: ['all'], concerns: [], badge: '' },
    'hydration-duo': { productType: 'combo', skinTypes: ['all'], concerns: [], badge: '' },
    'radiance-ritual-trio': { productType: 'combo', skinTypes: ['all'], concerns: [], badge: '' },
    'alora-radiance-travel-essentials-kit': { productType: 'combo', skinTypes: ['all'], concerns: [], badge: '' }
};

const dryRun = String(process.env.DRY_RUN || '').toLowerCase() === 'true';

try {
    await db();
    for (const [slug, tags] of Object.entries(MAPPING)) {
        const product = await Product.findOne({ slug });
        if (!product) {
            console.log(`Slug not found: ${slug}`);
            continue;
        }

        const changes = { ...tags };
        if (changes.badge === 'bestseller') changes.isBestseller = true;
        console.log(`${dryRun ? '[DRY RUN] ' : ''}${slug}: ${JSON.stringify(changes)}`);
        if (!dryRun) {
            Object.assign(product, changes);
            await product.save();
        }
    }
} catch (error) {
    console.error('Product tagging failed:', error);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
