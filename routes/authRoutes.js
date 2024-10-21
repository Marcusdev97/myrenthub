const express = require('express');
const router = express.Router();

// 模拟用户数据库
const users = [
    { username: 'admin', password: 'password123' }
];

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 检查用户凭据
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    // 模拟会话或生成 JWT（这里简单返回成功消息）
    res.status(200).json({ message: 'Login successful' });
});

module.exports = router;
