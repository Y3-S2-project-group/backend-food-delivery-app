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
    customerId:  {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurantId: { type: String, required: true },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ['DRAFT', 'CONFIRMED','PLACED', 'PREPARING', 'READY_FOR_DELIVERY','CANCELLED'],
      default: 'DRAFT'
    },
    totalAmount: { type: Number, required: true },
    customerInfo: {
      street: String,
      city: String,
      contactNumber: Number,
    },
    customerLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
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

  OrderSchema.index({ customerLocation: '2dsphere' });
  
  export default mongoose.model('Order', OrderSchema);