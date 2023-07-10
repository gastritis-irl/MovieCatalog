// Path: \public\script.js

async function addMovie(formData, fetchFunction = fetch) {
  const response = await fetchFunction('/add-movie', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    console.log(response);
    throw new Error('Error adding movie');
  }

  const responseData = await response.json(); // Convert response to JSON here
  console.log('Response from fetch(/add-movie): ', responseData);
  return responseData; // Return the response data
}

async function getMovies(formData, fetchFunction = fetch) {
  const queryParams = new URLSearchParams(formData).toString();

  const response = await fetchFunction(`/movies?${queryParams}`, {
    method: 'GET',
  });
  console.log(response);
  if (!response.success) {
    throw new Error('Error searching movies');
  }

  return response;
}

async function showDetails(event) {
  const movieId = event.target.parentNode.parentNode.id;
  try {
    const response = await fetch(`/api/movies/${movieId}`);
    if (!response.ok) throw new Error('Error fetching movie details');
    const movieDetails = await response.json();

    const { movie, user } = movieDetails.data; // access the nested movie object here
    const { genre, description, releaseYear } = movie;
    const { username, _id } = user;
    console.log('User who added movie:', username);

    const infoDiv = event.target.parentNode.querySelector('.extra-info');
    infoDiv.innerHTML = `<p class="detail">Genre: ${genre}</p><p class="detail">Description: ${description}</p><p class="detail">Year: ${releaseYear}</p><p class="detail">Added by: <a href="/users/${_id}">${username}</a></p>`;
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

// check if the form exists before adding event listener
const addMovieForm = document.getElementById('add-movie-form');
if (addMovieForm) {
  addMovieForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('Form Data:', [...formData]);

    try {
      const result = await addMovie(formData);
      alert(`Movie added with ID: ${result.data._id}`);

      // Create and display the new movie
      const newMovieDiv = createMovieDiv(result.data);
      const moviesList = document.getElementById('search-results'); // Assuming 'search-results' is the ID of your movies list
      moviesList.appendChild(newMovieDiv);
    } catch (error) {
      alert(error.message);
    }
  });
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

// Use the fetchWithAuth function when making requests

document.getElementById('search-movies-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  console.log('Form Data:', [...formData]);
  try {
    const results = await getMovies(formData);
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
  window.location.href = document.referrer || '/'; // fallback to '/' if document.referrer is empty
}

document.getElementById('home-button').addEventListener('click', () => {
  window.location.href = '/';
});
