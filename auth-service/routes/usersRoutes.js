import express from 'express';
import { deleteUser, getAllUsers, getUserById, updateUser, createDriverLocation, findDriversWithin5km, updateDriverAvailability } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Driver routes
router.post('/drivers/location', createDriverLocation);
// router.get('/drivers/available', getAvailableDrivers);
router.get('/drivers/nearest', findDriversWithin5km);
router.put('/drivers/:driverId/availability', updateDriverAvailability);
  

export default router;
