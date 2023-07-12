// Path: \app.js

const express = require('express');
const multer = require('multer');
// const session = require('express-session');
const cookieParser = require('cookie-parser');
// const jwt = require('jsonwebtoken');
const connectDB = require('./db/database.js');
const Movie = require('./models/Movie.js');
const { verifyToken } = require('./utils/verifyToken.js');
const { isAdmin } = require('./utils/isAdmin.js');
const { isUser } = require('./utils/isUser.js');
const movieController = require('./controllers/movieController.js');
const userController = require('./controllers/userController.js');
const reviewController = require('./controllers/reviewController.js');
const config = require('./config.js');

// Connect to the database
connectDB();

const app = express();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.set('view engine', 'ejs');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.get('/', verifyToken, async (req, res) => {
  const { title, genre, minYear, maxYear } = req.query;
  const query = Movie.find();

  if (title) query.where('title', new RegExp(title, 'i'));
  if (genre) query.where('genre', genre);
  if (minYear) query.where('releaseYear').gte(minYear);
  if (maxYear) query.where('releaseYear').lte(maxYear);

  const movies = await query.exec();
  res.render('index', { movies, user: req.user }); // Pass user object to the view
});

// route definitions
app.post('/register', userController.registerUser);
app.post('/login', userController.loginUser);
app.post('/logout', verifyToken, userController.logout);
app.post('/add-movie', verifyToken, upload.single('coverImage'), isUser, movieController.addMovie);
app.post('/movies/:movieId/reviews', verifyToken, isUser, reviewController.addReview);
app.get('/reviews', verifyToken, isAdmin, reviewController.getReviews);
app.get('/users', verifyToken, isAdmin, userController.getUsers);
app.get('/movies', verifyToken, movieController.getMovies);
app.get('/movies/:id', verifyToken, movieController.getMovieById);
app.get('/api/movies/:id', verifyToken, movieController.getApiMovieById);
app.get('/users/:id', verifyToken, userController.getUserById);
app.delete('/movies/:movieId/reviews/:reviewId', verifyToken, isUser, reviewController.deleteReview);
app.delete('/movies/:id', verifyToken, isAdmin, movieController.deleteMovie);
app.delete('/users/:id', verifyToken, isAdmin, userController.deleteUser);
app.delete('/reviews/:id', verifyToken, isUser, reviewController.deleteReview);

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

const PORT = config.PORT || 1234;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
  next(err);
});
