import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';

const router = express.Router();

// Protect all menu routes with authentication middleware
router.use(authenticateToken);

// Create a menu item (only for owner's restaurants)
router.post('/', createMenuItem);

// Get all menu items for a specific restaurant
router.get('/restaurant/:restaurantId', getMenuItems);

// Get a specific menu item by ID
router.get('/:id', getMenuItemById);

// Update a specific menu item
router.put('/:id', updateMenuItem);

// Delete a specific menu item
router.delete('/:id', deleteMenuItem);

export default router;
