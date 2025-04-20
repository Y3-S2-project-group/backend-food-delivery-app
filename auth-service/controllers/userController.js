import User from "../models/User.js";

//Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password field
        res.json(users);
      } catch (err) {
        res.status(500).json({ msg: 'Server error' });
      }
};

//Get user by id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
      } catch (err) {
        res.status(500).json({ msg: 'Server error' });
      }
};

//Update user
export const updateUser = async (req, res) => {
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
};

//Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json({ msg: 'User deleted successfully' });
      } catch (err) {
        res.status(500).json({ msg: 'Server error' });
      }
};