const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  isAvailable: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
