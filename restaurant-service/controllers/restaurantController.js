const Restaurant = require('../models/Restaurant');

exports.createRestaurant = async (req, res) => {
  const { name, address, phone } = req.body;
  const restaurant = new Restaurant({ name, address, phone });
  await restaurant.save();
  res.status(201).json(restaurant);
};

exports.updateAvailability = async (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;
  const restaurant = await Restaurant.findByIdAndUpdate(id, { isAvailable }, { new: true });
  res.json(restaurant);
};
