import SimpleProduct from "../models/product.models.js";
import fs from "fs";
import db from "../config/db.js";
import { deleteFromCloudinary } from "../middlewares/cloudinaryUpload.js";
import { addReviewSummaries, isLocalReviewPreview } from "../services/reviewSummary.service.js";
import { CACHE_TTL, getOrSetCache, invalidateCachePrefix } from "../services/cache.service.js";

const invalidateProductCaches = async () => {
    await Promise.all([
        invalidateCachePrefix("products:"),
        invalidateCachePrefix("product:detail:"),
        invalidateCachePrefix("ssr:product"),
        invalidateCachePrefix("ingredients:")
    ]);
};

const toProductSlug = (value = "") => String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ensureProductSlug = async (product) => {
    if (!product || product.slug) return product;
    const baseSlug = toProductSlug(product.name) || "product";
    let slug = baseSlug;
    let suffix = 2;
    while (await SimpleProduct.exists({ slug, _id: { $ne: product._id } })) {
        slug = `${baseSlug}-${suffix++}`;
    }
    product.slug = slug;
    await product.save();
    return product;
};

// 1. CREATE (Naya Product Add Karna)
export const addnewproduct = async (req, res) => {
    try {
        const { name, description, category, rating, totalReviews, isAvailable, sku, ingredients, benefits, usageInstructions, metaTitle, metaDescription } = req.body;
        
        let variants = [];
        if (req.body.variants && req.body.variants !== "") {
            try {
                variants = JSON.parse(req.body.variants);
            } catch (e) {
                return res.status(400).json({ error: "Variants array parsing text format invalid hai!" });
            }
        }

        const addproduct = {
            name,
            slug: toProductSlug(name),
            description,
            category, 
            rating: rating ? Number(rating) : 4.5,
            totalReviews: totalReviews ? Number(totalReviews) : 0,
            isAvailable: isAvailable === 'true' || isAvailable === true, 
            isBestseller: req.body.isBestseller === 'true' || req.body.isBestseller === true,
            isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
            sku, ingredients, benefits, usageInstructions, metaTitle, metaDescription,
            variants 
        };

        const mainImage = req.files?.imagepath?.[0];
        if (mainImage) addproduct.imagepath = mainImage.path;
        addproduct.galleryImages = (req.files?.galleryImages || []).map((file) => file.path);
        
        if (req.body.videoUrl) addproduct.videoUrl = req.body.videoUrl;
        const videoFile = req.files?.productVideo?.[0];
        if (videoFile) addproduct.videoUrl = videoFile.path;

        const newProduct = new SimpleProduct(addproduct);
        const savedProduct = await newProduct.save();
        await invalidateProductCaches();
        
        res.status(201).json(savedProduct);

    } catch (err) {
        import("fs").then(fs => fs.appendFileSync("error_log.txt", "Controller Error: " + err.stack + "\n"));
        console.error("Controller Error:", err);
        res.status(500).json({ success: false, message: "Could not load products." });
    }
};

// 2. READ (Saare Products Get Karna - Cached Lean Query)
export const readproduct = async (req, res) => {
    try {
        const preview = isLocalReviewPreview(req);
        const cacheKey = `products:all:${preview ? "preview" : "live"}`;
        const { data, hit } = await getOrSetCache(cacheKey, CACHE_TTL.PRODUCT_LIST, async () => {
            await db();
            const products = await SimpleProduct.find().lean();
            return addReviewSummaries(products, { useSampleReviews: preview });
        });
        res.setHeader("X-Cache", hit ? "HIT" : "MISS");
        res.status(200).json(data);
    } catch (err) {
        console.error("readproduct error:", err);
        res.status(500).json({ success: false, message: "Could not load product." });
    }
};

