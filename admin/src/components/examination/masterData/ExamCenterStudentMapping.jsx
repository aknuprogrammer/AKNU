import { useEffect, useMemo, useState } from "react";
import AddFormModal from "./AddFormModal";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";
import { collegesApi } from "../../../services/apiService";

const STORAGE_KEY = "exam_examCenterStudentMappings";

const ExamCenterStudentMapping = ({ tabKey }) => {
  const [mappings, setMappings] = useState([]);
  const [examCenters, setExamCenters] = useState([]);
  const [colleges, setColleges] = useState([]);
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

      const storedCenters = localStorage.getItem("exam_examinationCenters");
      if (storedCenters) {
        setExamCenters(JSON.parse(storedCenters));
      } else {
        setExamCenters([]);
      }

      const collegesData = await collegesApi.getAll().catch(() => []);
      setColleges(collegesData || []);

      const storedMappings = localStorage.getItem(STORAGE_KEY);
      if (storedMappings) {
        setMappings(JSON.parse(storedMappings));
      } else {
        setMappings([]);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load exam center-student mappings");
      showErrorMessage("Failed to load exam center-student mappings");
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
      const center =
        examCenters.find((centerItem) => centerItem._id === mapping.examCenterId) ||
        {};
      const college =
        colleges.find((collegeItem) => collegeItem._id === mapping.collegeId) || {};

      return (
        center.name?.toLowerCase().includes(term) ||
        center.code?.toLowerCase().includes(term) ||
        mapping.collegeName?.toLowerCase().includes(term) ||
        mapping.collegeCode?.toLowerCase().includes(term) ||
        college.name?.toLowerCase().includes(term) ||
        college.code?.toLowerCase().includes(term) ||
        mapping.fromRoll?.toLowerCase().includes(term) ||
        mapping.toRoll?.toLowerCase().includes(term)
      );
    });
  }, [mappings, examCenters, colleges, searchTerm]);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this exam center-student mapping?"
      )
    ) {
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
      const payload = {
        ...formData,
        notes: formData.notes?.trim() ? formData.notes : "",
      };

      if (editingItem) {
        const updated = mappings.map((item) =>
          item._id === editingItem._id
            ? { ...payload, _id: editingItem._id }
            : item
        );
        setMappings(updated);
        saveToLocalStorage(updated);
        showSuccessMessage("Mapping updated successfully");
      } else {
        const newItem = {
          ...payload,
          _id: `ecs_map_${Date.now()}`,
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
          <h3 className="text-xl font-semibold text-gray-800">
            Exam Center-Student Mapping
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Assign roll number ranges from each college to examination centers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search center, college, or roll range..."
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
            Add Mapping
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
                Examination Center
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                College
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Roll Range
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
            {filteredMappings.length > 0 ? (
              filteredMappings.map((mapping, index) => {
                const center =
                  examCenters.find((item) => item._id === mapping.examCenterId) ||
                  {};
                const college =
                  colleges.find((item) => item._id === mapping.collegeId) || {};

                const centerName = mapping.examCenterName || center.name;
                const centerCode = mapping.examCenterCode || center.code;
                const collegeName = mapping.collegeName || college.name;
                const collegeCode = mapping.collegeCode || college.code;
                const fromRoll = mapping.fromRoll || "";
                const toRoll = mapping.toRoll || "";
                const rollRange =
                  fromRoll && toRoll
                    ? `${fromRoll} - ${toRoll}`
                    : fromRoll || toRoll || "-";

                return (
                  <tr key={mapping._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {centerName || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {centerCode || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {collegeName || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {collegeCode || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rollRange}
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
                  colSpan="7"
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
                        d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zM5.879 18h12.242A2.879 2.879 0 0021 15.121v-.242C21 12.292 18.708 10 15.121 10H8.879C5.292 10 3 12.292 3 14.879v.242A2.879 2.879 0 005.879 18z"
                      />
                    </svg>
                    <p className="text-gray-600">No exam center-student mappings found</p>
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

export default ExamCenterStudentMapping;

