document.getElementById('submit-review-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const reviewData = {
    movieId: formData.get('movieId'),
    rating: formData.get('rating'),
    review: formData.get('review'),
  };

  const response = await fetch(`/movies/${reviewData.movieId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });

  if (response.ok) {
    alert('Review submitted successfully.');
    window.location.reload(); // reload the page to show the new review
  } else {
    const errorData = await response.json().catch((err) => console.error(err));
    alert(`Error submitting review: ${errorData?.message || 'Please check your input and try again.'}`);
  }
});
