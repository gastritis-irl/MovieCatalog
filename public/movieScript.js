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

function updateUserId() {
  // Get the selected user's ID
  const userId = document.getElementById('user-id').value;

  // Update the hidden input's value
  document.getElementById('user-id-hidden').value = userId;
}

// Attach the event listener to the dropdown on page load
window.onload = function onload() {
  const userDropdown = document.getElementById('user');

  if (userDropdown) {
    userDropdown.addEventListener('change', updateUserId);

    // Call the function once to set the initial value
    updateUserId();
  }
};

document.getElementById('submit-review-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const reviewData = {
    movieId: formData.get('movieId'),
    rating: formData.get('rating'),
    review: formData.get('review'),
    userId: formData.get('userId'),
  };

  try {
    await submitReview(reviewData);
    alert('Review submitted successfully.');
    window.location.reload();
  } catch (error) {
    alert(`Error submitting review: ${error.message || 'Please check your input and try again.'}`);
  }
});

document.querySelectorAll('.delete-review').forEach((button) => {
  button.addEventListener('click', async function deleteReview() {
    const reviewId = this.parentElement.id;
    const movieId = document.getElementById('movieId').value;
    const response = await fetch(`/movies/${movieId}/reviews/${reviewId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      this.parentElement.remove();
      alert('Review deleted successfully');
    } else {
      alert('Failed to delete review');
    }
  });
});
