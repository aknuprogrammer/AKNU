import React, { useState, useEffect, useCallback } from "react";
import { examinationPaymentApi, revaluationApi } from "../../../services/apiService";
import { showAxiosError, showSuccessMessage, showErrorMessage } from "../../../config/Toast";

const RevaluationPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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

  // Fetch revaluation payment transactions
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: limit,
        revaluationOnly: true, // Only fetch revaluation payments
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await examinationPaymentApi.getAllPayments(params);
      console.log("📊 Revaluation Payments API Response:", response);
      
      if (response && response.success) {
        const paymentData = response.data?.payments || response.data || [];
        console.log(`✅ Loaded ${paymentData.length} revaluation payment transactions`);
        setPayments(Array.isArray(paymentData) ? paymentData : []);
        
        // Extract pagination info
        if (response.data?.pagination) {
          setPagination({
            current: response.data.pagination.current || currentPage,
            total: response.data.pagination.pages || response.data.pagination.total || 1,
            totalRecords: response.data.pagination.total || paymentData.length,
            limit: parseInt(limit),
          });
          // If current page is beyond total pages, go to last page
          const totalPages = response.data.pagination.pages || response.data.pagination.total || 1;
          if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
          }
        }
      } else {
        console.warn("⚠️ API response not successful:", response);
        setPayments([]);
      }
    } catch (error) {
      showAxiosError(error, "Failed to fetch revaluation payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, currentPage, limit]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Handle create revaluation requests from payment
  const handleCreateRequests = async (paymentId) => {
    try {
      setCreatingRequests(true);
      const response = await revaluationApi.createFromPayment(paymentId);
      if (response && response.success) {
        showSuccessMessage(
          response.message || 
          `Successfully created ${response.data?.created || 0} revaluation request(s). ${response.data?.skipped || 0} already existed.`
        );
        await fetchPayments();
      } else {
        showErrorMessage(response?.message || "Failed to create revaluation requests");
      }
    } catch (error) {
      showAxiosError(error, "Failed to create revaluation requests");
    } finally {
      setCreatingRequests(false);
    }
  };

  const filteredPayments = payments;

  // Calculate statistics
  const statistics = {
    total: payments.length,
    paid: payments.filter(p => p.payment_status === "SUCCESS").length,
    pending: payments.filter(p => p.payment_status === "PENDING").length,
    failed: payments.filter(p => p.payment_status === "FAILED").length,
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Revaluation Payment Transactions
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            View all students who have completed payment for revaluation applications. 
            Requests are automatically created when payment is successful. 
            Go to "Requests" tab to assign evaluators and process requests.
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentPage(1);
            fetchPayments();
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Total Payments</div>
          <div className="text-2xl font-bold text-gray-800">
            {statistics.total || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Paid</div>
          <div className="text-2xl font-bold text-green-600">
            {statistics.paid || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {statistics.pending || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Failed</div>
          <div className="text-2xl font-bold text-red-600">
            {statistics.failed || 0}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by transaction ID, registration number, or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success/Paid</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-y-auto max-h-[600px] thin-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Student Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Course & Semester
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Revaluation Subjects
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No revaluation payment transactions found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {payment.transaction_id || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleDateString()
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.student_name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.registration_number || "N/A"}
                        </div>
                        {payment.email && (
                          <div className="text-xs text-gray-500">
                            {payment.email}
                          </div>
                        )}
                        {payment.phone && (
                          <div className="text-xs text-gray-500">
                            {payment.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.course || "N/A"}
                        </div>
                        {payment.semester && (
                          <div className="text-xs text-gray-500">
                            {payment.semester}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-blue-600">
                          {payment.revaluation_subject_count || payment.revaluation_subjects?.length || 0} Subject{payment.revaluation_subject_count !== 1 ? 's' : ''}
                        </div>
                        {payment.revaluation_subjects && payment.revaluation_subjects.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {payment.revaluation_subjects.length} result{payment.revaluation_subjects.length !== 1 ? 's' : ''} selected
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{payment.amount || "0"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payment.payment_status === "SUCCESS"
                              ? "bg-green-100 text-green-800"
                              : payment.payment_status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : payment.payment_status === "CANCELLED"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.payment_status === "SUCCESS"
                            ? "Paid"
                            : payment.payment_status || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {payment.payment_completed_at ? (
                          <div className="text-xs text-gray-600">
                            {new Date(payment.payment_completed_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </div>
                        ) : payment.createdAt ? (
                          <div className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPaymentModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors text-sm"
                            title="View Details"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, pagination.totalRecords)} of {pagination.totalRecords} payments
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

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold">Payment Transaction Details</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
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
                    {selectedPayment.transaction_id || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full inline-block ${
                      selectedPayment.payment_status === "SUCCESS"
                        ? "bg-green-100 text-green-800"
                        : selectedPayment.payment_status === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedPayment.payment_status || "PENDING"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="text-sm text-gray-900 font-semibold">
                    ₹{selectedPayment.amount || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Gateway
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedPayment.payment_gateway || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedPayment.student_name || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <div className="text-sm text-gray-900 font-mono">
                    {selectedPayment.registration_number || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedPayment.course || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedPayment.semester || "N/A"}
                  </div>
                </div>
                {selectedPayment.payment_completed_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Completed At
                    </label>
                    <div className="text-sm text-gray-900">
                      {new Date(selectedPayment.payment_completed_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}
                {selectedPayment.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Created At
                    </label>
                    <div className="text-sm text-gray-900">
                      {new Date(selectedPayment.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}
                {selectedPayment.bank_reference_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Reference Number
                    </label>
                    <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                      {selectedPayment.bank_reference_number}
                    </div>
                  </div>
                )}
              </div>
              {selectedPayment.revaluation_subjects && selectedPayment.revaluation_subjects.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Revaluation Subjects: {selectedPayment.revaluation_subject_count || selectedPayment.revaluation_subjects.length}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {selectedPayment.payment_status === "SUCCESS" 
                          ? "Revaluation requests are automatically created for successful payments. Go to the 'Requests' tab to assign evaluators and process requests."
                          : "Revaluation requests will be automatically created once payment is successful. You can manually create requests below if needed."}
                      </p>
                    </div>
                    {selectedPayment.payment_status !== "SUCCESS" && (
                      <button
                        onClick={async () => {
                          const paymentId = selectedPayment._id || selectedPayment.id;
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
                              await fetchPayments();
                              setShowPaymentModal(false);
                              setSelectedPayment(null);
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
                  setSelectedPayment(null);
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

export default RevaluationPayments;

