require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const { port } = require('./config/serverConfig.js');
const corsOptions = require('./config/corsConfig');
const db = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

// 中间件
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由设置
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const agentRoutes = require('./routes/agentRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const projectRoutes = require('./routes/projectRoutes');
const rentedRoutes = require('./routes/rentedRoutes');
const imageRoutes = require('./routes/imageRoutes');

app.use('/api', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/rented', rentedRoutes);
app.use('/api/images', imageRoutes);

// 静态资源的路由
app.use('/fontawesome-free-6.6.0-web', express.static(path.join(__dirname, 'fontawesome-free-6.6.0-web')));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is working' });
});

// 处理 HTML 页面请求
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/html/index.html')));
app.get('/dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'public/html/dashboard.html')));
app.get('/add_property.html', (req, res) => res.sendFile(path.join(__dirname, 'public/html/add_property.html')));
app.get('/edit_property.html', (req, res) => res.sendFile(path.join(__dirname, 'public/html/edit_property.html')));
app.get('/rented_property.html', (req, res) => res.sendFile(path.join(__dirname, 'public/html/rented_property.html')));

// 全局错误处理中间件
app.use(notFoundHandler);
app.use(errorHandler);

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// 测试数据库连接
db.getConnection()
  .then(conn => {
    console.log('Successfully connected to the Tencent Cloud database');
    conn.release();
  })
  .catch(err => {
    console.error('Failed to connect to the Tencent Cloud database:', err);
  });
