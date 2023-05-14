export async function submitReview(reviewData) {
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

export async function addMovie(formData) {
  const response = await fetch('/add-movie', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Error adding movie');
  }

  return response.json();
}

export async function getMovies(formData) {
  formData.set('title', formData.get('search-title'));
  formData.set('genre', formData.get('search-genre'));
  formData.set('minYear', formData.get('min-year'));
  formData.set('maxYear', formData.get('max-year'));
  formData.delete('search-title');
  formData.delete('search-genre');
  formData.delete('min-year');
  formData.delete('max-year');
  const queryParams = new URLSearchParams(formData).toString();

  const response = await fetch(`/movies?${queryParams}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Error searching movies');
  }

  return response.json();
}
