import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import ExportModal from './ExportModal';
import { exportToExcel, exportToCSV, exportToPDF } from '../lib/exportUtils';

const Report = ({ data, reportName = 'report' }) => {
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);

  if (!data || data.length === 0) {
    return <p>No data available for this report.</p>;
  }

  const headers = Object.keys(data[0]);

  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(filter.toLowerCase())
    )
  );

  const handleExportClick = (format) => {
    setSelectedFormat(format);
    setModalOpen(true);
  };

  const handleExport = (exportAll) => {
    const dataToExport = exportAll ? data : filteredData;

    switch (selectedFormat) {
      case 'Excel':
        exportToExcel(dataToExport, reportName);
        break;
      case 'CSV':
        exportToCSV(dataToExport, reportName);
        break;
      case 'PDF':
        exportToPDF(dataToExport, reportName);
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Export Buttons */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => handleExportClick('Excel')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to Excel
        </button>
        <button
          onClick={() => handleExportClick('CSV')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to CSV
        </button>
        <button
          onClick={() => handleExportClick('PDF')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to PDF
        </button>
      </div>

      {/* Filter Input */}
      <div className="mb-4">
        <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter data
        </label>
        <input
          id="filter"
          type="text"
          placeholder="Type to filter across all columns..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        {filter && (
          <p className="mt-1 text-sm text-gray-600">
            Showing {filteredData.length} of {data.length} rows
          </p>
        )}
      </div>

      <div className="rounded-md border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <TableCell key={colIndex}>{row[header]}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={headers.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onExport={handleExport}
        format={selectedFormat}
        totalRows={data.length}
        filteredRows={filteredData.length}
      />
    </div>
  );
};

export default Report;