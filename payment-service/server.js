const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const paymentRoutes = require('./routes/payment');

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 8008;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
