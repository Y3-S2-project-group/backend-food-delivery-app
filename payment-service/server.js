import express from 'express';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();
app.use(express.json());

const PORT = 8005;

app.use('/api/payments', paymentRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});