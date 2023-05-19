// Path: \app.js

const express = require('express');
// const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./db/database.js');
const Movie = require('./models/Movie.js');
const Review = require('./models/Review.js');
const User = require('./models/User.js');
require('dotenv').config();

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
// app.use('movies/public/uploads', express.static('public/uploads'));
// app.use('/public/uploads', express.static('uploads'));

app.set('view engine', 'ejs');

// function verifyToken(req, res, next) {
//   const token = req.header('auth-token');
//   if (!token) return res.status(401).send('Access Denied');

//   try {
//     const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
//     req.user = verified;
//     next();
//   } catch (err) {
//     res.status(400).send('Invalid Token');
//   }
//   return null;
// }

function validateReviewData(req, res, next) {
  const { movieId } = req.params;
  const { rating, review } = req.body;
  const reviewData = { movieId, rating, review };

  if (!reviewData.movieId) {
    return res.status(400).json({ success: false, message: 'Movie ID is required' });
  }
  if (!reviewData.rating || Number.isNaN(reviewData.rating) || reviewData.rating <= 1 || reviewData.rating >= 10) {
    return res.status(400).json({ success: false, message: 'Rating should be a number between 1 and 10' });
  }
  if (!reviewData.review) {
    return res.status(400).json({ success: false, message: 'Review is required' });
  }

  next();
  return { success: true };
}

function validateMovieData(data) {
  if (!data.title) {
    return { valid: false, message: 'Title is required' };
  }
  if (
    !data.releaseYear ||
    Number.isNaN(data.releaseYear) ||
    data.releaseYear < 1800 ||
    data.releaseYear > new Date().getFullYear()
  ) {
    return { valid: false, message: 'Invalid release year' };
  }
  if (!data.description) {
    return { valid: false, message: 'Description is required' };
  }
  if (!data.genre) {
    return { valid: false, message: 'Genre is required' };
  }
  if (!data.coverImage) {
    return { valid: false, message: 'Cover image is required' };
  }

  return { valid: true };
}

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
  res.render('index', { movies });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const user = new User({ username, password });

  try {
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return next(new Error('User not found')); // Pass the error to the next middleware function
    }

    // Compare hashed password with input password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return next(new Error('Invalid password')); // Pass the error to the next middleware function
    }

    // Create a token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY); // Use environment variable for JWT secret

    res.header('auth-token', token).json(token);
  } catch (err) {
    next(err); // Pass any other errors to the next middleware function
  }
  return null;
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/movies/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const movie = await Movie.findById(id);
    const reviews = await Review.find({ movieId: id });

    res.render('movie', { movie, reviews });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/add-movie', upload.single('coverImage'), async (req, res) => {
  const movieData = {
    title: req.body.title,
    releaseYear: req.body.year,
    description: req.body.description,
    genre: req.body.genre,
    coverImage: req.file.path,
  };

  const validationResult = validateMovieData(movieData);
  if (!validationResult.valid) {
    return res.status(400).json({ success: false, message: validationResult.message });
  }

  try {
    const movie = new Movie(movieData);
    await movie.save();
    res.json({ success: true, movie });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
  return null;
});

app.post('/movies/:movieId/reviews', /* verifyToken, */ validateReviewData, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating, review } = req.body;

    const newReview = new Review({
      movieId,
      rating,
      review,
    });

    await newReview.save();

    const movie = await Movie.findById(movieId);
    const reviews = await Review.find({ movieId });

    res.render('movie', { movie, reviews });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get('/movies', async (req, res) => {
  try {
    const { title, genre, minYear, maxYear } = req.query;
    const query = Movie.find();

    if (title) query.where('title', new RegExp(title, 'i'));
    if (genre) query.where('genre', genre);
    if (minYear) query.where('releaseYear').gte(minYear);
    if (maxYear) query.where('releaseYear').lte(maxYear);

    const movies = await query.exec();
    console.log('Found Movies:', movies);
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get('/reviews', async (req, res) => {
  const { movieId } = req.query;

  if (!movieId) {
    return res.status(400).json({ success: false, message: 'Movie ID is required' });
  }

  try {
    const reviews = await Review.find({ movieId });

    return res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
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
