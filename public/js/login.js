// login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    const loginBox = document.querySelector('.login-box');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        // Trigger slide-out animation on successful login
        loginBox.classList.add('slide-out');

        // Redirect to dashboard after the animation completes
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 500); // Duration should match the animation duration in CSS

    } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
    }
});
