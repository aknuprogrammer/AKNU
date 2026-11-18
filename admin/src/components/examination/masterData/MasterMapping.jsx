import { useEffect, useMemo, useState } from "react";
import AddFormModal from "./AddFormModal";
import { coursesApi } from "../../../services/apiService";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";

const STORAGE_KEY = "exam_masterMappings";

const MasterMapping = ({ tabKey }) => {
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
      const coursesData = await coursesApi.getAll();
      setCourses(coursesData || []);

      const storedStreams = localStorage.getItem("exam_streams");
      if (storedStreams) {
        setStreams(JSON.parse(storedStreams));
      } else {
        setStreams([]);
      }

      const storedMappings = localStorage.getItem(STORAGE_KEY);
      if (storedMappings) {
        setMappings(JSON.parse(storedMappings));
      } else {
        setMappings([]);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load master mappings");
      showErrorMessage("Failed to load master mappings");
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const filteredMappings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return mappings;

    return mappings.filter((mapping) => {
      const course = courses.find((c) => c._id === mapping.courseId);
      const stream = streams.find((s) => s._id === mapping.streamId);
      return (
        course?.name?.toLowerCase().includes(term) ||
        course?.code?.toLowerCase().includes(term) ||
        stream?.name?.toLowerCase().includes(term) ||
        stream?.code?.toLowerCase().includes(term) ||
        mapping?.courseType?.toLowerCase().includes(term) ||
        mapping?.timePeriod?.toLowerCase().includes(term)
      );
    });
  }, [mappings, courses, streams, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this mapping?")) {
      try {
        const updated = mappings.filter((item) => item._id !== id);
        setMappings(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Mapping deleted successfully");
      } catch (err) {
        showErrorMessage("Failed to delete mapping");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const course = courses.find((c) => c._id === formData.courseId);
      const stream = streams.find((s) => s._id === formData.streamId);

      const payload = {
        ...formData,
        courseName: course?.name || "",
        courseCode: course?.code || "",
        streamName: stream?.name || "",
        streamCode: stream?.code || "",
        notes: formData.notes?.trim() ? formData.notes : "",
      };

      if (editingItem) {
        const updated = mappings.map((item) =>
          item._id === editingItem._id ? { ...payload, _id: editingItem._id } : item
        );
        setMappings(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Mapping updated successfully");
      } else {
        const newItem = { ...payload, _id: `mm_${Date.now()}` };
        const updated = [...mappings, newItem];
        setMappings(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Mapping created successfully");
      }
      setShowAddForm(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      showErrorMessage("Failed to save mapping");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Master Mapping</h2>
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
          Add Master Mapping
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by course, stream, course type, or time period..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Stream
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Course Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Semester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Time Period
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMappings.length > 0 ? (
              filteredMappings.map((mapping, index) => {
                const course = courses.find((c) => c._id === mapping.courseId);
                const stream = streams.find((s) => s._id === mapping.streamId);
                return (
                  <tr key={mapping._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course?.name || mapping.courseName || "-"}
                      {course?.code && (
                        <span className="text-gray-400 ml-1">({course.code})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stream?.name || mapping.streamName || "-"}
                      {stream?.code && (
                        <span className="text-gray-400 ml-1">({stream.code})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mapping.courseType || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mapping.courseDuration || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{mapping.semesters || "-"}</div>
                        {mapping.semesterSubjects && Array.isArray(mapping.semesterSubjects) && mapping.semesterSubjects.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {mapping.semesterSubjects.map((sem, idx) => {
                              const subjectCount = Array.isArray(sem.subjects) ? sem.subjects.length : (Array.isArray(sem.subjectIds) ? sem.subjectIds.length : 0);
                              return `Sem ${sem.semester}: ${subjectCount} subject(s)`;
                            }).join(", ")}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mapping.timePeriod || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(mapping);
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
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No master mappings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddFormModal
          tabKey="masterMapping"
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

export default MasterMapping;

