import mongoose from "mongoose";

const homepageIngredientsSchema = new mongoose.Schema({
    key: {
        type: String,
        default: "homepage-ingredients",
        unique: true,
        immutable: true
    },
    eyebrow: {
        type: String,
        default: "DISCOVER",
        trim: true,
        maxlength: 60
    },
    heading: {
        type: String,
        default: "Skin-Loving Actives",
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        default: "Meet the thoughtful ingredients behind our everyday skincare rituals, chosen to nourish, care for, and bring out your skin's natural radiance.",
        trim: true,
        maxlength: 500
    },
    buttonText: {
        type: String,
        default: "Explore Our Ingredients",
        trim: true,
        maxlength: 50
    },
    buttonUrl: {
        type: String,
        default: "/products",
        trim: true,
        maxlength: 500
    },
    imageUrl: {
        type: String,
        default: "/static/4.webp",
        trim: true,
        maxlength: 1000
    },
    imageAlt: {
        type: String,
        default: "Alora Radiance skincare with botanical ingredients",
        trim: true,
        maxlength: 180
    },
    isEnabled: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const HomepageIngredients = mongoose.models.HomepageIngredients
    || mongoose.model("HomepageIngredients", homepageIngredientsSchema);

export default HomepageIngredients;
