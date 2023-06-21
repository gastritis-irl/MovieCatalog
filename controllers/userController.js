// Path: controllers\userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const config = require('../config.js');

exports.registerUser = async (req, res) => {
  const { username, password } = req.body;

  const user = new User({ username, password, role: 'user' });

  try {
    await user.save();
    const token = jwt.sign({ _id: user._id, role: user.role, username: user.username }, config.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });
    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ _id: user._id, role: user.role, username: user.username }, config.JWT_SECRET_KEY, {
      expiresIn: '1h',
    });
    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({
      message: 'User logged in successfully!',
      token,
      username,
      role: user.role,
    });
  } catch (err) {
    res.status(500).send(err);
  }
  return null;
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.redirect('/');
};

exports.verifyToken = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(403).send('Unauthorized');
  }

  try {
    const verified = jwt.verify(token, config.JWT_SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid Token');
  }
  return null;
};
