import React, { useState, useEffect } from "react";
import AddFormModal from "./AddFormModal";
import { collegeCourseMappingApi } from "../../../services/apiService";

const CollegeCourseMapping = () => {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch college-course mappings
  useEffect(() => {
    const fetchMappings = async () => {
      try {
        setLoading(true);
        const data = await collegeCourseMappingApi.getAll();
        setMappings(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMappings();
  }, []);


  // Filter mappings based on search term
  const filteredMappings = mappings.filter(
    (mapping) =>
      mapping.college?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.college?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.courses?.some(
        (course) =>
          course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await collegeCourseMappingApi.delete(id);
      // Refetch the data to ensure UI is in sync with backend
      const data = await collegeCourseMappingApi.getAll();
      setMappings(data);
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
      setDeleteConfirm(null);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      if (editingMapping) {
        const updatedMapping = await collegeCourseMappingApi.update(
          editingMapping._id,
          formData
        );
        setMappings(
          mappings.map((m) => (m.id === editingMapping.id ? updatedMapping : m))
        );
      } else {
        // Create new mapping and then refetch all data
        await collegeCourseMappingApi.create(formData);
        // Refetch all mappings to ensure UI is in sync with backend
        const data = await collegeCourseMappingApi.getAll();
        setMappings(data);
      }
      setShowAddForm(false);
      setEditingMapping(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleRowExpansion = (mappingId) => {
    setExpandedRow(expandedRow === mappingId ? null : mappingId);
  };

  const confirmDelete = (mapping) => {
    setDeleteConfirm({
      id: mapping._id,
      collegeName: mapping.college?.name,
      courseCount: mapping.courses?.length,
    });
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
        <h3 className="text-xl font-semibold text-gray-800">
          College-Course Mapping
        </h3>
        <button
          onClick={() => {
            setEditingMapping(null);
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
          Add Mapping
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by college name, code, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                College
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Courses
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Total Courses
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMappings.length > 0 ? (
              filteredMappings.map((mapping) => (
                <React.Fragment key={mapping._id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleRowExpansion(mapping._id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-600 font-medium">
                            {mapping.college?.code
                              ?.substring(0, 3)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {mapping.college?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {mapping.college?.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {mapping.courses
                          ?.slice(0, 2)
                          .map((course) => course.name)
                          .join(", ")}
                        {mapping.courses?.length > 2 && (
                          <span className="text-gray-500">
                            ... and {mapping.courses.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {mapping.courses?.length} courses
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMapping(mapping);
                          setShowAddForm(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(mapping);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedRow === mapping._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="px-6 py-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            All Courses for {mapping.college?.name}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {mapping.courses?.map((course) => (
                              <div
                                key={course._id}
                                className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {course.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Code: {course.code}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-8 text-center text-sm text-gray-500"
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <p className="text-gray-600">No mappings found</p>
                    {searchTerm && (
                      <p className="text-sm text-gray-500 mt-1">
                        Try adjusting your search terms
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-md border border-gray-100 rounded-xl shadow-2xl bg-white">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-red-600 to-red-500">
              <h3 className="text-lg font-semibold text-white">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 text-center mb-2">
                  Delete Mapping?
                </h4>
                <p className="text-gray-600 text-center">
                  Are you sure you want to delete the mapping for{" "}
                  <strong>{deleteConfirm.collegeName}</strong> with{" "}
                  <strong>{deleteConfirm.courseCount} courses</strong>? This
                  action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 p-6 border-t border-gray-100">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="px-5 py-2.5 transition-all text-white rounded-lg shadow-md shadow-red-100 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <AddFormModal
          tabKey="collegeCourseMapping"
          initialData={editingMapping}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingMapping(null);
          }}
        />
      )}
    </div>
  );
};

export default CollegeCourseMapping;
