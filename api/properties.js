// api/properties.js

const mysql = require('mysql2/promise');
const Cors = require('cors');

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

module.exports = async (req, res) => {
  // 运行 CORS 中间件
  await runMiddleware(req, res, cors);

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
      });

      if (id) {
        // 如果有 ID，则获取单个 property
        const [propertyResults] = await connection.execute('SELECT * FROM properties WHERE id = ?', [id]);
        if (propertyResults.length === 0) {
          return res.status(404).json({ error: 'Property not found' });
        }
        
        const property = propertyResults[0];
        property.images = JSON.parse(property.images);  // 将 images 字段解析为 JSON 数组

        // 获取 sources 相关的 partner 信息
        const [partnerResults] = await connection.execute('SELECT * FROM partners WHERE partner_id = ?', [property.sources]);
        if (partnerResults.length > 0) {
          property.sources = partnerResults[0];
        } else {
          property.sources = null;
        }

        res.json(property);
      } else {
        // 否则获取所有 properties
        const [propertyResults] = await connection.execute('SELECT * FROM properties WHERE agent IS NULL');
        
        const propertiesWithPartners = await Promise.all(propertyResults.map(async (property) => {
          const [partnerResults] = await connection.execute('SELECT * FROM partners WHERE partner_id = ?', [property.sources]);
          property.sources = partnerResults.length > 0 ? partnerResults[0] : { name: 'undefined', company: 'undefined' };
          return property;
        }));

        res.json(propertiesWithPartners);
      }

      await connection.end();
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
