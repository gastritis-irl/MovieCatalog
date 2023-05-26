const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    unique: true,
    trim: true,
    maxlength: [50, 'Title can not be more than 50 characters'],
  },
  releaseYear: {
    type: Number,
    required: [true, 'Please add a release year'],
    min: [1888, 'Release year can not be before cinema was invented'],
    max: [new Date().getFullYear(), 'Release year can not be in the future'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  genre: {
    type: String,
    required: [true, 'Please add a genre'],
    enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Thriller', 'Western'], // add your own genres
  },
  coverImage: {
    type: String,
    default: 'default.jpg',
  },
});

module.exports = mongoose.model('Movie', MovieSchema);
