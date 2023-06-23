// Path: controllers\userController.js

const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const config = require('../config.js');

exports.registerUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign({ _id: user._id, role: user.role, username: user.username }, config.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });
    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({ message: 'User registered successfully!' });
  } catch (err) {
    next(err); // delegate error handling to middleware
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      const error = new Error('User not found');
      error.status = 401;
      throw error;
    }

    const validPassword = await user.checkPassword(req.body.password);
    if (!validPassword) {
      const error = new Error('Invalid password');
      error.status = 401;
      throw error;
    }

    const token = jwt.sign({ _id: user._id, role: user.role, username: user.username }, config.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });
    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({
      message: 'User logged in successfully!',
      token,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    next(err); // delegate error handling to middleware
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.redirect('/');
};

exports.verifyToken = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    const error = new Error('Unauthorized');
    error.status = 403;
    throw error;
  }

  try {
    const verified = jwt.verify(token, config.JWT_SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    const error = new Error('Invalid Token');
    error.status = 400;
    throw error;
  }
};

exports.getMe = async (req, res, next) => {
  try {
    // Verify the token and return the user's details
    const user = await User.findById(req.user.username).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
  return null;
};