// 3. UPDATE (Product Details Badadna)
export const updateproduct = async (req, res) => {
    try {
        const { id } = req.params;
        let updateProductData = { ...req.body };

        if (updateProductData.name !== undefined) {
            updateProductData.slug = toProductSlug(updateProductData.name);
        }

        if (req.body.variants) {
            try {
                updateProductData.variants = JSON.parse(req.body.variants);
            } catch (e) {
                // Input validation fallback
            }
        }

        if (req.body.isAvailable !== undefined) {
            updateProductData.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
        }
        if (req.body.isBestseller !== undefined) {
            updateProductData.isBestseller = req.body.isBestseller === 'true' || req.body.isBestseller === true;
        }
        if (req.body.isFeatured !== undefined) {
            updateProductData.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
        }
        if (req.body.rating) updateProductData.rating = Number(req.body.rating);
        if (req.body.totalReviews) updateProductData.totalReviews = Number(req.body.totalReviews);

        const mainImage = req.files?.imagepath?.[0];
        const galleryImages = req.files?.galleryImages || [];
        if (mainImage) {
            const oldProduct = await SimpleProduct.findById(id);
            if (oldProduct && oldProduct.imagepath) {
                await deleteFromCloudinary(oldProduct.imagepath);
            }
            updateProductData.imagepath = mainImage.path;
        } else if (req.body.oldProfile) {
            updateProductData.imagepath = req.body.oldProfile;
        }

        delete updateProductData.oldProfile;

        if (galleryImages.length > 0) {
            const oldProduct = await SimpleProduct.findById(id);
            await Promise.all((oldProduct?.galleryImages || []).map(deleteFromCloudinary));
            updateProductData.galleryImages = galleryImages.map((file) => file.path);
        }

        if (req.body.videoUrl !== undefined) updateProductData.videoUrl = req.body.videoUrl;
        const updateVideoFile = req.files?.productVideo?.[0];
        if (updateVideoFile) updateProductData.videoUrl = updateVideoFile.path;

        const updatedProduct = await SimpleProduct.findByIdAndUpdate(
            id,
            updateProductData, 
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product database me nahi mila ya update fail hua" });
        }

        await invalidateProductCaches();
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not load products." });
    }
};

// SEO staff update handler
export const updateProductForSeo = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await SimpleProduct.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product nahi mila" });
        }

        if (req.body.description !== undefined) product.description = req.body.description;
        if (req.body.rating !== undefined) product.rating = Number(req.body.rating);
        if (req.body.metaTitle !== undefined) product.metaTitle = String(req.body.metaTitle || '').trim();
        if (req.body.metaDescription !== undefined) product.metaDescription = String(req.body.metaDescription || '').trim();
        if (req.body.keywords !== undefined) product.keywords = String(req.body.keywords || '').trim();

        if (req.body.volumes) {
            const volumes = JSON.parse(req.body.volumes);
            if (Array.isArray(volumes) && volumes.length === product.variants.length) {
                product.variants = product.variants.map((variant, index) => ({
                    ...variant.toObject(),
                    volume: String(volumes[index]).trim()
                }));
            }
        }

        const mainImage = req.files?.imagepath?.[0] || req.file;
        const galleryImages = req.files?.galleryImages || [];
        if (mainImage) {
            if (product.imagepath && product.imagepath !== mainImage.path) {
                await deleteFromCloudinary(product.imagepath);
            }
            product.imagepath = mainImage.path;
        }

        if (!product.imagepath) {
            product.imagepath = './static/alora image 2.jpeg';
        }

        let remainingExistingGallery = product.galleryImages || [];
        if (req.body.existingGallery !== undefined) {
            try {
                const parsed = JSON.parse(req.body.existingGallery);
                if (Array.isArray(parsed)) {
                    remainingExistingGallery = parsed;
                }
            } catch (e) {}
            // Delete removed existing gallery files from Cloudinary
            const toDelete = (product.galleryImages || []).filter(img => !remainingExistingGallery.includes(img));
            if (toDelete.length > 0) {
                await Promise.all(toDelete.map(deleteFromCloudinary));
            }
        } else if (galleryImages.length > 0) {
            await Promise.all((product.galleryImages || []).map(deleteFromCloudinary));
            remainingExistingGallery = [];
        }

        const newGalleryPaths = galleryImages.map((file) => file.path);
        if (req.body.existingGallery !== undefined || newGalleryPaths.length > 0) {
            product.galleryImages = [...remainingExistingGallery, ...newGalleryPaths].slice(0, 6);
        }

        if (req.body.removeVideo === 'true') {
            if (product.videoUrl) await deleteFromCloudinary(product.videoUrl);
            product.videoUrl = '';
        } else if (req.body.videoUrl !== undefined) {
            product.videoUrl = req.body.videoUrl;
        }
        const videoFile = req.files?.productVideo?.[0];
        if (videoFile) {
            if (product.videoUrl) await deleteFromCloudinary(product.videoUrl);
            product.videoUrl = videoFile.path;
        }

        if (req.body.faqs !== undefined) {
            try {
                let parsedFaqs = typeof req.body.faqs === 'string' ? JSON.parse(req.body.faqs) : req.body.faqs;
                if (Array.isArray(parsedFaqs)) {
                    product.faqs = parsedFaqs.filter(f => f && f.question && f.answer);
                }
            } catch (e) {}
        }

        await product.save();
        await invalidateProductCaches();
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not load product." });
    }
};

