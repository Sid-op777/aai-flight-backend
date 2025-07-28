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

// The internal URL for the Flight Service inside Kubernetes
const FLIGHT_SERVICE_URL = 'http://flight-service-svc/api/flights';

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
export const createBooking = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const client = await db.connect(); // Use a client for transactions
  try {
    const userId = req.userId;
    const { flightId, passengers } = req.body as { flightId: number; passengers: Passenger[] };

    if (!flightId || !passengers || passengers.length === 0) {
      return res.status(400).json({ message: 'Flight ID and at least one passenger are required' });
    }

    // --- Inter-Service Communication ---
    // 1. Call the Flight Service to get flight details (and verify it exists)
    let flightData:Flight;
    try {
      const response = await axios.get<Flight>(`${FLIGHT_SERVICE_URL}/${flightId}`);
      flightData = response.data;
      if (!flightData) {
        return res.status(404).json({ message: 'Flight not found' });
      }
    } catch (error) {
      console.error('Error fetching flight data:', error);
      return res.status(500).json({ message: 'Could not retrieve flight information' });
    }
    
    // 2. Calculate total price
    const totalPrice = parseFloat(flightData.price) * passengers.length;

    // --- Database Transaction ---
    await client.query('BEGIN'); // Start transaction

    // 3. Insert into the bookings table
    const bookingQuery = `
      INSERT INTO bookings (user_id, flight_id, total_price, booking_status)
      VALUES ($1, $2, $3, 'PENDING') -- Change 'CONFIRMED' to 'PENDING'
      RETURNING id;
    `;
    const bookingResult = await client.query(bookingQuery, [userId, flightId, totalPrice]);
    const newBookingId = bookingResult.rows[0].id;

    // 4. Insert each passenger
    const passengerQuery = `
      INSERT INTO passengers (booking_id, full_name, email, phone, passport_number)
      VALUES ($1, $2, $3, $4, $5);
    `;
    for (const passenger of passengers) {
      await client.query(passengerQuery, [
        newBookingId,
        passenger.fullName,
        passenger.email,
        passenger.phone,
        passenger.passportNumber,
      ]);
    }

    await client.query('COMMIT'); // Commit transaction

    //Publish the event
    const eventPayload = {
        bookingId: newBookingId,
        userId: userId,
        userEmail: 'user@example.com', // In a real app, you'd fetch this from User Service or get it from JWT
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

  } catch (error) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error(error);
    res.status(500).json({ message: 'Server error while creating booking' });
  } finally {
    client.release(); // Release the client back to the pool
  }
};


/**
 * @desc    Get all bookings for the authenticated user
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
export const getMyBookings = async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        const query = `
            SELECT b.id as booking_id, b.booking_status, b.total_price, b.created_at,
                   f.flight_number, f.airline_name, f.departure_airport_iata, f.arrival_airport_iata,
                   f.departure_time, f.arrival_time
            FROM bookings b
            JOIN flights f ON b.flight_id = f.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC;
        `;
        const { rows } = await db.query(query, [userId]); 
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};