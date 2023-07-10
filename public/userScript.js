// Path: \public\userScript.js

async function deleteMovie(movieId) {
  try {
    const response = await fetch(`/api/movies/${movieId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting movie');
    // Refresh the page to show that the movie has been deleted
    window.location.reload();
  } catch (err) {
    console.error(`Error deleting movie: ${err}`);
  }
}

window.deleteMovie = deleteMovie;

const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  });
  window.location.href = document.referrer || '/'; // fallback to '/' if document.referrer is empty
}
