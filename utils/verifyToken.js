// Path: \utils\verifyToken.js

const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const config = require('../config.js');

async function verifyToken(req, res, next) {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, config.JWT_SECRET_KEY);
    const user = await User.findById(verified._id);
    if (user) {
      req.user = user; // attach the user object to the request
      next();
    } else {
      res.status(401).send('Invalid user');
    }
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
  return null;
}

module.exports = { verifyToken };
