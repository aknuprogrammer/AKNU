import React, { useState, useEffect } from "react";
import AddFormModal from "./AddFormModal";
import { API } from "../../config/urls";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode";

const SubmitQuery = () => {
  const [queryList, setQueryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuery, setEditingQuery] = useState(null);
  const [viewingQuery, setViewingQuery] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [userEmployeeId, setUserEmployeeId] = useState(null);
  const [userEmployeeName, setUserEmployeeName] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Get user employee ID, name, and role from token (run first, before data fetching)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        // Get employeeId and name from decoded.user object
        if (decoded.user) {
          const employeeId = decoded.user.employeeId || decoded.user.employeeID;
          const fullName = decoded.user.fullName || 
                          `${decoded.user.firstName || ""} ${decoded.user.lastName || ""}`.trim() ||
                          decoded.user.name || "";
          if (employeeId) {
            setUserEmployeeId(employeeId);
          }
          if (fullName) {
            setUserEmployeeName(fullName);
          }
        } else {
          // Fallback to direct employeeId in token
          setUserEmployeeId(decoded.employeeId || decoded.employeeID);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch streams for dropdown (can run immediately)
  useEffect(() => {
    fetchStreams();
  }, []);

  // Filter queries based on search query
  useEffect(() => {
    let filtered = queryList;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((record) => {
        const employeeName = (record.employeeName || 
          (record.employee?.firstName && record.employee?.lastName
            ? `${record.employee.firstName} ${record.employee.lastName}`
            : record.employee?.name || record.name || "")).toLowerCase();
        const employeeId = ((record.employeeId || record.employeeID || 
          record.employee?.employeeId || record.employee?.employeeID || "") || "").toLowerCase();
        const queryType = (record.queryType || "").toLowerCase();
        const subject = (record.subject || "").toLowerCase();
        const status = (record.status || "").toLowerCase();
        return (
          employeeName.includes(query) ||
          employeeId.includes(query) ||
          queryType.includes(query) ||
          subject.includes(query) ||
          status.includes(query)
        );
      });
    }

    setFilteredList(filtered);
  }, [queryList, searchQuery]);

  // Fetch streams for dropdown
  const fetchStreams = async () => {
    try {
      const resp = await API.get("/examination/streams");
      const formatted = resp.data.map((stream) => ({
        label: stream.name,
        value: stream._id || stream.id,
      }));
      setDepartments(formatted);
    } catch (error) {
      console.error("Error fetching streams:", error);
      // Don't show error for streams, just log it
    }
  };

  // Fetch queries from API
  const fetchQueries = async () => {
    setLoading(true);
    try {
      const response = await API.get("/employee/query");
      let data = [];
      if (response.data && response.data.success) {
        data = response.data.data || [];
      } else {
        data = response.data || [];
      }

      // Filter by logged-in user's employeeId (only for non-admin roles)
      if (userEmployeeId && userRole !== "super_admin" && userRole !== "admin") {
        data = data.filter((record) => {
          const recordEmployeeId = record.employeeId || record.employeeID ||
            record.employee?.employeeId || record.employee?.employeeID;
          return recordEmployeeId === userEmployeeId;
        });
      }

      setQueryList(data);
    } catch (error) {
      console.error("Error fetching queries:", error);
      showAxiosError(error);
      setQueryList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch queries when userEmployeeId is available OR when role is admin/super_admin
  useEffect(() => {
    if (userEmployeeId !== null || userRole === "super_admin" || userRole === "admin") {
      fetchQueries();
    }
  }, [userEmployeeId, userRole]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this query?")) {
      try {
        setLoading(true);
        await API.delete(`/employee/query/${id}`);
        showSuccessMessage("Query deleted successfully");
        // Refresh the list
        await fetchQueries();
      } catch (error) {
        console.error("Error deleting query:", error);
        showAxiosError(error);
      } finally {
        setLoading(false);
      }
    }
  };


  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);

      if (editingQuery) {
        // Update existing query using PUT
        await API.put(`/employee/query/${editingQuery._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        showSuccessMessage("Query updated successfully");
      } else {
        // Create new query using POST
        await API.post("/employee/query", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        showSuccessMessage("Query submitted successfully");
      }

      setShowAddForm(false);
      setEditingQuery(null);
      // Refresh the list
      await fetchQueries();
    } catch (error) {
      console.error("Error submitting query:", error);
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Submit Query</h1>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Queries</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage employee queries and requests
            </p>
          </div>
          <button
            onClick={() => {
              setEditingQuery(null);
              setShowAddForm(true);
            }}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-lg hover:bg-[#3a4166] transition-colors"
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
            Submit Query
          </button>
        </div>

        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            {/* Search Input - Same style as Timesheet */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Employee Name, ID, Query Type, Subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
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
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

          </div>
          <div className="table-scroll-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Query Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Subject
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Submitted Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredList.length > 0 ? (
                  filteredList.map((query, index) => {
                    // Get employee name - handle different possible field structures
                    const employeeName =
                      query.employeeName ||
                      (query.employee?.firstName && query.employee?.lastName
                        ? `${query.employee.firstName} ${query.employee.lastName}`
                        : query.employee?.name ||
                          query.employeeName ||
                          query.name ||
                          "-");

                    // Get employee ID - handle different possible field structures
                    const employeeId =
                      query.employeeId ||
                      query.employeeID ||
                      query.employee?.employeeId ||
                      query.employee?.employeeID ||
                      query.employee?.id ||
                      query.employee?._id ||
                      "-";

                    return (
                      <tr
                        key={query._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employeeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employeeId}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs capitalize">
                            {query.queryType || "-"}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          title={query.subject}
                        >
                          {query.subject || "-"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {query.createdAt
                            ? new Date(query.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setViewingQuery(query);
                                setShowViewModal(true);
                              }}
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
                                setEditingQuery(query);
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
                              onClick={() => handleDelete(query._id)}
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
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        <p className="text-gray-600">No queries found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {searchQuery
                            ? "No queries match your search criteria"
                            : 'Click "Submit Query" to create one'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showAddForm && (
          <AddFormModal
            formType="query"
            initialData={editingQuery}
            departments={departments}
            userEmployeeId={userEmployeeId}
            userEmployeeName={userEmployeeName}
            userRole={userRole}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setShowAddForm(false);
              setEditingQuery(null);
            }}
          />
        )}

        {/* View Modal */}
        {showViewModal && viewingQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[95vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
                <h2 className="text-lg font-semibold text-white">
                  Query Details
                </h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingQuery(null);
                  }}
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

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Employee Information */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">
                      Employee Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Employee Name
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {viewingQuery.employeeName ||
                            (viewingQuery.employee?.firstName &&
                            viewingQuery.employee?.lastName
                              ? `${viewingQuery.employee.firstName} ${viewingQuery.employee.lastName}`
                              : viewingQuery.employee?.name ||
                                viewingQuery.name ||
                                "-")}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Employee ID
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {viewingQuery.employeeId ||
                            viewingQuery.employeeID ||
                            viewingQuery.employee?.employeeId ||
                            viewingQuery.employee?.employeeID ||
                            viewingQuery.employee?.id ||
                            viewingQuery.employee?._id ||
                            "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Query Details */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">
                      Query Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Query Type
                        </label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">
                          {viewingQuery.queryType || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Priority
                        </label>
                        <p className="mt-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              viewingQuery.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : viewingQuery.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {viewingQuery.priority || "-"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <p className="mt-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              viewingQuery.status === "resolved"
                                ? "bg-green-100 text-green-800"
                                : viewingQuery.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {viewingQuery.status || "pending"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Department/Stream
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {viewingQuery.department ||
                            viewingQuery.stream ||
                            viewingQuery.departmentName ||
                            "-"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Subject
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {viewingQuery.subject || "-"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                          {viewingQuery.description ||
                            viewingQuery.message ||
                            "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Submitted Date
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {viewingQuery.createdAt
                            ? new Date(
                                viewingQuery.createdAt
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </p>
                      </div>
                      {viewingQuery.updatedAt && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Last Updated
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(
                              viewingQuery.updatedAt
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attachments */}
                  {viewingQuery.attachments &&
                    viewingQuery.attachments.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">
                          Attachments
                        </h3>
                        <div className="space-y-2">
                          {Array.isArray(viewingQuery.attachments) ? (
                            viewingQuery.attachments.map((attachment, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                              >
                                <svg
                                  className="w-5 h-5 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <span className="text-sm text-gray-700">
                                  {typeof attachment === "string"
                                    ? attachment
                                    : attachment.name ||
                                      attachment.filename ||
                                      `Attachment ${idx + 1}`}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                              <svg
                                className="w-5 h-5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <span className="text-sm text-gray-700">
                                {typeof viewingQuery.attachments === "string"
                                  ? viewingQuery.attachments
                                  : viewingQuery.attachments.name ||
                                    viewingQuery.attachments.filename ||
                                    "Attachment"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingQuery(null);
                  }}
                  className="px-4 py-2 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitQuery;
