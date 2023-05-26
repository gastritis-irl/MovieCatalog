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

  const detailsButton = document.createElement('button');
  detailsButton.className = 'details';
  detailsButton.textContent = 'Show Details';

  const extraInfoDiv = document.createElement('div');
  extraInfoDiv.className = 'extra-info';
  extraInfoDiv.style.display = 'none';
  movieDiv.appendChild(extraInfoDiv);

  // Add event listener to the details button
  detailsButton.addEventListener('click', async () => {
    // Fetch and display movie details
    // Make sure your server provides an endpoint that gives more detailed information about a movie
    try {
      const response = await fetch(`/movies/${movie._id}`);
      const movieDetails = await response.json();

      if (response.ok) {
        extraInfoDiv.textContent = `More Details: Genre - ${movieDetails.genre}, Description - ${movieDetails.description}`;
        extraInfoDiv.style.display = 'block';
      } else {
        throw new Error(`Error fetching movie details: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
    }
  });

  return movieDiv;
}

async function showDetails() {
  const movieId = this.parentElement.id;
  try {
    const response = await fetch(`/api/movies/${movieId}`);

    if (!response.ok) {
      throw new Error(`Error fetching movie details: ${response.status}`);
    }

    const movieDetails = await response.json();

    // Update the movie details in the DOM
    const infoDiv = this.nextElementSibling;
    infoDiv.style.display = 'block';

    // Clear the content of infoDiv if there's anything in it
    infoDiv.innerHTML = '';

    // Create and append movie details with new classes
    const movieTitle = document.createElement('p');
    movieTitle.textContent = `Title: ${movieDetails.movie.title}`;
    movieTitle.classList.add('detail');
    infoDiv.appendChild(movieTitle);

    const movieGenre = document.createElement('p');
    movieGenre.textContent = `Genre: ${movieDetails.movie.genre}`;
    movieGenre.classList.add('detail');
    infoDiv.appendChild(movieGenre);

    const movieDescription = document.createElement('p');
    movieDescription.textContent = `Description: ${movieDetails.movie.description}`;
    movieDescription.classList.add('detail');
    infoDiv.appendChild(movieDescription);

    const movieYear = document.createElement('p');
    movieYear.textContent = `Year: ${movieDetails.movie.releaseYear}`;
    movieYear.classList.add('detail');
    infoDiv.appendChild(movieYear);

    // ... and so on, for each detail you want to display
  } catch (error) {
    console.error('Error fetching movie details:', error);
  }
}

function displaySearchResults(results) {
  const searchResultsDiv = document.getElementById('search-results');
  searchResultsDiv.innerHTML = '';

  if (results.success) {
    results.data.forEach((movie) => {
      const movieDiv = createMovieDiv(movie);
      searchResultsDiv.appendChild(movieDiv);
      const detailsButton = movieDiv.querySelector('.details');
      detailsButton.addEventListener('click', showDetails);
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

document.querySelectorAll('.details').forEach((button) => {
  button.addEventListener('click', showDetails);
});
