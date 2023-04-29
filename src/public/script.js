document.getElementById('add-movie-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const response = await fetch('/movies', {
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
  const response = await fetch(`/movies/${formData.get('movie-id')}/reviews`, {
    method: 'POST',
    body: formData,
  });

  if (response.ok) {
    alert('Review submitted successfully.');
  } else {
    alert('Error submitting review. Please check your input and try again.');
  }
});

document.getElementById('search-movies-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const queryParams = new URLSearchParams(formData).toString();
  const response = await fetch(`/movies?${queryParams}`, {
    method: 'GET',
  });

  if (response.ok) {
    const results = await response.json();
    displaySearchResults(results);
  } else {
    alert('Error searching movies. Please try again.');
  }
});

function displaySearchResults(results) {
  const resultsContainer = document.getElementById('search-results');
  resultsContainer.innerHTML = '';
  results.forEach((movie) => {
    const movieDiv = document.createElement('div');
    movieDiv.innerHTML = `<h3>${movie.title} (${movie.year})</h3>
                          <p>Genre: ${movie.genre}</p>
                          <p>Description: ${movie.description}</p>`;
    resultsContainer.appendChild(movieDiv);
  });
}
