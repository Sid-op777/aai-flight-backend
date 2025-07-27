import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';

/**
 * @desc    Search for flights
 * @route   GET /api/flights/search
 * @access  Public
 */
export const searchFlights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ message: 'Parameters "from", "to", and "date" are required' });
    }

    // A more robust query that searches for flights on a specific calendar date
    const query = `
      SELECT *, (arrival_time - departure_time) as duration
      FROM flights
      WHERE departure_airport_iata = $1
      AND arrival_airport_iata = $2
      AND departure_time::date = $3;
    `;

    const { rows } = await db.query(query, [
      (from as string).toUpperCase(),
      (to as string).toUpperCase(),
      date as string
    ]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get mock flight statistics for an airport
 * @route   GET /api/flights/stats/:iataCode
 * @access  Public
 */
export const getFlightStats = (req: Request, res: Response, next: NextFunction) => {
  const { iataCode } = req.params;

  // In a real application, this data would come from a complex query or a data warehouse.
  // Here, we are returning hardcoded mock data.
  const mockStats = {
    airport: iataCode.toUpperCase(),
    onTimePerformance: {
      percentage: 82,
      last30Days: true,
    },
    avgArrivalDelay: {
      minutes: 0.4,
      index: "low",
    },
    avgDepartureDelay: {
      minutes: 1.2,
      index: "low",
    },
    flightRating: {
      percentage: 78,
      source: "flightradar24 rating"
    },
    monthlyTraffic: [
      { month: "Jul", flights: 250000 },
      { month: "Aug", flights: 280000 },
      { month: "Sep", flights: 300000 },
      { month: "Oct", flights: 400000 },
      { month: "Nov", flights: 550000 },
      { month: "Dec", flights: 520000 },
    ],
    delayDistribution: [
      { range: "0-15 min", percentage: 12 },
      { range: "15-30 min", percentage: 4 },
      { range: ">30 min", percentage: 2 },
      { range: "On Time", percentage: 82 },
    ],
    topRoutes: [
        { destination: "BOM", departures: 356 },
        { destination: "BLR", departures: 298 },
        { destination: "MAA", departures: 245 },
    ]
  };

  res.json(mockStats);
};

export const getFlightById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM flights WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Flight not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};