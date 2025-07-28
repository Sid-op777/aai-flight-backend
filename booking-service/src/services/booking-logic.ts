import db from '../config/db';

export const handlePaymentSuccess = async (payload: { bookingId: number }) => {
  console.log(`Received payment.succeeded event for bookingId: ${payload.bookingId}`);
  
  const query = `
    UPDATE bookings 
    SET booking_status = 'CONFIRMED' 
    WHERE id = $1 AND booking_status = 'PENDING'
    RETURNING *;
  `;
  
  const { rows } = await db.query(query, [payload.bookingId]);
  
  if (rows.length > 0) {
    console.log(`Booking ${payload.bookingId} status updated to CONFIRMED.`);
    // Here you could publish another event like `booking.confirmed` if needed
  } else {
    console.warn(`Booking ${payload.bookingId} not found or was not in PENDING state.`);
  }
};