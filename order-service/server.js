import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

//express app
const app = express();

//routes
app.get('/', (req, res) => {
    res.send('Server is ready Ashan');
});

// Middleware
app.use(cors());

app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(bodyParser.json()); // Parses JSON payloads


//routes
app.use('/api', orderRoutes);//this is the route for the order service



// 404 Handler (for unmatched routes)
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  });
  
  mongoose.connect(process.env.ORDER_MONGO_URI)
  .then(() => {
      // Listen for requests
      app.listen(process.env.PORT, () => {
          console.log(`Connected to db & Listening on port ${process.env.PORT}`);
      });
  })
  .catch((err) => {
      console.error('Failed to connect to MongoDB:', err.message);
      process.exit(1); // Exit with error code
  });