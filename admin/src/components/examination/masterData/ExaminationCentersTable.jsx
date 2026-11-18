import { useState, useEffect } from "react";
import { collegesApi, examinationCentersApi } from "../../../services/apiService";
import AddFormModal from "./AddFormModal";
import { showSuccessMessage, showErrorMessage } from "../../../config/Toast";

const ExaminationCentersTable = ({ tabKey }) => {
  const [centers, setCenters] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingCenter, setViewingCenter] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch colleges from existing API
      const collegesData = await collegesApi.getAll();
      
      // Filter out inactive records for dropdowns
      const filterActive = (data) => {
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
          if (item.status !== undefined) {
            return item.status === 'Active';
          }
          return true;
        });
      };
      
      setColleges(filterActive(collegesData || []));

      // Fetch examination centers from API
      const centersData = await examinationCentersApi.getAll();
      setCenters(centersData || []);
      setError(null);
    } catch (err) {
      setError("Failed to load examination centers");
      showErrorMessage("Failed to load examination centers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this examination center?")) {
      try {
        await examinationCentersApi.delete(id);
        await fetchData(); // Refresh the list
        showSuccessMessage("Examination center deleted successfully");
      } catch (err) {
        showErrorMessage("Failed to delete examination center");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        await examinationCentersApi.update(editingItem._id, formData);
        showSuccessMessage("Examination center updated successfully");
      } else {
        await examinationCentersApi.create(formData);
        showSuccessMessage("Examination center created successfully");
      }
      await fetchData(); // Refresh the list
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      showErrorMessage("Failed to save examination center");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );

  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Examination Centers</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage examination centers
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowAddForm(true);
          }}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Examination Center
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Center Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Center Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                College/Campus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {centers.length > 0 ? (
              centers.map((center, index) => {
                // Handle both populated object and ObjectId string
                const collegeId = typeof center.collegeId === 'object' && center.collegeId?._id 
                  ? center.collegeId._id 
                  : center.collegeId;
                const college = typeof center.collegeId === 'object' && center.collegeId?.name
                  ? center.collegeId
                  : colleges.find((c) => c._id === collegeId);
                return (
                  <tr key={center._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {center.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {center.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {college?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          center.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {center.status || "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingCenter(center)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                          title="View"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            // Normalize collegeId - extract _id if it's a populated object
                            const normalizedCenter = {
                              ...center,
                              collegeId: typeof center.collegeId === 'object' && center.collegeId?._id
                                ? center.collegeId._id
                                : center.collegeId
                            };
                            setEditingItem(normalizedCenter);
                            setShowAddForm(true);
                          }}
                          className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                          title="Edit"
                        >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(center._id)}
                          className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <p className="text-gray-600">No examination centers found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Add Examination Center" to create one
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddFormModal
          tabKey={tabKey}
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* View Examination Center Details Modal */}
      {viewingCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">
                View Examination Center
              </h3>
              <button
                onClick={() => setViewingCenter(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Center Code*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCenter.code || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Center Name*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCenter.name || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      College/Campus*:
                    </label>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {typeof viewingCenter.collegeId === 'object' && viewingCenter.collegeId?.name
                          ? viewingCenter.collegeId.name
                          : colleges.find((c) => c._id === (typeof viewingCenter.collegeId === 'object' ? viewingCenter.collegeId?._id : viewingCenter.collegeId))?.name || "-"}
                    </p>
                      {typeof viewingCenter.collegeId === 'object' && viewingCenter.collegeId?.code && (
                        <p className="text-xs text-gray-500">
                          {viewingCenter.collegeId.code}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Capacity (Total Seats)*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCenter.capacity || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Number of Rooms:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCenter.rooms || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Status*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCenter.status || "Inactive"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Contact Person*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCenter.contactPerson || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Contact Number*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCenter.contactNumber || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Email:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCenter.email || "-"}
                    </p>
                  </div>
                </div>
                <div className="mb-5 flex items-start gap-3">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                    Address*:
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                    {viewingCenter.address || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setViewingCenter(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminationCentersTable;
