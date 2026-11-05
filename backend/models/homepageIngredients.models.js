import mongoose from "mongoose";

const ingredientArticleSectionSchema = new mongoose.Schema({
    heading: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
    },
    body: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    }
}, { _id: false });

const ingredientCardSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 120,
        match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    seoTitle: {
        type: String,
        trim: true,
        maxlength: 160
    },
    seoDescription: {
        type: String,
        trim: true,
        maxlength: 320
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 220
    },
    fullDescription: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    articleIntro: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    pageSections: {
        type: [ingredientArticleSectionSchema],
        default: []
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    imageAlt: {
        type: String,
        required: true,
        trim: true,
        maxlength: 180
    },
    recommendedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SimpleProduct"
    }]
});

const homepageIngredientsSchema = new mongoose.Schema({
    key: {
        type: String,
        default: "homepage-ingredients",
        unique: true,
        immutable: true
    },
    eyebrow: {
        type: String,
        default: "Discover",
        trim: true,
        maxlength: 60
    },
    heading: {
        type: String,
        default: "Skin-Saving Actives",
        trim: true,
        maxlength: 100
    },
    buttonText: {
        type: String,
        default: "Explore our Ingredients",
        trim: true,
        maxlength: 50
    },
    buttonUrl: {
        type: String,
        default: "/products",
        trim: true,
        maxlength: 500
    },
    ingredients: {
        type: [ingredientCardSchema],
        default: []
    },
    isEnabled: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const HomepageIngredients = mongoose.models.HomepageIngredients
    || mongoose.model("HomepageIngredients", homepageIngredientsSchema);

export default HomepageIngredients;
