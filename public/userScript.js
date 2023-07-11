// Path: \public\userScript.js

async function deleteMovie(movieId) {
  try {
    const response = await fetch(`/api/movies/${movieId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting movie');
    // Refresh the page to show that the movie has been deleted
    window.location.reload();
  } catch (err) {
    console.error(`Error deleting movie: ${err}`);
  }
}

window.deleteMovie = deleteMovie;

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

const deleteReviewButton = document.getElementById('delete-review-button');
if (deleteReviewButton) {
  deleteReviewButton.addEventListener('click', async () => {
    const { movieId } = deleteReviewButton.dataset;
    const { reviewId } = deleteReviewButton.dataset;
    try {
      const response = await fetch(`/movies/${movieId}/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Review deleted successfully');
        window.location.reload();
      } else {
        const errorData = await response.json().catch((err) => console.error(err));
        throw new Error(errorData?.message || 'Error deleting review');
      }
    } catch (error) {
      alert(`Error deleting review: ${error.message || 'An unknown error occurred.'}`);
    }
  });
}

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
