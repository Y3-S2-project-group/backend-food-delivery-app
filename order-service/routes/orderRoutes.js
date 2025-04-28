import express from "express";
import {
  placeOrder,
  modifyOrder,
  confirmOrder,
  updateOrderStatus,
  updatePlacedOrder,
  getOrderStatus,
  getOrdersReadyForDelivery,
  deleteOrder,
  getUserOrders,

} from "../controllers/orderController.js";
import { authenticateToken, authorizeRole, isOrderOwner } from "../middleware/authMiddleware.js";
import { processPayment } from "../../payment-service/utils/paymentUtils.js";


// Create router instance
const router = express.Router();

// Customer-only routes
router.post("/orders", 
  authenticateToken, 
  authorizeRole(['customer']), 
  placeOrder
);

router.put("/orders/:id", 
  authenticateToken, 
  authorizeRole(['customer']), 
  isOrderOwner, 
  modifyOrder
);

router.patch("/orders/:id/confirm", 
  authenticateToken, 
  authorizeRole(['customer']), 
  isOrderOwner,
  processPayment,
  confirmOrder
);

// Both customer and restaurant can check order status
router.get("/orders/:id/status", 
  authenticateToken, 
  authorizeRole(['customer', 'restaurant']), 
  isOrderOwner, 
  getOrderStatus
);

// Restaurant-only routes
router.patch("/orders/:id/status", 
  authenticateToken, 
  authorizeRole(['restaurant']), 
  isOrderOwner, 
  updateOrderStatus
);

router.patch("/orders/:id/placed", 
  authenticateToken, 
  authorizeRole(['restaurant']), 
  isOrderOwner, 
  updatePlacedOrder
);

router.get("/orders/ready-for-delivery", 
  authenticateToken, 
  authorizeRole(['restaurant', 'delivery']), 
  getOrdersReadyForDelivery
);

// Delete order
// Get user orders
router.get("/orders", 
  authenticateToken, 
  authorizeRole(['customer']), 
  getUserOrders
);

// Delete order
router.delete('/orders/:orderId',
  authenticateToken, 
  authorizeRole(['customer']), 
  deleteOrder,
);



export default router;
