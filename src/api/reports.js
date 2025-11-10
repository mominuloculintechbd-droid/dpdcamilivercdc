const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const db = require('../config/db');

const router = express.Router();

const reportsDir = path.join(__dirname, '../../reports');

// Get report metadata (parameter definitions)
router.get('/:reportName/metadata', async (req, res) => {
  const { reportName } = req.params;
  const metadataPath = path.join(reportsDir, `${reportName}.meta.json`);

  try {
    const metadataContent = await fs.readFile(metadataPath, 'utf8');
    const metadata = JSON.parse(metadataContent);
    res.json(metadata);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).send('No metadata found for this report');
    } else {
      console.error('Error loading metadata:', error);
      res.status(500).send('Error loading report metadata');
    }
  }
});

// Execute report (GET for backward compatibility, POST for reports with parameters)
router.get('/:reportName', async (req, res) => {
  const { reportName } = req.params;
  await executeReport(reportName, {}, res);
});

// Execute report with parameters
router.post('/:reportName', async (req, res) => {
  const { reportName } = req.params;
  const parameters = req.body.parameters || {};
  await executeReport(reportName, parameters, res);
});

// Helper function to execute report with optional parameters
async function executeReport(reportName, parameters, res) {
  const reportPath = path.join(reportsDir, `${reportName}.sql`);
  const metadataPath = path.join(reportsDir, `${reportName}.meta.json`);

  try {
    // Read SQL file
    const sql = await fs.readFile(reportPath, 'utf8');

    // Check if report has metadata
    let metadata = null;
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(metadataContent);
    } catch (error) {
      // No metadata file means no parameters needed
      if (error.code !== 'ENOENT') {
        console.error('Error reading metadata:', error);
      }
    }

    // Prepare bind parameters
    let bindParams = {};
    if (metadata && metadata.parameters) {
      metadata.parameters.forEach(param => {
        // Use provided value or default value
        const value = parameters[param.name] !== undefined
          ? parameters[param.name]
          : param.default;

        // Convert to appropriate type
        if (param.type === 'number') {
          bindParams[param.name] = Number(value);
        } else if (param.type === 'date') {
          bindParams[param.name] = new Date(value);
        } else {
          bindParams[param.name] = value;
        }
      });
    }

    // Execute query with bind parameters
    const data = await db.execute(sql, bindParams);
    res.json(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).send('Report not found');
    } else {
      console.error('Error executing report:', error);
      res.status(500).send('Error executing report: ' + error.message);
    }
  }
}

module.exports = router;