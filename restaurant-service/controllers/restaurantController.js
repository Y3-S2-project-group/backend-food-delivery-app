import Restaurant from '../models/Restaurant.js';

// Create a new restaurant
export const createRestaurant = async (req, res) => {
  try {
    const { name, description, address, contactNumber, email } = req.body;

    const newRestaurant = new Restaurant({
      name,
      description,
      address,
      contactNumber,
      email,
      ownerId: req.user.id,
    });

    const savedRestaurant = await newRestaurant.save();
    res.status(201).json(savedRestaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all restaurants of the current manager
export const getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ ownerId: req.user.id });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific restaurant by ID (owner-only)
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
    });

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a specific restaurant (owner-only)
export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found or not authorized' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a specific restaurant (owner-only)
export const deleteRestaurant = async (req, res) => {
  try {
    const deleted = await Restaurant.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: 'Restaurant not found or not authorized' });
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all pending restaurant requests
export const getPendingRestaurants = async (req, res) => {
  try {
    // Correctly filter by the 'status' field instead of '_id'
    const pendingRestaurants = await Restaurant.find({ status: 'pending' });
    res.json(pendingRestaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// For Admin Service to approve a restaurant
export const updateRestaurantStatus = async (req, res) => {
  try {
    const { status } = req.body;  // 'approved' or 'rejected'
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected".' });
    }

    restaurant.status = status;
    await restaurant.save();

    res.json({ message: `Restaurant ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};