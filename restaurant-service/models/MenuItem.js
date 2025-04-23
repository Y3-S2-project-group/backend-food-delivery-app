const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  name: String,
  price: Number,
  category: String,
  isAvailable: { type: Boolean, default: true },
  description: String,
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
