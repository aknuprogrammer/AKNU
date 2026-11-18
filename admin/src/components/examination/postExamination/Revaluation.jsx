import React, { useState, useEffect, useCallback } from "react";
import { revaluationApi } from "../../../services/apiService";
import { API } from "../../../config/urls";
import { showAxiosError, showSuccessMessage, showErrorMessage } from "../../../config/Toast";
import RevaluationWorkflow from "./RevaluationWorkflow";

const Revaluation = () => {
  const [revaluationRequests, setRevaluationRequests] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    byStatus: {},
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRevaluationModal, setShowRevaluationModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedEvaluator, setSelectedEvaluator] = useState("");
  const [revaluationMarks, setRevaluationMarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentTransaction, setSelectedPaymentTransaction] = useState(null);
  const [creatingRequests, setCreatingRequests] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalRecords: 0,
    limit: 10,
  });

  // Fetch revaluation requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: limit,
      };
      // Apply status filter based on active tab
      if (activeTab !== "all") {
        const statusMap = {
          pending: "Pending",
          approved: "Approved",
          "in-progress": "In Progress",
          completed: "Completed",
          rejected: "Rejected",
        };
        if (statusMap[activeTab]) {
          params.status = statusMap[activeTab];
        }
      }
      if (searchTerm) params.search = searchTerm;

      const response = await revaluationApi.getAll(params);
      console.log("📊 Revaluation API Response:", response);
      
      if (response && response.success) {
        // Handle different response structures
        const requests = response.data?.requests || response.data || [];
        console.log(`✅ Loaded ${requests.length} revaluation requests`);
        
        // Sort requests: successful payments first, then by date
        const sortedRequests = requests.sort((a, b) => {
          const aPaid = a.paymentTransactionId?.payment_status === "SUCCESS" || a.paymentStatus === "Paid";
          const bPaid = b.paymentTransactionId?.payment_status === "SUCCESS" || b.paymentStatus === "Paid";
          if (aPaid && !bPaid) return -1;
          if (!aPaid && bPaid) return 1;
          // If both have same payment status, sort by date (newest first)
          const aDate = new Date(a.requestDate || a.createdAt || 0);
          const bDate = new Date(b.requestDate || b.createdAt || 0);
          return bDate - aDate;
        });
        
        setRevaluationRequests(Array.isArray(sortedRequests) ? sortedRequests : []);
        
        // Extract pagination info
        if (response.data?.pagination) {
          setPagination(response.data.pagination);
          // If current page is beyond total pages, go to last page
          if (response.data.pagination.total > 0 && currentPage > response.data.pagination.total) {
            setCurrentPage(response.data.pagination.total);
          }
        }
      } else {
        console.warn("⚠️ API response not successful:", response);
        setRevaluationRequests([]);
      }
    } catch (error) {
      showAxiosError(error, "Failed to fetch revaluation requests");
      setRevaluationRequests([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, currentPage, limit]);

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await revaluationApi.getStatistics();
      if (response && response.success && response.data) {
        setStatistics(response.data);
      } else {
        // Set default statistics if API fails
        setStatistics({
          total: revaluationRequests.length,
          byStatus: {},
        });
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      // Calculate statistics from local data as fallback
      const stats = {
        total: revaluationRequests.length,
        byStatus: {},
      };
      revaluationRequests.forEach((req) => {
        stats.byStatus[req.status] = (stats.byStatus[req.status] || 0) + 1;
      });
      setStatistics(stats);
    }
  };

  // Fetch evaluators for dropdown (using same API as EvaluatorAllocation)
  const fetchProfessors = async () => {
    try {
      const response = await API.get("/examination/evaluators", {
        params: { status: "Active" },
      });
      
      // Evaluators API returns { success: true, data: evaluators }
      const evaluatorsData = response.data?.data || [];
      console.log(`✅ Loaded ${evaluatorsData.length} evaluators:`, evaluatorsData);
      
      setEvaluators(evaluatorsData);
    } catch (error) {
      console.error("❌ Error fetching evaluators:", error);
      showAxiosError(error, "Failed to load evaluators");
      setEvaluators([]);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchRequests(),
        fetchStatistics(),
        fetchProfessors(),
      ]);
    };
    loadData();
  }, []);

  // Refetch when filters change (with debounce for search)
  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, searchTerm ? 500 : 0); // Debounce only for search, immediate for status filter

    return () => clearTimeout(timer);
  }, [fetchRequests]);

  const handleApproveRequest = async (requestId) => {
    if (!window.confirm("Approve this revaluation request?")) return;

    try {
      setProcessing(true);
      const response = await revaluationApi.approve(requestId, {});
      if (response && response.success) {
        showSuccessMessage("Request approved successfully");
        await Promise.all([fetchRequests(), fetchStatistics()]);
      } else {
        showErrorMessage(response?.message || "Failed to approve request");
      }
    } catch (error) {
      showAxiosError(error, "Failed to approve request");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      showErrorMessage("Please provide a rejection reason");
      return;
    }

    try {
      setProcessing(true);
      const response = await revaluationApi.reject(selectedRequest._id, {
        rejectionReason: rejectionReason,
      });
      if (response && response.success) {
        showSuccessMessage("Request rejected successfully");
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectionReason("");
        await Promise.all([fetchRequests(), fetchStatistics()]);
      } else {
        showErrorMessage(response?.message || "Failed to reject request");
      }
    } catch (error) {
      showAxiosError(error, "Failed to reject request");
    } finally {
      setProcessing(false);
    }
  };

  const handleAssignEvaluator = async () => {
    if (!selectedRequest || !selectedEvaluator) {
      showErrorMessage("Please select an evaluator");
      return;
    }

    try {
      setProcessing(true);
      const response = await revaluationApi.assignEvaluator(selectedRequest._id, {
        evaluatorId: selectedEvaluator,
      });
      if (response && response.success) {
        showSuccessMessage("Evaluator assigned successfully");
        setShowAssignModal(false);
        setSelectedRequest(null);
        setSelectedEvaluator("");
        await Promise.all([fetchRequests(), fetchStatistics()]);
      } else {
        showErrorMessage(response?.message || "Failed to assign evaluator");
      }
    } catch (error) {
      showAxiosError(error, "Failed to assign evaluator");
    } finally {
      setProcessing(false);
    }
  };

  const handleEnterMarks = async () => {
    if (!selectedRequest || !revaluationMarks) {
      showErrorMessage("Please enter revaluation marks");
      return;
    }

    const marks = parseFloat(revaluationMarks);
    if (isNaN(marks) || marks < 0) {
      showErrorMessage("Please enter a valid marks value");
      return;
    }

    if (selectedRequest.originalMaxMarks && marks > selectedRequest.originalMaxMarks) {
      showErrorMessage(`Marks cannot exceed maximum marks (${selectedRequest.originalMaxMarks})`);
      return;
    }

    try {
      setProcessing(true);
      const response = await revaluationApi.enterMarks(selectedRequest._id, {
        revaluationMarks: marks,
        revaluationMaxMarks: selectedRequest.originalMaxMarks,
      });
      if (response && response.success) {
        showSuccessMessage("Marks entered successfully");
        setShowRevaluationModal(false);
        setSelectedRequest(null);
        setRevaluationMarks("");
        await Promise.all([fetchRequests(), fetchStatistics()]);
      } else {
        showErrorMessage(response?.message || "Failed to enter marks");
      }
    } catch (error) {
      showAxiosError(error, "Failed to enter marks");
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteRequest = async (requestId) => {
    if (!window.confirm("Complete this revaluation? This will update the student's result.")) return;

    try {
      setProcessing(true);
      const response = await revaluationApi.complete(requestId);
      if (response && response.success) {
        showSuccessMessage("Revaluation completed successfully. Student result has been updated.");
        await Promise.all([fetchRequests(), fetchStatistics()]);
      } else {
        showErrorMessage(response?.message || "Failed to complete revaluation");
      }
    } catch (error) {
      showAxiosError(error, "Failed to complete revaluation");
    } finally {
      setProcessing(false);
    }
  };

  // Filter requests by tab (excluding completed)
  const getFilteredRequestsByTab = () => {
    const nonCompletedRequests = revaluationRequests.filter((r) => r.status !== "Completed");
    switch (activeTab) {
      case "pending":
        return nonCompletedRequests.filter((r) => r.status === "Pending");
      case "approved":
        return nonCompletedRequests.filter((r) => r.status === "Approved");
      case "in-progress":
        return nonCompletedRequests.filter((r) => r.status === "In Progress");
      case "rejected":
        return nonCompletedRequests.filter((r) => r.status === "Rejected");
      default:
        return nonCompletedRequests;
    }
  };

  const filteredRequests = getFilteredRequestsByTab();

  // Tab configuration (excluding completed - moved to separate page)
  const tabs = [
    { id: "all", label: "All Requests", count: revaluationRequests.filter((r) => r.status !== "Completed").length },
    { id: "pending", label: "Pending Approval", count: revaluationRequests.filter((r) => r.status === "Pending").length },
    { id: "approved", label: "Approved", count: revaluationRequests.filter((r) => r.status === "Approved").length },
    { id: "in-progress", label: "In Progress", count: revaluationRequests.filter((r) => r.status === "In Progress").length },
    { id: "rejected", label: "Rejected", count: revaluationRequests.filter((r) => r.status === "Rejected").length },
  ];

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Revaluation Requests Management
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage revaluation requests through the complete workflow
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentPage(1);
            fetchRequests();
            fetchStatistics();
          }}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md border mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by request number, registration, student name, subject, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Total Requests</div>
          <div className="text-2xl font-bold text-gray-800">
            {statistics.total || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {statistics.byStatus?.Pending || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">
            {statistics.byStatus?.["In Progress"] || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {statistics.byStatus?.Completed || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Rejected</div>
          <div className="text-2xl font-bold text-red-600">
            {statistics.byStatus?.Rejected || 0}
          </div>
        </div>
      </div>

      {/* Revaluation Requests Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-y-auto max-h-[600px] thin-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Request Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Student Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Original Marks
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Revaluation Marks
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Difference
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No revaluation requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => {
                    const isPaid = request.paymentTransactionId?.payment_status === "SUCCESS" || request.paymentStatus === "Paid";
                    return (
                    <tr 
                      key={request._id} 
                      className={`hover:bg-gray-50 ${isPaid ? 'bg-green-50/30 border-l-4 border-l-green-500' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.requestNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.requestDate
                            ? new Date(request.requestDate).toLocaleDateString()
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.studentName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.registrationNumber}
                        </div>
                        {request.hallTicketNumber && (
                          <div className="text-xs text-gray-500">
                            {request.hallTicketNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.subjectName || "N/A"}
                        </div>
                        {request.subjectId?.subjectCode && (
                          <div className="text-xs text-gray-500">
                            {request.subjectId.subjectCode}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div>
                          <span className="text-sm font-medium">
                            {request.originalMarks}
                          </span>
                          {request.originalGrade && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({request.originalGrade})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {request.revaluationMarks !== null &&
                        request.revaluationMarks !== undefined ? (
                          <div>
                            <span className="text-sm font-bold text-blue-600">
                              {request.revaluationMarks}
                            </span>
                            {request.newStatus && (
                              <span
                                className={`ml-1 text-xs px-2 py-0.5 rounded ${
                                  request.newStatus === "PASS"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {request.newStatus}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {request.difference !== null &&
                        request.difference !== undefined ? (
                          <span
                            className={`text-sm font-medium ${
                              request.difference > 0
                                ? "text-green-600"
                                : request.difference < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {request.difference > 0 ? "+" : ""}
                            {request.difference}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {request.paymentTransactionId ? (
                          <div className="text-center space-y-1">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full inline-block ${
                                request.paymentTransactionId?.payment_status === "SUCCESS" ||
                                request.paymentStatus === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : request.paymentTransactionId?.payment_status === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {request.paymentTransactionId?.payment_status === "SUCCESS"
                                ? "Paid"
                                : request.paymentTransactionId?.payment_status || request.paymentStatus || "Pending"}
                            </span>
                            <div className="text-xs text-gray-600 font-semibold">
                              ₹{request.paymentTransactionId?.amount || "N/A"}
                            </div>
                            {request.paymentTransactionId?.payment_completed_at && (
                              <div className="text-xs text-gray-500">
                                {new Date(request.paymentTransactionId.payment_completed_at).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                request.paymentStatus === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {request.paymentStatus || "Pending"}
                            </span>
                            {!request.paymentTransactionId && (
                              <div className="text-xs text-gray-400 mt-1">
                                No payment info
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            request.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : request.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : request.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : request.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {request.status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request._id)}
                                disabled={processing}
                                className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                                title="Approve"
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
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectModal(true);
                                }}
                                disabled={processing}
                                className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Reject"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                          {request.status === "Approved" && (
                            <button
                              onClick={async () => {
                                setSelectedRequest(request);
                                // Refetch evaluators when opening the modal
                                await fetchProfessors();
                                setShowAssignModal(true);
                              }}
                              disabled={processing}
                              className="text-blue-600 hover:text-blue-900 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors disabled:opacity-50 text-sm"
                              title="Assign Evaluator"
                            >
                              Assign
                            </button>
                          )}
                          {request.status === "In Progress" && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRevaluationModal(true);
                                }}
                                disabled={processing}
                                className="text-emerald-600 hover:text-emerald-900 px-3 py-1.5 rounded hover:bg-emerald-50 transition-colors disabled:opacity-50 text-sm"
                                title="Enter Revaluation Marks"
                              >
                                Enter Marks
                              </button>
                              {request.revaluationMarks !== null &&
                                request.revaluationMarks !== undefined && (
                                  <button
                                    onClick={() =>
                                      handleCompleteRequest(request._id)
                                    }
                                    disabled={processing}
                                    className="text-green-600 hover:text-green-900 px-3 py-1.5 rounded hover:bg-green-50 transition-colors disabled:opacity-50 text-sm"
                                    title="Complete Revaluation"
                                  >
                                    Complete
                                  </button>
                                )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && pagination.totalRecords > 0 && (
        <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.totalRecords)} of {pagination.totalRecords} requests
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {pagination.total > 1 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
                  let pageNum;
                  if (pagination.total <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.total - 2) {
                    pageNum = pagination.total - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white border-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.total, prev + 1))}
              disabled={currentPage === pagination.total}
              className="px-3 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(pagination.total)}
              disabled={currentPage === pagination.total}
              className="px-3 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Assign Evaluator Modal */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Assign Evaluator</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequest(null);
                  setSelectedEvaluator("");
                }}
                className="text-gray-500 hover:text-gray-700"
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
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request: {selectedRequest.requestNumber}
                </label>
                <p className="text-sm text-gray-600">
                  {selectedRequest.studentName} - {selectedRequest.subjectName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Evaluator <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEvaluator}
                  onChange={(e) => setSelectedEvaluator(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Evaluator</option>
                  {evaluators.length === 0 ? (
                    <option value="" disabled>No evaluators available</option>
                  ) : (
                    evaluators.map((evaluator) => (
                      <option key={evaluator._id || evaluator.evaluatorId} value={evaluator._id || evaluator.evaluatorId}>
                        {evaluator.name || "Unknown"} 
                        {evaluator.evaluatorId && ` (${evaluator.evaluatorId})`}
                        {evaluator.college && ` - ${evaluator.college}`}
                      </option>
                    ))
                  )}
                </select>
                {evaluators.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No evaluators found. Please check if professors are available.
                  </p>
                )}
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequest(null);
                  setSelectedEvaluator("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignEvaluator}
                disabled={!selectedEvaluator || processing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Request Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Reject Request</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason("");
                }}
                className="text-gray-500 hover:text-gray-700"
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
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request: {selectedRequest.requestNumber}
                </label>
                <p className="text-sm text-gray-600">
                  {selectedRequest.studentName} - {selectedRequest.subjectName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter reason for rejection..."
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectRequest}
                disabled={!rejectionReason.trim() || processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revaluation Marks Entry Modal */}
      {showRevaluationModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Enter Revaluation Marks</h3>
              <button
                onClick={() => {
                  setShowRevaluationModal(false);
                  setSelectedRequest(null);
                  setRevaluationMarks("");
                }}
                className="text-gray-500 hover:text-gray-700"
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
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student: {selectedRequest.studentName}
                </label>
                <p className="text-sm text-gray-600">
                  Subject: {selectedRequest.subjectName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Marks
                </label>
                <div className="text-lg font-semibold text-gray-800">
                  {selectedRequest.originalMarks} / {selectedRequest.originalMaxMarks}
                  {selectedRequest.originalGrade && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({selectedRequest.originalGrade})
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Revaluation Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={revaluationMarks}
                  onChange={(e) => setRevaluationMarks(e.target.value)}
                  min="0"
                  max={selectedRequest.originalMaxMarks || 100}
                  step="0.5"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter marks"
                />
                {revaluationMarks && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600">Difference: </span>
                    <span
                      className={`font-medium ${
                        parseFloat(revaluationMarks) - selectedRequest.originalMarks > 0
                          ? "text-green-600"
                          : parseFloat(revaluationMarks) - selectedRequest.originalMarks < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {parseFloat(revaluationMarks) - selectedRequest.originalMarks > 0
                        ? "+"
                        : ""}
                      {(
                        parseFloat(revaluationMarks) - selectedRequest.originalMarks
                      ).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRevaluationModal(false);
                  setSelectedRequest(null);
                  setRevaluationMarks("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEnterMarks}
                disabled={!revaluationMarks || processing}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? "Saving..." : "Save Marks"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Transaction Details Modal */}
      {showPaymentModal && selectedPaymentTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold">Payment Transaction Details</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPaymentTransaction(null);
                }}
                className="text-gray-500 hover:text-gray-700"
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
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID
                  </label>
                  <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                    {selectedPaymentTransaction.transaction_id || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full inline-block ${
                      selectedPaymentTransaction.payment_status === "SUCCESS"
                        ? "bg-green-100 text-green-800"
                        : selectedPaymentTransaction.payment_status === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedPaymentTransaction.payment_status || "PENDING"}
                  </span>
                </div>
                {selectedPaymentTransaction.registration_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <div className="text-sm text-gray-900 font-mono">
                      {selectedPaymentTransaction.registration_number}
                    </div>
                  </div>
                )}
                {selectedPaymentTransaction.student_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name
                    </label>
                    <div className="text-sm text-gray-900">
                      {selectedPaymentTransaction.student_name}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="text-sm text-gray-900 font-semibold">
                    ₹{selectedPaymentTransaction.amount || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Gateway
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedPaymentTransaction.payment_gateway || "N/A"}
                  </div>
                </div>
                {selectedPaymentTransaction.payment_mode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Mode
                    </label>
                    <div className="text-sm text-gray-900">
                      {selectedPaymentTransaction.payment_mode}
                    </div>
                  </div>
                )}
                {selectedPaymentTransaction.bank_reference_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Reference Number
                    </label>
                    <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                      {selectedPaymentTransaction.bank_reference_number}
                    </div>
                  </div>
                )}
                {selectedPaymentTransaction.payment_completed_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Completed At
                    </label>
                    <div className="text-sm text-gray-900">
                      {new Date(selectedPaymentTransaction.payment_completed_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}
                {selectedPaymentTransaction.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Created At
                    </label>
                    <div className="text-sm text-gray-900">
                      {new Date(selectedPaymentTransaction.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}
              </div>
              {selectedPaymentTransaction.payment_link && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Link
                  </label>
                  <a
                    href={selectedPaymentTransaction.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {selectedPaymentTransaction.payment_link}
                  </a>
                </div>
              )}
              {selectedPaymentTransaction.revaluation_subjects && selectedPaymentTransaction.revaluation_subjects.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Revaluation Subjects: {selectedPaymentTransaction.revaluation_subject_count || selectedPaymentTransaction.revaluation_subjects.length}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {selectedPaymentTransaction.payment_status === "SUCCESS" 
                          ? "Revaluation requests are automatically created for successful payments. This request is already linked to this payment transaction."
                          : "Revaluation requests will be automatically created once payment is successful. You can manually create requests below if needed."}
                      </p>
                    </div>
                    {selectedPaymentTransaction.payment_status !== "SUCCESS" && (
                      <button
                        onClick={async () => {
                          const paymentId = selectedPaymentTransaction._id || selectedPaymentTransaction.id;
                          if (!paymentId) {
                            showErrorMessage("Payment transaction ID not found. Please refresh and try again.");
                            return;
                          }
                          try {
                            setCreatingRequests(true);
                            const response = await revaluationApi.createFromPayment(paymentId);
                            if (response && response.success) {
                              showSuccessMessage(
                                response.message || 
                                `Successfully created ${response.data?.created || 0} revaluation request(s). ${response.data?.skipped || 0} already existed.`
                              );
                              // Refresh the requests list
                              await fetchRequests();
                              await fetchStatistics();
                              // Close modal after successful creation
                              setShowPaymentModal(false);
                              setSelectedPaymentTransaction(null);
                            } else {
                              showErrorMessage(response?.message || "Failed to create revaluation requests");
                            }
                          } catch (error) {
                            showAxiosError(error, "Failed to create revaluation requests");
                          } finally {
                            setCreatingRequests(false);
                          }
                        }}
                        disabled={creatingRequests}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {creatingRequests ? "Creating..." : "Create Revaluation Requests"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPaymentTransaction(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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

export default Revaluation;
