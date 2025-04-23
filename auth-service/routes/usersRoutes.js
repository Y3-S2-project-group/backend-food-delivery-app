// routes/users.js
import express from 'express';
import User from '../models/User.js';
import { deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
  

export default router;
