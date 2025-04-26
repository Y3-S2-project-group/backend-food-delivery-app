import express from 'express';
import { createRestaurant, getMyRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant, updateRestaurantStatus, getPendingRestaurants } from '../controllers/restaurantController.js';
import authenticateToken from '../middleware/authMiddleware.js';


const router = express.Router();


router.post('/', authenticateToken, createRestaurant);
router.get('/pending', getPendingRestaurants); // Admin access (still authenticated, maybe add role check)
router.get('/', authenticateToken, getMyRestaurants);
router.get('/:id', authenticateToken, getRestaurantById);
router.put('/:id', authenticateToken, updateRestaurant);
router.delete('/:id', authenticateToken, deleteRestaurant);

router.patch('/:id/verify', updateRestaurantStatus); // Admin access (still authenticated, maybe add role check)




export default router;
