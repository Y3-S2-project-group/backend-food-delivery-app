// filepath: /Users/nipun/Desktop/Food-Delivery-app/backend/payment-service/utils/paymentUtils.js
import axios from 'axios';

export const processPayment = async (orderId, amount) => {
  try {
    const response = await axios.post('http://localhost:5000/api/payments', {
      orderId,
      amount,
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Payment failed',
      };
    }
  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};