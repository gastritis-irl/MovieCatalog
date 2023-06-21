// Path: controllers\reviewController.js

const Review = require('../models/Review.js');
// const { validateReviewData } = require('../utils/validate.js');

exports.addReview = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating, review } = req.body;

    const newReview = new Review({
      movieId,
      userId: req.body.userId,
      rating,
      review,
    });

    await newReview.save();
    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { movieId, reviewId } = req.params;
    console.log('Deleting review with id:', reviewId, 'for movie:', movieId);

    // First, check if the review with the provided ID exists
    const review = await Review.findOne({ _id: reviewId, movieId });

    console.log('Review found:', review);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Then delete it
    await Review.deleteOne({ _id: reviewId });

    return res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting the review:', error);
    return res.status(500).json({ success: false, message: 'Error deleting the review' });
  }
};

exports.getReviews = async (req, res) => {
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
};
