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
    res.cookie('auth-token', token, { httpOnly: true });
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
  res.clearCookie('auth-token');
  res.status(200).json({ message: 'Logged out successfully' });
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

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render('404');
    }

    // Check if a user is logged in
    if (req.user) {
      // Render the page with the currentUserId property if a user is logged in
      res.render('user', { user, currentUser: req.user });
    } else {
      // Render the page without the currentUserId property if no user is logged in
      res.render('user', { user });
    }
  } catch (err) {
    next(err);
  }
  return null;
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    // console.log('Found Users:', users);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
    // res.status(500).json({ success: false, message: error.message });
  }
};
