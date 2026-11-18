/**
 * Reusable StatusBadge Component
 * Displays status with appropriate color coding
 */
import React from "react";

const StatusBadge = ({ 
  status, 
  statusConfig = {},
  className = "",
  size = "md" 
}) => {
  // Default status configurations
  const defaultStatusConfig = {
    active: { color: "bg-green-100 text-green-800", label: "Active" },
    inactive: { color: "bg-red-100 text-red-800", label: "Inactive" },
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    approved: { color: "bg-blue-100 text-blue-800", label: "Approved" },
    rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    completed: { color: "bg-green-100 text-green-800", label: "Completed" },
    cancelled: { color: "bg-gray-100 text-gray-800", label: "Cancelled" },
    available: { color: "bg-green-100 text-green-800", label: "Available" },
    occupied: { color: "bg-blue-100 text-blue-800", label: "Occupied" },
    maintenance: { color: "bg-orange-100 text-orange-800", label: "Maintenance" },
    reserved: { color: "bg-purple-100 text-purple-800", label: "Reserved" },
    ...statusConfig,
  };

  // Size configurations
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const statusKey = status?.toLowerCase() || "";
  const config = defaultStatusConfig[statusKey] || {
    color: "bg-gray-100 text-gray-800",
    label: status || "Unknown",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses[size]} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;

