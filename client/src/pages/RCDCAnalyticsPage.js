import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RCDCAnalyticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    rcSuccess: 0,
    rcInProgress: 0,
    dcSuccess: 0,
    dcInProgress: 0,
    dcFailed: 0,
    totalCommands: 0,
    lastUpdated: null
  });
  const [nocsData, setNocsData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3001/api/reports/rc_dc_analytics_summary');
      const data = response.data;

      // Process the data to calculate analytics
      const stats = {
        rcSuccess: 0,
        rcInProgress: 0,
        dcSuccess: 0,
        dcInProgress: 0,
        dcFailed: 0,
        totalCommands: data.length,
        lastUpdated: new Date()
      };

      // Calculate NOCS-wise statistics
      const nocsMap = {};

      data.forEach(row => {
        const commandType = row.COMMAND_TYPE?.trim();
        const commandStatus = row.COMMAND_STATUS?.trim();
        const nocsName = row.NOCS_NAME?.trim() || 'Unknown';

        // Overall stats
        if (commandType === 'D1-RemoteConnect' && commandStatus === 'COMPLETED') {
          stats.rcSuccess++;
        } else if (commandType === 'D1-RemoteConnect' && commandStatus === 'COMINPROG') {
          stats.rcInProgress++;
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'COMPLETED') {
          stats.dcSuccess++;
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'COMINPROG') {
          stats.dcInProgress++;
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'DISCARDED') {
          stats.dcFailed++;
        }

        // NOCS-wise stats
        if (!nocsMap[nocsName]) {
          nocsMap[nocsName] = {
            nocsName,
            rcSuccess: 0,
            rcInProgress: 0,
            dcSuccess: 0,
            dcInProgress: 0,
            dcFailed: 0,
            total: 0
          };
        }

        nocsMap[nocsName].total++;

        if (commandType === 'D1-RemoteConnect' && commandStatus === 'COMPLETED') {
          nocsMap[nocsName].rcSuccess++;
        } else if (commandType === 'D1-RemoteConnect' && commandStatus === 'COMINPROG') {
          nocsMap[nocsName].rcInProgress++;
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'COMPLETED') {
          nocsMap[nocsName].dcSuccess++;
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'COMINPROG') {
          nocsMap[nocsName].dcInProgress++;
        } else if (commandType === 'D1-RemoteDisconnect' && commandStatus === 'DISCARDED') {
          nocsMap[nocsName].dcFailed++;
        }
      });

      // Convert NOCS map to array and sort by total commands (descending)
      const nocsArray = Object.values(nocsMap).sort((a, b) => b.total - a.total);

      setAnalytics(stats);
      setNocsData(nocsArray);
      setError(null);

      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMsg = error.response?.data || error.message;
      setError(errorMsg);
      toast.error('Failed to fetch data. Check if database is accessible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Database Connection Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Unable to connect to the Oracle database. Please check:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>VPN connection is active</li>
                    <li>Network connectivity to database server</li>
                    <li>Database credentials are correct</li>
                  </ul>
                  <p className="mt-2 text-xs text-red-600 font-mono">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-3 flex-shrink-0 text-red-400 hover:text-red-500"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">RC/DC Analytics Dashboard</h1>
              <p className="text-gray-600">Remote Connect/Disconnect Command Statistics (Today)</p>
              {analytics.lastUpdated && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {analytics.lastUpdated.toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Total Commands Card */}
        <div className="mb-6">
          <StatCard
            title="Total Commands"
            value={analytics.totalCommands}
            icon="📊"
            color="border-purple-500"
            bgColor="bg-purple-50"
          />
        </div>

        {/* Remote Connect Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔌</span>
            Remote Connect (RC) Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="RC Success (COMPLETED)"
              value={analytics.rcSuccess}
              icon="✅"
              color="border-green-500"
              bgColor="bg-green-50"
            />
            <StatCard
              title="RC In Progress (COMINPROG)"
              value={analytics.rcInProgress}
              icon="⏳"
              color="border-yellow-500"
              bgColor="bg-yellow-50"
            />
          </div>
        </div>

        {/* Remote Disconnect Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔴</span>
            Remote Disconnect (DC) Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="DC Success (COMPLETED)"
              value={analytics.dcSuccess}
              icon="✅"
              color="border-green-500"
              bgColor="bg-green-50"
            />
            <StatCard
              title="DC In Progress (COMINPROG)"
              value={analytics.dcInProgress}
              icon="⏳"
              color="border-yellow-500"
              bgColor="bg-yellow-50"
            />
            <StatCard
              title="DC Failed/Discarded"
              value={analytics.dcFailed}
              icon="❌"
              color="border-red-500"
              bgColor="bg-red-50"
            />
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">RC Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.rcSuccess + analytics.rcInProgress > 0
                  ? ((analytics.rcSuccess / (analytics.rcSuccess + analytics.rcInProgress)) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">DC Success Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.dcSuccess + analytics.dcInProgress + analytics.dcFailed > 0
                  ? ((analytics.dcSuccess / (analytics.dcSuccess + analytics.dcInProgress + analytics.dcFailed)) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total RC Commands</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.rcSuccess + analytics.rcInProgress}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total DC Commands</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.dcSuccess + analytics.dcInProgress + analytics.dcFailed}
              </p>
            </div>
          </div>
        </div>

        {/* NOCS-wise Report */}
        {nocsData.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📍</span>
              NOCS-wise Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NOCS Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                      RC Success
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-100">
                      RC Success %
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50">
                      RC In Progress
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-100">
                      RC In Progress %
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                      DC Success
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-yellow-50">
                      DC In Progress
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-red-50">
                      DC Failed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nocsData.map((nocs, index) => {
                    const totalRC = nocs.rcSuccess + nocs.rcInProgress;
                    const rcSuccessPercent = totalRC > 0 ? ((nocs.rcSuccess / totalRC) * 100).toFixed(1) : 0;
                    const rcInProgressPercent = totalRC > 0 ? ((nocs.rcInProgress / totalRC) * 100).toFixed(1) : 0;

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {nocs.nocsName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-medium bg-green-50">
                          {nocs.rcSuccess}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-700 font-semibold bg-green-100">
                          {rcSuccessPercent}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-yellow-600 font-medium bg-yellow-50">
                          {nocs.rcInProgress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-yellow-700 font-semibold bg-yellow-100">
                          {rcInProgressPercent}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-medium bg-green-50">
                          {nocs.dcSuccess}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-yellow-600 font-medium bg-yellow-50">
                          {nocs.dcInProgress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-medium bg-red-50">
                          {nocs.dcFailed}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr className="font-bold">
                    <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                    <td className="px-6 py-4 text-sm text-center text-green-700 bg-green-50">
                      {nocsData.reduce((sum, nocs) => sum + nocs.rcSuccess, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-green-800 bg-green-100">
                      {(() => {
                        const totalRCSuccess = nocsData.reduce((sum, nocs) => sum + nocs.rcSuccess, 0);
                        const totalRCInProgress = nocsData.reduce((sum, nocs) => sum + nocs.rcInProgress, 0);
                        const totalRC = totalRCSuccess + totalRCInProgress;
                        return totalRC > 0 ? ((totalRCSuccess / totalRC) * 100).toFixed(1) : 0;
                      })()}%
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-yellow-700 bg-yellow-50">
                      {nocsData.reduce((sum, nocs) => sum + nocs.rcInProgress, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-yellow-800 bg-yellow-100">
                      {(() => {
                        const totalRCSuccess = nocsData.reduce((sum, nocs) => sum + nocs.rcSuccess, 0);
                        const totalRCInProgress = nocsData.reduce((sum, nocs) => sum + nocs.rcInProgress, 0);
                        const totalRC = totalRCSuccess + totalRCInProgress;
                        return totalRC > 0 ? ((totalRCInProgress / totalRC) * 100).toFixed(1) : 0;
                      })()}%
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-green-700 bg-green-50">
                      {nocsData.reduce((sum, nocs) => sum + nocs.dcSuccess, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-yellow-700 bg-yellow-50">
                      {nocsData.reduce((sum, nocs) => sum + nocs.dcInProgress, 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-red-700 bg-red-50">
                      {nocsData.reduce((sum, nocs) => sum + nocs.dcFailed, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RCDCAnalyticsPage;
