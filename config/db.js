const mysql = require('mysql2');
require('dotenv').config();

// Log database connection details
console.log(`Connecting to database at ${process.env.DB_HOST}:${process.env.DB_PORT}`);

// Define SSL options based on environment
let sslOptions = null;
if (process.env.DB_SSL === 'true') {
  sslOptions = {
    rejectUnauthorized: false, // This should be used carefully. Set to `true` if using a valid SSL certificate.
  };
  console.log('SSL is enabled for database connections.');
} else {
  console.log('SSL is disabled for database connections.');
}

// Create a MySQL connection pool with SSL support
const pool = mysql.createPool({
  host: process.env.DB_HOST,      // Database hostname (Tencent Cloud DB)
  user: process.env.DB_USER,      // Database username
  password: process.env.DB_PASS,  // Database password
  database: process.env.DB_NAME,  // Database name
  port: process.env.DB_PORT,      // Database port
  dateStrings: true,              // Convert DATE/TIMESTAMP types to strings
  connectionLimit: 10,            // Limit for concurrent connections
  connectTimeout: 20000,          // Connection timeout (20 seconds)
  ssl: sslOptions,                // SSL options if needed
});

// Log if pool is created successfully
pool.on('connection', (connection) => {
  console.log('Database connection established successfully.');
});

// Log error on acquiring connection from pool
pool.on('acquire', (connection) => {
  console.log('Connection acquired: ID', connection.threadId);
});

// Handle error on pool creation or connection issues
pool.on('error', (err) => {
  console.error('Error in database connection pool:', err.code, err.message);
});

// Export the connection pool as a promise-based interface
module.exports = pool.promise();
