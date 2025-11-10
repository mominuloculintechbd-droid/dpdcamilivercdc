const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const db = require('../config/db');

class QueryJobManager {
  constructor() {
    this.jobs = new Map(); // In-memory job store
    this.resultsDir = path.join(__dirname, '../../query_results');
    this.maxConcurrentJobs = 3;
    this.runningJobs = 0;
    this.resultRetentionDays = 7;

    // Ensure results directory exists
    this.initializeResultsDirectory();

    // Start cleanup task (runs every hour)
    setInterval(() => this.cleanupOldResults(), 60 * 60 * 1000);
  }

  async initializeResultsDirectory() {
    try {
      await fs.mkdir(this.resultsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create results directory:', error);
    }
  }

  /**
   * Create a new query job
   */
  async createJob(reportName, sql, parameters = {}) {
    const jobId = uuidv4();
    const job = {
      jobId,
      reportName,
      parameters,
      status: 'pending',
      startTime: new Date().toISOString(),
      endTime: null,
      rowCount: null,
      resultFilePath: null,
      error: null,
      sql: sql.substring(0, 200) + (sql.length > 200 ? '...' : '') // Store truncated SQL for reference
    };

    this.jobs.set(jobId, job);

    // Start execution if capacity allows
    this.tryExecuteNextJob();

    return jobId;
  }

  /**
   * Try to execute the next pending job if capacity allows
   */
  async tryExecuteNextJob() {
    if (this.runningJobs >= this.maxConcurrentJobs) {
      return; // At capacity
    }

    // Find next pending job
    const pendingJob = Array.from(this.jobs.values()).find(job => job.status === 'pending');
    if (!pendingJob) {
      return; // No pending jobs
    }

    // Execute the job
    this.executeJob(pendingJob.jobId);
  }

  /**
   * Execute a query job
   */
  async executeJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.error(`Job ${jobId} not found`);
      return;
    }

    job.status = 'running';
    this.runningJobs++;

    // Emit job started event (will be picked up by WebSocket)
    this.emitJobEvent(jobId, 'started');

    try {
      // Read SQL file
      const sqlFilePath = path.join(__dirname, '../../reports', `${job.reportName}.sql`);
      const sql = await fs.readFile(sqlFilePath, 'utf8');

      // Execute query with parameters
      const bindParams = {};
      for (const [key, value] of Object.entries(job.parameters)) {
        bindParams[key] = value;
      }

      const startExecution = Date.now();
      const results = await db.execute(sql, bindParams);
      const executionTime = Date.now() - startExecution;

      // Save results to file
      const resultFilePath = path.join(this.resultsDir, `${jobId}.json`);
      const resultData = {
        jobId,
        reportName: job.reportName,
        parameters: job.parameters,
        rowCount: results.length,
        executionTime,
        completedAt: new Date().toISOString(),
        data: results
      };

      await fs.writeFile(resultFilePath, JSON.stringify(resultData, null, 2));

      // Update job status
      job.status = 'completed';
      job.endTime = new Date().toISOString();
      job.rowCount = results.length;
      job.resultFilePath = resultFilePath;
      job.executionTime = executionTime;

      console.log(`Job ${jobId} completed successfully (${results.length} rows, ${executionTime}ms)`);

      // Emit job completed event
      this.emitJobEvent(jobId, 'completed', {
        rowCount: results.length,
        executionTime
      });

    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);

      job.status = 'failed';
      job.endTime = new Date().toISOString();
      job.error = error.message;

      // Emit job failed event
      this.emitJobEvent(jobId, 'failed', {
        error: error.message
      });
    } finally {
      this.runningJobs--;

      // Try to start next job
      this.tryExecuteNextJob();
    }
  }

  /**
   * Get job by ID
   */
  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs with optional filtering
   */
  getAllJobs(filter = 'all') {
    const jobs = Array.from(this.jobs.values());

    if (filter === 'running') {
      return jobs.filter(job => job.status === 'running' || job.status === 'pending');
    } else if (filter === 'completed') {
      return jobs.filter(job => job.status === 'completed');
    } else if (filter === 'failed') {
      return jobs.filter(job => job.status === 'failed');
    }

    return jobs;
  }

  /**
   * Get job statistics
   */
  getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      running: jobs.filter(j => j.status === 'running').length,
      pending: jobs.filter(j => j.status === 'pending').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length
    };
  }

  /**
   * Get result data for a completed job
   */
  async getJobResult(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'completed') {
      throw new Error('Job is not completed');
    }

    if (!job.resultFilePath) {
      throw new Error('Result file not found');
    }

    try {
      const resultData = await fs.readFile(job.resultFilePath, 'utf8');
      return JSON.parse(resultData);
    } catch (error) {
      throw new Error(`Failed to read result file: ${error.message}`);
    }
  }

  /**
   * Cancel a running or pending job
   */
  cancelJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status === 'running') {
      // Note: We can't easily cancel an in-flight Oracle query
      // But we can mark it as cancelled and ignore the results
      job.status = 'cancelled';
      job.endTime = new Date().toISOString();
      this.emitJobEvent(jobId, 'cancelled');
      return true;
    } else if (job.status === 'pending') {
      job.status = 'cancelled';
      job.endTime = new Date().toISOString();
      this.emitJobEvent(jobId, 'cancelled');
      return true;
    }

    return false;
  }

  /**
   * Delete a job and its result file
   */
  async deleteJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Delete result file if it exists
    if (job.resultFilePath) {
      try {
        await fs.unlink(job.resultFilePath);
      } catch (error) {
        console.error(`Failed to delete result file for job ${jobId}:`, error);
      }
    }

    // Remove from memory
    this.jobs.delete(jobId);
    this.emitJobEvent(jobId, 'deleted');
  }

  /**
   * Clean up old result files
   */
  async cleanupOldResults() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.resultRetentionDays);

    console.log(`Cleaning up results older than ${cutoffDate.toISOString()}`);

    const jobsToDelete = [];
    for (const [jobId, job] of this.jobs) {
      if (job.status === 'completed' || job.status === 'failed') {
        const jobDate = new Date(job.startTime);
        if (jobDate < cutoffDate) {
          jobsToDelete.push(jobId);
        }
      }
    }

    for (const jobId of jobsToDelete) {
      try {
        await this.deleteJob(jobId);
        console.log(`Deleted old job ${jobId}`);
      } catch (error) {
        console.error(`Failed to delete job ${jobId}:`, error);
      }
    }

    console.log(`Cleanup complete. Deleted ${jobsToDelete.length} jobs.`);
  }

  /**
   * Emit job event (to be picked up by WebSocket)
   */
  emitJobEvent(jobId, event, data = {}) {
    // This will be used by the WebSocket handler
    if (global.io) {
      global.io.emit('job:event', {
        jobId,
        event,
        timestamp: new Date().toISOString(),
        ...data
      });
    }
  }

  /**
   * Set WebSocket io instance for real-time updates
   */
  setSocketIO(io) {
    global.io = io;
  }
}

// Export singleton instance
module.exports = new QueryJobManager();
