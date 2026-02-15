const jwt = require('jsonwebtoken');

// 1. Verify Token (Authentication)
// This checks if the user is actually logged in.
const protect = (req, res, next) => {
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded.user; // Add the user info to the request object
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// 2. Check Role (Authorization)
// This checks if the user is an Admin, Staff, or Student.
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        msg: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

// 3. Check Canteen Permissions
// For canteen admins: checks if they can manage the specified canteen
const checkCanteenPermission = async (req, res, next) => {
  try {
    const User = require('../models/Auth/User');
    
    // Get the user from database to check managedCanteen
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Only canteen_admin role needs this check
    if (user.role === 'canteen_admin') {
      // If managedCanteen is set (specific canteen admin)
      if (user.managedCanteen) {
        // Get the canteen from request body or query
        const requestedCanteen = req.body.canteen || req.query.canteen;
        
        // Check if they're trying to access a canteen they don't manage
        if (requestedCanteen && requestedCanteen !== user.managedCanteen) {
          return res.status(403).json({ 
            msg: `You can only manage '${user.managedCanteen}' canteen` 
          });
        }
      }
      // If managedCanteen is null, they are super admin and can manage all
    }

    // Attach user to request for later use
    req.userDetails = user;
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error checking permissions', error: err.message });
  }
};

module.exports = { protect, authorize, checkCanteenPermission };