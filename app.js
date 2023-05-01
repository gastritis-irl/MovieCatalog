const express = require('express');
const path = require('path');
const multer = require('multer');
const connectDB = require('./db/database.js');
const Movie = require('./models/Movie.js');
const Review = require('./models/Review.js');

// Connect to the database
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());

// Set up multer storage destination and filename
/* This code is setting up the storage configuration for Multer, a middleware used for handling file
uploads in Node.js. */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/add-movie', upload.single('coverImage'), async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  try {
    const movie = new Movie({
      title: req.body.title,
      releaseYear: req.body.year,
      description: req.body.description,
      genre: req.body.genre,
      coverImage: req.file.path,
    });
    await movie.save();
    res.json({ success: true, data: movie, id: movie._id });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/movies/:movieId/reviews', async (req, res) => {
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

app.get('/search-movies', async (req, res) => {
  // Implement logic for searching movies
  try {
    const { title, genre, minYear, maxYear } = req.query;
    const query = Movie.find();

    if (title) query.where('title', new RegExp(title, 'i'));
    if (genre) query.where('genre', genre);
    if (minYear) query.where('releaseYear').gte(minYear);
    if (maxYear) query.where('releaseYear').lte(maxYear);

    const movies = await query.exec();
    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
