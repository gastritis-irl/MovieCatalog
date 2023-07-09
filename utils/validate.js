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

exports.validateMovieData = function validateMovieData(data, file) {
  if (!data.title) {
    return { error: { details: [{ message: 'Title is required' }] } };
  }
  if (
    !data.releaseYear ||
    Number.isNaN(data.releaseYear) ||
    data.releaseYear < 1800 ||
    data.releaseYear > new Date().getFullYear()
  ) {
    console.log('Invalid release year: ', data.releaseYear);
    return { error: { details: [{ message: 'Invalid release year' }] } };
  }
  if (!data.description) {
    return { error: { details: [{ message: 'Description is required' }] } };
  }
  if (!data.genre) {
    return { error: { details: [{ message: 'Genre is required' }] } };
  }
  // if (!data.coverImage) {
  //   console.log('Cover image is required', data.coverImage);
  //   console.log('Cover image is required', file);
  //   return { error: { details: [{ message: 'Cover image is required' }] } };
  // }
  if (!file) {
    console.log('Cover image is required', file);
    return { error: { details: [{ message: 'Cover image is required' }] } };
  }

  return { success: true };
};
