import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payment.js';
dotenv.config(); 



const app = express();

// Middleware

// Middleware
app.use(express.json());
app.use(cors());

// Routes
// Routes
app.use('/api/payments', paymentRoutes);

// Server start
// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});