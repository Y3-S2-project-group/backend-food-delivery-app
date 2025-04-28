import mongoose from 'mongoose';

const driverLocationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  location: {
    type: { 
      type: String, 
      default: 'Point' 
    },
    coordinates: [Number] // [longitude, latitude]
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Create a geospatial index for efficient proximity queries
driverLocationSchema.index({ location: '2dsphere' });

const DriverLocation = mongoose.model('DriverLocation', driverLocationSchema);

export default DriverLocation;