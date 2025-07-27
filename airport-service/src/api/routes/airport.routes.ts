import { Router } from 'express';
import { searchAirports, getAirportByIata } from '../controllers/airport.controller';

const router = Router();

router.get('/api/airports/search', searchAirports);

router.get('/api/airports/:iataCode', getAirportByIata);

export default router;