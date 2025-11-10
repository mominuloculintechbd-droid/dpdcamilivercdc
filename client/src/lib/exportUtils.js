import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Formats a cell value for export based on its type
 * @param {*} value - The value to format
 * @param {string} columnName - The column name to help detect type
 * @returns {*} - Formatted value
 */
function formatCellValue(value, columnName) {
  if (value === null || value === undefined) {
    return '';
  }

  // Detect date columns by name or format
  const isDateColumn = columnName.toUpperCase().includes('DATE') ||
                       columnName.toUpperCase().includes('TIME');

  if (isDateColumn && value) {
    // Try to parse as date
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  // Format numbers with thousand separators
  if (typeof value === 'number') {
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 2
    });
  }

  return value;
}

/**
 * Generates a filename with timestamp
 * @param {string} reportName - Name of the report
 * @param {string} extension - File extension (csv, xlsx, pdf)
 * @returns {string} - Formatted filename
 */
function generateFilename(reportName, extension) {
  const timestamp = new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
  return `${reportName}_${timestamp}.${extension}`;
}

/**
 * Exports data to Excel format with formatting
 * @param {Array} data - Array of objects to export
 * @param {string} reportName - Name of the report for filename
 */
export function exportToExcel(data, reportName) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get column headers
  const headers = Object.keys(data[0]);

  // Format data for Excel
  const formattedData = data.map(row => {
    const formattedRow = {};
    headers.forEach(header => {
      formattedRow[header] = formatCellValue(row[header], header);
    });
    return formattedRow;
  });

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(formattedData);

  // Auto-size columns
  const columnWidths = headers.map(header => {
    const maxLength = Math.max(
      header.length,
      ...data.map(row => {
        const value = String(formatCellValue(row[header], header));
        return value.length;
      })
    );
    return { wch: Math.min(maxLength + 2, 50) }; // Cap at 50 characters
  });
  ws['!cols'] = columnWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report Data');

  // Generate filename and download
  const filename = generateFilename(reportName, 'xlsx');
  XLSX.writeFile(wb, filename);
}

/**
 * Exports data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} reportName - Name of the report for filename
 */
export function exportToCSV(data, reportName) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get column headers
  const headers = Object.keys(data[0]);

  // Format data for CSV
  const formattedData = data.map(row => {
    const formattedRow = {};
    headers.forEach(header => {
      formattedRow[header] = formatCellValue(row[header], header);
    });
    return formattedRow;
  });

  // Create worksheet and export as CSV
  const ws = XLSX.utils.json_to_sheet(formattedData);
  const csv = XLSX.utils.sheet_to_csv(ws);

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', generateFilename(reportName, 'csv'));
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports data to PDF format with auto-layout table
 * @param {Array} data - Array of objects to export
 * @param {string} reportName - Name of the report for filename
 */
export function exportToPDF(data, reportName) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create PDF document
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

  // Get column headers
  const headers = Object.keys(data[0]);

  // Format data for PDF
  const formattedData = data.map(row => {
    return headers.map(header => formatCellValue(row[header], header));
  });

  // Add title
  const reportTitle = reportName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  doc.setFontSize(16);
  doc.text(reportTitle, 14, 15);

  // Add metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, 14, 22);
  doc.text(`Total Rows: ${data.length}`, 14, 27);

  // Add table with auto-layout
  doc.autoTable({
    head: [headers],
    body: formattedData,
    startY: 32,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      halign: 'left'
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 32, left: 14, right: 14 },
    didDrawPage: function(data) {
      // Footer with page number
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });

  // Save the PDF
  doc.save(generateFilename(reportName, 'pdf'));
}
