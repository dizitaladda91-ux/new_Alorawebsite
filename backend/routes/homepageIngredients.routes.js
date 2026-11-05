import express from "express";
import { requireAuth, authorizeRoles } from "../middlewares/auth.middleware.js";
import { uploadContentImage } from "../middlewares/cloudinaryUpload.js";
import {
    getHomepageIngredients,
    updateHomepageIngredients,
    uploadHomepageIngredientsImage
} from "../controllers/homepageIngredients.controllers.js";

const router = express.Router();
const authorizeContentEditors = [requireAuth, authorizeRoles("admin", "seoadmin")];

router.get("/", getHomepageIngredients);
router.put("/", ...authorizeContentEditors, updateHomepageIngredients);
router.post("/upload-image", ...authorizeContentEditors, (req, res, next) => {
    uploadContentImage.single("image")(req, res, (error) => {
        if (error) {
            console.error("Homepage image upload failed:", error);
            const message = error.code === "LIMIT_FILE_SIZE"
                ? "Image must be 5 MB or smaller."
                : error.message || "Image upload failed.";
            return res.status(400).json({ success: false, message });
        }
        return next();
    });
}, uploadHomepageIngredientsImage);

export default router;
