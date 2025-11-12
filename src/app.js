const express = require('express');
const cors = require('cors');
const reportsRouter = require('./api/reports');

const app = express();

// Configure CORS to allow GitHub Pages and local network
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://mominuloculintechbd-droid.github.io',
    /^http:\/\/172\.16\.\d+\.\d+:?\d*$/,  // Allow local network
    /^http:\/\/192\.168\.\d+\.\d+:?\d*$/  // Allow common local network
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/reports', reportsRouter);

module.exports = app;