const Restaurant = require('../models/Restaurant');

// Admin verifies the restaurant
exports.verifyRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findByIdAndUpdate(id, { isVerified: true }, { new: true });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant verified successfully', restaurant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
