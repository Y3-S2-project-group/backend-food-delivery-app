import express from 'express';
import dotenv from 'dotenv';

import transporter from '../utils/email.js';
import { forgotPassword, login, register, resetPassword, verifyOtp } from '../controllers/authController.js';

dotenv.config();

const router = express.Router();

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

  

export default router;
