// Path: utils\validate.js

exports.validateReviewData = function validateReviewData(reviewData) {
  const { movieId, rating, review, userId } = reviewData;

  if (!movieId) {
    return { error: 'Movie ID is required' };
  }
  if (!rating || Number.isNaN(rating) || rating < 1 || rating > 10) {
    return { error: 'Rating should be a number between 1 and 10' };
  }
  if (!review) {
    return { error: 'Review is required' };
  }
  if (!userId) {
    return { error: 'User ID is required' };
  }

  return { success: true };
};

exports.validateMovieData = function validateMovieData(data) {
  if (!data.title) {
    return { error: 'Title is required' };
  }
  if (
    !data.releaseYear ||
    Number.isNaN(data.releaseYear) ||
    data.releaseYear < 1800 ||
    data.releaseYear > new Date().getFullYear()
  ) {
    return { error: 'Invalid release year' };
  }
  if (!data.description) {
    return { error: 'Description is required' };
  }
  if (!data.genre) {
    return { error: 'Genre is required' };
  }
  if (!data.coverImage) {
    return { error: 'Cover image is required' };
  }

  return { success: true };
};
