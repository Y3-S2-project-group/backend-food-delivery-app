import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

// POST /api/payments
router.post('/', async (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ message: 'OrderId and Amount are required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: 'usd',
      metadata: { orderId },
    });

    const paymentDate = new Date().toISOString();

    res.status(200).json({
      orderId,
      amount,
      paymentDate,
      clientSecret: paymentIntent.client_secret,
      message: 'Payment initiated successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment failed', error: error.message });
  }
});

export default router;
