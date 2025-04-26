// controllers/orderController.js
import Order from "../models/Order.js";

// 1.  Place a new order
export const placeOrder = async (req, res) => {
  try {
    // Check if req.body exists
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

    // Get customerId from authenticated user
    const customerId = req.user.id;

    // Validation
    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: restaurantId and items array' 
      });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.itemId || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have itemId, quantity, and price'
        });
      }
    }

    // Calculate total amount if not provided
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

    // Validate and set status (only allow DRAFT or CONFIRMED)
    const orderStatus = status === 'CONFIRMED' ? 'CONFIRMED' : 'DRAFT';

    // Create new order
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

    // Save order to database
    const savedOrder = await newOrder.save();

    // Return success response with created order
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

// 2. Modify an order (only if status is DRAFT)
export const modifyOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const updates = req.body;
    const { status, cancellationReason } = updates;

    // We can use req.order from isOrderOwner middleware
    const order = req.order;
    
    // Only DRAFT orders can be modified
    if (order.status !== "DRAFT") {
      return res.status(400).json({ 
        success: false,
        message: "Order cannot be modified after it's confirmed or cancelled" 
      });
    }

    // Handle cancellation in DRAFT state
    if (status === "CANCELLED") {
      // Require cancellation reason
      if (!cancellationReason) {
        return res.status(400).json({
          success: false,
          message: "Cancellation reason is required when cancelling an order"
        });
      }
      
      order.status = "CANCELLED";
      order.cancellationReason = cancellationReason;
    } else {
      // For other updates, ensure status remains DRAFT
      updates.status = "DRAFT"; // Ensure status can't be changed to anything except CANCELLED
      Object.assign(order, updates);
    }

    const updatedOrder = await order.save();
    
    return res.status(200).json({
      success: true,
      message: order.status === "CANCELLED" ? "Order cancelled successfully" : "Order modified successfully",
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

// 3. Confirm an order
export const confirmOrder = async (req, res) => {
  try {
    // We can use req.order from isOrderOwner middleware
    const order = req.order;

    if (order.status !== "DRAFT") {
      return res.status(400).json({ 
        success: false,
        message: "Only DRAFT orders can be confirmed" 
      });
    }

    // Update status to CONFIRMED
    order.status = "CONFIRMED";
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

//4. Update order status (after CONFIRMED)
export const updateOrderStatus = async (req, res) => {
  try {
    console.log('Incoming request to update order status');
    
    const { status, cancellationReason } = req.body;
    
    // We can use req.order from isOrderOwner middleware
    const order = req.order;

    // Only CONFIRMED orders can proceed to next statuses
    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Only orders with CONFIRMED status can be updated'
      });
    }

    // Allowed next statuses from CONFIRMED
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

    // Cancellation requires a reason
    if (status === 'CANCELLED' && !cancellationReason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required when cancelling an order'
      });
    }

    // Apply status update
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
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the order status',
      error: error.message
    });
  }
};

// 5. Update order in PLACED status
export const updatePlacedOrder = async (req, res) => {
  try {
    const { status } = req.body;
    
    // We can use req.order from isOrderOwner middleware
    const order = req.order;

    // Check if the order is in a status that can be updated
    if (order.status !== 'PLACED' && order.status !== 'PREPARING') {
      return res.status(400).json({
        success: false,
        message: 'Only orders with PLACED or PREPARING status can be updated'
      });
    }

    // Define valid transitions for each current status
    let validNextStatus;
    if (order.status === 'PLACED') {
      validNextStatus = 'PREPARING';
    } else if (order.status === 'PREPARING') {
      validNextStatus = 'READY_FOR_DELIVERY';
    }

    // Ensure the requested status is valid for the current state
    if (status !== validNextStatus) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. From ${order.status}, you can only update to ${validNextStatus}`
      });
    }

    // Update the order status
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

// 6. Get order status
export const getOrderStatus = async (req, res) => {
  try {
    // We can use req.order from isOrderOwner middleware
    const order = req.order;

    // Include cancellation reason if order is cancelled
    const responseData = {
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    // Add cancellation reason if order is cancelled
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


// 7. Get orders ready for delivery (simplified)
export const getOrdersReadyForDelivery = async (req, res) => {
  try {
    let query = { status: 'READY_FOR_DELIVERY' };
    
    // If user is a restaurant, only show their orders
    if (req.user.role === 'restaurant') {
      query.restaurantId = req.user.id;
    }
    
    // Find all orders with status READY_FOR_DELIVERY
    const readyOrders = await Order.find(query);
    
    if (readyOrders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders are currently ready for delivery",
        count: 0,
        data: []
      });
    }

    // Map orders to include only the most essential delivery information
    const deliveryOrders = readyOrders.map(order => ({
      orderId: order._id,
      restaurantId: order.restaurantId,
      // Only essential customer details and customerInfo
      customerInfo: {
        street: order.customerInfo.street,
        city: order.customerInfo.city,
        contactNumber: order.customerInfo.contactNumber,
      },
      customerLocation: order.customerLocation.coordinates,
      // Simplified items info
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