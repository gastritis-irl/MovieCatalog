// config.js
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 1234,
  SESSION_SECRET: process.env.SESSION_SECRET,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
};
