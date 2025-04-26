const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const paymentRoutes = require('./routes/payment');

const app = express();
app.use(express.json());

app.use(cors());
dotenv.config();

app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
