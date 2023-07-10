// Path: public\register.html

async function registerUser(formData) {
  const response = await fetch('/register', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(formData)),
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error registering in');
  }

  return response.json();
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await registerUser(formData);
      console.log(response); // log the response to see what's returned

      const { token, username, role } = response;
      localStorage.setItem('authToken', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      window.location.href = document.referrer || '/'; // fallback to '/' if document.referrer is empty
    } catch (error) {
      alert(error.message);
    }
  });
}
