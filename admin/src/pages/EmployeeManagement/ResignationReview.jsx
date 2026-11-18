import React, { useState, useEffect } from "react";
import { API } from "../../config/urls";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ResignationReview = () => {
  const [resignationList, setResignationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingResignation, setViewingResignation] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, under_review, approved, rejected

  // Filter resignations based on search query and status
  useEffect(() => {
    let filtered = resignationList;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((record) => {
        const employeeName = (record.employeeName || "").toLowerCase();
        const employeeId = (record.employeeId || "").toLowerCase();
        const reason = (record.reason || "").toLowerCase();
        const department = (record.department || "").toLowerCase();
        return (
          employeeName.includes(query) ||
          employeeId.includes(query) ||
          reason.includes(query) ||
          department.includes(query)
        );
      });
    }

    setFilteredList(filtered);
  }, [resignationList, searchQuery, statusFilter]);

  // Fetch resignations from API
  const fetchResignations = async () => {
    setLoading(true);
    try {
      const response = await API.get("/employee/resignation");
      let data = [];
      if (response.data && response.data.success) {
        data = response.data.data || [];
      } else {
        data = response.data || [];
      }
      setResignationList(data);
    } catch (error) {
      console.error("Error fetching resignations:", error);
      showAxiosError(error);
      setResignationList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResignations();
  }, []);

  const handleApprove = async (id) => {
    if (window.confirm("Are you sure you want to approve this resignation? The employee will be marked as resigned.")) {
      try {
        setLoading(true);
        await API.put(`/employee/resignation/${id}`, {
          status: "approved",
          approvedAt: new Date(),
        });
        showSuccessMessage("Resignation approved successfully");
        await fetchResignations();
      } catch (error) {
        console.error("Error approving resignation:", error);
        showAxiosError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason) {
      try {
        setLoading(true);
        await API.put(`/employee/resignation/${id}`, {
          status: "rejected",
          reviewComments: reason,
          reviewedAt: new Date(),
        });
        showSuccessMessage("Resignation rejected successfully");
        await fetchResignations();
      } catch (error) {
        console.error("Error rejecting resignation:", error);
        showAxiosError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReview = async (id) => {
    try {
      setLoading(true);
      await API.put(`/employee/resignation/${id}`, {
        status: "under_review",
        reviewedAt: new Date(),
      });
      showSuccessMessage("Resignation marked as under review");
      await fetchResignations();
    } catch (error) {
      console.error("Error updating resignation status:", error);
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      under_review: { bg: "bg-blue-100", text: "text-blue-800", label: "Under Review" },
      approved: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
      withdrawn: { bg: "bg-gray-100", text: "text-gray-800", label: "Withdrawn" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading && resignationList.length === 0)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Employee Name, ID, Reason, Department..."
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

            {/* Status Filter */}
            <div className="flex-shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
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
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Resignation Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Last Working Date
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredList.length > 0 ? (
                filteredList.map((resignation) => (
                  <tr
                    key={resignation._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {resignation.employeeName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resignation.employeeId || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resignation.department || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resignation.resignationDate
                        ? new Date(resignation.resignationDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resignation.lastWorkingDate
                        ? new Date(resignation.lastWorkingDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(resignation.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setViewingResignation(resignation);
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
                        {resignation.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleReview(resignation._id)}
                              className="text-blue-600 hover:text-blue-900 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors text-xs font-medium"
                              title="Mark as Under Review"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleApprove(resignation._id)}
                              className="text-green-600 hover:text-green-900 px-3 py-1.5 rounded hover:bg-green-50 transition-colors text-xs font-medium"
                              title="Approve"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(resignation._id)}
                              className="text-red-600 hover:text-red-900 px-3 py-1.5 rounded hover:bg-red-50 transition-colors text-xs font-medium"
                              title="Reject"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {resignation.status === "under_review" && (
                          <>
                            <button
                              onClick={() => handleApprove(resignation._id)}
                              className="text-green-600 hover:text-green-900 px-3 py-1.5 rounded hover:bg-green-50 transition-colors text-xs font-medium"
                              title="Approve"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(resignation._id)}
                              className="text-red-600 hover:text-red-900 px-3 py-1.5 rounded hover:bg-red-50 transition-colors text-xs font-medium"
                              title="Reject"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
                      <p className="text-gray-600">No resignations found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {searchQuery || statusFilter !== "all"
                          ? "No resignations match your search criteria"
                          : "No resignation requests submitted yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && viewingResignation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h2 className="text-xl font-semibold text-white">
                Resignation Details
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingResignation(null);
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
                        {viewingResignation.employeeName || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Employee ID
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingResignation.employeeId || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingResignation.department || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Designation
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingResignation.designation || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resignation Details */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">
                    Resignation Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Resignation Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingResignation.resignationDate
                          ? new Date(viewingResignation.resignationDate).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Working Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingResignation.lastWorkingDate
                          ? new Date(viewingResignation.lastWorkingDate).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Notice Period (Days)
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingResignation.noticePeriodDays || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <p className="mt-1">
                        {getStatusBadge(viewingResignation.status)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Reason
                      </label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {viewingResignation.reason?.replace("_", " ") || "-"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Reason Details
                      </label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {viewingResignation.reasonDetails || "-"}
                      </p>
                    </div>
                    {viewingResignation.handoverTo && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Handover To
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {viewingResignation.handoverTo}
                        </p>
                      </div>
                    )}
                    {viewingResignation.handoverNotes && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Handover Notes
                        </label>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                          {viewingResignation.handoverNotes}
                        </p>
                      </div>
                    )}
                    {viewingResignation.reviewComments && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Review Comments
                        </label>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                          {viewingResignation.reviewComments}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Submitted Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewingResignation.createdAt
                          ? new Date(
                              viewingResignation.createdAt
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
                  </div>
                </div>

                {/* Attachments */}
                {viewingResignation.attachments &&
                  viewingResignation.attachments.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">
                        Attachments
                      </h3>
                      <div className="space-y-2">
                        {Array.isArray(viewingResignation.attachments) ? (
                          viewingResignation.attachments.map((attachment, idx) => (
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
                                {attachment.fileName ||
                                  attachment.name ||
                                  `Attachment ${idx + 1}`}
                              </span>
                            </div>
                          ))
                        ) : null}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              {(viewingResignation.status === "pending" ||
                viewingResignation.status === "under_review") && (
                <>
                  <button
                    onClick={() => {
                      handleReject(viewingResignation._id);
                      setShowViewModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(viewingResignation._id);
                      setShowViewModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingResignation(null);
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
  );
};

export default ResignationReview;

