import React, { useState, useEffect } from 'react';
import {
  getInitialParameterValues,
  validateParameters,
  rememberParameters,
  forgetParameters
} from '../lib/parameterService';

/**
 * Modal component for collecting report parameters before execution
 */
function ParameterModal({ isOpen, metadata, reportName, onExecute, onCancel }) {
  const [values, setValues] = useState({});
  const [rememberFlags, setRememberFlags] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize values when modal opens
  useEffect(() => {
    if (isOpen && metadata) {
      const initialValues = getInitialParameterValues(metadata, reportName);
      setValues(initialValues);

      // Initialize remember flags (default to false)
      const flags = {};
      metadata.parameters.forEach(param => {
        flags[param.name] = false;
      });
      setRememberFlags(flags);

      setErrors({});
    }
  }, [isOpen, metadata, reportName]);

  if (!isOpen || !metadata) return null;

  const handleValueChange = (paramName, value) => {
    setValues(prev => ({
      ...prev,
      [paramName]: value
    }));

    // Clear error for this field when user types
    if (errors[paramName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[paramName];
        return newErrors;
      });
    }
  };

  const handleRememberChange = (paramName, checked) => {
    setRememberFlags(prev => ({
      ...prev,
      [paramName]: checked
    }));
  };

  const handleExecute = () => {
    // Validate parameters
    const validation = validateParameters(values, metadata);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Save remembered parameters
    const toRemember = {};
    metadata.parameters.forEach(param => {
      if (rememberFlags[param.name]) {
        toRemember[param.name] = values[param.name];
      }
    });

    if (Object.keys(toRemember).length > 0) {
      rememberParameters(reportName, toRemember);
    } else {
      // Clear remembered values if user didn't check any boxes
      forgetParameters(reportName);
    }

    // Execute with parameters
    onExecute(values);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const renderInput = (param) => {
    const value = values[param.name] || '';
    const hasError = !!errors[param.name];

    const inputClasses = `w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 transition-colors ${
      hasError
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-blue-500'
    }`;

    if (param.type === 'number') {
      return (
        <input
          type="number"
          id={param.name}
          value={value}
          onChange={(e) => handleValueChange(param.name, e.target.value)}
          placeholder={param.placeholder}
          min={param.min}
          max={param.max}
          required={param.required}
          className={inputClasses}
        />
      );
    }

    if (param.type === 'date') {
      return (
        <input
          type="date"
          id={param.name}
          value={value}
          onChange={(e) => handleValueChange(param.name, e.target.value)}
          required={param.required}
          className={inputClasses}
        />
      );
    }

    // Default: text input
    return (
      <input
        type="text"
        id={param.name}
        value={value}
        onChange={(e) => handleValueChange(param.name, e.target.value)}
        placeholder={param.placeholder}
        required={param.required}
        className={inputClasses}
      />
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-900">
            Report Parameters
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {metadata.description || `Configure parameters for ${reportName} report`}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-5">
          {metadata.parameters.map((param) => (
            <div key={param.name} className="space-y-2">
              {/* Label */}
              <label
                htmlFor={param.name}
                className="block text-sm font-medium text-gray-900"
              >
                {param.label}
                {param.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* Description */}
              {param.description && (
                <p className="text-sm text-gray-600">{param.description}</p>
              )}

              {/* Input */}
              {renderInput(param)}

              {/* Error message */}
              {errors[param.name] && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors[param.name]}
                </p>
              )}

              {/* Remember checkbox */}
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberFlags[param.name] || false}
                  onChange={(e) => handleRememberChange(param.name, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember this value for next time</span>
              </label>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Execute Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParameterModal;
