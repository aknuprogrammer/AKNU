import { useState, useEffect } from "react";
import { collegesApi } from "../../../services/apiService";
import AddFormModal from "./AddFormModal";

const CollegeSelectorTable = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [viewingCollege, setViewingCollege] = useState(null);

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const response = await collegesApi.getAll();
        // Handle different API response structures
        const data = response?.data || response || [];
        setColleges(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  // Handle delete
  const handleDelete = async (_id) => {
    try {
      await collegesApi.delete(_id);
      setColleges(colleges.filter((college) => college._id !== _id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      if (editingCollege) {
        const updatedCollege = await collegesApi.update(
          editingCollege._id,
          formData
        );
        setColleges(
          colleges.map((c) =>
            c._id === editingCollege._id ? updatedCollege : c
          )
        );
      } else {
        const newCollege = await collegesApi.create(formData);
        setColleges([...colleges, newCollege]);
      }
      setShowAddForm(false);
      setEditingCollege(null);
    } catch (err) {
      setError(err.message);
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
        <h3 className="text-xl font-semibold text-gray-800">Colleges</h3>
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
                Date
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {college.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {college.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {college.date ? new Date(college.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }) : "-"}
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
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No colleges found
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
                      Address*:
                    </label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                      {viewingCollege.address || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      College Type*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCollege.collegeType || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      College Category*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCollege.collegeCategory || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Course Category*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCollege.courseCategory || "-"}
                    </p>
                  </div>
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Date*:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingCollege.date ? new Date(viewingCollege.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }) : "-"}
                    </p>
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeSelectorTable;
