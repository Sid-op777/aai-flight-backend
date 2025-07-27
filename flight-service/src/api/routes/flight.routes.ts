import { Router } from 'express';
import { searchFlights, getFlightStats, getFlightById } from '../controllers/flight.controller';

const router = Router();

// Route for searching flights
router.get('/api/flights/search', searchFlights);

// Route for getting mock airport flight stats
router.get('/api/flights/stats/:iataCode', getFlightStats);

router.get('/api/flights/:id', getFlightById);

export default router;