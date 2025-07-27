import express from 'express';
import dotenv from 'dotenv';
import db from './config/db';
import { connectRabbitMQ } from './config/rabbitmq';
import tripRoutes from './api/routes/trip.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware to parse JSON request bodies
app.use(express.json());

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Trip Service' });
});

// Use the trip routes
app.use('/', tripRoutes);

// Main function to start the service
const startServer = async () => {
  try {
    // Test the database connection
    await db.query('SELECT NOW()');
    console.log('Database connection successful.');

    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Trip Service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Trip Service:', error);
    process.exit(1);
  }
};

startServer();