/**
 * Reusable SummaryCard Component
 * Displays key metrics and statistics
 */
import React from "react";

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  trend,
  subtitle,
  onClick,
  className = "",
}) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  const cardColor = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#525b88]">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`text-xs mt-1 ${trend.positive ? "text-green-600" : "text-red-600"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${cardColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;

