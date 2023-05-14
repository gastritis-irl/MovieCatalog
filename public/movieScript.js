// Purpose: To handle the movie page
//
// Path: \public\movieScript.js

async function submitReview(reviewData) {
  const response = await fetch(`/movies/${reviewData.movieId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });

  // If the response is not ok, throw an error
  if (!response.ok) {
    const errorData = await response.json().catch((err) => console.error(err));
    throw new Error(errorData?.message || 'Error submitting review');
  }
}

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
