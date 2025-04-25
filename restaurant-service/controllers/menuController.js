import MenuItem from '../models/MenuItem.js';

// Create menu item
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

// Get all menu items for a restaurant
export const getMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Ensure restaurantId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurantId' });
    }

    const items = await MenuItem.find({ restaurantId: mongoose.Types.ObjectId(restaurantId) });
    
    if (!items.length) {
      return res.status(404).json({ message: 'No menu items found for this restaurant' });
    }
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single menu item by ID
export const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedItem) return res.status(404).json({ message: 'Menu item not found' });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

