// Path: \utils\verifyToken.js

const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const config = require('../config.js');

async function verifyToken(req, res, next) {
  // Get the token from the cookies
  const token = req.cookies['auth-token'];
  if (!token) {
    console.log('No token found');
    return next(); // If there's no token, just continue
  }

  try {
    const verified = jwt.verify(token, config.JWT_SECRET_KEY);
    const user = await User.findById(verified._id);
    if (user) {
      req.user = user; // attach the user object to the request
      res.locals.user = user; // make the user object available in EJS templates
    }
  } catch (err) {
    console.error('Error verifying token:', err);
    res.clearCookie('auth-token'); // clear the cookie if token is not valid or user not found
  }
  next();
  return null;
}

module.exports = { verifyToken };
