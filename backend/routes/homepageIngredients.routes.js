import express from "express";
import { requireAuth, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
    getHomepageIngredients,
    updateHomepageIngredients,
    createHomepageIngredientsUploadSignature
} from "../controllers/homepageIngredients.controllers.js";

const router = express.Router();
const authorizeContentEditors = [requireAuth, authorizeRoles("admin", "seoadmin")];

router.get("/", getHomepageIngredients);
router.put("/", ...authorizeContentEditors, updateHomepageIngredients);
router.post("/upload-signature", ...authorizeContentEditors, createHomepageIngredientsUploadSignature);

export default router;
