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
    try {
      const response = await fetch(`/reviews/${reviewId}`, {
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

document.querySelectorAll('.delete-movie').forEach((button) => {
  button.addEventListener('click', async function deleteMovie() {
    const movieId = this.dataset.id;

    try {
      const response = await fetch(`/movies/${movieId}`, {
        method: 'DELETE',
      });
      console.log(response);
      if (response.ok) {
        window.location.href = document.referrer || '/';
        alert('Movie deleted successfully');
      } else {
        const errorData = await response.json().catch((err) => console.error(err));
        throw new Error(errorData?.message || 'Error deleting movie');
      }
    } catch (error) {
      console.log(error);
      alert('Failed to delete movie');
    }
  });
});

const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin', // required to include cookies with the request
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('role');

        alert('Logged out successfully');
        window.location.reload();
      } else {
        const errorData = await response.json().catch((err) => console.error(err));
        throw new Error(errorData?.message || 'Error during logout');
      }
    } catch (error) {
      alert(`Error during logout: ${error.message || 'An unknown error occurred.'}`);
    }
  });
}

document.getElementById('home-button').addEventListener('click', () => {
  window.location.href = '/';
});
