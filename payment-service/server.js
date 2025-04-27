const express = require('express');
const dotenv = require('dotenv'); // Import dotenv first
const cors = require('cors');


dotenv.config(); 

const paymentRoutes = require('./routes/payment');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/payments', paymentRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
