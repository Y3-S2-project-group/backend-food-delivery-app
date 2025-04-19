const express = require('express');
const router = express.Router();
const { createRestaurant, updateAvailability } = require('../controllers/restaurantController');

router.post('/', createRestaurant);
router.patch('/:id/availability', updateAvailability);

module.exports = router;
