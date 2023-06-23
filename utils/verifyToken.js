// Path: \utils\verifyToken.js

const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const config = require('../config.js');

async function verifyToken(req, res, next) {
  // Get the token from the cookies
  const token = req.cookies['auth-token'];
  if (!token) return next(); // If there's no token, continue without error

  try {
    const verified = jwt.verify(token, config.JWT_SECRET_KEY);
    const user = await User.findById(verified._id);
    if (user) {
      req.user = user; // attach the user object to the request
      res.locals.user = user; // make the user object available in EJS templates
    }
  } catch (err) {
    console.error('Error verifying token:', err);
  }
  next();
  return null;
}

module.exports = { verifyToken };
