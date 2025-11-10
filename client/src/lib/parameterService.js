import axios from 'axios';

const STORAGE_PREFIX = 'report_param_';

/**
 * Fetch parameter metadata for a report
 * @param {string} reportName - Name of the report
 * @returns {Promise<Object|null>} - Parameter metadata or null if no parameters
 */
export async function getReportMetadata(reportName) {
  try {
    const response = await axios.get(`http://localhost:3001/api/reports/${reportName}/metadata`);
    return response.data;
  } catch (error) {
    // If metadata doesn't exist (404), report has no parameters
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Get remembered parameter values from localStorage
 * @param {string} reportName - Name of the report
 * @returns {Object} - Saved parameter values
 */
export function getRememberedParameters(reportName) {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${reportName}`);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading remembered parameters:', error);
    return {};
  }
}

/**
 * Save parameter values to localStorage
 * @param {string} reportName - Name of the report
 * @param {Object} parameters - Parameter values to remember
 */
export function rememberParameters(reportName, parameters) {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${reportName}`,
      JSON.stringify(parameters)
    );
  } catch (error) {
    console.error('Error saving parameters:', error);
  }
}

/**
 * Clear remembered parameters for a report
 * @param {string} reportName - Name of the report
 */
export function forgetParameters(reportName) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${reportName}`);
  } catch (error) {
    console.error('Error clearing parameters:', error);
  }
}

/**
 * Get initial parameter values (from storage or defaults)
 * @param {Object} metadata - Report metadata with parameter definitions
 * @param {string} reportName - Name of the report
 * @returns {Object} - Initial parameter values
 */
export function getInitialParameterValues(metadata, reportName) {
  if (!metadata || !metadata.parameters) {
    return {};
  }

  const remembered = getRememberedParameters(reportName);
  const values = {};

  metadata.parameters.forEach(param => {
    // Use remembered value if it exists, otherwise use default
    values[param.name] = remembered[param.name] !== undefined
      ? remembered[param.name]
      : param.default;
  });

  return values;
}

/**
 * Validate parameter values against metadata rules
 * @param {Object} values - Parameter values to validate
 * @param {Object} metadata - Report metadata with parameter definitions
 * @returns {Object} - Validation result with errors object
 */
export function validateParameters(values, metadata) {
  const errors = {};

  if (!metadata || !metadata.parameters) {
    return { isValid: true, errors };
  }

  metadata.parameters.forEach(param => {
    const value = values[param.name];

    // Check required
    if (param.required && (value === undefined || value === null || value === '')) {
      errors[param.name] = `${param.label} is required`;
      return;
    }

    // Skip validation if value is empty and not required
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Type-specific validation
    if (param.type === 'number') {
      const numValue = Number(value);

      if (isNaN(numValue)) {
        errors[param.name] = `${param.label} must be a valid number`;
        return;
      }

      if (param.min !== undefined && numValue < param.min) {
        errors[param.name] = `${param.label} must be at least ${param.min}`;
        return;
      }

      if (param.max !== undefined && numValue > param.max) {
        errors[param.name] = `${param.label} must be at most ${param.max}`;
        return;
      }
    }

    if (param.type === 'date') {
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) {
        errors[param.name] = `${param.label} must be a valid date`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
