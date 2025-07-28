import { Response, NextFunction } from 'express';
import db from '../../config/db';
import { IAuthRequest } from '../middleware/auth.middleware';
import axios from 'axios';
import { publishEvent } from '../../config/rabbitmq';

// Define the structure of a passenger
interface Passenger {
  fullName: string;
  email?: string;
  phone?: string;
  passportNumber?: string;
}

// Define the type for the flight data we expect back from the flight service
interface Flight {
  id: number;
  flight_number: string;
  airline_name: string;
  departure_airport_iata: string;
  arrival_airport_iata: string;
  departure_time: string; 
  arrival_time: string;   
  price: string;          
}

// CORRECTED: Removed the trailing slash for robust URL joining
const FLIGHT_SERVICE_URL = 'http://flight-service-svc';

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
export const createBooking = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  // Use a transaction from the connection pool
  const client = await db.connect(); 
  try {
    const userId = req.userId;
    const { flightId, passengers } = req.body as { flightId: number; passengers: Passenger[] };

    if (!flightId || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ message: 'Flight ID and a non-empty array of passengers are required' });
    }

    // --- Inter-Service Communication ---
    let flightData: Flight;
    try {
      console.log(`Fetching flight data for flightId: ${flightId}`);
      // The path starts with a slash, correctly joining with the base URL
      const response = await axios.get<Flight>(`${FLIGHT_SERVICE_URL}/api/flights/${flightId}`);
      flightData = response.data;
      console.log(`Successfully fetched flight data for ${flightData.flight_number}`);
    } catch (error: any) {
      console.error('Error fetching flight data:', error.isAxiosError ? error.message : error);
      return res.status(500).json({ message: 'Could not retrieve flight information at this time.' });
    }
    
    // Calculate total price
    const totalPrice = parseFloat(flightData.price) * passengers.length;

    // --- Database Transaction ---
    await client.query('BEGIN');

    // Insert into the bookings table
    const bookingQuery = `
      INSERT INTO bookings (user_id, flight_id, total_price, booking_status)
      VALUES ($1, $2, $3, 'PENDING')
      RETURNING id;
    `;
    const bookingResult = await client.query(bookingQuery, [userId, flightId, totalPrice]);
    const newBookingId = bookingResult.rows[0].id;
    console.log(`Created new booking with ID: ${newBookingId}`);

    // Insert each passenger
    const passengerQuery = `
      INSERT INTO passengers (booking_id, full_name, email, phone, passport_number)
      VALUES ($1, $2, $3, $4, $5);
    `;
    for (const passenger of passengers) {
      // Add validation for passenger data
      if (!passenger.fullName || !passenger.email) {
        throw new Error('Each passenger must have a fullName and email.');
      }
      await client.query(passengerQuery, [ newBookingId, passenger.fullName, passenger.email, passenger.phone, passenger.passportNumber ]);
    }

    await client.query('COMMIT');

    // Publish the event AFTER the transaction is successfully committed
    const eventPayload = {
        bookingId: newBookingId,
        userId: userId,
        userEmail: 'user@example.com', // Placeholder
        flightDetails: {
            flightNumber: flightData.flight_number,
            airline: flightData.airline_name,
            departure: flightData.departure_airport_iata,
            arrival: flightData.arrival_airport_iata
        },
        totalPrice: totalPrice,
    };
    publishEvent('booking.created', eventPayload);

    res.status(201).json({ message: 'Booking created successfully', bookingId: newBookingId });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Booking creation failed, transaction rolled back:', error.message);
    res.status(500).json({ message: error.message || 'Server error while creating booking' });
  } finally {
    client.release();
  }
};

export const getMyBookings = async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const query = `
            SELECT 
                b.id as "bookingId",
                b.booking_status as status,
                b.total_price as "totalPrice",
                b.created_at as "bookingDate",
                -- We'll generate a mock PNR for display
                'BK' || LPAD(b.id::text, 6, '0') as pnr,
                -- Aggregate flight details into a single JSON object
                json_build_object(
                    'id', f.id,
                    'flightNumber', f.flight_number,
                    'airline', f.airline_name,
                    'from', f.departure_airport_iata,
                    'to', f.arrival_airport_iata,
                    'departureTime', f.departure_time,
                    'arrivalTime', f.arrival_time,
                    'duration', (f.arrival_time - f.departure_time)
                ) as flight,
                -- Aggregate all passengers for this booking into a JSON array
                json_agg(
                    json_build_object(
                        'fullName', p.full_name,
                        'email', p.email
                    )
                ) as passengers
            FROM bookings b
            JOIN flights f ON b.flight_id = f.id
            JOIN passengers p ON b.id = p.booking_id
            WHERE b.user_id = $1
            GROUP BY b.id, f.id -- Group by booking and flight to aggregate passengers
            ORDER BY b.created_at DESC;
        `;
        const { rows } = await db.query(query, [userId]);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: 'Server error while fetching bookings' });
    }
};