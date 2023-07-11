// Path: controllers\reviewController.js

const Review = require('../models/Review.js');
const User = require('../models/User.js');
// const { validateReviewData } = require('../utils/validate.js');

exports.addReview = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating, review } = req.body;
    console.log('User:', req.user);

    const newReview = new Review({
      movieId,
      userId: req.user._id,
      rating,
      review,
    });
    // console.log('New review:', newReview);

    const reviewcheck = await newReview.save();
    console.log('Review check: ', reviewcheck);
    const reviewAdded = await User.findByIdAndUpdate(req.user._id, { $push: { reviews: review._id } });
    console.log('Review added to user: ', reviewAdded);

    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    // First, check if the review with the provided ID exists
    const review = await Review.findOne({ _id: req.params.id });

    console.log('Review found:', review);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Then check if the user is authorized to delete the review
    // console.log('Review user ID:', review.userId);
    if (req.user._id !== review.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this review' });
    }

    // Then delete it
    await Review.deleteOne({ _id: req.params.id });

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
