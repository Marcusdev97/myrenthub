const mysql = require('mysql2/promise');
const Cors = require('cors');

// Initialize CORS middleware
const cors = Cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://myeasyrenthub.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
});

// Run middleware helper function
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
        // Fetch single property by ID
        const [propertyResults] = await connection.execute('SELECT * FROM properties WHERE id = ?', [id]);
        
        // Log the property data for debugging
        console.log('Property with ID:', id, 'Data:', propertyResults);

        if (propertyResults.length === 0) {
          return res.status(404).json({ error: 'Property not found' });
        }
        
        const property = propertyResults[0];

        // Parse images as JSON, with error handling
        try {
          property.images = JSON.parse(property.images).map((image) => {
            return `${process.env.IMAGE_BASE_URL || req.protocol + '://' + req.get('host')}/uploads/${image}`;
          });
        } catch (e) {
          console.error('Error parsing images:', e);
          property.images = [];
        }

        // Fetch partner details related to property sources
        const [partnerResults] = await connection.execute('SELECT * FROM partners WHERE partner_id = ?', [property.sources]);
        property.sources = partnerResults.length > 0 ? partnerResults[0] : null;

        res.setHeader('Content-Type', 'application/json');
        res.json(property);

      } else {
        // Fetch all properties
        const [propertyResults] = await connection.execute(getPropertiesQuery());

        // Log results for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetched Properties:', propertyResults);
        }

        const propertiesWithPartners = await Promise.all(propertyResults.map(async (property) => {
          // Parse images as JSON, with error handling
          try {
            property.images = JSON.parse(property.images).map((image) => {
              return `${process.env.IMAGE_BASE_URL || req.protocol + '://' + req.get('host')}/uploads/${image}`;
            });
          } catch (e) {
            console.error('Error parsing images:', e);
            property.images = [];
          }

          const [partnerResults] = await connection.execute('SELECT * FROM partners WHERE partner_id = ?', [property.sources]);
          property.sources = partnerResults.length > 0 ? partnerResults[0] : { name: 'undefined', company: 'undefined' };
          return property;
        }));

        // Log final properties with partner data
        if (process.env.NODE_ENV === 'development') {
          console.log('Properties with Partner Info:', propertiesWithPartners);
        }

        res.setHeader('Content-Type', 'application/json');
        res.json(propertiesWithPartners);
      }

      await connection.end(); // Close connection
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};