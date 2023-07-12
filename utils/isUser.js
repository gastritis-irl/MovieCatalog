// Path: /utils/isUser.js

const isUser = (req, res, next) => {
  if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).send('Only users or admins can perform this action');
  }
};

module.exports = { isUser };
