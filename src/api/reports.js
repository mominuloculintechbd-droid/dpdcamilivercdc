const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const db = require('../config/db');
const jobManager = require('../services/queryJobManager');

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

// Execute report asynchronously (returns job ID)
router.post('/:reportName/execute', async (req, res) => {
  const { reportName } = req.params;
  const parameters = req.body.parameters || {};

  try {
    // Read SQL file to validate report exists
    const reportPath = path.join(reportsDir, `${reportName}.sql`);
    const sql = await fs.readFile(reportPath, 'utf8');

    // Create job
    const jobId = await jobManager.createJob(reportName, sql, parameters);

    res.json({
      jobId,
      message: 'Report execution started',
      reportName,
      parameters
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).send('Report not found');
    } else {
      console.error('Error starting report execution:', error);
      res.status(500).send('Error starting report execution: ' + error.message);
    }
  }
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

// ========== JOB MANAGEMENT ENDPOINTS ==========

// Get all jobs with optional filtering
router.get('/jobs/list', async (req, res) => {
  const { filter = 'all' } = req.query;

  try {
    const jobs = jobManager.getAllJobs(filter);

    // Sort by start time (newest first)
    jobs.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    // Return only necessary fields (exclude SQL and other heavy data)
    const jobList = jobs.map(job => ({
      jobId: job.jobId,
      reportName: job.reportName,
      parameters: job.parameters,
      status: job.status,
      startTime: job.startTime,
      endTime: job.endTime,
      rowCount: job.rowCount,
      executionTime: job.executionTime,
      error: job.error
    }));

    res.json(jobList);
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).send('Error getting jobs: ' + error.message);
  }
});

// Get job statistics
router.get('/jobs/stats', async (req, res) => {
  try {
    const stats = jobManager.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting job stats:', error);
    res.status(500).send('Error getting job stats: ' + error.message);
  }
});

// Get specific job status
router.get('/jobs/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = jobManager.getJob(jobId);

    if (!job) {
      return res.status(404).send('Job not found');
    }

    // Return job without SQL
    const jobInfo = {
      jobId: job.jobId,
      reportName: job.reportName,
      parameters: job.parameters,
      status: job.status,
      startTime: job.startTime,
      endTime: job.endTime,
      rowCount: job.rowCount,
      executionTime: job.executionTime,
      error: job.error
    };

    res.json(jobInfo);
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).send('Error getting job: ' + error.message);
  }
});

// Get job result data
router.get('/jobs/:jobId/result', async (req, res) => {
  const { jobId } = req.params;

  try {
    const result = await jobManager.getJobResult(jobId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Job not found') {
      res.status(404).send('Job not found');
    } else if (error.message === 'Job is not completed') {
      res.status(400).send('Job is not completed yet');
    } else {
      console.error('Error getting job result:', error);
      res.status(500).send('Error getting job result: ' + error.message);
    }
  }
});

// Cancel a running or pending job
router.post('/jobs/:jobId/cancel', async (req, res) => {
  const { jobId } = req.params;

  try {
    const cancelled = jobManager.cancelJob(jobId);

    if (cancelled) {
      res.json({ message: 'Job cancelled successfully' });
    } else {
      res.status(400).send('Job cannot be cancelled (already completed or failed)');
    }
  } catch (error) {
    if (error.message === 'Job not found') {
      res.status(404).send('Job not found');
    } else {
      console.error('Error cancelling job:', error);
      res.status(500).send('Error cancelling job: ' + error.message);
    }
  }
});

// Delete a job
router.delete('/jobs/:jobId', async (req, res) => {
  const { jobId } = req.params;

  try {
    await jobManager.deleteJob(jobId);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    if (error.message === 'Job not found') {
      res.status(404).send('Job not found');
    } else {
      console.error('Error deleting job:', error);
      res.status(500).send('Error deleting job: ' + error.message);
    }
  }
});

module.exports = router;