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

        // 登录成功，添加 `slide-out` 类触发动画
        loginBox.classList.add('slide-out');

        // 延迟重定向，时间与动画持续时间一致
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 500); // 0.5秒，与CSS中的动画持续时间一致

    } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
    }
});
