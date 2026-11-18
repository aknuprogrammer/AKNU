/**
 * Reusable FilterBar Component for Hostel Management
 * Provides consistent filtering UI across all hostel modules
 */
import React, { useState } from "react";
import { Filter } from "lucide-react";

const FilterBar = ({ 
  filters = {}, 
  onFilter, 
  filterConfig = [],
  className = "" 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  /**
   * Handle input change for any filter field
   */
  const handleChange = (name, value) => {
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
    // Real-time filtering (optional - can be removed if only on submit)
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onFilter) {
      onFilter(localFilters);
    }
  };

  /**
   * Reset all filters
   */
  const handleReset = () => {
    const resetFilters = {};
    filterConfig.forEach((config) => {
      resetFilters[config.name] = config.defaultValue || "";
    });
    setLocalFilters(resetFilters);
    if (onFilter) {
      onFilter(resetFilters);
    }
  };

  /**
   * Render filter field based on type
   */
  const renderFilterField = (config) => {
    const { name, type, placeholder, options, label, className: fieldClassName } = config;
    const value = localFilters[name] || "";

    const baseInputClass = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]";

    switch (type) {
      case "select":
        return (
          <select
            name={name}
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            className={`${baseInputClass} ${fieldClassName || ""}`}
          >
            <option value="">{placeholder || `All ${label || name}`}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "date":
        return (
          <input
            type="date"
            name={name}
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            className={`${baseInputClass} ${fieldClassName || ""}`}
            placeholder={placeholder}
          />
        );

      case "number":
        return (
          <input
            type="number"
            name={name}
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            className={`${baseInputClass} ${fieldClassName || ""}`}
            placeholder={placeholder}
            min={config.min}
            max={config.max}
          />
        );

      default: // text input
        return (
          <input
            type="text"
            name={name}
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            className={`${baseInputClass} ${fieldClassName || ""}`}
            placeholder={placeholder || `Search ${label || name}...`}
          />
        );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col md:flex-row md:items-center gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg ${className}`}
    >
      {/* Filter Fields */}
      {filterConfig.map((config) => (
        <div key={config.name} className={`flex-1 min-w-[120px] ${config.fullWidth ? "md:col-span-2" : ""}`}>
          {config.label && (
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {config.label}
            </label>
          )}
          {renderFilterField(config)}
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-2 items-end">
        <button
          type="submit"
          className="flex items-center justify-center px-4 py-2 h-[37px] rounded-md text-sm font-medium transition-colors bg-[#525B88] text-white hover:bg-[#3a4166]"
          title="Apply Filters"
        >
          <Filter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 h-[37px] rounded-md text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
          title="Reset Filters"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default FilterBar;

