import { Response, NextFunction } from 'express';
import db from '../../config/db';
import { IAuthRequest } from '../middleware/auth.middleware';
import { publishEvent } from '../../config/rabbitmq';

// --- This function MOCKS a lookup to an external airline/GDS system ---
const mockPnrLookup = (pnr: string, airline: string) => {
  console.log(`Mocking PNR lookup for PNR: ${pnr}, Airline: ${airline}`);
  // In a real app, this would be a complex API call.
  // Here, we return a hardcoded, realistic-looking trip.
  return {
    airlineName: "IndiGo",
    segments: [
      {
        flightNumber: '6E555',
        departureAirportIata: 'DEL',
        arrivalAirportIata: 'BOM',
        departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        arrivalTime: new Date(Date.now() + (2 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000)).toISOString(), // 2 hours later
        webCheckinLink: 'https://www.goindigo.in/web-check-in.html'
      }
    ]
  };
};


/**
 * @desc    Import a new trip via PNR
 * @route   POST /api/trips/import
 * @access  Private
 */
export const importTrip = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const client = await db.connect();
  try {
    const userId = req.userId;
    const { pnr, airline } = req.body;

    if (!pnr || !airline) {
      return res.status(400).json({ message: 'PNR and airline are required' });
    }

    // 1. "Call" the external system (our mock function)
    const tripData = mockPnrLookup(pnr, airline);
    
    await client.query('BEGIN'); // Start transaction

    // 2. Insert into the trips table
    const tripQuery = `INSERT INTO trips (user_id, pnr, airline_name) VALUES ($1, $2, $3) RETURNING id;`;
    const tripResult = await client.query(tripQuery, [userId, pnr, tripData.airlineName]);
    const newTripId = tripResult.rows[0].id;

    // 3. Insert each flight segment
    for (const segment of tripData.segments) {
      const segmentQuery = `
        INSERT INTO trip_flight_segments (trip_id, flight_number, departure_airport_iata, arrival_airport_iata, departure_time, arrival_time, web_checkin_link)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      await client.query(segmentQuery, [
        newTripId,
        segment.flightNumber,
        segment.departureAirportIata,
        segment.arrivalAirportIata,
        segment.departureTime,
        segment.arrivalTime,
        segment.webCheckinLink
      ]);
    }

    await client.query('COMMIT'); // Commit transaction

    // 4. Publish a trip.imported event
    publishEvent('trip.imported', { tripId: newTripId, userId, segments: tripData.segments });

    res.status(201).json({ message: 'Trip imported successfully', tripId: newTripId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server error while importing trip' });
  } finally {
    client.release();
  }
};

/**
 * @desc    Get all trips for the authenticated user
 * @route   GET /api/trips
 * @access  Private
 */
export const getMyTrips = async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        // This query is a bit more complex, joining trips with their segments
        const query = `
            SELECT 
                t.id as trip_id,
                t.pnr,
                t.airline_name,
                json_agg(json_build_object(
                    'flight_number', s.flight_number,
                    'departure_airport_iata', s.departure_airport_iata,
                    'arrival_airport_iata', s.arrival_airport_iata,
                    'departure_time', s.departure_time,
                    'arrival_time', s.arrival_time,
                    'web_checkin_link', s.web_checkin_link
                )) as segments
            FROM trips t
            JOIN trip_flight_segments s ON t.id = s.trip_id
            WHERE t.user_id = $1
            GROUP BY t.id
            ORDER BY t.created_at DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};