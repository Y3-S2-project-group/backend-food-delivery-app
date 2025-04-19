const express = require('express');
const router = express.Router();
const { verifyRestaurant } = require(',../controllers/menuVerifyController');

// Admin-only route to verify restaurant
router.patch('/restaurants/:id/verify', verifyRestaurant);

module.exports = router;
