/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions [{key: 'field', label: 'Header'}]
 * @param {String} filename - Name of the file (without extension)
 */
export const exportToCSV = (data, columns, filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create CSV header
  const headers = columns.map(col => col.label || col.key).join(',');
  
  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = '';
      
      // Handle nested properties (e.g., 'book.bookTitle')
      const keys = col.key.split('.');
      value = keys.reduce((obj, key) => {
        if (obj && typeof obj === 'object') {
          return obj[key];
        }
        return obj;
      }, item);
      
      // Handle special formatting
      if (col.format && typeof col.format === 'function') {
        value = col.format(value, item);
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        value = '';
      }
      
      // Escape commas and quotes in CSV
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""'); // Escape quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
      }
      
      return value;
    }).join(',');
  });
  
  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export data to Excel (XLSX) - requires xlsx library
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions
 * @param {String} filename - Name of the file
 */
export const exportToExcel = async (data, columns, filename = 'export') => {
  try {
    // Dynamic import of xlsx library
    const XLSX = await import('xlsx');
    
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Prepare worksheet data
    const worksheetData = data.map(item => {
      const row = {};
      columns.forEach(col => {
        const keys = col.key.split('.');
        let value = keys.reduce((obj, key) => {
          if (obj && typeof obj === 'object') {
            return obj[key];
          }
          return obj;
        }, item);
        
        if (col.format && typeof col.format === 'function') {
          value = col.format(value, item);
        }
        
        row[col.label || col.key] = value || '';
      });
      return row;
    });
    
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Download
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    // Fallback to CSV if xlsx library is not available
    exportToCSV(data, columns, filename);
  }
};

