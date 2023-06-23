// Path: public\login.js

async function loginUser(formData) {
  const response = await fetch('/login', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(formData)),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error logging in');
  }

  return response.json();
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await loginUser(formData);
      console.log(response); // log the response to see what's returned

      const { token, username, role } = response;
      localStorage.setItem('authToken', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      // Redirect to the home page after successful login
      window.location.href = '/';
    } catch (error) {
      alert(error.message);
    }
  });
}
