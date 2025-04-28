// controllers/orderController.js
import Order from "../models/Order.js";

import { processPayment } from "../../payment-service/utils/paymentUtils.js";

// 🚀 1. Place a new order
export const placeOrder = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Request body is missing' 
      });
    }
    
    const { 
      restaurantId, 
      items, 
      customerInfo,
      customerLocation,
      totalAmount,
      status 
    } = req.body;

    const customerId = req.user.id;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: restaurantId and items array' 
      });
    }

    for (const item of items) {
      if (!item.itemId || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have itemId, quantity, and price'
        });
      }
    }

    let calculatedTotal = totalAmount;
    if (!calculatedTotal) {
      calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    if (status && status !== 'DRAFT' && status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Initial order status can only be DRAFT or CONFIRMED'
      });
    }

    const orderStatus = status === 'CONFIRMED' ? 'CONFIRMED' : 'DRAFT';

    const newOrder = new Order({
      customerId,
      restaurantId,
      items,
      totalAmount: calculatedTotal,
      status: orderStatus,
      customerInfo: customerInfo || {},
      customerLocation,
      paymentStatus: 'PENDING'
    });

    const savedOrder = await newOrder.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: savedOrder
    });

  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while placing the order',
      error: error.message
    });
  }
};

// 🚀 2. Modify an order (only if status is DRAFT)
// 🚀 2. Modify an order (only if status is DRAFT)
export const modifyOrder = async (req, res) => {
  try {
    const orderId = req.params.id || req.params.orderId;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID is required" });
    }

    const updates = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if the order is in DRAFT status unless it's a cancellation
    if (order.status !== "DRAFT" && updates.status !== "CANCELLED") {
      return res.status(400).json({ success: false, message: "Only DRAFT orders can be modified" });
    }

    // Handle cancellation
    if (updates.status === "CANCELLED") {
      if (!updates.cancellationReason) {
        return res.status(400).json({ success: false, message: "Cancellation reason is required" });
      }
      order.status = "CANCELLED";
      order.cancellationReason = updates.cancellationReason;
    } else {
      // Handle item updates
      if (updates.items) {
        order.items = updates.items.map(item => ({
          itemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }));

        // Recalculate total if items updated
        order.totalAmount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      }

      // Handle customer info updates
      if (updates.customerInfo) {
        // Create a copy to avoid modifying the request object
        const customerInfoUpdates = { ...updates.customerInfo };

        // Handle phone number format - convert to numeric string if needed for DB schema
        if (customerInfoUpdates.contactNumber) {
          // If schema expects a number, we strip non-numeric characters
          const numericOnly = customerInfoUpdates.contactNumber.toString().replace(/\D/g, '');
          
          // Store as a number if needed by mongoose schema
          customerInfoUpdates.contactNumber = parseInt(numericOnly, 10);
          
          // If the parsed value is NaN (e.g., empty string after stripping),
          // set a default or return an error
          if (isNaN(customerInfoUpdates.contactNumber)) {
            return res.status(400).json({ 
              success: false, 
              message: "Contact number must contain numeric digits" 
            });
          }
        }

        // Update customer info
        order.customerInfo = {
          ...order.customerInfo,
          ...customerInfoUpdates
        };
      }

      // Handle other updates
      if (updates.totalAmount !== undefined) {
        order.totalAmount = updates.totalAmount;
      }
    }

    // Save the updated order
    const updatedOrder = await order.save();
    
    return res.status(200).json({
      success: true,
      message: "Order modified successfully",
      data: updatedOrder
    });

  } catch (error) {
    console.error("Error modifying order:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to modify order", 
      error: error.message 
    });
  }
};



// 🚀 3. Confirm an order
export const confirmOrder = async (req, res) => {
  try {
    const order = req.order;

    if (order.status !== "DRAFT") {
      return res.status(400).json({ 
        success: false,
        message: "Only DRAFT orders can be confirmed" 
      });
    }

    // Calculate the total amount for the payment
    const totalAmount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Process the payment
    const paymentResult = await processPayment(order._id, totalAmount);

    if (!paymentResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Payment failed',
        error: paymentResult.message,
      });
    }

    console.log('Payment successful:', paymentResult.data);


    order.status = "CONFIRMED";
    order.paymentStatus = 'PAID';
    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: "Order confirmed successfully",
      data: updatedOrder
    });
  } catch (error) {
    console.error("Error confirming order:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to confirm order",
      error: error.message 
    });
  }
};

