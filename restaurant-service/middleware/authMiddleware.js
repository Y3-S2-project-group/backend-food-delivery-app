// Simulate decoded token containing restaurantId
const dummyAuth = (req, res, next) => {
    req.user = {
      restaurantId: "661f9989d6b54a7a4e2bdb2a" // example ObjectId
    };
    next();
  };
  
  module.exports = dummyAuth;
  