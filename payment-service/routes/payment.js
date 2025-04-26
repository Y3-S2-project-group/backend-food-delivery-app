const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments
router.post('/', async (req, res) => {
  const { orderId, amount } = req.body;

  try {
    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe accepts amounts in cents
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
    res.status(500).json({ message: 'Payment failed', error: error.message });
  }
});

module.exports = router;
