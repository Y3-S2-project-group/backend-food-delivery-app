import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";

export const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log(req.body);
        try {
            const existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ msg: 'User already exists' });
    
            const hashed = await bcrypt.hash(password, 10);
            
            const user = new User({ name, email, password: hashed, role });
            await user.save();
            
            res.status(201).json({ msg: 'User registered successfully' });
        } catch (err) {
            if (err.name === 'ValidationError') {
                return res.status(400).json({ msg: err.message });
            }
            console.error('Registration error:', err);
            res.status(500).send('Server error');
        }
};

export const login = async (req, res) => {
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
};

export const forgotPassword = async (req, res) => {
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
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
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
};

export const resetPassword = async (req, res) => {
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
};


// ***** Delivery Person and Restaurant Manager registration functions *****
export const registerDeliveryPerson = async (req, res) => {
    try {
      const { name, email, password } = req.body;  // No latitude, longitude needed now
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered." });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: "delivery-person",
        latitude: null,
        longitude: null,
      });
  
      await newUser.save();
  
      res.status(201).json({ message: "Delivery person registered successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Registration failed.", error: error.message });
    }
  };
  
  
  export const registerRestaurantManager = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered." });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create restaurant manager user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: "restaurant",
      });
  
      await newUser.save();
  
      res.status(201).json({ message: "Restaurant manager registered successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Registration failed.", error: error.message });
    }
  };