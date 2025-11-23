// backend/middleware/requireAdmin.js
const User = require('../models/User');

async function requireAdmin(req, res, next) {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'Not authenticated.' });
    }

    const user = await User.findById(req.user.id);
    // Check if user exists
    if (!user) {
      return res.status(401).json({ msg: 'User not found.' });
    }
    // Check if user is active
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admin access required.' });
    }

    // exposes role if needed
    req.user.role = user.role;
    next();
  } catch (err) {
    console.error('requireAdmin error:', err);
    return res.status(500).json({ msg: 'Server error.' });
  }
}

module.exports = requireAdmin;
