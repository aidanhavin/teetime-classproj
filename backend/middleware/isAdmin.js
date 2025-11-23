
const User = require('../models/User');

// Middleware to check if the user is an admin
async function isAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'Not authenticated.' });
    }
    // Fetch user from DB to check role and active status
    const user = await User.findById(req.user.id).select('role active');
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }
    // Check if user is active
    if (!user.active) {
      return res.status(403).json({ msg: 'Account is inactive.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access only.' });
    }

    req.adminUser = user;
    next();
  } catch (err) {
    console.error('isAdmin error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
}

module.exports = isAdmin;
