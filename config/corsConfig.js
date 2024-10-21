const allowedOrigins = [
    'http://localhost:3000', // 本地开发
    'https://myeasyrenthub.com' // 生产环境
  ];
  
  module.exports = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  };
  