/**
 * Facilities Selector Component
 * Fetches facilities from API and allows selection based on type (checkbox, count, both)
 */
import React, { useState, useEffect } from "react";
import { API } from "../../config/urls";

const FacilitiesSelector = ({ 
  selectedFacilities = [], 
  facilityCounts = {}, 
  onFacilitiesChange, 
  onFacilityCountsChange,
  category = "both", // 'room', 'hostel', 'both'
  showCounts = true,
  disabled = false // For view mode
}) => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch facilities from API
  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get("/hostel/facilities");
        let facilitiesData = [];
        
        if (response.data) {
          if (response.data.success && response.data.data) {
            facilitiesData = response.data.data;
          } else if (Array.isArray(response.data.data)) {
            facilitiesData = response.data.data;
          } else if (Array.isArray(response.data)) {
            facilitiesData = response.data;
          }
        }
        
        // Filter by category and status
        const filtered = facilitiesData.filter(
          (f) => f.status === "active" && (f.category === category || f.category === "both")
        );
        
        // Sort by order (if available) or name
        filtered.sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
        
        setFacilities(filtered);
      } catch (err) {
        console.error("Error fetching facilities:", err);
        setError(err.message);
        // Fallback to empty array on error
        setFacilities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [category]);

  const handleCheckboxChange = (facilityId, checked) => {
    if (onFacilitiesChange) {
      const updatedFacilities = checked
        ? [...selectedFacilities, facilityId]
        : selectedFacilities.filter((id) => id !== facilityId);
      onFacilitiesChange(updatedFacilities);
    }
  };

  const handleCountChange = (facilityId, value) => {
    if (onFacilityCountsChange) {
      onFacilityCountsChange(facilityId, Number(value) || 0);
    }
  };

  // Separate facilities by type
  const checkboxFacilities = facilities.filter(
    (f) => f.type === "checkbox" || f.type === "both"
  );
  const countFacilities = facilities.filter(
    (f) => (f.type === "count" || f.type === "both") && showCounts
  );

  if (loading) {
    return <div className="text-sm text-gray-500">Loading facilities...</div>;
  }

  if (error && facilities.length === 0) {
    return <div className="text-sm text-red-500">Error loading facilities: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Checkbox Facilities (checkbox and both types) */}
      {checkboxFacilities.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facilities
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {checkboxFacilities.map((facility) => {
              const facilityId = facility._id || facility.id || facility.name;
              const isSelected = selectedFacilities.includes(facilityId);
              
              return (
                <label key={facilityId} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleCheckboxChange(facilityId, e.target.checked)}
                    disabled={disabled}
                    className={`rounded border-gray-300 text-[#525b88] ${disabled ? "cursor-not-allowed opacity-50" : "focus:ring-[#525b88]"}`}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {facility.icon && <span className="mr-1">{facility.icon}</span>}
                    {facility.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Count Facilities (count and both types) */}
      {showCounts && countFacilities.length > 0 && (
        <div className="mt-4 bg-gray-50 border border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Facilities Count (How many items)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {countFacilities.map((facility) => {
              const facilityId = facility._id || facility.id || facility.name;
              const countValue = facilityCounts[facilityId] || "";
              
              return (
                <div key={facilityId}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {facility.icon && <span className="mr-1">{facility.icon}</span>}
                    {facility.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={countValue}
                    onChange={(e) => handleCountChange(facilityId, e.target.value)}
                    disabled={disabled}
                    readOnly={disabled}
                    className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
                      disabled 
                        ? "bg-gray-100 cursor-not-allowed" 
                        : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                    }`}
                    placeholder="0"
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Enter the number of each facility/item available.
          </p>
        </div>
      )}

      {facilities.length === 0 && !loading && (
        <div className="text-sm text-gray-400">No facilities available</div>
      )}
    </div>
  );
};

export default FacilitiesSelector;
