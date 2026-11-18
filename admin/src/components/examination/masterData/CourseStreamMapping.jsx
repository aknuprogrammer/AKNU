import { useEffect, useMemo, useState } from "react";
import { coursesApi, courseStreamMappingsApi, streamsApi, semestersApi, subjectsApi } from "../../../services/apiService";
import AddFormModal from "./AddFormModal";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";

const CourseStreamMapping = ({ tabKey }) => {
  const [mappings, setMappings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [coursesResponse, streamsData, mappingsResponse] = await Promise.all([
        coursesApi.getAll().catch(() => ({ data: [] })),
        streamsApi.getAll().catch(() => []),
        courseStreamMappingsApi.getAll().catch(() => ({ data: [] }))
      ]);

      // Handle nested response structure for courses
      const coursesData = Array.isArray(coursesResponse) 
        ? coursesResponse 
        : (coursesResponse?.data || []);
      
      // Filter active courses
      const filterActive = (data) => {
        if (!Array.isArray(data)) return [];
        return data.filter(item => {
          if (item.status !== undefined) {
            return item.status === 'Active';
          }
          return true;
        });
      };
      
      setCourses(filterActive(coursesData));

      // Filter active streams
      const streamsArray = Array.isArray(streamsData) ? streamsData : [];
      setStreams(filterActive(streamsArray));

      // Handle nested response structure for mappings
      const mappingsData = Array.isArray(mappingsResponse) 
        ? mappingsResponse 
        : (mappingsResponse?.data || []);
      
      setMappings(mappingsData);
      setError(null);
    } catch (err) {
      setError("Failed to load course-stream mappings");
      showErrorMessage("Failed to load course-stream mappings");
    } finally {
      setLoading(false);
    }
  };


  const filteredMappings = useMemo(() => {
    // Filter active mappings by default
    const activeMappings = mappings.filter(mapping => {
      // Handle both populated objects and IDs
      const courseId = typeof mapping.courseId === 'object' && mapping.courseId?._id 
        ? mapping.courseId._id 
        : mapping.courseId;
      const streamId = typeof mapping.streamId === 'object' && mapping.streamId?._id 
        ? mapping.streamId._id 
        : mapping.streamId;
      
      // Check if course and stream are active
      const course = typeof mapping.courseId === 'object' && mapping.courseId?.name
        ? mapping.courseId
        : courses.find((c) => (c._id || c.id) === courseId);
      const stream = typeof mapping.streamId === 'object' && mapping.streamId?.name
        ? mapping.streamId
        : streams.find((s) => (s._id || s.id) === streamId);
      
      // Only show if mapping is active and both course and stream are active
      const mappingActive = mapping.status === 'Active' || mapping.status === undefined;
      const courseActive = !course || course.status === 'Active' || course.status === undefined;
      const streamActive = !stream || stream.status === 'Active' || stream.status === undefined;
      
      return mappingActive && courseActive && streamActive;
    });

    const term = searchTerm.trim().toLowerCase();
    if (!term) return activeMappings;

    return activeMappings.filter((mapping) => {
      // Handle both populated objects and IDs
      const courseId = typeof mapping.courseId === 'object' && mapping.courseId?._id 
        ? mapping.courseId._id 
        : mapping.courseId;
      const streamId = typeof mapping.streamId === 'object' && mapping.streamId?._id 
        ? mapping.streamId._id 
        : mapping.streamId;
      
      const course = typeof mapping.courseId === 'object' && mapping.courseId?.name
        ? mapping.courseId
        : courses.find((c) => (c._id || c.id) === courseId);
      const stream = typeof mapping.streamId === 'object' && mapping.streamId?.name
        ? mapping.streamId
        : streams.find((s) => (s._id || s.id) === streamId);
      
      return (
        course?.name?.toLowerCase().includes(term) ||
        course?.code?.toLowerCase().includes(term) ||
        stream?.name?.toLowerCase().includes(term) ||
        stream?.code?.toLowerCase().includes(term)
      );
    });
  }, [mappings, courses, streams, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this mapping? This will set it to Inactive.")) {
      try {
        // Use API to soft delete (sets status to Inactive)
        await courseStreamMappingsApi.delete(id);
        await fetchData(); // Refresh data from API
        showSuccessMessage("Mapping deleted successfully (set to Inactive)");
      } catch (err) {
        const errorMessage = err.message || "Failed to delete mapping";
        showErrorMessage(errorMessage);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Prepare payload according to API structure
      const payload = {
        courseId: formData.courseId,
        streamId: formData.streamId,
        semesterId: formData.semesterId,
        subjects: formData.subjects || [],
        timePeriod: formData.timePeriod?.trim() || "",
        status: formData.status || "Active",
        notes: formData.notes?.trim() || "",
      };

      if (editingItem) {
        const mappingId = editingItem._id || editingItem.id;
        // Use API to update
        await courseStreamMappingsApi.update(mappingId, payload);
        showSuccessMessage("Mapping updated successfully");
      } else {
        // Use API to create
        await courseStreamMappingsApi.create(payload);
        showSuccessMessage("Mapping created successfully");
      }
      
      await fetchData(); // Refresh data from API
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      const errorMessage = err.message || "Failed to save mapping";
      showErrorMessage(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Course-Stream Mapping
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Map available streams to courses for curriculum planning
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
          Add Mapping
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by course or stream..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Stream
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Time Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMappings.length > 0 ? (
              filteredMappings.map((mapping) => {
                // Handle both populated objects and IDs
                const courseId = typeof mapping.courseId === 'object' && mapping.courseId?._id 
                  ? mapping.courseId._id 
                  : mapping.courseId;
                const streamId = typeof mapping.streamId === 'object' && mapping.streamId?._id 
                  ? mapping.streamId._id 
                  : mapping.streamId;
                const semesterId = typeof mapping.semesterId === 'object' && mapping.semesterId?._id 
                  ? mapping.semesterId._id 
                  : mapping.semesterId;
                
                const course = typeof mapping.courseId === 'object' && mapping.courseId?.name
                  ? mapping.courseId
                  : courses.find((c) => (c._id || c.id) === courseId);
                const stream = typeof mapping.streamId === 'object' && mapping.streamId?.name
                  ? mapping.streamId
                  : streams.find((s) => (s._id || s.id) === streamId);
                const semester = typeof mapping.semesterId === 'object' && mapping.semesterId?._id
                  ? mapping.semesterId
                  : null;
                
                const subjectCount = Array.isArray(mapping.subjects) ? mapping.subjects.length : 0;
                
                return (
                  <tr key={mapping._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {course?.name || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {course?.code || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {stream?.name || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stream?.code || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {semester?.description || semester?.name || semester?.code || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {subjectCount} subject{subjectCount !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          mapping.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {mapping.status || "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mapping.timePeriod || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {mapping.notes || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingItem(mapping);
                          setShowAddForm(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-900 mr-3 p-1.5 rounded hover:bg-emerald-50 transition-colors"
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
                        onClick={() => handleDelete(mapping._id)}
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <p className="text-gray-600">No course-stream mappings found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Add Mapping" to create one
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
    </div>
  );
};

export default CourseStreamMapping;

