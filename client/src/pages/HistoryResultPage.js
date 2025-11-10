import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Report from '../components/Report';

const HistoryResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, reportName, metadata } = location.state || {};

  if (!data || !reportName) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-yellow-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">This result is no longer available.</p>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    return `${min}m ${sec % 60}s`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {reportName.replace(/_/g, ' ')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {metadata?.rowCount?.toLocaleString() || 0} rows retrieved
              {metadata?.executionTime && ` • Executed in ${formatDuration(metadata.executionTime)}`}
              {metadata?.completedAt && ` • Completed ${new Date(metadata.completedAt).toLocaleString()}`}
            </p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            ← Back to History
          </button>
        </div>
      </div>

      {/* Cached Result Badge */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <span className="text-lg">📦</span>
          <span className="font-medium">Viewing cached result from query history</span>
        </div>
      </div>

      {/* Report Component */}
      <Report data={data} reportName={reportName} />
    </div>
  );
};

export default HistoryResultPage;
