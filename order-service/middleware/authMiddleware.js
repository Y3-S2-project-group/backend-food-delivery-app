import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. No token provided' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    req.user = user; // Now you can access req.user.id, req.user.role, etc.
    next();
  });
};

// Middleware to check if user has required role
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

// Middleware to check if user is the order owner
const isOrderOwner = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // For customers - they must be the owner of the order
    if (req.user.role === 'customer' && order.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not the owner of this order'
      });
    }

    // For restaurant users - we don't check any specific condition here
    // as the restaurantId field is not related to user.id

    // Store the order in the request object for controllers to use
    req.order = order;
    next();
  } catch (error) {
    console.error('Error checking order ownership:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while checking order ownership',
      error: error.message
    });
  }
};

export { authenticateToken, authorizeRole, isOrderOwner };
