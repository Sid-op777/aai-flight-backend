import { Router } from 'express';
import { createReview, getReviewsForAirport } from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/api/reviews/:iataCode', getReviewsForAirport);

router.post('/api/reviews', authMiddleware, createReview);

export default router;