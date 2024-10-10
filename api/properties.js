// api/properties.js
import { createConnection } from 'mysql2/promise';
import Cors from 'cors';

// 初始化 CORS 中间件
const cors = Cors({
  origin: 'https://myeasyrenthub.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
});

// 运行中间件的辅助函数
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async (req, res) => {
  // 运行 CORS 中间件
  await runMiddleware(req, res, cors);

  try {
    const connection = await createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    const [rows] = await connection.execute('SELECT * FROM properties');
    res.status(200).json(rows);
    await connection.end();
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
