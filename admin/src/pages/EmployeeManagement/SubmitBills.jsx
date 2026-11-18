import React, { useState, useEffect } from "react";
import AddFormModal from "./AddFormModal";
import { API } from "../../config/urls";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode";

const SubmitBills = () => {
  const [billList, setBillList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [viewingBill, setViewingBill] = useState(null);
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
          const fullName =
            decoded.user.fullName ||
            `${decoded.user.firstName || ""} ${
              decoded.user.lastName || ""
            }`.trim() ||
            decoded.user.name ||
            "";
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

  // Filter bills based on search query
  useEffect(() => {
    let filtered = billList;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((record) => {
        const employeeName = (
          record.employeeName ||
          (record.employee?.firstName && record.employee?.lastName
            ? `${record.employee.firstName} ${record.employee.lastName}`
            : record.employee?.name || record.name || "")
        ).toLowerCase();
        const employeeId = (
          record.employeeId ||
          record.employeeID ||
          record.employee?.employeeId ||
          record.employee?.employeeID ||
          "" ||
          ""
        ).toLowerCase();
        const billType = (getBillTypeName(record.billType) || "").toLowerCase();
        const status = (record.status || "").toLowerCase();
        return (
          employeeName.includes(query) ||
          employeeId.includes(query) ||
          billType.includes(query) ||
          status.includes(query)
        );
      });
    }

    setFilteredList(filtered);
  }, [billList, searchQuery]);

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

  // Fetch bills from API
  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await API.get("/employee/bill");
      let data = [];
      if (response.data && response.data.success) {
        data = response.data.data || [];
      } else {
        data = response.data || [];
      }

      // Filter by logged-in user's employeeId (only for non-admin roles)
      if (
        userEmployeeId &&
        userRole !== "super_admin" &&
        userRole !== "admin"
      ) {
        data = data.filter((record) => {
          const recordEmployeeId =
            record.employeeId ||
            record.employeeID ||
            record.employee?.employeeId ||
            record.employee?.employeeID;
          return recordEmployeeId === userEmployeeId;
        });
      }

      setBillList(data);
    } catch (error) {
      console.error("Error fetching bills:", error);
      showAxiosError(error);
      setBillList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch bills when userEmployeeId is available OR when role is admin/super_admin
  useEffect(() => {
    if (
      userEmployeeId !== null ||
      userRole === "super_admin" ||
      userRole === "admin"
    ) {
      fetchBills();
    }
  }, [userEmployeeId, userRole]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        setLoading(true);
        await API.delete(`/employee/bill/${id}`);
        showSuccessMessage("Bill deleted successfully");
        // Refresh the list
        await fetchBills();
      } catch (error) {
        console.error("Error deleting bill:", error);
        showAxiosError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);

      if (editingBill) {
        // Update existing bill using PUT
        await API.put(`/employee/bill/${editingBill._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        showSuccessMessage("Bill updated successfully");
      } else {
        // Create new bill using POST
        await API.post("/employee/bill", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        showSuccessMessage("Bill submitted successfully");
      }

      setShowAddForm(false);
      setEditingBill(null);
      // Refresh the list
      await fetchBills();
    } catch (error) {
      console.error("Error submitting bill:", error);
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return `₹${parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get bill type display name
  const getBillTypeName = (type) => {
    const types = {
      travel: "Travel Expenses",
      accommodation: "Accommodation",
      food: "Food & Beverages",
      stationery: "Stationery & Supplies",
      medical: "Medical Expenses",
      utility: "Utility Bills",
      other: "Other Expenses",
    };
    return types[type] || type;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Submit Bills</h1>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Bills</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage employee bill submissions
            </p>
          </div>
          <button
            onClick={() => {
              setEditingBill(null);
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
            Submit Bill
          </button>
        </div>

        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            {/* Search Input - Same style as Timesheet */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Employee Name, ID, Bill Type, Status..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Bill Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Bill Amount
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Submitted Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredList.length > 0 ? (
                  filteredList.map((bill, index) => {
                    // Get employee name - handle different possible field structures
                    const employeeName =
                      bill.employeeName ||
                      (bill.employee?.firstName && bill.employee?.lastName
                        ? `${bill.employee.firstName} ${bill.employee.lastName}`
                        : bill.employee?.name ||
                          bill.employeeName ||
                          bill.name ||
                          "-");

                    // Get employee ID - handle different possible field structures
                    const employeeId =
                      bill.employeeId ||
                      bill.employeeID ||
                      bill.employee?.employeeId ||
                      bill.employee?.employeeID ||
                      bill.employee?.id ||
                      bill.employee?._id ||
                      "-";

                    return (
                      <tr
                        key={bill._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {employeeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {employeeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {getBillTypeName(bill.billType)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatCurrency(bill.billAmount)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bill.createdAt
                            ? new Date(bill.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setViewingBill(bill);
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
                                setEditingBill(bill);
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
                              onClick={() => handleDelete(bill._id)}
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-gray-600">No bills found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {searchQuery
                            ? "No bills match your search criteria"
                            : 'Click "Submit Bill" to create one'}
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
            formType="bills"
            initialData={editingBill}
            departments={departments}
            userEmployeeId={userEmployeeId}
            userEmployeeName={userEmployeeName}
            userRole={userRole}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setShowAddForm(false);
              setEditingBill(null);
            }}
          />
        )}

        {/* View Modal */}
        {showViewModal && viewingBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[95vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
                <h2 className="text-lg font-semibold text-white">
                  Bill Details
                </h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingBill(null);
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
                          {viewingBill.employeeName ||
                            (viewingBill.employee?.firstName &&
                            viewingBill.employee?.lastName
                              ? `${viewingBill.employee.firstName} ${viewingBill.employee.lastName}`
                              : viewingBill.employee?.name ||
                                viewingBill.name ||
                                "-")}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Employee ID
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {viewingBill.employeeId ||
                            viewingBill.employeeID ||
                            viewingBill.employee?.employeeId ||
                            viewingBill.employee?.employeeID ||
                            viewingBill.employee?.id ||
                            viewingBill.employee?._id ||
                            "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bill Details */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">
                      Bill Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Bill Type
                        </label>
                        <p className="mt-1">
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {getBillTypeName(viewingBill.billType)}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Bill Amount
                        </label>
                        <p className="mt-1 text-sm text-gray-900 font-semibold">
                          {formatCurrency(viewingBill.billAmount)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Bill Date
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {viewingBill.billDate
                            ? new Date(viewingBill.billDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <p className="mt-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              viewingBill.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : viewingBill.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : viewingBill.status === "in_review"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {viewingBill.status || "pending"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Department/Stream
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {viewingBill.department ||
                            viewingBill.stream ||
                            viewingBill.departmentName ||
                            "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Submitted Date
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {viewingBill.createdAt
                            ? new Date(
                                viewingBill.createdAt
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
                      {viewingBill.updatedAt && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Last Updated
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {new Date(viewingBill.updatedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      )}
                      {viewingBill.description && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                            {viewingBill.description || "-"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attachments */}
                  {viewingBill.attachments &&
                    viewingBill.attachments.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-[#525B88] mb-4 border-b pb-2">
                          Attachments
                        </h3>
                        <div className="space-y-2">
                          {Array.isArray(viewingBill.attachments) ? (
                            viewingBill.attachments.map((attachment, idx) => (
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
                                {typeof viewingBill.attachments === "string"
                                  ? viewingBill.attachments
                                  : viewingBill.attachments.name ||
                                    viewingBill.attachments.filename ||
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
                    setViewingBill(null);
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

export default SubmitBills;
