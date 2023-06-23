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
  formData.set('title', formData.get('title'));
  formData.set('genre', formData.get('genre'));
  formData.set('minYear', formData.get('minYear'));
  formData.set('maxYear', formData.get('maxYear'));
  const queryParams = new URLSearchParams(formData).toString();

  const response = await fetch(`/movies?${queryParams}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Error searching movies');
  }

  return response.json();
}

// check if the form exists before adding event listener
const addMovieForm = document.getElementById('add-movie-form');
if (addMovieForm) {
  addMovieForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const result = await addMovie(formData);
      alert(`Movie added with ID: ${result.movie._id}`);
    } catch (error) {
      alert(error.message);
    }
  });
}

async function showDetails(event) {
  const movieId = event.target.parentNode.parentNode.id;
  try {
    const response = await fetch(`/api/movies/${movieId}`);
    if (!response.ok) throw new Error('Error fetching movie details');
    const movieDetails = await response.json();

    const { movie } = movieDetails.data; // access the nested movie object here
    const { genre, description, releaseYear } = movie;

    const infoDiv = event.target.parentNode.querySelector('.extra-info');
    infoDiv.innerHTML = `<p class = "detail" >Genre: ${genre}</p><p class = "detail">Description: ${description}</p><p class = "detail">Year: ${releaseYear}</p>`;
    infoDiv.style.display = 'block';
  } catch (err) {
    console.error(`Error fetching movie details: ${err}`);
  }
}

function createMovieDiv(movie) {
  const movieDiv = document.createElement('div');
  movieDiv.className = 'movie';
  movieDiv.id = movie._id;

  const title = document.createElement('h3');
  title.textContent = movie.title;
  movieDiv.appendChild(title);

  const coverImage = document.createElement('img');
  coverImage.src = `/${movie.coverImage.replace('public\\', '')}`;
  coverImage.alt = `${movie.title} Cover Image`;
  coverImage.className = 'cover-image';
  movieDiv.appendChild(coverImage);

  const year = document.createElement('p');
  year.textContent = `Year: ${movie.releaseYear}`;
  movieDiv.appendChild(year);

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';

  const detailsButton = document.createElement('button');
  detailsButton.className = 'details';
  detailsButton.textContent = 'Show Details';
  detailsButton.addEventListener('click', showDetails);
  buttonContainer.appendChild(detailsButton);

  const extraInfoDiv = document.createElement('div');
  extraInfoDiv.className = 'extra-info';
  extraInfoDiv.style.display = 'none';
  buttonContainer.appendChild(extraInfoDiv);

  const movieLink = document.createElement('a');
  movieLink.href = `/movies/${movie._id}`;
  movieLink.textContent = `${movie.title}'s Page`;
  buttonContainer.appendChild(movieLink);

  movieDiv.appendChild(buttonContainer);

  return movieDiv;
}

function displaySearchResults(results) {
  const searchResultsDiv = document.getElementById('search-results');
  console.log('Search Results Div:', searchResultsDiv);
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
document.querySelectorAll('.details').forEach((button) => {
  button.addEventListener('click', showDetails);
});

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('authToken');
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Error making request to ${url}: ${response.status}`);
  }

  return response.json();
}

// Use the fetchWithAuth function when making requests

document.getElementById('search-movies-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  console.log('Form Data:', [...formData]);
  try {
    const results = await getMovies(formData, fetchWithAuth);
    displaySearchResults(results);
  } catch (error) {
    alert(error.message);
  }
});

const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  });
}
