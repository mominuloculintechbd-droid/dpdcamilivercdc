import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ParameterModal from '../components/ParameterModal';
import { getReportMetadata } from '../lib/parameterService';

const ReportPage = () => {
  const { reportName } = useParams();
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState(null);
  const [showParameterModal, setShowParameterModal] = useState(false);
  const executedRef = useRef(false);

  // Load metadata on mount
  useEffect(() => {
    // Reset execution flag when report changes
    executedRef.current = false;

    const loadMetadata = async () => {
      setShowParameterModal(false);

      try {
        const meta = await getReportMetadata(reportName);
        setMetadata(meta);

        if (meta && meta.parameters && meta.parameters.length > 0) {
          // Report has parameters - show modal first
          setShowParameterModal(true);
        } else {
          // No parameters - execute in background by default
          if (!executedRef.current) {
            executedRef.current = true;
            executeInBackground({});
          }
        }
      } catch (err) {
        console.error('Error loading metadata:', err);
        // If metadata loading fails, execute in background anyway
        if (!executedRef.current) {
          executedRef.current = true;
          executeInBackground({});
        }
      }
    };

    loadMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportName]);

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
    executeInBackground(parameters);
  };

  const handleParameterCancel = () => {
    // Navigate back without executing
    navigate(-1);
  };

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
    </>
  );
};

export default ReportPage;