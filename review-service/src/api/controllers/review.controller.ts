import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import { IAuthRequest } from '../middleware/auth.middleware';
import axios from 'axios';

interface GetReviewsParams {
  iataCode: string;
}

const USER_SERVICE_URL = 'http://user-service-svc/api/users';

interface EnrichedReview {
  id: number;
  airport_iata_code: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  userName: string; // The new field!
}

/**
 * @desc    Create a new review for an airport
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { airport_iata_code, rating, comment } = req.body;

    if (!airport_iata_code || !rating) {
      return res.status(400).json({ message: 'Airport IATA code and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const query = `
      INSERT INTO reviews (user_id, airport_iata_code, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const { rows } = await db.query(query, [userId, airport_iata_code, rating, comment]);
    res.status(201).json(rows[0]);

  } catch (error: any) {
    if (error.code === '23505') { 
      return res.status(409).json({ message: 'You have already reviewed this airport.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * @desc    Get all reviews for a specific airport
 * @route   GET /api/reviews/:iataCode
 * @access  Public
 */
export const getReviewsForAirport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { iataCode } = req.params;
    
    // 1. Get reviews from our own database
    const query = 'SELECT * FROM reviews WHERE airport_iata_code = $1 ORDER BY created_at DESC;';
    const { rows: reviews } = await db.query(query, [iataCode.toUpperCase()]);

    if (reviews.length === 0) {
      return res.json([]); // No reviews, return early
    }

    // 2. Collect all unique user IDs
    const userIds = [...new Set(reviews.map(review => String(review.user_id)))];

    // 3. Fetch user data in a single batch call from the User Service
    let userMap: { [key: string]: { fullName: string } } = {};
    try {
      const userResponse = await axios.get(`${USER_SERVICE_URL}/batch?ids=${userIds.join(',')}`);
      userMap = userResponse.data;
    } catch (error) {
      console.error("Could not fetch user data from User Service:", error);
      // We can still proceed, but names will be anonymous.
    }
    
    // 4. "Join" the data by mapping over the reviews and adding the user name
    const enrichedReviews: EnrichedReview[] = reviews.map(review => ({
      ...review,
      userName: userMap[String(review.user_id)]?.fullName || 'Anonymous User'
    }));
    
    res.json(enrichedReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};