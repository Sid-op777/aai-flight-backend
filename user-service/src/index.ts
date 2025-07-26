import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './api/routes/user.routes';
import { errorHandler } from './api/middleware/error.middleware'; // Import error handler

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'User Service' });
});

// Use the user routes
app.use('/', userRoutes);

// Use the error handler - MUST be after all routes
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`User Service running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});