import { useState, useEffect } from "react";
import { collegesApi } from "../../../services/apiService";
import AddFormModal from "./AddFormModal";
import { showSuccessMessage, showErrorMessage } from "../../../config/Toast";

const CollegesTable = ({ tabKey }) => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [viewingCollege, setViewingCollege] = useState(null);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await collegesApi.getAll();
      
      // Helper function to extract data from API response
      const extractData = (response) => {
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data)) return response.data;
        if (response?.success && response?.data && Array.isArray(response.data)) return response.data;
        return [];
      };
      
      const collegesData = extractData(response);
      setColleges(collegesData);
      setError(null);
    } catch (err) {
      setError("Failed to load colleges");
      showErrorMessage("Failed to load colleges");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id) => {
    if (window.confirm("Are you sure you want to delete this college?")) {
      try {
        await collegesApi.delete(_id);
        setColleges(colleges.filter((college) => college._id !== _id));
        showSuccessMessage("College deleted successfully");
      } catch (err) {
        showErrorMessage("Failed to delete college");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCollege) {
        await collegesApi.update(editingCollege._id, formData);
        showSuccessMessage("College updated successfully");
      } else {
        await collegesApi.create(formData);
        showSuccessMessage("College created successfully");
      }
      await fetchColleges();
      setShowAddForm(false);
      setEditingCollege(null);
    } catch (err) {
      showErrorMessage("Failed to save college");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Colleges</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage colleges and campuses
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCollege(null);
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
          Add College
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                College Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                College Name
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
            {colleges.length > 0 ? (
              colleges.map((college) => (
                <tr key={college._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {college.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {college.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        college.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {college.status || "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingCollege(college)}
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
                          setEditingCollege(college);
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
                        onClick={() => handleDelete(college._id)}
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
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
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
                    <p className="text-gray-600">No colleges found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Add College" to create one
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
          tabKey="colleges"
          initialData={editingCollege}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingCollege(null);
          }}
        />
      )}

      {/* View College Details Modal */}
      {viewingCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">
                View College
              </h3>
              <button
                onClick={() => setViewingCollege(null)}
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
                      College Code*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCollege.code || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      College Name*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCollege.name || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-start gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                      Address Line 1*:
                    </label>
                    <p className="text-sm text-gray-900 flex-1">
                      {viewingCollege.addressLine1 || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-start gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                      Address Line 2:
                    </label>
                    <p className="text-sm text-gray-900 flex-1">
                      {viewingCollege.addressLine2 || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      City*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCollege.city || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      District*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCollege.district || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      State*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCollege.state || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Pincode*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCollege.pincode || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      College Type*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {typeof viewingCollege.collegeTypeId === 'object' && viewingCollege.collegeTypeId?.name
                        ? viewingCollege.collegeTypeId.name
                        : viewingCollege.collegeType || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      College Category*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {typeof viewingCollege.collegeCategoryId === 'object' && viewingCollege.collegeCategoryId?.name
                        ? viewingCollege.collegeCategoryId.name
                        : viewingCollege.collegeCategory || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      College Other Category*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {typeof viewingCollege.courseCategoryId === 'object' && viewingCollege.courseCategoryId?.name
                        ? viewingCollege.courseCategoryId.name
                        : viewingCollege.courseCategory || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Status*:
                    </label>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        viewingCollege.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {viewingCollege.status || "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="mb-5 flex items-start gap-3">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                    Comments:
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                    {viewingCollege.comments || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setViewingCollege(null)}
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

export default CollegesTable;

