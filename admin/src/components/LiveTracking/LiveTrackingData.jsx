import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Eye } from "lucide-react";
import { API } from "../../config/urls";

// Simulated API call

const LiveTrackingData = () => {
  const [journeys, setJourneys] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalRecords: 0,
  });
  const limit = 5;

  // Fetch paginated journeys
  const fetchJourneys = async (pageNum = 1) => {
    try {
      const res = await API.get(
        `/faculty-tracking/tracking-data?page=${pageNum}&limit=${limit}`
      );

      if (res.data.success) {
        setJourneys(res.data.data);
        setPagination({
          totalPages: res.data.totalPages,
          totalRecords: res.data.totalRecords,
        });
      }
    } catch (err) {
      console.error("Error fetching journeys:", err);
    }
  };

  useEffect(() => {
    fetchJourneys(page);
  }, [page]);

  // Smart pagination generator
  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const current = page;
    const maxVisible = 4;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);

    if (current <= 3) {
      start = 2;
      end = Math.min(maxVisible - 1, total - 1);
    }

    if (current >= total - 2) {
      start = Math.max(2, total - (maxVisible - 2));
      end = total - 1;
    }

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("...");
    if (total > 1) pages.push(total);

    return pages;
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  // Open map with all journey points
  const openMapView = (journey) => {
    try {
      const params = new URLSearchParams();

      // Add start coordinates
      if (journey.startCoordinates) {
        params.append("startLat", journey.startCoordinates.lat || 0);
        params.append("startLng", journey.startCoordinates.lng || 0);
      }

      // Add current location
      if (journey.currentLocation) {
        params.append("currentLat", journey.currentLocation.lat || 0);
        params.append("currentLng", journey.currentLocation.lng || 0);
      }

      // Add end coordinates
      if (journey.endCoordinates) {
        params.append("endLat", journey.endCoordinates.lat || 0);
        params.append("endLng", journey.endCoordinates.lng || 0);
      }

      // Add stop points as JSON string
      if (journey.stopPoints && journey.stopPoints.length > 0) {
        const simplifiedStops = journey.stopPoints.map((stop) => ({
          coordinates: stop.coordinates,
          name: stop.name || "",
          location: stop.location || "",
          description: stop.description || "",
        }));
        params.append("stopPoints", JSON.stringify(simplifiedStops));
      }

      const url = `/map-view?${params.toString()}`;
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error opening map view:", error);
      alert("Error opening map view. Please check console for details.");
    }
  };

  // Open details page
  const openDetailsView = (journeyId) => {
    const url = `/journey-details?id=${journeyId}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Live Tracking Data
        </h1>
        <p className="text-gray-600">Manage and track faculty journeys</p>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Tracking Records
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all faculty tracking data
            </p>
          </div>
        </div>

        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  From Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  To Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Faculty Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Stop Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {journeys?.length > 0 ? (
                journeys.map((e, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {e.purpose || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {e.fromLocation || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {e.toLocation || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {e.facultyId?.fullName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {e.facultyId?.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          e.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : e.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {e.status
                          ? e.status.charAt(0).toUpperCase() + e.status.slice(1)
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {e.stopPoints?.length || 0} stops
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openMapView(e)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                          title="View Map"
                        >
                          <MapPin className="h-5 w-5 text-yellow-600" />
                        </button>
                        <button
                          onClick={() => openDetailsView(e._id)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5 text-blue-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <p className="text-gray-600">No tracking records found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Tracking data will appear here when available
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Section */}
      <div className="flex justify-end items-center gap-2 mt-3">
        {/* Prev Button */}
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum, index) =>
            pageNum === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-500 select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  pageNum === page
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {pageNum}
              </button>
            )
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNextPage}
          disabled={page >= pagination.totalPages}
          className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// export default LiveTrackingData;

// export default LiveTrackingData

export default LiveTrackingData;
