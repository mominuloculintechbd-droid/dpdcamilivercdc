import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Report from '../components/Report';
import { Spinner } from '../components/ui/spinner';
import { Skeleton } from '../components/ui/skeleton';
import ParameterModal from '../components/ParameterModal';
import { getReportMetadata } from '../lib/parameterService';

const ReportPage = () => {
  const { reportName } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState(null);
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [checkingMetadata, setCheckingMetadata] = useState(true);

  // Load metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      setCheckingMetadata(true);
      setData(null);
      setError(null);
      setShowParameterModal(false);

      try {
        const meta = await getReportMetadata(reportName);
        setMetadata(meta);

        if (meta && meta.parameters && meta.parameters.length > 0) {
          // Report has parameters - show modal first
          setShowParameterModal(true);
          setLoading(false);
        } else {
          // No parameters - fetch data directly
          await fetchData({});
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
        // If metadata loading fails, try to fetch data anyway
        await fetchData({});
      } finally {
        setCheckingMetadata(false);
      }
    };

    loadMetadata();
  }, [reportName]);

  const fetchData = async (parameters) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (parameters && Object.keys(parameters).length > 0) {
        // POST request with parameters
        response = await axios.post(`http://localhost:3001/api/reports/${reportName}`, {
          parameters
        });
      } else {
        // GET request without parameters
        response = await axios.get(`http://localhost:3001/api/reports/${reportName}`);
      }
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const executeInBackground = async (parameters) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/reports/${reportName}/execute`, {
        parameters
      });

      const { jobId } = response.data;

      // Show success toast
      toast.success(
        <div>
          <div className="font-medium">Report started in background</div>
          <div className="text-sm">Check Query History to view results</div>
        </div>,
        {
          duration: 5000,
          action: {
            label: 'View History',
            onClick: () => navigate('/history')
          }
        }
      );

      // Navigate to history page
      setTimeout(() => {
        navigate('/history');
      }, 1000);
    } catch (err) {
      console.error('Error starting background execution:', err);
      toast.error('Failed to start background execution: ' + err.message);
    }
  };

  const handleParameterExecute = (parameters) => {
    setShowParameterModal(false);
    fetchData(parameters);
  };

  const handleParameterCancel = () => {
    // Navigate back without executing
    navigate(-1);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Report</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Title skeleton */}
        <Skeleton className="h-8 w-64" />

        {/* Loading message with spinner */}
        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
          <Spinner size="default" />
          <div>
            <p className="font-medium text-gray-900">Loading report data...</p>
            <p className="text-sm text-gray-500">Executing query on Oracle database</p>
          </div>
        </div>

        {/* Export buttons skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Filter skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Table skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Parameter Modal */}
      <ParameterModal
        isOpen={showParameterModal}
        metadata={metadata}
        reportName={reportName}
        onExecute={handleParameterExecute}
        onCancel={handleParameterCancel}
      />

      {/* Report Content */}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {reportName.replace(/_/g, ' ')}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {data?.length || 0} rows retrieved
                {metadata && metadata.parameters && metadata.parameters.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    (Parametric report)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => executeInBackground({})}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium flex items-center gap-2"
              title="Run this report in the background and check results in Query History"
            >
              <span>🚀</span>
              <span>Run in Background</span>
            </button>
          </div>
        </div>
        <Report data={data} reportName={reportName} />
      </div>
    </>
  );
};

export default ReportPage;