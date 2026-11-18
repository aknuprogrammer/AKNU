import { useState, useEffect } from "react";
import { coursesApi } from "../../../services/apiService";
import AddFormModal from "./AddFormModal";
import { showSuccessMessage, showErrorMessage } from "../../../config/Toast";

// Mock data - replace with actual API when available
const MOCK_MAPPINGS = [];

const SubjectCourseMapping = ({ tabKey }) => {
  const [mappings, setMappings] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch courses from existing API
      const coursesData = await coursesApi.getAll();
      setCourses(coursesData || []);

      // Get data from localStorage
      const storedSubjects = localStorage.getItem("exam_subjects");
      if (storedSubjects) {
        setSubjects(JSON.parse(storedSubjects));
      }

      const storedSemesters = localStorage.getItem("exam_semesters");
      if (storedSemesters) {
        setSemesters(JSON.parse(storedSemesters));
      }

      const storedYears = localStorage.getItem("exam_academicYears");
      if (storedYears) {
        setAcademicYears(JSON.parse(storedYears));
      }

      const storedStreams = localStorage.getItem("exam_streams");
      if (storedStreams) {
        setStreams(JSON.parse(storedStreams));
      }

      const storedMappings = localStorage.getItem("exam_subjectCourseMappings");
      if (storedMappings) {
        setMappings(JSON.parse(storedMappings));
      } else {
        setMappings(MOCK_MAPPINGS);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load mappings");
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = (data) => {
    localStorage.setItem("exam_subjectCourseMappings", JSON.stringify(data));
  };

  const filteredMappings = mappings.filter(
    (mapping) => {
      const subject = subjects.find((s) => s._id === mapping.subjectId);
      const course = courses.find((c) => c._id === mapping.courseId);
      const stream = streams.find((s) => s._id === mapping.streamId);
      return (
        subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stream?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stream?.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

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
      if (editingItem) {
        const updated = mappings.map((item) =>
          item._id === editingItem._id
            ? { ...formData, _id: editingItem._id }
            : item
        );
        setMappings(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Mapping updated successfully");
      } else {
        const newItem = {
          ...formData,
          _id: `map_${Date.now()}`,
        };
        const updated = [...mappings, newItem];
        setMappings(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Mapping created successfully");
      }
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      showErrorMessage("Failed to save mapping");
    }
  };

  const toggleRowExpansion = (mappingId) => {
    setExpandedRow(expandedRow === mappingId ? null : mappingId);
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
          <h3 className="text-xl font-semibold text-gray-800">
            Subject-Course Mapping
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Map subjects to courses by semester (Using existing Courses API)
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
            placeholder="Search by subject or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                Subject
              </th>
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
                Academic Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMappings.length > 0 ? (
              filteredMappings.map((mapping) => {
                const subject = subjects.find((s) => s._id === mapping.subjectId);
                const course = courses.find((c) => c._id === mapping.courseId);
                const stream = streams.find((s) => s._id === mapping.streamId);
                const semester = semesters.find((s) => s._id === mapping.semesterId);
                const academicYear = academicYears.find((ay) => ay._id === mapping.academicYearId);
                
                return (
                  <tr
                    key={mapping._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {subject?.name || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subject?.code || "-"}
                      </div>
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {semester?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {academicYear?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          mapping.isCore
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {mapping.isCore ? "Core" : "Elective"}
                      </span>
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
                  colSpan="7"
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

export default SubjectCourseMapping;
