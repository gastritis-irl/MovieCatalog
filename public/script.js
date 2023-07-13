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
  console.log('Response from fetch(/movies): ', response);
  // console.log('Response from fetch(/movies): ', response.json());
  console.log(response.ok);
  if (!response.ok) {
    throw new Error('Error searching movies');
  }

  return response.json();
}

async function showDetails(event) {
  const movieId = event.target.parentNode.parentNode.id;
  try {
    const response = await fetch(`/api/movies/${movieId}`);
    if (!response.ok) throw new Error('Error fetching movie details');
    const movieDetails = await response.json();

    const { movie, user } = movieDetails.data; // access the nested movie object here
    const { genre, description, releaseYear } = movie;
    if (user) {
      const { username, _id } = user;
      console.log('User who added movie:', username);

      const infoDiv = event.target.parentNode.querySelector('.extra-info');
      infoDiv.innerHTML = `<p class="detail">Genre: ${genre}</p><p class="detail">Description: ${description}</p><p class="detail">Year: ${releaseYear}</p><p class="detail">Added by: <a href="/users/${_id}">${username}</a></p>`;
      infoDiv.style.display = 'block';
    } else {
      const infoDiv = event.target.parentNode.querySelector('.extra-info');
      infoDiv.innerHTML = `<p class="detail">Genre: ${genre}</p><p class="detail">Description: ${description}</p><p class="detail">Year: ${releaseYear}</p><p class="detail">User who added movie: Unknown</p>`;
      infoDiv.style.display = 'block';
    }
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

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-movie';
  deleteButton.dataset.id = movie._id;
  deleteButton.addEventListener('click', async function deleteMovie() {
    const movieId = this.dataset.id;

    try {
      const response = await fetch(`/movies/${movieId}`, {
        method: 'DELETE',
      });
      console.log(response);
      if (response.ok) {
        this.parentElement.remove();
        alert('Movie deleted successfully');
      } else {
        const errorData = await response.json().catch((err) => console.error(err));
        throw new Error(errorData?.message || 'Error deleting movie');
      }
    } catch (error) {
      alert('Failed to delete movie.', error);
    }
  });
  // movieDiv.appendChild(deleteButton);

  const span1 = document.createElement('span');
  span1.textContent = '';
  span1.className = 'button_lg';
  deleteButton.appendChild(span1);

  const span2 = document.createElement('span');
  span2.textContent = '';
  span2.className = 'button_sl';
  span1.appendChild(span2);

  const span3 = document.createElement('span');
  span3.textContent = 'Delete Movie';
  span3.className = 'button_text';
  span1.appendChild(span3);

  movieDiv.appendChild(deleteButton);

  return movieDiv;
}

function createUserDiv(user) {
  const userDiv = document.createElement('div');
  userDiv.className = 'movie'; // Use 'movie' class to match with movie div
  userDiv.id = user._id;

  const username = document.createElement('h3');
  username.textContent = `Username: ${user.username}`;
  userDiv.appendChild(username);

  const role = document.createElement('p');
  role.textContent = `Role: ${user.role}`;
  userDiv.appendChild(role);

  const button = document.createElement('button');
  button.className = 'delete-user';
  button.dataset.id = user._id;
  button.addEventListener('click', async function deleteUser() {
    const userId = this.dataset.id;

    try {
      const response = await fetch(`/users/${userId}`, {
        method: 'DELETE',
      });
      console.log(response);
      if (response.ok) {
        window.location.reload();
        alert('User deleted successfully');
      } else {
        const errorData = await response.json().catch((err) => console.error(err));
        throw new Error(errorData?.message || 'Error deleting User');
      }
    } catch (error) {
      console.log(error);
      alert('Failed to delete user');
    }
  });
  // userDiv.appendChild(button);

  const span1 = document.createElement('span');
  span1.textContent = '';
  span1.className = 'button_lg';
  button.appendChild(span1);

  const span2 = document.createElement('span');
  span2.textContent = '';
  span2.className = 'button_sl';
  span1.appendChild(span2);

  const span3 = document.createElement('span');
  span3.textContent = 'Delete User';
  span3.className = 'button_text';
  span1.appendChild(span3);

  userDiv.appendChild(button);

  return userDiv;
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
      console.log('Movie Div:', movieDiv);
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

document.querySelectorAll('.delete-movie').forEach((button) => {
  button.addEventListener('click', async function deleteMovie() {
    const movieId = this.dataset.id;

    try {
      const response = await fetch(`/movies/${movieId}`, {
        method: 'DELETE',
      });
      console.log(response);
      if (response.ok) {
        this.parentElement.remove();
        alert('Movie deleted successfully');
      } else {
        const errorData = await response.json().catch((err) => console.error(err));
        throw new Error(errorData?.message || 'Error deleting movie');
      }
    } catch (error) {
      console.log(error);
      alert('Failed to delete movie');
    }
  });
});

document.querySelectorAll('.delete-user').forEach((button) => {
  button.addEventListener('click', async function deleteUser() {
    const userId = this.dataset.id;

    try {
      const response = await fetch(`/users/${userId}`, {
        method: 'DELETE',
      });
      console.log(response);
      if (response.ok) {
        window.location.reload();
        alert('User deleted successfully');
      } else {
        const errorData = await response.json().catch((err) => console.error(err));
        throw new Error(errorData?.message || 'Error deleting User');
      }
    } catch (error) {
      console.log(error);
      alert('Failed to delete user');
    }
  });
});

async function getUsers(formData, fetchFunction = fetch) {
  const queryParams = new URLSearchParams(formData).toString();
  console.log('Query Params:', queryParams);

  const response = await fetchFunction(`/users?${queryParams}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Error searching users');
  }

  return response.json();
}

const searchUsersForm = document.getElementById('search-users-form');
if (searchUsersForm) {
  searchUsersForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('Form Data:', [...formData]);

    try {
      const userdata = await getUsers(formData);

      // Display the returned users
      const usersList = document.getElementById('users-list');
      usersList.innerHTML = '';
      userdata.data.forEach((user) => {
        const userDiv = createUserDiv(user);
        usersList.appendChild(userDiv);
      });
    } catch (error) {
      alert(error.message);
    }
  });
}
