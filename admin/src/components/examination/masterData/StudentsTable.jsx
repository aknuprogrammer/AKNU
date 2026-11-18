import { useEffect, useMemo, useState } from "react";
import AddFormModal from "./AddFormModal";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";
import { coursesApi, collegesApi } from "../../../services/apiService";

const STORAGE_KEY = "exam_students";

const StudentsTable = ({ tabKey }) => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [colleges, setColleges] = useState([]);
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
      const [coursesData, collegesData] = await Promise.all([
        coursesApi.getAll().catch(() => []),
        collegesApi.getAll().catch(() => []),
      ]);
      
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
      
      setCourses(filterActive(coursesData || []));
      setColleges(filterActive(collegesData || []));

      const storedStreams = localStorage.getItem("exam_streams");
      if (storedStreams) {
        setStreams(JSON.parse(storedStreams));
      }

      const storedStudents = localStorage.getItem(STORAGE_KEY);
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      } else {
        setStudents([]);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load students");
      showErrorMessage("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const saveToLocalStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return students;

    return students.filter((student) => {
      const course =
        courses.find((courseItem) => courseItem._id === student.courseId) || {};
      const college =
        colleges.find((collegeItem) => collegeItem._id === student.collegeId) ||
        {};
      const stream =
        streams.find((streamItem) => streamItem._id === student.streamId) || {};

      return (
        student.studentId?.toLowerCase().includes(term) ||
        student.name?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term) ||
        college.name?.toLowerCase().includes(term) ||
        college.code?.toLowerCase().includes(term) ||
        course.name?.toLowerCase().includes(term) ||
        course.code?.toLowerCase().includes(term) ||
        stream.name?.toLowerCase().includes(term) ||
        stream.code?.toLowerCase().includes(term)
      );
    });
  }, [students, courses, streams, colleges, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const updated = students.filter((item) => item._id !== id);
        setStudents(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Student deleted successfully");
      } catch (err) {
        showErrorMessage("Failed to delete student");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const trimmedNotes = formData.notes?.trim() || "";
      const payload = {
        ...formData,
        notes: trimmedNotes,
      };

      if (editingItem) {
        const updated = students.map((item) =>
          item._id === editingItem._id
            ? { ...payload, _id: editingItem._id }
            : item
        );
        setStudents(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Student updated successfully");
      } else {
        const newItem = {
          ...payload,
          _id: `student_${Date.now()}`,
        };
        const updated = [...students, newItem];
        setStudents(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Student created successfully");
      }
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      showErrorMessage("Failed to save student");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Students</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage student records and their course-stream assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, course, stream..."
              className="px-4 py-2 pl-9 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
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
            Add Student
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                College
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Stream
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
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
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => {
                const course =
                  courses.find((courseItem) => courseItem._id === student.courseId) ||
                  {};
                const college =
                  colleges.find((collegeItem) => collegeItem._id === student.collegeId) ||
                  {};
                const stream =
                  streams.find((streamItem) => streamItem._id === student.streamId) ||
                  {};

                const collegeName = student.collegeName || college.name;
                const collegeCode = student.collegeCode || college.code;
                const courseName = student.courseName || course.name;
                const courseCode = student.courseCode || course.code;
                const streamName = student.streamName || stream.name;
                const streamCode = student.streamCode || stream.code;

                return (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.studentId || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {collegeName || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {collegeCode || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {courseName || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {courseCode || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {streamName || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {streamCode || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          student.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : student.status === "Alumni"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {student.status || "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.notes || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingItem(student);
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
                        onClick={() => handleDelete(student._id)}
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
                  colSpan="10"
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
                        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z"
                      />
                    </svg>
                    <p className="text-gray-600">No students found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Add Student" to create one
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

export default StudentsTable;

