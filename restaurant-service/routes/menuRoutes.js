import express from 'express';
import { createMenuItem, getMenuItems, getMenuItemById, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';

const router = express.Router();

router.post('/', createMenuItem);
router.get('/menu/:restaurantId', getMenuItems);
router.get('/:id', getMenuItemById);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;
