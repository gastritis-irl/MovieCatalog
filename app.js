// Path: \app.js

const express = require('express');
const multer = require('multer');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const connectDB = require('./db/database.js');
const Movie = require('./models/Movie.js');
const { verifyToken } = require('./utils/verifyToken.js');
const { isAdmin } = require('./utils/isAdmin.js');
const { validateReviewData } = require('./utils/validate.js');
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

/* here, secret is used to sign the session ID cookie, resave forces the session to be saved back to the session store, 
saveUninitialized forces a session that is "uninitialized" to be saved to the store 
and cookie settings are used to set properties on the session ID cookie. */
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Don't save a session until something is stored
    cookie: { secure: true }, // Use this if your website uses HTTPS. Set it to false if not using HTTPS.
  }),
);

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
  const token = req.headers.authorization?.split(' ')[1];
  let user;

  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).send('Failed to authenticate token');
    }
  }

  const { title, genre, minYear, maxYear } = req.query;
  const query = Movie.find();

  if (title) query.where('title', new RegExp(title, 'i'));
  if (genre) query.where('genre', genre);
  if (minYear) query.where('releaseYear').gte(minYear);
  if (maxYear) query.where('releaseYear').lte(maxYear);

  const movies = await query.exec();
  res.render('index', { movies, user }); // Pass user object to the view

  return null;
});

// route definitions
app.post('/register', userController.registerUser);
app.post('/login', userController.loginUser);
app.get('/logout', userController.logout);
app.get('/movies', verifyToken, movieController.getMovies);
app.get('/movies/:id', movieController.getMovieById);
app.post('/add-movie', upload.single('coverImage'), movieController.addMovie);
app.get('/api/movies/:id', movieController.getApiMovieById);
app.post('/movies/:movieId/reviews', verifyToken, validateReviewData, reviewController.addReview);
app.get('/reviews', reviewController.getReviews);
app.delete('/movies/:movieId/reviews/:reviewId', verifyToken, reviewController.deleteReview);
app.delete('/movies/:movieId', verifyToken, isAdmin, movieController.deleteMovie);

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
