import express from 'express';
import dotenv from 'dotenv';
import db from './config/db';
import { connectRabbitMQ, subscribeToEvents } from './config/rabbitmq';
import bookingRoutes from './api/routes/booking.routes'; // Corrected import name for consistency

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005; // Use the correct port for this service

// Middleware
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Booking Service' });
});

app.use('/', bookingRoutes); // Use the router imported as bookingRoutes

/**
 * Main function to initialize dependencies and start the server.
 */
const startServer = async () => {
  try {
    // 1. Test database connection
    await db.query('SELECT NOW()');
    console.log('Database connection successful.');

    // 2. Connect to RabbitMQ
    await connectRabbitMQ();
    
    // 3. Subscribe to events
    await subscribeToEvents();

    // 4. Start the Express server only AFTER all connections are successful
    app.listen(PORT, () => {
      console.log(`Booking Service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Booking Service:', error);
    process.exit(1); // Exit with a failure code if any startup step fails
  }
};

// Execute the startup function
startServer();