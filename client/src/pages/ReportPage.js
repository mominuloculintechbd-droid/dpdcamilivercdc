import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Report from '../components/Report';

const ReportPage = () => {
  const { reportName } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/reports/${reportName}`);
        setData(response.data);
      } catch (err) {
        setError(err);
      }
    };

    fetchData();
  }, [reportName]);

  if (error) {
    return <div>Error fetching report: {error.message}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{reportName.replace(/_/g, ' ')}</h1>
      <Report data={data} reportName={reportName} />
    </div>
  );
};

export default ReportPage;