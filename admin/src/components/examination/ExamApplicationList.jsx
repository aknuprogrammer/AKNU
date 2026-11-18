import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config/urls";

// API service functions for examination payments
const examinationPaymentApi = {
  getAllPayments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${BASE_URL}/examination-application/payments${queryString ? `?${queryString}` : ""}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch payments");
    }
    return response.json();
  },

  getPaymentStatus: async (transactionId) => {
    const response = await fetch(
      `${BASE_URL}/examination-application/payment-status/${transactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch payment status");
    }
    return response.json();
  },

  getPaymentHistory: async (registrationNumber, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${BASE_URL}/examination-application/payments/${registrationNumber}${queryString ? `?${queryString}` : ""}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch payment history");
    }
    return response.json();
  },

  verifyTransaction: async (transactionId) => {
    const response = await fetch(
      `${BASE_URL}/examination-application/verify-transaction/${transactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to verify transaction");
    }
    return response.json();
  },

  updatePaymentStatus: async (transactionId) => {
    const response = await fetch(
      `${BASE_URL}/examination-application/update-payment-status/${transactionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update payment status");
    }
    return response.json();
  },
};

const ExamApplicationList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    status: "",
    registrationNumber: "",
    startDate: "",
    endDate: "",
  });

  // Modal states
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.registrationNumber && { registrationNumber: filters.registrationNumber }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };

      const response = await examinationPaymentApi.getAllPayments(params);
      if (response.success) {
        setPayments(response.data.payments || []);
        setPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters.page, filters.limit, filters.status, filters.registrationNumber, filters.startDate, filters.endDate]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1, // Reset to page 1 when other filters change
    }));
  };

  // View payment details
  const handleViewPayment = async (payment) => {
    try {
      const response = await examinationPaymentApi.getPaymentStatus(payment.transaction_id);
      if (response.success) {
        setSelectedPayment(response.data);
        setShowPaymentModal(true);
      }
    } catch (err) {
      alert(err.message || "Failed to fetch payment details");
    }
  };

  // View payment history
  const handleViewHistory = async (registrationNumber) => {
    try {
      const response = await examinationPaymentApi.getPaymentHistory(registrationNumber, {
        page: 1,
        limit: 10,
      });
      if (response.success) {
        setPaymentHistory(response.data.payments || []);
        setHistoryPagination(response.data.pagination || { current: 1, pages: 1, total: 0 });
        setShowHistoryModal(true);
      }
    } catch (err) {
      alert(err.message || "Failed to fetch payment history");
    }
  };

  // Verify transaction
  const handleVerifyTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to verify this transaction with Easebuzz API?")) {
      return;
    }
    try {
      setLoading(true);
      const response = await examinationPaymentApi.verifyTransaction(transactionId);
      if (response.success) {
        alert("Transaction verified successfully!");
        fetchPayments(); // Refresh the list
      }
    } catch (err) {
      alert(err.message || "Failed to verify transaction");
    } finally {
      setLoading(false);
    }
  };

  // Update payment status
  const handleUpdateStatus = async (transactionId) => {
    if (!window.confirm("Are you sure you want to update the payment status?")) {
      return;
    }
    try {
      setLoading(true);
      const response = await examinationPaymentApi.updatePaymentStatus(transactionId);
      if (response.success) {
        alert(`Payment status updated from ${response.data.old_status} to ${response.data.new_status}`);
        fetchPayments(); // Refresh the list
      }
    } catch (err) {
      alert(err.message || "Failed to update payment status");
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate statistics
  const stats = {
    total: pagination.total,
    success: payments.filter((p) => p.payment_status === "SUCCESS").length,
    pending: payments.filter((p) => p.payment_status === "PENDING").length,
    failed: payments.filter((p) => p.payment_status === "FAILED").length,
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Examination Payment Applications</h3>
          <p className="text-sm text-gray-500 mt-1">
            View and manage all examination payment transactions
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Total Payments</div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Successful</div>
          <div className="text-2xl font-bold text-green-600">{stats.success}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="text-sm text-gray-600">Failed</div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              value={filters.registrationNumber}
              onChange={(e) => handleFilterChange("registrationNumber", e.target.value)}
              placeholder="REG2025001"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange("limit", parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setFilters({
                page: 1,
                limit: 50,
                status: "",
                registrationNumber: "",
                startDate: "",
                endDate: "",
              });
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Payment Transactions</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No payments found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Course & Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.transaction_id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.student_name}
                        </div>
                        <div className="text-xs text-gray-500">{payment.registration_number}</div>
                        <div className="text-xs text-gray-500">{payment.email}</div>
                        <div className="text-xs text-gray-500">{payment.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.course}</div>
                        <div className="text-xs text-gray-500">{payment.semester}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{payment.amount?.toLocaleString("en-IN") || "0"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Regular: {payment.regular_subject_count || 0} | Supp:{" "}
                          {payment.supplementary_subject_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                            payment.payment_status
                          )}`}
                        >
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.payment_completed_at || payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewPayment(payment)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="View Details"
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
                            onClick={() => handleViewHistory(payment.registration_number)}
                            className="text-purple-600 hover:text-purple-900 p-1.5 rounded hover:bg-purple-50 transition-colors"
                            title="View History"
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleVerifyTransaction(payment.transaction_id)}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                            title="Verify Transaction"
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(payment.transaction_id)}
                            className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                            title="Update Status"
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
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.current - 1) * filters.limit) + 1} to{" "}
                  {Math.min(pagination.current * filters.limit, pagination.total)} of{" "}
                  {pagination.total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange("page", pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {pagination.current} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => handleFilterChange("page", pagination.current + 1)}
                    disabled={pagination.current === pagination.pages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-blue-500">
              <h3 className="text-lg font-semibold text-white">Payment Details</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.transaction_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                          selectedPayment.payment_status
                        )}`}
                      >
                        {selectedPayment.payment_status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Registration Number</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedPayment.registration_number}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Student Name</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.student_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Course</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.course}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Semester</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.semester}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Amount</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      ₹{selectedPayment.amount?.toLocaleString("en-IN") || "0"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Regular Subjects</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedPayment.regular_subject_count || 0}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Supplementary Subjects
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedPayment.supplementary_subject_count || 0}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Payment Date</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDate(selectedPayment.payment_completed_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sub Merchant ID</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedPayment.sub_merchant_id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Merchant Key</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.merchant_key}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bank Account</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.bank_account}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bank Name</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.bank_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Number</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.account_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">IFSC Code</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPayment.ifsc_code}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-purple-600 to-purple-500">
              <h3 className="text-lg font-semibold text-white">Payment History</h3>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setPaymentHistory([]);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {paymentHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No payment history found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Course & Semester
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Payment Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.map((payment) => (
                        <tr key={payment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {payment.transaction_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{payment.amount?.toLocaleString("en-IN") || "0"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                                payment.payment_status
                              )}`}
                            >
                              {payment.payment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{payment.course}</div>
                            <div className="text-xs">{payment.semester}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payment.payment_completed_at || payment.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false);
                  setPaymentHistory([]);
                }}
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

export default ExamApplicationList;

