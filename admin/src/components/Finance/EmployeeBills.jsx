import React, { useEffect, useState } from "react";
import {
  Filter,
  User,
  Hash,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Building,
} from "lucide-react";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    employeeName: "",
    employeeId: "",
    billType: "",
    department: "",
    status: "",
    amountMin: "",
    amountMax: "",
    billDateFrom: "",
    billDateTo: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row md:items-center gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg"
    >
      {/* Employee Name */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="employeeName"
          placeholder="Employee Name"
          value={filters.employeeName}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Employee ID */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="employeeId"
          placeholder="Employee ID"
          value={filters.employeeId}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Bill Type */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="billType"
          value={filters.billType}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Types</option>
          <option value="travel">Travel Expenses</option>
          <option value="accommodation">Accommodation</option>
          <option value="food">Food & Beverages</option>
          <option value="stationery">Stationery & Supplies</option>
          <option value="medical">Medical Expenses</option>
          <option value="utility">Utility Bills</option>
          <option value="other">Other Expenses</option>
        </select>
      </div>

      {/* Status */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Apply Filter Button */}
      <div>
        <button
          type="submit"
          className={`flex items-center justify-center px-4 py-2 h-[37px] rounded-md text-sm font-medium transition-colors bg-[#525B88] text-white hover:bg-[#3a4166]`}
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

const EmployeeBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    employeeName: "",
    employeeId: "",
    billType: "",
    department: "",
    status: "",
    amountMin: "",
    amountMax: "",
    billDateFrom: "",
    billDateTo: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Static data for Employee Bills
  const staticData = [
    {
      _id: "1",
      employeeId: "EMP001",
      employeeName: "Rajesh Kumar",
      department: "Computer Science",
      billType: "travel",
      billAmount: 12500,
      billDate: "2024-01-15",
      description: "Conference travel expenses",
      status: "pending",
      submittedDate: "2024-01-16",
      attachments: ["receipt1.pdf", "invoice1.pdf"],
    },
    {
      _id: "2",
      employeeId: "EMP002",
      employeeName: "Priya Sharma",
      department: "Mathematics",
      billType: "accommodation",
      billAmount: 8500,
      billDate: "2024-01-10",
      description: "Hotel accommodation for workshop",
      status: "approved",
      submittedDate: "2024-01-11",
      attachments: ["hotel_receipt.pdf"],
    },
    {
      _id: "3",
      employeeId: "EMP003",
      employeeName: "Amit Patel",
      department: "Physics",
      billType: "food",
      billAmount: 3500,
      billDate: "2024-01-12",
      description: "Team lunch meeting",
      status: "in_review",
      submittedDate: "2024-01-13",
      attachments: ["restaurant_bill.pdf"],
    },
    {
      _id: "4",
      employeeId: "EMP004",
      employeeName: "Sneha Reddy",
      department: "Chemistry",
      billType: "stationery",
      billAmount: 2500,
      billDate: "2024-01-08",
      description: "Office supplies and stationery",
      status: "approved",
      submittedDate: "2024-01-09",
      attachments: ["invoice.pdf"],
    },
    {
      _id: "5",
      employeeId: "EMP005",
      employeeName: "Karan Singh",
      department: "English",
      billType: "medical",
      billAmount: 15000,
      billDate: "2024-01-14",
      description: "Medical reimbursement",
      status: "rejected",
      submittedDate: "2024-01-15",
      attachments: ["medical_bill.pdf"],
    },
  ];

  const fetchBills = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setBills(staticData);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError(error.message);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    setFilters(filters);
  };

  const handleApprove = (id) => {
    if (window.confirm("Are you sure you want to approve this bill?")) {
      setBills(bills.map((bill) =>
        bill._id === id ? { ...bill, status: "approved" } : bill
      ));
    }
  };

  const handleReject = (id) => {
    if (window.confirm("Are you sure you want to reject this bill?")) {
      setBills(bills.map((bill) =>
        bill._id === id ? { ...bill, status: "rejected" } : bill
      ));
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

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

  const filteredAndSortedBills = React.useMemo(() => {
    const filtered = bills.filter((bill) => {
      const amount = parseFloat(bill.billAmount || 0);

      return (
        (filters.employeeName === "" ||
          bill.employeeName
            ?.toLowerCase()
            .includes(filters.employeeName.toLowerCase())) &&
        (filters.employeeId === "" ||
          bill.employeeId
            ?.toLowerCase()
            .includes(filters.employeeId.toLowerCase())) &&
        (filters.billType === "" ||
          bill.billType?.toLowerCase().includes(filters.billType.toLowerCase())) &&
        (filters.department === "" ||
          bill.department
            ?.toLowerCase()
            .includes(filters.department.toLowerCase())) &&
        (filters.status === "" ||
          bill.status?.toLowerCase().includes(filters.status.toLowerCase())) &&
        (filters.amountMin === "" || amount >= parseFloat(filters.amountMin)) &&
        (filters.amountMax === "" || amount <= parseFloat(filters.amountMax))
      );
    });

    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        if (sortConfig.key === "billAmount") {
          const aValue = parseFloat(a.billAmount || 0);
          const bValue = parseFloat(b.billAmount || 0);
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        if (["billDate", "submittedDate"].includes(sortConfig.key)) {
          const dateA = new Date(a[sortConfig.key] || 0);
          const dateB = new Date(b[sortConfig.key] || 0);
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [bills, filters, sortConfig]);

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Employee Bills Management
        </h2>
      </div>

      <FilterBar onFilter={handleFilter} />

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#525b88]"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error fetching data: {error}
          <button
            onClick={fetchBills}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto mt-4 border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88]">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("employeeId")}
                >
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    Emp ID
                    {sortConfig.key === "employeeId" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("employeeName")}
                >
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Employee
                    {sortConfig.key === "employeeName" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("department")}
                >
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    Department
                    {sortConfig.key === "department" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("billType")}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Bill Type
                    {sortConfig.key === "billType" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("billAmount")}
                >
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Amount (₹)
                    {sortConfig.key === "billAmount" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("billDate")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Bill Date
                    {sortConfig.key === "billDate" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === "status" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedBills.length > 0 ? (
                filteredAndSortedBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {bill.employeeId || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {bill.employeeName || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.department || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {getBillTypeName(bill.billType)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                      {bill.description || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ₹{bill.billAmount?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.billDate
                        ? new Date(bill.billDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          bill.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : bill.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : bill.status === "in_review"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {bill.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {bill.status !== "approved" && (
                          <button
                            onClick={() => handleApprove(bill._id)}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {bill.status !== "rejected" && (
                          <button
                            onClick={() => handleReject(bill._id)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        {bill.attachments && bill.attachments.length > 0 && (
                          <button
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="View Attachments"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-600">No employee bills found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Bills submitted by employees will appear here
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
  );
};

export default EmployeeBills;

