// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function auth(req, res, next) {
  let token;

  // First try Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  // Then try HttpOnly cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token at all
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach user info to request object for downstream use
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error('JWT verify error:', err);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
}

module.exports = auth;
