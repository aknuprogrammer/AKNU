import React, { useState, useEffect } from "react";
import { API } from "../../config/urls";
import {
  showAxiosError,
  showSuccessMessage,
  showErrorMessage,
} from "../../config/Toast";
import { DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode";
export default function PaySlip() {
  const [loading, setLoading] = useState(false);
  const [paySlipList, setPaySlipList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userEmployeeId, setUserEmployeeId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Get user role and employee ID from token (run first, before data fetching)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);

        // Get employeeId from decoded.user object (same as Timesheet and Leave)
        if (decoded.user) {
          const employeeId = decoded.user.employeeId || decoded.user.employeeID;
          if (employeeId) {
            setUserEmployeeId(employeeId);
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

  // Fetch pay slip data from employee-payroll endpoint
  const fetchPaySlipData = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const resp = await API.get("/employee/upload-pay-slip");
      let data = resp.data.data || resp.data || [];

      // Filter by logged-in user's employeeId (only for non-admin roles)
      // Note: Backend already filters by approvalStatus for employees
      const isAdmin = userRole === "super_admin" || userRole === "admin";
      if (userEmployeeId && !isAdmin) {
        data = data.filter(
          (item) => (item.employeeId || item.employeeID) === userEmployeeId
        );
      }

      setPaySlipList(data);
      setFilteredList(data);
    } catch (error) {
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when userEmployeeId is available OR when role is admin/super_admin
  useEffect(() => {
    if (
      userEmployeeId !== null ||
      userRole === "super_admin" ||
      userRole === "admin"
    ) {
      fetchPaySlipData();
    }
  }, [userEmployeeId, userRole]);

  // Filter pay slip data based on search query and date range
  useEffect(() => {
    let filtered = paySlipList;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((record) => {
        const employeeName = (record.employeeName || "").toLowerCase();
        const employeeId = (
          record.employeeId ||
          record.employeeID ||
          ""
        ).toLowerCase();
        const payPeriod = (record.payPeriod || "").toLowerCase();
        return (
          employeeName.includes(query) ||
          employeeId.includes(query) ||
          payPeriod.includes(query)
        );
      });
    }

    // Apply date range filter (based on payDate)
    if (fromDate) {
      filtered = filtered.filter((record) => {
        const recordDate = record.payDate
          ? new Date(record.payDate).toISOString().split("T")[0]
          : "";
        return recordDate >= fromDate;
      });
    }
    if (toDate) {
      filtered = filtered.filter((record) => {
        const recordDate = record.payDate
          ? new Date(record.payDate).toISOString().split("T")[0]
          : "";
        return recordDate <= toDate;
      });
    }

    setFilteredList(filtered);
  }, [paySlipList, searchQuery, fromDate, toDate]);

  // Format pay period
  const formatPayPeriod = (period) => {
    if (!period) return "-";
    if (period.includes("-")) {
      const [year, month] = period.split("-");
      const date = new Date(year, month - 1);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    return period;
  };

  // Handle view file
  const handleViewFile = async (item) => {
    try {
      const response = await API.get(
        `/employee/upload-pay-slip/${item._id}/file`,
        {
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([response.data], {
        type: item.paySlipFileContentType || "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Error viewing file:", error);
      if (item.paySlipFile) {
        window.open(item.paySlipFile, "_blank");
      } else {
        showErrorMessage("Failed to open file. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        Pay Slip Records
      </h1>

      {/* Pay Slip Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
          {/* Search Input - Same style as Timesheet */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Employee Name, ID, Pay Period..."
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

          {/* From Date */}
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
            />
          </div>

          {/* To Date */}
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#525B88]"></div>
          </div>
        ) : (
          <div className="table-scroll-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs whitespace-nowrap font-medium text-white uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Pay Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Paid Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Loss of Pay Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Pay Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    File
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {!hasSearched ? (
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <p className="text-gray-600">
                          Enter search criteria and click "Search Pay Slips"
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Fill in Employee Name, Employee ID, or Pay Period to
                          search
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredList.length > 0 ? (
                  filteredList.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.employeeName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.employeeId || item.employeeID || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPayPeriod(item.payPeriod)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.paidDays ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.lossOfPayDays ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.payDate
                          ? new Date(item.payDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.paySlipFileName || item.paySlipFile ? (
                          <button
                            onClick={() => handleViewFile(item)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer bg-transparent border-none p-1 rounded hover:bg-blue-50 transition-colors"
                            title="View File"
                          >
                            <DocumentIcon className="h-5 w-5" />
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-gray-600">
                          No pay slip records found
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {userRole === "employee"
                            ? "No pay slips available for your account"
                            : "No pay slip records match your search criteria"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
