import { submitReview } from '../api/movie.js';

document.getElementById('submit-review-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const reviewData = {
    movieId: formData.get('movieId'),
    rating: formData.get('rating'),
    review: formData.get('review'),
  };

  try {
    await submitReview(reviewData);
    alert('Review submitted successfully.');
    window.location.reload(); // reload the page to show the new review
  } catch (error) {
    alert(`Error submitting review: ${error.message || 'Please check your input and try again.'}`);
  }
});
