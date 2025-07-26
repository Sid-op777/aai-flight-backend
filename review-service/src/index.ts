import express from 'express';
import dotenv from 'dotenv';
import reviewRoutes from './api/routes/review.routes';
import db from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Review Service' });
});

app.use('/', reviewRoutes);

// Test the database connection on startup
db.query('SELECT NOW()')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Review Service listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed!', err.stack);
    process.exit(1);
  });