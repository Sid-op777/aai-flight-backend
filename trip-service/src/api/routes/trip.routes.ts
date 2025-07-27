import { Router } from 'express';
import { importTrip, getMyTrips } from '../controllers/trip.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// A private route to import a new trip using a PNR
router.post('/api/trips/import', authMiddleware, importTrip);

// A private route to get all of the user's imported trips
router.get('/api/trips', authMiddleware, getMyTrips);

export default router;