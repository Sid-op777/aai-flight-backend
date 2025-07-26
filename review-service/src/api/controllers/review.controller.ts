import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import { IAuthRequest } from '../middleware/auth.middleware';

interface GetReviewsParams {
  iataCode: string;
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
export const getReviewsForAirport = async (req: Request<GetReviewsParams>, res: Response, next: NextFunction) => {
  try {
    const { iataCode } = req.params; 
    
    const query = 'SELECT * FROM reviews WHERE airport_iata_code = $1 ORDER BY created_at DESC;';
    const { rows } = await db.query(query, [iataCode.toUpperCase()]);
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};