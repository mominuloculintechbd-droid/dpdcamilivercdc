import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from '../components/ui/spinner';
import websocketService from '../lib/websocket';
import notificationManager from '../lib/notificationManager';

const QueryHistoryPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, running: 0, completed: 0, failed: 0 });
  const navigate = useNavigate();

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/reports/jobs/list?filter=${filter}`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/reports/jobs/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchJobs(), fetchStats()]);
      setLoading(false);
    };

    init();

    // Auto-refresh every 5 seconds if there are running jobs
    const interval = setInterval(() => {
      if (stats.running > 0 || stats.pending > 0) {
        fetchJobs();
        fetchStats();
      }
    }, 5000);

    // Mark all as viewed when page loads
    notificationManager.markAllViewed();

    return () => clearInterval(interval);
  }, [filter]);

  // Listen for WebSocket events
  useEffect(() => {
    const handleJobEvent = (data) => {
      // Refresh jobs list when events occur
      fetchJobs();
      fetchStats();
    };

    websocketService.on('job:event', handleJobEvent);

    return () => {
      websocketService.off('job:event', handleJobEvent);
    };
  }, []);

  const handleViewResults = async (jobId, reportName) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/reports/jobs/${jobId}/result`);

      // Navigate to a special route that shows cached results
      navigate(`/history/${jobId}`, {
        state: {
          data: response.data.data,
          reportName,
          metadata: {
            rowCount: response.data.rowCount,
            executionTime: response.data.executionTime,
            completedAt: response.data.completedAt
          }
        }
      });
    } catch (error) {
      console.error('Error fetching job results:', error);
      alert('Failed to load results: ' + error.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/reports/jobs/${jobId}`);
      fetchJobs();
      fetchStats();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job: ' + error.message);
    }
  };

  const handleCancelJob = async (jobId) => {
    try {
      await axios.post(`http://localhost:3001/api/reports/jobs/${jobId}/cancel`);
      fetchJobs();
      fetchStats();
    } catch (error) {
      console.error('Error cancelling job:', error);
      alert('Failed to cancel job: ' + error.message);
    }
  };

  const handleRerun = (reportName, parameters) => {
    navigate(`/reports/${reportName}`, {
      state: { parameters }
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      running: { icon: '🔄', text: 'Running', className: 'bg-blue-100 text-blue-800' },
      pending: { icon: '⏸️', text: 'Pending', className: 'bg-gray-100 text-gray-800' },
      completed: { icon: '✅', text: 'Completed', className: 'bg-green-100 text-green-800' },
      failed: { icon: '❌', text: 'Failed', className: 'bg-red-100 text-red-800' },
      cancelled: { icon: '🚫', text: 'Cancelled', className: 'bg-orange-100 text-orange-800' }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        <span>{badge.icon}</span>
        <span>{badge.text}</span>
      </span>
    );
  };

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return '—';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    if (diffMin > 0) {
      return `${diffMin}m ${diffSec % 60}s`;
    }
    return `${diffSec}s`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHour = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Spinner size="large" />
          <p className="mt-4 text-gray-600">Loading query history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Query History</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage your report executions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Jobs</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-200 bg-blue-50">
          <div className="text-sm text-blue-600">Running</div>
          <div className="text-2xl font-bold text-blue-700">{stats.running + stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-green-200 bg-green-50">
          <div className="text-sm text-green-600">Completed</div>
          <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-red-200 bg-red-50">
          <div className="text-sm text-red-600">Failed</div>
          <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex gap-2">
          {['all', 'running', 'completed', 'failed'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No jobs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parameters</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rows</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.jobId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {job.reportName.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {Object.keys(job.parameters).length > 0 ? (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {Object.entries(job.parameters).map(([key, value]) => (
                            <span key={key}>{key}: {value} </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatTimestamp(job.startTime)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDuration(job.startTime, job.endTime)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {job.rowCount !== null ? job.rowCount.toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {job.status === 'completed' && (
                          <>
                            <button
                              onClick={() => handleViewResults(job.jobId, job.reportName)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleRerun(job.reportName, job.parameters)}
                              className="text-green-600 hover:text-green-800"
                            >
                              Re-run
                            </button>
                          </>
                        )}
                        {(job.status === 'running' || job.status === 'pending') && (
                          <button
                            onClick={() => handleCancelJob(job.jobId)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            Cancel
                          </button>
                        )}
                        {job.status === 'failed' && (
                          <button
                            onClick={() => handleRerun(job.reportName, job.parameters)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Retry
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteJob(job.jobId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryHistoryPage;
