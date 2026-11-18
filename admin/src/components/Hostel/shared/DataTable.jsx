/**
 * Reusable DataTable Component for Hostel Management
 * Extends GlobalTable with sorting and additional features
 */
import React, { useMemo } from "react";
import GlobalTable from "../../../utils/GlobalComponents/table/Table";
import { Eye } from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  sortConfig = { key: null, direction: "asc" },
  onSort,
  emptyState = {
    title: "No records found",
    message: "Records will appear here once data is available.",
  },
  className = "",
}) => {
  /**
   * Handle action clicks
   */
  const handleActionClick = (actionType, row, rowIndex) => {
    switch (actionType) {
      case "view":
        if (onView) onView(row._id || row.id, row);
        break;
      case "edit":
        if (onEdit) onEdit(row._id || row.id, row);
        break;
      case "delete":
        if (onDelete) onDelete(row._id || row.id, row);
        break;
      default:
        console.warn(`Unknown action type: ${actionType}`);
    }
  };

  /**
   * Build actions array based on available handlers
   */
  const actions = useMemo(() => {
    const actionList = [];
    
    if (onView) {
      actionList.push({
        type: "view",
        icon: <Eye className="w-5 h-5" />,
        title: "View Details",
        className: "text-blue-600 hover:text-blue-900",
      });
    }
    
    if (onEdit) {
      actionList.push({
        type: "edit",
        icon: <PencilIcon className="h-4 w-4" />,
        title: "Edit",
        className: "text-[#525b88] hover:text-[#3a4166]",
      });
    }
    
    if (onDelete) {
      actionList.push({
        type: "delete",
        icon: <TrashIcon className="h-4 w-4" />,
        title: "Delete",
        className: "text-red-500 hover:text-red-700",
      });
    }

    return actionList;
  }, [onView, onEdit, onDelete]);

  /**
   * Enhanced columns with sorting support
   */
  const enhancedColumns = useMemo(() => {
    return columns.map((col) => {
      const isSortable = col.sortable !== false && onSort;
      const isActiveSort = sortConfig.key === col.key;

      return {
        ...col,
        title: isSortable ? (
          <div
            className="flex items-center cursor-pointer hover:opacity-80"
            onClick={() => onSort(col.key)}
          >
            {col.title}
            {isActiveSort && (
              <span className="ml-1">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        ) : (
          col.title
        ),
        headerClassName: isSortable ? "cursor-pointer" : col.headerClassName,
      };
    });
  }, [columns, sortConfig, onSort]);

  // Error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p className="font-medium">Error loading data</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <GlobalTable
        data={data}
        columns={enhancedColumns}
        actions={actions}
        loading={loading}
        emptyState={emptyState}
        onActionClick={handleActionClick}
        striped={true}
        hoverable={true}
      />
    </div>
  );
};

export default DataTable;

