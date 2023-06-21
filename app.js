// Path: \app.js

const express = require('express');
// const path = require('path');
const multer = require('multer');
const session = require('express-session');
const connectDB = require('./db/database.js');
const Movie = require('./models/Movie.js');
const { verifyToken } = require('./utils/verifyToken.js');
const { validateReviewData } = require('./utils/validate.js');
const movieController = require('./controllers/movieController.js');
const userController = require('./controllers/userController.js');
const reviewController = require('./controllers/reviewController.js');
// const config = require('./config.js');

// Connect to the database
connectDB();

const app = express();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

/* here, secret is used to sign the session ID cookie, resave forces the session to be saved back to the session store, 
saveUninitialized forces a session that is "uninitialized" to be saved to the store 
and cookie settings are used to set properties on the session ID cookie. */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: 'auto' },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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

app.get('/', async (req, res) => {
  const { title, genre, minYear, maxYear } = req.query;
  const query = Movie.find();

  if (title) query.where('title', new RegExp(title, 'i'));
  if (genre) query.where('genre', genre);
  if (minYear) query.where('releaseYear').gte(minYear);
  if (maxYear) query.where('releaseYear').lte(maxYear);

  const movies = await query.exec();
  res.render('index', { movies, user: req.session.user }); // Pass user object to the view
});

// route definitions
app.post('/register', userController.registerUser);
app.post('/login', userController.loginUser);
app.get('/logout', userController.logout);
app.get('/movies', movieController.getMovies);
app.get('/movies/:id', movieController.getMovieById);
app.post('/add-movie', upload.single('coverImage'), movieController.addMovie);
app.get('/api/movies/:id', movieController.getApiMovieById);
app.post('/movies/:movieId/reviews', verifyToken, validateReviewData, reviewController.addReview);
app.get('/reviews', reviewController.getReviews);
app.delete('/movies/:movieId/reviews/:reviewId', verifyToken, reviewController.deleteReview);

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

const PORT = process.env.PORT || 1234;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
  next(err);
});
