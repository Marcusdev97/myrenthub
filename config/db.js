const mysql = require('mysql2');
require('dotenv').config();

console.log(`Connecting to database at ${process.env.DB_HOST}:${process.env.DB_PORT}`); // Log database connection details

let sslOptions = null;
if (process.env.DB_SSL === 'true') {
  sslOptions = {
    // SSL options would be included here if needed in the future
  };
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,      // Tencent Cloud DB hostname
  user: process.env.DB_USER,      // Database username
  password: process.env.DB_PASS,  // Database password
  database: process.env.DB_NAME,  // Database name
  port: process.env.DB_PORT,      // Database port (typically 3306)
  dateStrings: true,
  connectionLimit: 10,            // Number of concurrent connections
  connectTimeout: 20000,          // Timeout duration
  ssl: sslOptions,                // SSL options if enabled
});

module.exports = pool.promise();
