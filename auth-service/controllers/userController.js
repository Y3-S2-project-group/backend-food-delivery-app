import DriverLocation from "../models/DriverLocation.js";
import User from "../models/User.js";

//Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password field
        res.json(users);
      } catch (err) {
        res.status(500).json({ msg: 'Server error' });
      }
};

//Get user by id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
      } catch (err) {
        res.status(500).json({ msg: 'Server error' });
      }
};

//Update user
export const updateUser = async (req, res) => {
    const { name, email, role } = req.body;
        try {
          const user = await User.findById(req.params.id);
          if (!user) return res.status(404).json({ msg: 'User not found' });
      
          user.name = name || user.name;
          user.email = email || user.email;
          user.role = role || user.role;
      
          await user.save();
          res.json({ msg: 'User updated successfully' });
        } catch (err) {
          res.status(500).json({ msg: 'Server error' });
        }
};

//Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json({ msg: 'User deleted successfully' });
      } catch (err) {
        res.status(500).json({ msg: 'Server error' });
      }
};


// ************* Driver Related Functions ************* //


// Create Driver Location
export const createDriverLocation = async (req, res) => {
  try {
    const { userId, longitude, latitude, isAvailable } = req.body;
    
    // Validate user exists and is a driver
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.role !== 'delivery-person') {
      return res.status(400).json({
        success: false,
        message: 'User is not a driver'
      });
    }
    
    // Check if record already exists
    let driverLocation = await DriverLocation.findOne({ userId });
    
    if (driverLocation) {
      // Update existing record
      driverLocation.location.coordinates = [parseFloat(longitude), parseFloat(latitude)];
      driverLocation.isAvailable = isAvailable !== undefined ? isAvailable : driverLocation.isAvailable;
      driverLocation.lastUpdated = Date.now();
    } else {
      // Create new record
      driverLocation = new DriverLocation({
        userId,
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        isAvailable: isAvailable !== undefined ? isAvailable : true
      });
    }
    
    await driverLocation.save();
    
    res.status(201).json({
      success: true,
      message: 'Driver location saved successfully',
      data: driverLocation
    });
  } catch (err) {
    console.error('Error saving driver location:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// Find drivers within 5km range
export const findDriversWithin5km = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }
    
    // Convert coordinates to float
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    // Find all available drivers within 5km radius
    // 5km in radians is approximately 0.000784 (5/6371 - Earth's radius in km)
    const driversWithinRange = await DriverLocation.find({
      isAvailable: true,
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], 5/6371]
        }
      }
    });
    
    if (driversWithinRange.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'No available drivers found within 5km range',
        data: []
      });
    }
    
    // Get driver details for all drivers
    const driverIds = driversWithinRange.map(driver => driver.userId);
    const driverDetails = await User.find({
      _id: { $in: driverIds }
    }).select('-password');
    
    // Combine driver details with location data
    const result = driversWithinRange.map(driverLoc => {
      const driver = driverDetails.find(d => 
        d._id.toString() === driverLoc.userId.toString());
      
      if (!driver) return null;
      
      return {
        id: driver._id,
        name: driver.name,
        contactNumber: driver.contactNumber || '',
        location: driverLoc.location.coordinates
      };
    }).filter(Boolean);
    
    res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (err) {
    console.error('Error finding drivers within 5km range:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
};

// Add endpoint to update driver availability
export const updateDriverAvailability = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean value'
      });
    }
    
    const driverLocation = await DriverLocation.findOneAndUpdate(
      { userId: driverId },
      { isAvailable: isAvailable },
      { new: true }
    );
    
    if (!driverLocation) {
      return res.status(404).json({
        success: false,
        message: 'Driver location not found'
      });
    }
    
    res.json({
      success: true,
      message: `Driver availability updated to ${isAvailable}`,
      data: driverLocation
    });
  } catch (err) {
    console.error('Error updating driver availability:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Get user data
    const driver = await User.findById(driverId).select('-password');
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    // Verify the user is a driver
    if (driver.role !== 'delivery-person') {
      return res.status(400).json({
        success: false,
        message: 'User is not a driver'
      });
    }
    
    // Get driver location information
    const driverLocation = await DriverLocation.findOne({ userId: driverId });
    
    // Combine data
    const result = {
      id: driver._id,
      name: driver.name,
      email: driver.email,
      contactNumber: driver.contactNumber || '',
      role: driver.role,
      location: driverLocation ? driverLocation.location.coordinates : null,
      isAvailable: driverLocation ? driverLocation.isAvailable : false,
      lastUpdated: driverLocation ? driverLocation.lastUpdated : null
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Error fetching driver by ID:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message
    });
  }
};

// Get all available drivers
// export const getAvailableDrivers = async (req, res) => {
//   try {
//     // Get users with role 'delivery-person' who are available
//     const availableDrivers = await User.find({
//       role: 'delivery-person'
//     }).select('-password');
    
//     // Get their locations
//     const driversWithLocation = await DriverLocation.find({
//       userId: { $in: availableDrivers.map(d => d._id) },
//       isAvailable: true
//     });
    
//     // Combine user data with location data
//     const result = availableDrivers.map(driver => {
//       const locationData = driversWithLocation.find(loc => 
//         loc.userId.toString() === driver._id.toString());
      
//       return {
//         id: driver._id,
//         name: driver.name,
//         contactNumber: driver.contactNumber || '',
//         location: locationData ? locationData.location.coordinates : null,
//         isAvailable: locationData ? locationData.isAvailable : false
//       };
//     });
    
//     res.json({
//       success: true,
//       count: result.length,
//       data: result
//     });
//   } catch (err) {
//     console.error('Error fetching available drivers:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Server error',
//       error: err.message
//     });
//   }
// };