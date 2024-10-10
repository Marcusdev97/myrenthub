require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8080;
const https = require('https');
const fs = require('fs');


// Middleware for CORS
app.use(cors({
  origin: 'https://myeasyrenthub.com',
  credentials: true
}));

const options = {
  key: fs.readFileSync('/path/to/your/private.key'),
  cert: fs.readFileSync('/path/to/your/certificate.crt')
};

// Database connection
const db = require('./config/db');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const propertyRoutes = require('./routes/propertyRoutes');
const projectRoutes = require('./routes/projectRoutes');
const agentRoutes = require('./routes/agentRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const rentedRoutes = require('./routes/rentedRoutes');

app.use('/api/properties', propertyRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/rented', rentedRoutes);
app.use('/fontawesome-free-6.6.0-web', express.static(path.join(__dirname, 'fontawesome-free-6.6.0-web')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is working' });
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/add_property.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/add_property.html'));
});

app.get('/edit_property.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/edit_property.html'));
});

app.get('/rented_property.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/rented_property.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

//Test Database Connections for Tencent
db.getConnection()
  .then(conn => {
    console.log('Successfully connected to the Tencent Cloud database');
    conn.release();
  })
  .catch(err => {
    console.error('Failed to connect to the Tencent Cloud database:', err);
  });