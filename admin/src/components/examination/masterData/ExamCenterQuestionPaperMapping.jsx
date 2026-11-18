import { useEffect, useMemo, useState } from "react";
import AddFormModal from "./AddFormModal";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";
import { 
  examCenterQuestionPaperMappingsApi,
  examinationCentersApi,
  questionPapersApi
} from "../../../services/apiService";

const ExamCenterQuestionPaperMapping = ({ tabKey }) => {
  const [mappings, setMappings] = useState([]);
  const [examCenters, setExamCenters] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMappings = async () => {
    try {
      const response = await examCenterQuestionPaperMappingsApi.getAll();
      
      // Handle API response structure: { success, count, data: [...] }
      let mappingsData = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          mappingsData = response;
        } else if (response.data && Array.isArray(response.data)) {
          mappingsData = response.data;
        } else if (response.success && response.data && Array.isArray(response.data)) {
          mappingsData = response.data;
        }
      }
      
      // Filter out inactive mappings for display (optional - can show all with includeInactive)
      const activeMappings = mappingsData.filter(m => 
        m.status !== 'Inactive' || m.status === undefined
      );
      
      setMappings(activeMappings);
    } catch (err) {
      console.error("Error fetching mappings:", err);
      setMappings([]);
    }
  };

  const fetchExamCenters = async () => {
    try {
      const response = await examinationCentersApi.getAll();
      const centersData = Array.isArray(response) 
        ? response 
        : (response?.data || []);
      // Filter active centers for dropdown
      setExamCenters(centersData.filter(c => c.status === "Active"));
    } catch (err) {
      console.error("Error fetching exam centers:", err);
      setExamCenters([]);
    }
  };

  const fetchQuestionPapers = async () => {
    try {
      const response = await questionPapersApi.getAll({ status: "Submitted" });
      let papersData = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          papersData = response;
        } else if (response.data && Array.isArray(response.data)) {
          papersData = response.data;
        } else if (response.success && response.data && Array.isArray(response.data)) {
          papersData = response.data;
        }
      }
      // Filter Submitted/Approved papers for dropdown
      setQuestionPapers(papersData.filter(qp => 
        qp.status === "Submitted" || qp.status === "Approved"
      ));
    } catch (err) {
      console.error("Error fetching question papers:", err);
      setQuestionPapers([]);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchMappings(),
        fetchExamCenters(),
        fetchQuestionPapers()
      ]);
      setError(null);
    } catch (err) {
      setError("Failed to load exam center-question paper mappings");
      showErrorMessage(err.message || "Failed to load mappings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMappings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return mappings;

    return mappings.filter((mapping) => {
      // Handle both populated objects and plain IDs
      const centerId = typeof mapping.examCenterId === 'object' 
        ? mapping.examCenterId._id || mapping.examCenterId.id
        : mapping.examCenterId;
      const qpId = typeof mapping.questionPaperId === 'object'
        ? mapping.questionPaperId._id || mapping.questionPaperId.id
        : mapping.questionPaperId;

      const center = examCenters.find((item) => (item._id || item.id) === centerId) ||
        (typeof mapping.examCenterId === 'object' ? mapping.examCenterId : null);
      const questionPaper = questionPapers.find((item) => (item._id || item.id) === qpId) ||
        (typeof mapping.questionPaperId === 'object' ? mapping.questionPaperId : null);

      const centerCode = mapping.examCenterCode || center?.code || "";
      const qpNumber = mapping.questionPaperNumber || questionPaper?.questionPaperNumber || "";
      const subjectName = mapping.subjectName || questionPaper?.subjectName || "";
      const subjectCode = mapping.subjectCode || questionPaper?.subjectCode || "";

      return (
        centerCode.toLowerCase().includes(term) ||
        qpNumber.toLowerCase().includes(term) ||
        subjectName.toLowerCase().includes(term) ||
        subjectCode.toLowerCase().includes(term)
      );
    });
  }, [mappings, examCenters, questionPapers, searchTerm]);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this exam center-question paper mapping?"
      )
    ) {
      try {
        await examCenterQuestionPaperMappingsApi.delete(id, false); // Soft delete
        showSuccessMessage("Mapping deleted successfully");
        await fetchMappings(); // Refresh from API
      } catch (err) {
        showErrorMessage(err.message || "Failed to delete mapping");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Extract IDs from populated objects if they exist
      const getObjectId = (field) => {
        if (!field) return field;
        if (typeof field === 'string') return field;
        if (field._id) return field._id;
        if (field.id) return field.id;
        return field;
      };

      const payload = {
        examCenterId: getObjectId(formData.examCenterId),
        questionPaperId: getObjectId(formData.questionPaperId),
        status: formData.status || "Active",
        notes: formData.notes?.trim() || "",
      };

      if (editingItem) {
        // Update existing mapping
        const mappingId = editingItem._id || editingItem.id;
        await examCenterQuestionPaperMappingsApi.update(mappingId, payload);
        showSuccessMessage("Mapping updated successfully");
      } else {
        // Create new mapping
        await examCenterQuestionPaperMappingsApi.create(payload);
        showSuccessMessage("Mapping created successfully");
      }
      
      await fetchMappings(); // Refresh from API
      setShowAddForm(false);
      setEditingItem(null);
    } catch (err) {
      showErrorMessage(err.message || "Failed to save mapping");
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
            Exam Center-Question Paper Mapping
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Link examination centers to question papers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search center or question paper..."
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
                Center Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Question Paper Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Subject
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
                // Handle both populated objects and plain IDs
                const centerId = mapping.examCenterId && typeof mapping.examCenterId === 'object' 
                  ? mapping.examCenterId._id || mapping.examCenterId.id
                  : mapping.examCenterId;
                const qpId = mapping.questionPaperId && typeof mapping.questionPaperId === 'object'
                  ? mapping.questionPaperId._id || mapping.questionPaperId.id
                  : mapping.questionPaperId;

                const center = examCenters.find((item) => (item._id || item.id) === centerId) ||
                  (mapping.examCenterId && typeof mapping.examCenterId === 'object' ? mapping.examCenterId : null) ||
                  {};
                const questionPaper = questionPapers.find((item) => (item._id || item.id) === qpId) ||
                  (mapping.questionPaperId && typeof mapping.questionPaperId === 'object' ? mapping.questionPaperId : null) ||
                  {};

                const centerName = mapping.examCenterName || center?.name || "";
                const centerCode = mapping.examCenterCode || center?.code || "-";
                const qpNumber = mapping.questionPaperNumber || questionPaper?.questionPaperNumber || "-";
                const subjectName = mapping.subjectName || questionPaper?.subjectName || "-";
                const subjectCode = mapping.subjectCode || questionPaper?.subjectCode || "-";
                const paperType = mapping.paperType || questionPaper?.paperType || "-";

                return (
                  <tr key={mapping._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {centerCode || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-emerald-600">
                        {qpNumber || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {subjectName || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subjectCode || "-"}
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-600">
                      No exam center-question paper mappings found
                    </p>
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

export default ExamCenterQuestionPaperMapping;

