import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user; // Now you can access req.user.id, req.user.role, etc.
    next();
  });
};

export default authenticateToken;


// import mongoose from 'mongoose';
// import jwt from 'jsonwebtoken';

// function authenticateToken(req, res, next) {
//   const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

//   if (!token) {
//     // Mock the user with multiple valid ObjectIds for testing purposes
//     const mockUserIds = [
//       new mongoose.Types.ObjectId('60f7f8b4d72fbc001c8b0d21'),
//       new mongoose.Types.ObjectId('60f7f8b4d72fbc001c8b0d22'),
//       new mongoose.Types.ObjectId('60f7f8b4d72fbc001c8b0d23')
//     ];

//     // Here, you can switch between mock user IDs for different scenarios
//     req.user = { id: mockUserIds[1] };  // Switch index to use different ObjectId (1 for second ID)
//     return next();  // Proceed to the next middleware or route handler
//   }

//   // If token is provided, verify it (keep existing token validation logic)
//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403); // Forbidden
//     req.user = user; // Access user info
//     next();
//   });
// }

// export default authenticateToken;
