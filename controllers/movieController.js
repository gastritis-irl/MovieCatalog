// Path: controllers\movieController.js

const Movie = require('../models/Movie.js');
const Review = require('../models/Review.js');
const User = require('../models/User.js');
// const isAdmin = require('../utils/isAdmin.js');
const { validateMovieData } = require('../utils/validate.js');

exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({});
    res.status(200).json({ success: true, data: movies });
  } catch (err) {
    next(err);
  }
};

exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).render('404');
    }
    const reviews = await Review.find({ movieId: req.params.id });
    const users = await User.find();
    res.render('movie', { movie, reviews, users });
  } catch (err) {
    next(err);
  }
  return null;
};

exports.addMovie = async (req, res, next) => {
  try {
    const { error, value } = validateMovieData(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const newMovie = new Movie(value);
    newMovie.coverImage = req.file.path;
    const movie = await newMovie.save();
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
    const users = await User.find();

    // Structure the response data as needed, this is just a simple example
    const response = { movie, reviews, users };

    res.status(200).json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
  return null;
};

exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    await Movie.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, message: 'Movie deleted successfully' });
  } catch (err) {
    next(err);
  }
  return null;
};
