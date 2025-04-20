const MenuItem = require('../models/MenuItem');

exports.addMenuItem = async (req, res) => {
  const item = new MenuItem({ ...req.body, restaurantId: req.user.restaurantId });
  await item.save();
  res.status(201).json(item);
};

exports.getMenuItems = async (req, res) => {
  const items = await MenuItem.find({ restaurantId: req.user.restaurantId });
  res.json(items);
};

exports.updateMenuItem = async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
};

exports.deleteMenuItem = async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
