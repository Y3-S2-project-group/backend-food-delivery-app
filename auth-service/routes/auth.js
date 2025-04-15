import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

import transporter from '../utils/email.js';

dotenv.config();

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: 'User already exists' });

        const hashed = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashed, role });
        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).send('Server error');
    }
});


// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset OTP',
            html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 15 minutes.</p>`
        });

        res.json({ msg: 'OTP sent to email' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        if (Date.now() > user.otpExpires) {
            return res.status(400).json({ msg: 'OTP expired' });
        }

        res.json({ msg: 'OTP verified. You can now reset your password.' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

  

export default router;
