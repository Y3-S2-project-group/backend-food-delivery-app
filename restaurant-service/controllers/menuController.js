import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';

// Create menu item (only for restaurant owners)
export const createMenuItem = async (req, res) => {
  try {
    const {
      restaurantId,
      name,
      description,
      category,
      price,
      isAvailable,
      preparationTimeInMin,
      tags,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurantId' });
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const menuItem = new MenuItem({
      restaurantId,
      name,
      description,
      category,
      price,
      isAvailable,
      preparationTimeInMin,
      tags,
    });

    const savedItem = await menuItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all menu items for a restaurant (owner-only)
export const getMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurantId' });
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const items = await MenuItem.find({ restaurantId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single menu item by ID (owner-only)
export const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

    const restaurant = await Restaurant.findOne({
      _id: menuItem.restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update menu item (owner-only)
export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

    const restaurant = await Restaurant.findOne({
      _id: menuItem.restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(menuItem, req.body);
    const updatedItem = await menuItem.save();

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete menu item (owner-only)
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

    const restaurant = await Restaurant.findOne({
      _id: menuItem.restaurantId,
      ownerId: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await menuItem.deleteOne();
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all menu items for a restaurant (public / customer access)
export const getPublicMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurantId' });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant || restaurant.status !== 'approved') {
      return res.status(404).json({ message: 'Restaurant not found or not approved yet' });
    }

    const items = await MenuItem.find({ restaurantId, isAvailable: true }); // Only available items
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