// 🚀 4. Update order status (after CONFIRMED)
export const updateOrderStatus = async (req, res) => {
  try {
    console.log('Incoming request to update order status');
    
    const { status, cancellationReason } = req.body;
    const order = req.order;

    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Only orders with CONFIRMED status can be updated'
      });
    }

    const allowedStatusTransitions = [
      'PLACED',
      'CANCELLED'
    ];

    if (!allowedStatusTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. From CONFIRMED, allowed values are: ${allowedStatusTransitions.join(', ')}`
      });
    }

    if (status === 'CANCELLED' && !cancellationReason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required when cancelling an order'
      });
    }

    order.status = status;
    if (status === 'CANCELLED') {
      order.cancellationReason = cancellationReason;
    }

    const updatedOrder = await order.save();

    console.log(`Order ${order._id} status updated to ${status}`);

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    console.error('🔥 Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the order status',
      error: error.message
    });
  }
};

// 🚀 5. Update order in PLACED status
export const updatePlacedOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const order = req.order;

    if (order.status !== 'PLACED' && order.status !== 'PREPARING') {
      return res.status(400).json({
        success: false,
        message: 'Only orders with PLACED or PREPARING status can be updated'
      });
    }

    let validNextStatus;
    if (order.status === 'PLACED') {
      validNextStatus = 'PREPARING';
    } else if (order.status === 'PREPARING') {
      validNextStatus = 'READY_FOR_DELIVERY';
    }

    if (status !== validNextStatus) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. From ${order.status}, you can only update to ${validNextStatus}`
      });
    }

    order.status = status;
    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the order',
      error: error.message
    });
  }
};

// 🚀 6. Get order status
export const getOrderStatus = async (req, res) => {
  try {
    const order = req.order;

    const responseData = {
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    if (order.status === 'CANCELLED' && order.cancellationReason) {
      responseData.cancellationReason = order.cancellationReason;
    }

    return res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("Error getting order status:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to get order status",
      error: error.message 
    });
  }
};

// 🚀 7. Get orders ready for delivery
export const getOrdersReadyForDelivery = async (req, res) => {
  try {
    const query = { status: 'READY_FOR_DELIVERY' };
    
    console.log("Query for ready orders:", query);
    
    const readyOrders = await Order.find(query);
    console.log(`Found ${readyOrders.length} orders ready for delivery`);
    
    if (readyOrders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders are currently ready for delivery",
        count: 0,
        data: []
      });
    }

    const deliveryOrders = readyOrders.map(order => ({
      orderId: order._id,
      restaurantId: order.restaurantId,
      customerInfo: {
        street: order.customerInfo?.street || '',
        city: order.customerInfo?.city || '',
        contactNumber: order.customerInfo?.contactNumber || ''
      },
      customerLocation: {
        type: order.customerLocation?.type || 'Point',
        coordinates: order.customerLocation?.coordinates || []
      },
      totalItems: order.items.length,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    }));

    return res.status(200).json({
      success: true,
      message: "Retrieved orders ready for delivery",
      count: deliveryOrders.length,
      data: deliveryOrders
    });
  } catch (error) {
    console.error("Error fetching orders ready for delivery:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders ready for delivery",
      error: error.message
    });
  }
};


export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    const orders = await Order.find({ customerId: userId })
      .sort({ createdAt: -1 }); // Most recent first
    
    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found for this user",
        data: []
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      count: orders.length,
      data: orders
    });
    
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user orders",
      error: error.message
    });
  }
};


// 🚀 Delete an order (only if status is DRAFT)
export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Check if the order belongs to the user
    if (order.customerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this order"
      });
    }
    
    // Only draft orders can be deleted
    if (order.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only orders in DRAFT status can be deleted"
      });
    }
    
    await Order.findByIdAndDelete(orderId);
    
    return res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message
    });
  }
}
  

  // 🚀 Get complete order details
export const getOrderDetails = async (req, res) => {
  try {
    const order = req.order;

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Error getting order details:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to get order details",
      error: error.message 
    });
  }
};


export const getConfirmedOrders = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId || req.query.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required"
      });
    }

    // Find confirmed orders for the specified restaurant
    const confirmedOrders = await Order.find({ 
      restaurantId: restaurantId
    }).sort({ createdAt: -1 }); // Most recent first
    
    if (confirmedOrders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No confirmed orders found for this restaurant",
        data: []
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Confirmed orders retrieved successfully",
      count: confirmedOrders.length,
      data: confirmedOrders
    });
    
  } catch (error) {
    console.error("Error fetching confirmed orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve confirmed orders",
      error: error.message
    });
  }
};