// 4. DELETE (Sirf Database se Product Hata Dena)
export const deleteproduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteProduct = await SimpleProduct.findByIdAndDelete(id);
        
        if (!deleteProduct) {
            return res.status(404).json({ message: "Product nahi mila" });
        }

        if (deleteProduct.imagepath) {
            await deleteFromCloudinary(deleteProduct.imagepath);
        }
        await Promise.all((deleteProduct.galleryImages || []).map(deleteFromCloudinary));
        await invalidateProductCaches();

        res.status(200).json({ message: "Product successfully deleted!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not load products." });
    }
};

// 5. GET SINGLE PRODUCT (Cached Lean Query)
export const getproductbyid = async (req, res) => {
    try {
        const { id } = req.params;
        const preview = isLocalReviewPreview(req);
        const cacheKey = `product:detail:${String(id || "").toLowerCase()}:${preview ? "preview" : "live"}`;
        const { data: productWithReviews, hit } = await getOrSetCache(cacheKey, CACHE_TTL.PRODUCT_DETAIL, async () => {
            await db();
            let product = await SimpleProduct.findOne({ slug: id }).lean();
            if (!product && /^[a-f\d]{24}$/i.test(id)) {
                product = await SimpleProduct.findById(id).lean();
            }
            if (!product) {
                const products = await SimpleProduct.find().lean();
                product = products.find((item) => toProductSlug(item.name) === id);
            }

            if (!product) {
                return null;
            }

            await ensureProductSlug(product);

            const [enriched] = await addReviewSummaries([product], {
                useSampleReviews: preview
            });
            return enriched;
        });

        if (!productWithReviews) {
            return res.status(404).json({ error: "Product nahi mila" });
        }

        res.setHeader("X-Cache", hit ? "HIT" : "MISS");
        res.status(200).json(productWithReviews);
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not load product." });
    }
};

// 6. SEARCH PRODUCTS (Cached Query)
export const searchProducts = async (req, res) => {
    try {
        const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
        if (!q) {
            return res.status(200).json({ success: true, products: [] });
        }
        const cacheKey = `products:search:${q.toLowerCase()}`;
        const { data: products, hit } = await getOrSetCache(cacheKey, CACHE_TTL.SEARCH_RESULTS, async () => {
            await db();
            const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedQuery, "i");
            return SimpleProduct.find({
                $or: [
                    { name: regex },
                    { description: regex },
                    { category: regex }
                ]
            }).lean();
        });
        res.setHeader("X-Cache", hit ? "HIT" : "MISS");
        res.status(200).json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: "Could not search products." });
    }
};
