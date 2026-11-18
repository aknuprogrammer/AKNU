import { useEffect, useMemo, useState } from "react";
import AddFormModal from "./AddFormModal";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";
import { collegesApi, invigilatorsApi } from "../../../services/apiService";

const InvigilatorsTable = ({ tabKey }) => {
  const [invigilators, setInvigilators] = useState([]);
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
      const collegesData = await collegesApi.getAll().catch(() => []);
      
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

      // Fetch invigilators from API
      const invigilatorsData = await invigilatorsApi.getAll().catch(() => []);
      setInvigilators(Array.isArray(invigilatorsData) ? invigilatorsData : []);
      setError(null);
    } catch (err) {
      setError("Failed to load invigilators");
      showErrorMessage("Failed to load invigilators");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvigilators = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return invigilators;

    return invigilators.filter((invigilator) => {
      // Handle populated collegeId (object) or ObjectId string
      const collegeId = typeof invigilator.collegeId === 'object' && invigilator.collegeId?._id
        ? invigilator.collegeId._id
        : invigilator.collegeId;
      const college = typeof invigilator.collegeId === 'object' && invigilator.collegeId?.name
        ? invigilator.collegeId
        : colleges.find((collegeItem) => collegeItem._id === collegeId) || {};

      return (
        invigilator.invigilatorCode?.toLowerCase().includes(term) ||
        invigilator.name?.toLowerCase().includes(term) ||
        college.name?.toLowerCase().includes(term) ||
        college.code?.toLowerCase().includes(term) ||
        invigilator.role?.toLowerCase().includes(term) ||
        invigilator.year?.toLowerCase().includes(term)
      );
    });
  }, [invigilators, colleges, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invigilator?")) {
      try {
        await invigilatorsApi.delete(id);
        await fetchData(); // Refresh the list
        showSuccessMessage("Invigilator deleted successfully");
      } catch (err) {
        showErrorMessage("Failed to delete invigilator");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Normalize collegeId - extract _id if it's a populated object
      const collegeId = typeof formData.collegeId === 'object' && formData.collegeId?._id
        ? formData.collegeId._id
        : formData.collegeId;

      // Normalize invigilatorCode - uppercase and trim
      const invigilatorCode = (formData.invigilatorCode || "").trim().toUpperCase();

      // Check for duplicate invigilator code (client-side validation)
      if (invigilatorCode) {
        const existingInvigilator = invigilators.find(
          (inv) => inv.invigilatorCode?.toUpperCase() === invigilatorCode && 
                   (!editingItem || inv._id !== editingItem._id)
        );
        if (existingInvigilator) {
          showErrorMessage(`Invigilator code "${invigilatorCode}" already exists. Please use a different code.`);
          return;
        }
      }

      const trimmedNotes = formData.notes?.trim() || "";
      const payload = {
        ...formData,
        collegeId: collegeId,
        invigilatorCode: invigilatorCode,
        notes: trimmedNotes,
      };

      if (editingItem) {
        await invigilatorsApi.update(editingItem._id, payload);
        showSuccessMessage("Invigilator updated successfully");
      } else {
        await invigilatorsApi.create(payload);
        showSuccessMessage("Invigilator created successfully");
      }
      await fetchData(); // Refresh the list
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      // Display specific error message if available
      const errorMessage = err.message || "Failed to save invigilator";
      showErrorMessage(errorMessage);
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
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Invigilators</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage invigilator records
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
          Add Invigilator
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, code, college, role, or year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Invigilator Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                College
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Year
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
            {filteredInvigilators.length > 0 ? (
              filteredInvigilators.map((invigilator, index) => {
                // Handle populated collegeId (object) or ObjectId string
                const collegeId = typeof invigilator.collegeId === 'object' && invigilator.collegeId?._id
                  ? invigilator.collegeId._id
                  : invigilator.collegeId;
                const college = typeof invigilator.collegeId === 'object' && invigilator.collegeId?.name
                  ? invigilator.collegeId
                  : colleges.find((c) => c._id === collegeId);
                return (
                  <tr key={invigilator._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invigilator.invigilatorCode || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invigilator.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {college?.name || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {college?.code || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invigilator.role || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invigilator.year || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invigilator.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {invigilator.status || "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          // Normalize collegeId - extract _id if it's a populated object
                          const normalizedInvigilator = {
                            ...invigilator,
                            collegeId: typeof invigilator.collegeId === 'object' && invigilator.collegeId?._id
                              ? invigilator.collegeId._id
                              : invigilator.collegeId
                          };
                          setEditingItem(normalizedInvigilator);
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
                        onClick={() => handleDelete(invigilator._id)}
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
                  colSpan="8"
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-gray-600">No invigilators found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Add Invigilator" to create one
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

export default InvigilatorsTable;

