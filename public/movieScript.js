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

const submitReviewFormElement = document.getElementById('submit-review-form');
if (submitReviewFormElement) {
  submitReviewFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const reviewData = {
      movieId: formData.get('movieId'),
      rating: formData.get('rating'),
      review: formData.get('review'),
      userId: formData.get('userId'),
    };
    console.log(reviewData);

    try {
      await submitReview(reviewData);
      alert('Review submitted successfully.');
      window.location.reload();
    } catch (error) {
      alert(`Error submitting review: ${error.message || 'Please check your input and try again.'}`);
    }
  });
}

document.querySelectorAll('.delete-review').forEach((button) => {
  button.addEventListener('click', async function deleteReview() {
    const reviewId = this.dataset.id; // dataset accesses all data-* attributes
    const movieId = document.getElementById('movie-id').value;
    try {
      const response = await fetch(`/movies/${movieId}/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        this.parentElement.remove();
        alert('Review deleted successfully');
      } else {
        const errorData = await response.json().catch((err) => console.error(err));
        throw new Error(errorData?.message || 'Error deleting review');
      }
    } catch (error) {
      alert('Failed to delete review');
    }
  });
});

const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  });
  window.location.href = document.referrer || '/'; // fallback to '/' if document.referrer is empty
}
