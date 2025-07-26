import { Router } from 'express';
import { searchAirports } from '../controllers/airport.controller';

const router = Router();

router.get('/api/airports/search', searchAirports);

export default router;