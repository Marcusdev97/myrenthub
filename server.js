// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8080;

// Configurations
const db = require('./config/db');
const propertyRoutes = require('./routes/propertyRoutes');
const agentRoutes = require('./routes/agentRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const rentedRoutes = require('./routes/rentedRoutes'); // New Rented Routes

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/properties', propertyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/rented', rentedRoutes); // Add the new rented routes here
app.use('/fontawesome-free-6.6.0-web', express.static(path.join(__dirname, 'fontawesome-free-6.6.0-web')));

// Serve HTML files
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
