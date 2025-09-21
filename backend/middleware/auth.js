const passport = require('passport');

// Authenticate user
exports.authenticate = passport.authenticate('jwt', { session: false });

// Check if user is a manager
exports.isManager = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Manager role required.' });
};

// Check if user is a sales representative
exports.isSalesRep = (req, res, next) => {
  if (req.user && req.user.role === 'sales_representative') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Sales representative role required.' });
};

// Check if user is either manager or sales rep
exports.isAuthorized = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'sales_representative')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Unauthorized role.' });
};