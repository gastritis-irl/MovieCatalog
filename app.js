const express = require('express');
// const path = require('path');
const multer = require('multer');
// const jwt = require('jsonwebtoken');
const connectDB = require('./db/database.js');
const Movie = require('./models/Movie.js');
const Review = require('./models/Review.js');
const User = require('./models/User.js');

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
app.use(express.static('public/uploads'));
app.use('/uploads', express.static('uploads'));

app.set('view engine', 'ejs');

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

  // In a real-world application, you'd want to validate this data and hash the password.

  const user = new User({ username, password });

  try {
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // In a real-world application, you'd want to validate this data.

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }

    // Check password
    if (user.password !== password) {
      // In a real-world application, you'd want to hash the password and compare the hashed values.
      return res.status(400).send('Invalid password');
    }

    res.json(user); // In a real-world application, you'd want to create a token here and send it to the user.
  } catch (err) {
    res.status(400).send(err);
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
    res.redirect(`/movies/${movie._id}`);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
  return null;
});

app.post('/movies/:movieId/reviews', validateReviewData, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating, review } = req.body;

    const newReview = new Review({
      movieId,
      rating,
      review,
    });

    await newReview.save();
    res.json({ success: true, data: newReview });
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

app.use((err, req, res) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
});
