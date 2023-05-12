document.getElementById('add-movie-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const response = await fetch('/add-movie', {
    method: 'POST',
    body: formData,
  });

  if (response.ok) {
    const result = await response.json();
    alert(`Movie added with ID: ${result.id}`);
  } else {
    alert('Error adding movie. Please check your input and try again.');
  }
});

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
  } else {
    const errorData = await response.json().catch((err) => console.error(err));
    alert(`Error submitting review: ${errorData?.message || 'Please check your input and try again.'}`);
  }
});

function createMovieDiv(movie) {
  const movieDiv = document.createElement('div');
  movieDiv.className = 'movie';

  const title = document.createElement('h3');
  title.textContent = movie.title;
  movieDiv.appendChild(title);

  const year = document.createElement('p');
  year.textContent = `Year: ${movie.releaseYear}`;
  movieDiv.appendChild(year);

  const genre = document.createElement('p');
  genre.textContent = `Genre: ${movie.genre}`;
  movieDiv.appendChild(genre);

  const description = document.createElement('p');
  description.textContent = `Description: ${movie.description}`;
  movieDiv.appendChild(description);

  return movieDiv;
}

function displaySearchResults(results) {
  console.log('Displaying search results:', results);

  const searchResultsDiv = document.getElementById('search-results');
  searchResultsDiv.innerHTML = '';

  if (results.success) {
    results.data.forEach((movie) => {
      const movieDiv = createMovieDiv(movie);
      searchResultsDiv.appendChild(movieDiv);
    });
  } else {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Error fetching search results.';
    searchResultsDiv.appendChild(errorMessage);
  }
}

document.getElementById('search-movies-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
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

  if (response.ok) {
    const results = await response.json();
    console.log('Search results:', results);
    displaySearchResults(results);
  } else {
    alert('Error searching movies. Please try again.');
  }
});
