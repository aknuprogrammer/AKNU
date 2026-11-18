// components/GlobalTable.jsx
import React from 'react';

const GlobalTable = ({
  data = [],
  columns = [],
  actions = [],
  emptyState = {
    title: "No records found",
    message: "No data available to display."
  },
  className = "",
  striped = true,
  hoverable = true,
  fixedActions = false,
  loading = false,
  onActionClick = () => {},
  onCellClick = () => {}
}) => {
  // Helper function to safely get value with fallback
  const getValueWithFallback = (value, fallback) => {
    return value ?? fallback;
  };

  // Render cell content based on column configuration
  const renderCellContent = (row, column, rowIndex) => {
    const value = row[column.key];
    
    // Custom render function has highest priority
    if (column.render) {
      return column.render(value, row, rowIndex);
    }

    // Predefined cell types
    switch (column.cellType) {
      case 'text':
        return getValueWithFallback(value, (column.placeholder || '-'));
      
      case 'badge':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${column.badgeColor || 'bg-gray-100 text-gray-800'}`}>
            {getValueWithFallback(value, (column.placeholder || '-'))}
          </span>
        );
      
      case 'status':
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
          completed: 'bg-blue-100 text-blue-800',
          cancelled: 'bg-gray-100 text-gray-800',
          ...column.statusColors
        };
        const colorClass = statusColors[value] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {getValueWithFallback(value, (column.placeholder || '-'))}
          </span>
        );
      
      case 'boolean':
        const displayValue = value ? (column.trueText || 'Yes') : (column.falseText || 'No');
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {displayValue}
          </span>
        );
      
      case 'number':
        const numValue = getValueWithFallback(value, 0);
        return column.format ? column.format(numValue) : numValue.toString();
      
      case 'date':
        if (!value) return column.placeholder || '-';
        return new Date(value).toLocaleDateString();
      
      case 'datetime':
        if (!value) return column.placeholder || '-';
        return new Date(value).toLocaleString();
      
      case 'currency':
        const amount = getValueWithFallback(value, 0);
        const formatted = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: column.currency || 'INR'
        }).format(amount);
        return formatted;
      
      case 'percentage':
        const percentValue = getValueWithFallback(value, 0);
        return `${percentValue}%`;
      
      case 'avatar':
        return (
          <div className="flex items-center">
            {value ? (
              <img className="h-8 w-8 rounded-full" src={value} alt="" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-600">
                  {column.avatarFallback || 'NA'}
                </span>
              </div>
            )}
          </div>
        );
      
      case 'actions':
        return (
          <div className="flex gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onActionClick(action.type, row, rowIndex);
                }}
                className={`flex items-center gap-1 text-sm ${
                  action.disabled?.(row) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                } ${action.className || 'text-gray-600 hover:text-gray-900'}`}
                title={action.title}
                disabled={action.disabled?.(row)}
              >
                {action.icon}
                {action.text}
              </button>
            ))}
          </div>
        );
      
      case 'custom':
      default:
        return getValueWithFallback(value, (column.placeholder || '-'));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-12 bg-[#525B88]"></div>
          {/* Rows skeleton */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-16 border-b border-gray-200 flex items-center px-6 ${
              striped && i % 2 === 0 ? 'bg-gray-50' : ''
            }`}>
              {columns.map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1 mx-2 first:ml-0 last:mr-0"></div>
              ))}
              {actions.length > 0 && (
                <div className="h-4 bg-gray-200 rounded w-20 ml-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-[#525B88]">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={`px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${
                    column.headerClassName || ''
                  } ${column.fixed ? 'sticky right-0 z-20 bg-[#525B88]' : ''}`}
                >
                  {column.title}
                </th>
              ))}
              {actions.length > 0 && (
                <th className={`px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${
                  fixedActions ? 'sticky right-0 z-20 bg-[#525B88]' : ''
                }`}>
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`transition-colors duration-150 ${
                    hoverable ? 'hover:bg-gray-50' : ''
                  } ${striped && rowIndex % 2 === 0 ? 'bg-gray-50' : ''} ${
                    row.rowClassName || ''
                  }`}
                  onClick={() => onCellClick('row', row, rowIndex)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key || colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.cellClassName || ''
                      } ${column.fixed ? `sticky right-0 z-10 bg-white hover:bg-gray-50 ${
                        striped && rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }` : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCellClick('cell', row, rowIndex, column.key);
                      }}
                    >
                      {renderCellContent(row, column, rowIndex)}
                    </td>
                  ))}
                  
                  {actions.length > 0 && (
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      fixedActions ? `sticky right-0 z-10 bg-white hover:bg-gray-50 ${
                        striped && rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      }` : ''
                    }`}>
                      <div className="flex gap-3">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              onActionClick(action.type, row, rowIndex);
                            }}
                            className={`flex items-center gap-1 ${
                              action.disabled?.(row) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                            } ${action.className || 'text-gray-600 hover:text-gray-900'}`}
                            title={action.title}
                            disabled={action.disabled?.(row)}
                          >
                            {action.icon}
                            {action.text}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
                  className="px-6 py-12 text-center"
                >
                  <div className="text-gray-400 text-lg font-medium mb-2">
                    {emptyState.title}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {emptyState.message}
                  </p>
                  {emptyState.action && (
                    <button
                      onClick={emptyState.onAction}
                      className="mt-4 px-4 py-2 bg-[#525B88] text-white rounded-lg hover:bg-[#454d75] text-sm"
                    >
                      {emptyState.action}
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalTable;