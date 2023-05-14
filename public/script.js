import { addMovie, getMovies } from '../api/movie.js';

document.getElementById('add-movie-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    const result = await addMovie(formData);
    alert(`Movie added with ID: ${result.id}`);
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
