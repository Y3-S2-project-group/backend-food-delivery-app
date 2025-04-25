// services/PaymentService.js
import stripe from '../config/stripe.js'; // Add `.js` extension explicitly
import { v4 as uuidv4 } from 'uuid';

class PaymentService {
  constructor() {
    this.payments = new Map();
  }

  async processPayment(orderId, paymentDetails) {
    const { amount, paymentMethodId } = paymentDetails;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
      });

      const paymentId = uuidv4();
      const paidAt = new Date();

      const paymentData = {
        paymentId,
        orderId,
        amount,
        paymentMethod: paymentMethodId,
        status: paymentIntent.status,
        paidAt,
      };

      this.payments.set(paymentId, paymentData);
      return paymentData;
    } catch (error) {
      throw new Error('Payment processing failed');
    }
  }

  getPaymentStatus(paymentId) {
    const payment = this.payments.get(paymentId);
    return payment ? payment.status : 'Payment not found';
  }
}

export default new PaymentService();
