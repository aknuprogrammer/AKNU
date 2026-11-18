import React, { useState, useEffect, useCallback } from "react";
import { revaluationApi } from "../../../services/apiService";
import { showAxiosError } from "../../../config/Toast";

const CompletedRevaluations = () => {
  const [revaluationRequests, setRevaluationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalRecords: 0,
    limit: 10,
  });

  // Fetch completed revaluation requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: limit,
        status: "Completed",
      };
      if (searchTerm) params.search = searchTerm;

      const response = await revaluationApi.getAll(params);
      
      if (response && response.success) {
        const requests = response.data?.requests || response.data || [];
        setRevaluationRequests(Array.isArray(requests) ? requests : []);
        
        if (response.data?.pagination) {
          setPagination(response.data.pagination);
          if (response.data.pagination.total > 0 && currentPage > response.data.pagination.total) {
            setCurrentPage(response.data.pagination.total);
          }
        }
      } else {
        setRevaluationRequests([]);
      }
    } catch (error) {
      showAxiosError(error, "Failed to fetch completed revaluations");
      setRevaluationRequests([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, limit]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchRequests();
    }, searchTerm ? 500 : 0);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Completed Revaluations
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            View all completed revaluation requests and their results
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentPage(1);
            fetchRequests();
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
              placeholder="Search by request number, registration, student name, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Completed Revaluations Table */}
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Completed Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revaluationRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No completed revaluations found
                    </td>
                  </tr>
                ) : (
                  revaluationRequests.map((request) => {
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.studentName || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.registrationNumber || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {request.subjectName || "N/A"}
                          </div>
                          {request.subjectId?.code && (
                            <div className="text-xs text-gray-500">
                              {request.subjectId.code}
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
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {request.revaluationCompletedAt ? (
                            <div className="text-sm text-gray-900">
                              {new Date(request.revaluationCompletedAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              })}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
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

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-md border">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.current * pagination.limit, pagination.totalRecords)} of{" "}
            {pagination.totalRecords} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={pagination.current === 1 || loading}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {pagination.current} of {pagination.total}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.total, p + 1))}
              disabled={pagination.current === pagination.total || loading}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedRevaluations;

