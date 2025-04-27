const express = require('express');
const dotenv = require('dotenv');
dotenv.config();


const paymentRoutes = require('./routes/payment');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
