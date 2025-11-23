
const express = require('express');
const router = express.Router();

// Controllers and middleware
const { register, login, logout } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const User =require('../models/User');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// This route returns the current authenticated user's info
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email role');

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    console.error('/me error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
