// routes/paymentRoutes.js
import express from 'express';
import paymentService from '../services/PaymentService.js';

const router = express.Router();

router.post('/pay', async (req, res) => {
    const { orderId, amount, paymentMethodId } = req.body;

    try {
        const payment = await paymentService.processPayment(orderId, {
            amount,
            paymentMethodId,
        });
        res.status(200).json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/status/:paymentId', (req, res) => {
    const status = paymentService.getPaymentStatus(req.params.paymentId);
    res.json({ status });
});

export default router;
