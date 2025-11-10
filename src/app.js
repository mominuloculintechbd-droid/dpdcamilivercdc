const express = require('express');
const cors = require('cors');
const reportsRouter = require('./api/reports');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/reports', reportsRouter);

module.exports = app;