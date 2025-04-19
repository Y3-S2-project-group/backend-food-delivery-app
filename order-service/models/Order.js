import mongoose from "mongoose"; // Import mongoose

const Schema = mongoose.Schema; // Create schema

// Define Order Item
const OrderItemSchema = new Schema({
    itemId: { type: String, required: true },
    name: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  });
  
  // Define Order
const OrderSchema = new Schema({
    customerId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ['DRAFT', 'CONFIRMED','PLACED', 'PREPARING', 'READY_FOR_DELIVERY','CANCELLED'],
      default: 'DRAFT'
    },
    totalAmount: { type: Number, required: true },
    address: {
      street: String,
      city: String,
      zipCode: String,
      additionalInfo: String,
      contactNumber: Number,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING'
    },
    
    cancellationReason: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  // Auto-update `updatedAt`
  OrderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
  });
  
  export default mongoose.model('Order', OrderSchema);