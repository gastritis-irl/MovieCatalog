// Path: controllers\movieController.js

const Movie = require('../models/Movie.js');
const Review = require('../models/Review.js');
const User = require('../models/User.js');
// const isAdmin = require('../utils/isAdmin.js');
const { validateMovieData } = require('../utils/validate.js');

exports.getMovies = async (req, res) => {
  try {
    // const token = req.headers.authorization?.split(' ')[1];
    let user;

    // if (token) {
    //   try {
    //     user = jwt.verify(token, config.JWT_SECRET);
    //   } catch (err) {
    //     return res.status(401).send('Failed to authenticate token');
    //   }
    // }

    const { title, genre, minYear, maxYear } = req.query;
    console.log('Query:', req.query);
    const query = Movie.find();

    if (title) query.where('title', new RegExp(title, 'i'));
    if (genre) query.where('genre', genre);
    if (minYear) query.where('releaseYear').gte(minYear);
    if (maxYear) query.where('releaseYear').lte(maxYear);

    const movies = await query.exec();
    console.log('Found Movies:', movies);
    res.json({ success: true, data: movies, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
  return null;
};

exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).render('404');
    }
    const reviews = await Review.find({ movieId: req.params.id });
    const users = await User.find(); // fetch all users
    console.log('User:', req.user);
    res.render('movie', { movie, reviews, users });
  } catch (err) {
    next(err);
  }
  return null;
};

exports.addMovie = async (req, res, next) => {
  try {
    const validation = validateMovieData(req.body, req.file);
    if (validation.error) {
      console.log('Validation:', validation.error.details[0].message);
      return res.status(400).json({ success: false, message: validation.error.details[0].message });
    }

    const movieDetails = req.body;
    movieDetails.userId = req.user._id; // Add the user ID to the movie details
    console.log('Movie Details:', movieDetails);

    const newMovie = new Movie(movieDetails);
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }
    newMovie.coverImage = req.file.path;
    const movie = await newMovie.save();
    console.log('New Movie:', movie);

    // Add movie to user's movie list
    await User.findByIdAndUpdate(req.user._id, { $push: { movies: movie._id } });

    res.status(201).json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
  return null;
};

exports.getApiMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const reviews = await Review.find({ movieId: id });
    const user = await User.findById(movie.userId); // use findById instead of find
    console.log('User:', user);

    // Structure the response data as needed, this is just a simple example
    const response = { movie, reviews, user };

    res.status(200).json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
  return null;
};

exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    console.log('MovieId:', req.params.id);
    console.log('Movie:', movie);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    await Movie.deleteOne({ _id: movie._id });
    res.status(200).json({ success: true, message: 'Movie deleted successfully' });
  } catch (err) {
    next(err);
  }
  return null;
};
