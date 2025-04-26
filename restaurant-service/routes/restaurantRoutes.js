import express from 'express';
import { createRestaurant, getMyRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant, updateRestaurantStatus, getPendingRestaurants } from '../controllers/restaurantController.js';
import {authenticateToken, checkRole} from '../middleware/authMiddleware.js';


const router = express.Router();


// Only authenticated users can create a restaurant (e.g., restaurant manager)
router.post('/', authenticateToken, checkRole('restaurant'), createRestaurant);

// Only admin can view all pending restaurant approvals
router.get('/pending', authenticateToken, checkRole('admin'), getPendingRestaurants);

// Only the logged-in restaurant manager can view their own restaurants
router.get('/', authenticateToken, checkRole('restaurant'), getMyRestaurants);

// Authenticated restaurant user can get/update/delete their restaurant by ID
router.get('/:id', authenticateToken, checkRole('restaurant'), getRestaurantById);
router.put('/:id', authenticateToken, checkRole('restaurant'), updateRestaurant);
router.delete('/:id', authenticateToken, checkRole('restaurant'), deleteRestaurant);

// Only admin can verify/approve a restaurant
router.patch('/:id/verify', authenticateToken, checkRole('admin'), updateRestaurantStatus);




export default router;
