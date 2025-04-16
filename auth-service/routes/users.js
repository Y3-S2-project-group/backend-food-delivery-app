// routes/users.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// get user by id
router.get('/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) return res.status(404).json({ msg: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  });

// update user
router.put('/:id', async (req, res) => {
    const { name, email, role } = req.body;
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });
  
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role;
  
      await user.save();
      res.json({ msg: 'User updated successfully' });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  });

  
// delete user
router.delete('/:id', async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ msg: 'User not found' });
      res.json({ msg: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  });
  

export default router;
