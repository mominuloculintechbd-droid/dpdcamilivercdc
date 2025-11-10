import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Report from '../components/Report';
import { Spinner } from '../components/ui/spinner';
import { Skeleton } from '../components/ui/skeleton';

const ReportPage = () => {
  const { reportName } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData(null);
      setError(null);

      try {
        const response = await axios.get(`http://localhost:3001/api/reports/${reportName}`);
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportName]);

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
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          {reportName.replace(/_/g, ' ')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {data?.length || 0} rows retrieved
        </p>
      </div>
      <Report data={data} reportName={reportName} />
    </div>
  );
};

export default ReportPage;