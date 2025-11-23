
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const isProd = process.env.NODE_ENV === 'production';

// helper: creates jwt once
function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. basic fields
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please fill all fields.' });
    }

    // 2. check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: 'User with that email already exists.' });
    }

    // 3. hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. creates user in DB with hashed password
    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
    });

    // 5. optional: make token on signup (auto-login on register)
    const token = signToken(user._id);

    // set HttpOnly cookie (Secure in prod)
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,                    // requires HTTPS in production
      sameSite: isProd ? 'none' : 'lax', // cross site support when needed
      maxAge: 24 * 60 * 60 * 1000,       // 1 day
      partitioned: true,                 // ok if browser supports CHIPS
    });

    return res.status(201).json({
  msg: 'User created successfully',
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
  token, 
});
// 6. return user info and token
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: 'Please fill all fields.' });
    }

    // 1. check user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials.' });

    // 2. compare password using passwordHash
    const isMatch = await user.comparePassword(password);
    // or: const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

    // 3. sign token
    const token = signToken(user._id);

    // set HttpOnly cookie (Secure in prod)
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      partitioned: true,
    });

    return res.json({
  msg: 'Logged in',
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role:user.role,
  },
  token, 
});

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// POST /api/auth/logout  (clear cookie)
exports.logout = async (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  return res.json({ msg: 'Logged out' });
};
