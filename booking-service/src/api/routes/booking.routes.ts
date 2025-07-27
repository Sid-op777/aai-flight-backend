import { Router } from 'express';
import { createBooking, getMyBookings } from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/api/bookings', authMiddleware, createBooking);
router.get('/api/bookings/my-bookings', authMiddleware, getMyBookings);

export default router;