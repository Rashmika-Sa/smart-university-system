const jwt = require('jsonwebtoken');

// 1. Verify Token (Authentication)
// This checks if the user is actually logged in.
const protect = (req, res, next) => {
  // Get token from request header (x-auth-token)
  const token = req.header('x-auth-token');

  // Check if no token provided — deny access immediately
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify the token is valid and not expired
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded.user; // Add the user info to the request object so next middleware can use it
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// 2. Check Role (Authorization)
// This checks if the user is an Admin, Staff, or Student.
// Usage: authorize('admin', 'library_admin') — pass allowed roles as arguments
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the logged-in user's role is in the allowed roles list
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
    
    // Get the full user record from database to check managedCanteen field
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Only canteen_admin role needs this permission check
    if (user.role === 'canteen_admin') {
      // If managedCanteen is set, this admin only manages one specific canteen
      if (user.managedCanteen) {
        // Get the canteen being requested from body or query params
        const requestedCanteen = req.body.canteen || req.query.canteen;
        
        // Check if they're trying to access a canteen they don't manage
        if (requestedCanteen && requestedCanteen !== user.managedCanteen) {
          return res.status(403).json({ 
            msg: `You can only manage '${user.managedCanteen}' canteen` 
          });
        }
      }
      // If managedCanteen is null, they are super admin and can manage all canteens
    }

    // Attach full user details to request for use in next middleware or controller
    req.userDetails = user;
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error checking permissions', error: err.message });
  }
};

// ── Library Module Middleware ──────────────────────────────────────────────────
// These are used exclusively by library routes and do not affect any other routes.

// libraryProtect — same as protect, ensures user is logged in before accessing library routes
const libraryProtect = protect;

// libraryAdmin — only allows 'admin' and 'library_admin' roles to access admin library routes
const libraryAdmin = authorize('admin', 'library_admin');

module.exports = { 
  protect, 
  authorize, 
  checkCanteenPermission,
  // Library middleware exports — used only by library routes
  libraryProtect,
  libraryAdmin,
};