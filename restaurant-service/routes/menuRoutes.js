const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { addMenuItem, getMenuItems, updateMenuItem, deleteMenuItem, } = require('../controllers/menuController');

// Simulated authentication middleware
router.use(auth);

// Menu routes
router.post('/', addMenuItem);
router.get('/', getMenuItems);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

module.exports = router;
