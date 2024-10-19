const mysql = require('mysql2/promise');
const Cors = require('cors');

// Initialize CORS middleware
const cors = Cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://myeasyrenthub.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
});

// Middleware helper for running CORS
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

// Query helper function based on environment
const getPropertiesQuery = () => {
  return process.env.LOCALHOST === 'true'
    ? 'SELECT * FROM properties WHERE agent IS NULL'  // Fetch unrented properties in localhost
    : 'SELECT * FROM properties';  // Fetch all properties in production
};

module.exports = async (req, res) => {
  // Redirect HTTP to HTTPS if necessary
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV !== 'development') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  // Run CORS middleware
  await runMiddleware(req, res, cors);

  const { id } = req.query;

  try {
    // Setup database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    if (req.method === 'GET') {
      if (id) {
        // Fetch single property by ID
        const [propertyResults] = await connection.execute('SELECT * FROM properties WHERE id = ?', [id]);

        if (propertyResults.length === 0) {
          return res.status(404).json({ error: 'Property not found' });
        }

        const property = propertyResults[0];

        // Fetch images for the property from the images table
        const [imageResults] = await connection.execute('SELECT image_url FROM images WHERE property_id = ?', [id]);
        property.images = imageResults.map(img => img.image_url);  // Use image URLs from the images table

        // Fetch associated partner details
        const [partnerResults] = await connection.execute('SELECT * FROM partners WHERE partner_id = ?', [property.sources]);
        property.sources = partnerResults.length > 0 ? partnerResults[0] : null;

        res.setHeader('Content-Type', 'application/json');
        res.json(property);

      } else {
        // Fetch all properties
        const [propertyResults] = await connection.execute(getPropertiesQuery());

        // Map through properties to attach partner info and fetch images
        const propertiesWithImagesAndPartners = await Promise.all(propertyResults.map(async (property) => {
          // Fetch images for each property from the images table
          const [imageResults] = await connection.execute('SELECT image_url FROM images WHERE property_id = ?', [property.id]);
          property.images = imageResults.map(img => img.image_url);

          // Fetch partner info
          const [partnerResults] = await connection.execute('SELECT * FROM partners WHERE partner_id = ?', [property.sources]);
          property.sources = partnerResults.length > 0 ? partnerResults[0] : { name: 'undefined', company: 'undefined' };

          return property;
        }));

        res.setHeader('Content-Type', 'application/json');
        res.json(propertiesWithImagesAndPartners);
      }

      await connection.end(); // Close database connection
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
