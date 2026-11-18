import { useEffect, useMemo, useState } from "react";
import AddFormModal from "./AddFormModal";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";
import { collegesApi, examinationCentersApi, examCenterCollegeMappingsApi, invigilatorsApi } from "../../../services/apiService";

const ExamCenterMappings = ({ tabKey }) => {
  const [mappings, setMappings] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [examCenters, setExamCenters] = useState([]);
  const [invigilators, setInvigilators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingMapping, setViewingMapping] = useState(null);
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

      // Fetch examination centers from API
      const examCentersData = await examinationCentersApi.getAll().catch(() => []);
      setExamCenters(examCentersData || []);

      // Fetch invigilators from API
      const invigilatorsData = await invigilatorsApi.getAll().catch(() => []);
      setInvigilators(Array.isArray(invigilatorsData) ? invigilatorsData : []);

      // Fetch all mappings from API
      const mappingsData = await examCenterCollegeMappingsApi.getAll().catch(() => []);
      setMappings(Array.isArray(mappingsData) ? mappingsData : []);
      setError(null);
    } catch (err) {
      setError("Failed to load mappings");
      showErrorMessage("Failed to load mappings");
    } finally {
      setLoading(false);
    }
  };

  const filteredMappings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return mappings;

    return mappings.filter((mapping) => {
      // Handle populated examCenterId (object) or ObjectId string
      const examCenterId = typeof mapping.examCenterId === 'object' && mapping.examCenterId?._id
        ? mapping.examCenterId._id
        : mapping.examCenterId;
      const center = typeof mapping.examCenterId === 'object' && mapping.examCenterId?.name
        ? mapping.examCenterId
        : examCenters.find((item) => item._id === examCenterId) || {};

      // Handle populated collegeId (object) or ObjectId string
      const collegeId = typeof mapping.collegeId === 'object' && mapping.collegeId?._id
        ? mapping.collegeId._id
        : mapping.collegeId;
      const college = typeof mapping.collegeId === 'object' && mapping.collegeId?.name
        ? mapping.collegeId
        : colleges.find((item) => item._id === collegeId) || {};

      return (
        center?.name?.toLowerCase().includes(term) ||
        center?.code?.toLowerCase().includes(term) ||
        college?.name?.toLowerCase().includes(term) ||
        college?.code?.toLowerCase().includes(term) ||
        mapping.fromRoll?.toLowerCase().includes(term) ||
        mapping.toRoll?.toLowerCase().includes(term) ||
        mapping.invigilatorName?.toLowerCase().includes(term) ||
        mapping.roomName?.toLowerCase().includes(term) ||
        mapping.roomCode?.toLowerCase().includes(term)
      );
    });
  }, [mappings, examCenters, colleges, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this mapping?")) {
      try {
        await examCenterCollegeMappingsApi.delete(id);
        await fetchData(); // Refresh the list
        showSuccessMessage("Mapping deleted successfully");
      } catch (err) {
        showErrorMessage("Failed to delete mapping");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const selectedCenter = examCenters.find((center) => center._id === formData.examCenterId);
      const selectedCollege = colleges.find((college) => college._id === formData.collegeId);

      if (!formData.examCenterId) {
        showErrorMessage("Please select an examination center.");
        return;
      }

      if (!formData.collegeId) {
        showErrorMessage("Please select a college or campus.");
        return;
      }

      // Determine mapping type based on what fields are filled
      // If room name is provided, it's a room mapping
      // If student range is provided, it's a student mapping
      // Otherwise, it's a college mapping
      let mappingType = "college";
      const fromRoll = (formData.fromRoll || "").trim();
      const toRoll = (formData.toRoll || "").trim();
      const roomName = (formData.roomName || "").trim();

      if (roomName) {
        mappingType = "room";
        // fromRoll and toRoll are optional for room mappings
      } else if (fromRoll || toRoll) {
        mappingType = "student";
        if (!fromRoll || !toRoll) {
          showErrorMessage("Please enter both start and end roll numbers.");
          return;
        }
      }

      // Get invigilator details if invigilatorId is provided
      const selectedInvigilator = formData.invigilatorId 
        ? invigilators.find((inv) => inv._id === formData.invigilatorId)
        : null;

      // Normalize IDs - extract _id if they are populated objects
      const examCenterId = typeof formData.examCenterId === 'object' && formData.examCenterId?._id
        ? formData.examCenterId._id
        : formData.examCenterId;
      const collegeId = typeof formData.collegeId === 'object' && formData.collegeId?._id
        ? formData.collegeId._id
        : formData.collegeId;
      const invigilatorId = typeof formData.invigilatorId === 'object' && formData.invigilatorId?._id
        ? formData.invigilatorId._id
        : formData.invigilatorId;

      // Get selected items - handle both populated objects and lookups
      const center = typeof examCenterId === 'object' 
        ? examCenterId 
        : examCenters.find((c) => c._id === examCenterId);
      const college = typeof collegeId === 'object'
        ? collegeId
        : colleges.find((c) => c._id === collegeId);

      const payload = {
        examCenterId: typeof examCenterId === 'object' ? examCenterId._id : examCenterId,
        examCenterName: center?.name || "",
        examCenterCode: center?.code || "",
        collegeId: typeof collegeId === 'object' ? collegeId._id : collegeId,
        collegeName: college?.name || "",
        collegeCode: college?.code || "",
        fromRoll: fromRoll || "",
        toRoll: toRoll || "",
        invigilatorId: typeof invigilatorId === 'object' ? invigilatorId._id : invigilatorId || "",
        invigilatorName: selectedInvigilator?.name || (formData.invigilatorName || "").trim() || "",
        invigilatorCode: selectedInvigilator?.invigilatorCode || "",
        roomName: roomName || "",
        roomCode: (formData.roomCode || "").trim() || "",
        status: formData.status || "Active",
        notes: (formData.notes || "").trim() || "",
        mappingType,
      };

      if (editingItem) {
        await examCenterCollegeMappingsApi.update(editingItem._id, payload);
        showSuccessMessage("Mapping updated successfully");
      } else {
        await examCenterCollegeMappingsApi.create(payload);
        showSuccessMessage("Mapping created successfully");
      }

      await fetchData();
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
            Exam Center Mappings
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage exam center, college, student range, and room assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search center, college, roll range, or invigilator..."
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
                Exam Center
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                College/Campus
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
            {filteredMappings.length > 0 ? (
              filteredMappings.map((mapping, index) => {
                // Handle populated examCenterId (object) or ObjectId string
                const examCenterId = typeof mapping.examCenterId === 'object' && mapping.examCenterId?._id
                  ? mapping.examCenterId._id
                  : mapping.examCenterId;
                const center = typeof mapping.examCenterId === 'object' && mapping.examCenterId?.name
                  ? mapping.examCenterId
                  : examCenters.find((item) => item._id === examCenterId) || {};

                // Handle populated collegeId (object) or ObjectId string
                const collegeId = typeof mapping.collegeId === 'object' && mapping.collegeId?._id
                  ? mapping.collegeId._id
                  : mapping.collegeId;
                const college = typeof mapping.collegeId === 'object' && mapping.collegeId?.name
                  ? mapping.collegeId
                  : colleges.find((item) => item._id === collegeId) || {};

                const centerName = mapping.examCenterName || center.name;
                const centerCode = mapping.examCenterCode || center.code;
                const collegeName = mapping.collegeName || college.name;
                const collegeCode = mapping.collegeCode || college.code;

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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingMapping(mapping)}
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
                  colSpan="5"
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
                        d="M16.5 21a1.5 1.5 0 001.5-1.5V7.827a1.5 1.5 0 00-.439-1.06l-4.828-4.828A1.5 1.5 0 0011.673 2H7.5A1.5 1.5 0 006 3.5V19.5A1.5 1.5 0 007.5 21h9z"
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
          tabKey="examCenterMappings"
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingItem(null);
          }}
          invigilators={invigilators}
        />
      )}

      {/* View Mapping Details Modal */}
      {viewingMapping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">
                View Mapping Details
              </h3>
              <button
                onClick={() => setViewingMapping(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Examination Center */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Examination Center*
                    </label>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {typeof viewingMapping.examCenterId === 'object' && viewingMapping.examCenterId?.name
                          ? viewingMapping.examCenterId.name
                          : viewingMapping.examCenterName || examCenters.find((c) => c._id === (typeof viewingMapping.examCenterId === 'object' ? viewingMapping.examCenterId?._id : viewingMapping.examCenterId))?.name || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {typeof viewingMapping.examCenterId === 'object' && viewingMapping.examCenterId?.code
                          ? viewingMapping.examCenterId.code
                          : viewingMapping.examCenterCode || examCenters.find((c) => c._id === (typeof viewingMapping.examCenterId === 'object' ? viewingMapping.examCenterId?._id : viewingMapping.examCenterId))?.code || "-"}
                      </p>
                    </div>
                  </div>

                  {/* College/Campus */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College/Campus*
                    </label>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {typeof viewingMapping.collegeId === 'object' && viewingMapping.collegeId?.name
                          ? viewingMapping.collegeId.name
                          : viewingMapping.collegeName || colleges.find((c) => c._id === (typeof viewingMapping.collegeId === 'object' ? viewingMapping.collegeId?._id : viewingMapping.collegeId))?.name || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {typeof viewingMapping.collegeId === 'object' && viewingMapping.collegeId?.code
                          ? viewingMapping.collegeId.code
                          : viewingMapping.collegeCode || colleges.find((c) => c._id === (typeof viewingMapping.collegeId === 'object' ? viewingMapping.collegeId?._id : viewingMapping.collegeId))?.code || "-"}
                      </p>
                    </div>
                  </div>

                  {/* From Roll No. */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Roll No.*
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingMapping.fromRoll || "-"}
                    </p>
                  </div>

                  {/* To Roll No. */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Roll No.*
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingMapping.toRoll || "-"}
                    </p>
                  </div>

                  {/* Room Name */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Name
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingMapping.roomName || "-"}
                    </p>
                  </div>

                  {/* Room Code */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Code
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingMapping.roomCode || "-"}
                    </p>
                  </div>

                  {/* Invigilator */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invigilator
                    </label>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {typeof viewingMapping.invigilatorId === 'object' && viewingMapping.invigilatorId?.name
                          ? viewingMapping.invigilatorId.name
                          : invigilators.find((inv) => inv._id === (typeof viewingMapping.invigilatorId === 'object' ? viewingMapping.invigilatorId?._id : viewingMapping.invigilatorId))?.name || viewingMapping.invigilatorName || "-"}
                      </p>
                      {(typeof viewingMapping.invigilatorId === 'object' && viewingMapping.invigilatorId?.invigilatorCode
                        ? viewingMapping.invigilatorId.invigilatorCode
                        : invigilators.find((inv) => inv._id === (typeof viewingMapping.invigilatorId === 'object' ? viewingMapping.invigilatorId?._id : viewingMapping.invigilatorId))?.invigilatorCode || viewingMapping.invigilatorCode) && (
                        <p className="text-xs text-gray-500">
                          {typeof viewingMapping.invigilatorId === 'object' && viewingMapping.invigilatorId?.invigilatorCode
                            ? viewingMapping.invigilatorId.invigilatorCode
                            : invigilators.find((inv) => inv._id === (typeof viewingMapping.invigilatorId === 'object' ? viewingMapping.invigilatorId?._id : viewingMapping.invigilatorId))?.invigilatorCode || viewingMapping.invigilatorCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status*
                    </label>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        viewingMapping.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {viewingMapping.status || "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {viewingMapping.notes || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setViewingMapping(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamCenterMappings;
