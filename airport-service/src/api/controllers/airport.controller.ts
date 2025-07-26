import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';

/**
 * @desc    Search for airports by name or IATA code
 * @route   GET /api/airports/search
 * @access  Public
 */
export const searchAirports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: 'Search query (q) is required' });
    }

    const searchQuery = `
      SELECT iata_code, name, city, country 
      FROM airports 
      WHERE name ILIKE $1 OR city ILIKE $1 OR iata_code ILIKE $1
      LIMIT 10;
    `;
    
    const { rows } = await db.query(searchQuery, [`%${query}%`]);
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};