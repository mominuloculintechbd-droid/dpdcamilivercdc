import React, { useState } from 'react';

/**
 * Modal component for choosing between exporting all data or filtered data
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback to close the modal
 * @param {Function} props.onExport - Callback with selection (true for all, false for filtered)
 * @param {string} props.format - Export format (Excel, CSV, PDF)
 * @param {number} props.totalRows - Total number of rows in dataset
 * @param {number} props.filteredRows - Number of rows after filtering
 */
function ExportModal({ isOpen, onClose, onExport, format, totalRows, filteredRows }) {
  const [selection, setSelection] = useState('all');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(selection === 'all');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Export to {format}
          </h3>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">
            Choose which data to export:
          </p>

          <div className="space-y-3">
            {/* All Data Option */}
            <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="exportOption"
                value="all"
                checked={selection === 'all'}
                onChange={(e) => setSelection(e.target.value)}
                className="mt-0.5 mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Export all data
                </div>
                <div className="text-sm text-gray-600">
                  {totalRows.toLocaleString()} rows
                </div>
              </div>
            </label>

            {/* Filtered Data Option */}
            <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="exportOption"
                value="filtered"
                checked={selection === 'filtered'}
                onChange={(e) => setSelection(e.target.value)}
                className="mt-0.5 mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Export filtered data only
                </div>
                <div className="text-sm text-gray-600">
                  {filteredRows.toLocaleString()} rows
                  {filteredRows === totalRows && (
                    <span className="text-gray-500"> (no filter applied)</span>
                  )}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
