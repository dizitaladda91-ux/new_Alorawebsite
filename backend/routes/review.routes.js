import express from 'express';
import { createReview, getReviewsByProduct } from '../controllers/review.controllers.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { createRateLimiter } from '../middlewares/security.middleware.js';

const router = express.Router();

router.route('/')
    .post(requireAuth, createRateLimiter({ max: 5, message: 'Too many review submissions. Please try again later.' }), createReview);

router.route('/:productId')
    .get(getReviewsByProduct);

export default router;
