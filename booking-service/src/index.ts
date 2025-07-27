import express from 'express';
import dotenv from 'dotenv';
import router from './api/routes/booking.routes';
import db from './config/db';
import { connectRabbitMQ } from './config/rabbitmq';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Booking Service' });
});

app.use('/', router);

// Test the database connection on startup
db.query('SELECT NOW()')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Booking Service listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed!', err.stack);
    process.exit(1);
  });

connectRabbitMQ().then(() => {
    app.listen(PORT, () => {
        console.log(`Booking Service listening on port ${PORT}`);
    });
});