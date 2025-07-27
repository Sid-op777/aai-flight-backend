import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

// --- Configuration ---
const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;
const REDIS_URL = process.env.REDIS_URL; // e.g., "redis://redis-svc:6379"
const CACHE_EXPIRATION_SECONDS = 300; // Cache for 5 minutes

if (!REDIS_URL) {
  throw new Error("Redis URL is not configured.");
}
const redis = new Redis(REDIS_URL);

// --- API Endpoint ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Live Tracking Service' });
});

app.get('/api/tracking/live', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, iata } = req.query as { type: 'arrivals' | 'departures', iata: string };

    if (!AVIATIONSTACK_API_KEY) {
      throw new Error("AviationStack API key is not configured.");
    }
    if (!type || !iata || !['arrivals', 'departures'].includes(type)) {
      return res.status(400).json({ message: 'Query parameters "type" (arrivals/departures) and "iata" are required.' });
    }

    const cacheKey = `live:${type}:${iata.toUpperCase()}`;
    
    // --- Step 1: Check the cache first ---
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Serving from CACHE: ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    }

    console.log(`Serving from API: ${cacheKey}`);
    // --- Step 2: If not in cache, call the external API ---
    const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_API_KEY}&${type === 'arrivals' ? 'arr_iata' : 'dep_iata'}=${iata.toUpperCase()}`;
    
    const apiResponse = await axios.get(apiUrl);

    // --- Step 3: Store the fresh data in the cache ---
    // Use 'EX' to set an expiration time in seconds
    await redis.set(cacheKey, JSON.stringify(apiResponse.data), 'EX', CACHE_EXPIRATION_SECONDS);

    // --- Step 4: Return the fresh data ---
    res.json(apiResponse.data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching live tracking data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Live Tracking Service listening on port ${PORT}`);
});