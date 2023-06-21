// Path: controllers\userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

exports.registerUser = async (req, res) => {
  const { username, password } = req.body;

  const user = new User({ username, password });

  try {
    await user.save();
    res.json({ username: user.username, _id: user._id });
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
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);

    res.header('auth-token', token).json(token);
  } catch (err) {
    res.status(500).send(err);
  }
  return null;
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Could not log out. Please try again');
    }
    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
};
