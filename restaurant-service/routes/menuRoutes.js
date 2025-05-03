import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  getPublicMenuItems, 
} from '../controllers/menuController.js';

const router = express.Router();

// ✅ Public route - Customers can view menu items without authentication
router.get('/public/restaurant/:restaurantId', getPublicMenuItems);

// 🔒 Protected route - Owners can view their restaurant menu items
router.get('/restaurant/:restaurantId', authenticateToken, getMenuItems);

// 🔒 Protected route - Owners can create menu item
router.post('/', authenticateToken, createMenuItem);

// 🔒 Protected route - Owners can update menu item
router.put('/:id', authenticateToken, updateMenuItem);

// 🔒 Protected route - Owners can delete menu item
router.delete('/:id', authenticateToken, deleteMenuItem);

// 🔒 Protected route - Owners can get single menu item by ID
router.get('/:id', authenticateToken, getMenuItemById);

export default router;
