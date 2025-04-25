import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import menuRoutes from './routes/menuRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());

// CORS setup for local development (frontend running on Vite - localhost:5173)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menus', menuRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Restaurant Service API!');
});

// Listen on 0.0.0.0 for Docker compatibility
app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
