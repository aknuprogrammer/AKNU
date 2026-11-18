import { useEffect, useMemo, useState } from "react";
import AddFormModal from "./AddFormModal";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";

const STORAGE_KEY = "exam_subject_professor_mapping";
const TIMETABLE_KEY = "exam_timetable_entries";
const PROFESSORS_KEY = "exam_professors";

const SubjectProfessorMapping = ({ tabKey }) => {
  const [mappings, setMappings] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      // Load mappings
      const storedMappings = localStorage.getItem(STORAGE_KEY);
      setMappings(storedMappings ? JSON.parse(storedMappings) : []);

      // Load timetable entries
      const storedTimetable = localStorage.getItem(TIMETABLE_KEY);
      setTimetableEntries(storedTimetable ? JSON.parse(storedTimetable) : []);

      // Load professors
      const storedProfessors = localStorage.getItem(PROFESSORS_KEY);
      setProfessors(storedProfessors ? JSON.parse(storedProfessors) : []);

      setError(null);
    } catch (err) {
      setError("Failed to load data");
      showErrorMessage("Failed to load subject-professor mappings");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToLocalStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const professorLookup = useMemo(() => {
    return professors.reduce((acc, prof) => {
      acc[prof._id] = prof;
      return acc;
    }, {});
  }, [professors]);

  const timetableLookup = useMemo(() => {
    return timetableEntries.reduce((acc, entry) => {
      const key = `${entry.subjectId}_${entry.paperType}`;
      acc[key] = entry;
      return acc;
    }, {});
  }, [timetableEntries]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        const updated = mappings.filter((item) => item._id !== id);
        setMappings(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Assignment deleted successfully");
      } catch (err) {
        showErrorMessage("Failed to delete assignment");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Check for duplicate (same subject + paper type + examination type)
      const duplicate = mappings.some((item) => {
        if (editingItem && item._id === editingItem._id) {
          return false;
        }
        return (
          item.subjectId === formData.subjectId &&
          item.paperType === formData.paperType &&
          item.examinationType === (formData.examinationType || "Regular")
        );
      });

      if (duplicate) {
        throw new Error("This subject paper for the selected examination type is already assigned to a professor. Please edit the existing assignment.");
      }

      if (editingItem) {
        const updated = mappings.map((item) =>
          item._id === editingItem._id ? { ...formData, _id: editingItem._id } : item
        );
        setMappings(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Assignment updated successfully");
      } else {
        const newMapping = {
          ...formData,
          _id: `mapping_${Date.now()}`,
          assignedAt: new Date().toISOString(),
        };
        const updated = [...mappings, newMapping];
        setMappings(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Professor assigned successfully");
      }
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      showErrorMessage(err.message || "Failed to save assignment");
    }
  };

  const filteredMappings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return mappings;
    return mappings.filter((mapping) => {
      const subjectName = mapping.subjectName ? mapping.subjectName.toLowerCase() : "";
      const subjectCode = mapping.subjectCode ? mapping.subjectCode.toLowerCase() : "";
      const paperType = mapping.paperType ? mapping.paperType.toLowerCase() : "";
      const professorName = professorLookup[mapping.professorId]?.name?.toLowerCase() || "";
      const professorId = professorLookup[mapping.professorId]?.professorId?.toLowerCase() || "";
      return (
        subjectName.includes(query) ||
        subjectCode.includes(query) ||
        paperType.includes(query) ||
        professorName.includes(query) ||
        professorId.includes(query)
      );
    });
  }, [mappings, searchQuery, professorLookup]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Subject-Professor Assignment</h3>
          <p className="text-sm text-gray-500 mt-1">
            Assign professors to create question papers for subjects based on timetable
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject, paper type, or professor"
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            onClick={() => {
              setEditingItem(null);
              setShowAddForm(true);
            }}
            className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
            Assign Professor
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
                Subject / Paper
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Exam Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Submitted Date (deadline)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Assigned Professor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Assigned Date
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
            {filteredMappings.length ? (
              filteredMappings.map((mapping, index) => {
                const professor = professorLookup[mapping.professorId];
                const timetableEntry = timetableLookup[`${mapping.subjectId}_${mapping.paperType}`];
                return (
                  <tr key={mapping._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-medium text-gray-900">
                        {mapping.subjectName || mapping.subjectCode || "-"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {mapping.subjectCode ? `${mapping.subjectCode} • ` : ""}
                        {mapping.paperType || "Paper"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          mapping.examinationType === "Regular"
                            ? "bg-blue-100 text-blue-800"
                            : mapping.examinationType === "Supplementary"
                            ? "bg-orange-100 text-orange-800"
                            : mapping.examinationType === "Revaluation"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {mapping.examinationType || "Regular"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {timetableEntry?.examDate
                        ? new Date(timetableEntry.examDate).toLocaleDateString()
                        : "-"}
                      {timetableEntry?.startTime && timetableEntry?.endTime && (
                        <div className="text-xs text-gray-400">
                          {timetableEntry.startTime} - {timetableEntry.endTime}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-medium text-gray-900">
                        {professor?.name || "-"}
                      </div>
                      {professor?.professorId && (
                        <div className="text-xs text-gray-500">
                          ID: {professor.professorId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {mapping.assignedAt
                        ? new Date(mapping.assignedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          mapping.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {mapping.status || "Active"}
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
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-gray-600">No assignments found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Assign Professor" to create an assignment based on timetable entries
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
          tabKey={"subjectProfessorMapping"}
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

export default SubjectProfessorMapping;

