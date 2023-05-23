// Purpose: Client-side JavaScript for the movie app
//
// Path: \public\script.js

async function addMovie(formData) {
  const response = await fetch('/add-movie', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Error adding movie');
  }

  return response.json();
}

async function getMovies(formData) {
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

document.getElementById('add-movie-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    const result = await addMovie(formData);
    alert(`Movie added with ID: ${result.movie._id}`);
  } catch (error) {
    alert(error.message);
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

  try {
    const results = await getMovies(formData);
    displaySearchResults(results);
  } catch (error) {
    alert(error.message);
  }
});
