import React, { useEffect, useState } from "react";
import {
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Building,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    vendorName: "",
    billNumber: "",
    category: "",
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
      {/* Vendor Name */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="vendorName"
          placeholder="Vendor Name"
          value={filters.vendorName}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Bill Number */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="billNumber"
          placeholder="Bill Number"
          value={filters.billNumber}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Category */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Categories</option>
          <option value="maintenance">Maintenance</option>
          <option value="utilities">Utilities</option>
          <option value="supplies">Supplies</option>
          <option value="equipment">Equipment</option>
          <option value="services">Services</option>
          <option value="rent">Rent</option>
          <option value="other">Other</option>
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
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
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

const MiscellaneousBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    vendorName: "",
    billNumber: "",
    category: "",
    department: "",
    status: "",
    amountMin: "",
    amountMax: "",
    billDateFrom: "",
    billDateTo: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Static data for Miscellaneous Bills
  const staticData = [
    {
      _id: "1",
      billNumber: "MISC-2024-001",
      vendorName: "ABC Maintenance Services",
      category: "maintenance",
      department: "Facilities",
      description: "Building maintenance and repairs",
      billAmount: 45000,
      billDate: "2024-01-10",
      dueDate: "2024-01-25",
      status: "pending",
      paymentDate: null,
    },
    {
      _id: "2",
      billNumber: "MISC-2024-002",
      vendorName: "XYZ Power Corporation",
      category: "utilities",
      department: "Administration",
      description: "Monthly electricity bill",
      billAmount: 125000,
      billDate: "2024-01-05",
      dueDate: "2024-01-20",
      status: "paid",
      paymentDate: "2024-01-18",
    },
    {
      _id: "3",
      billNumber: "MISC-2024-003",
      vendorName: "Office Supplies Co.",
      category: "supplies",
      department: "HR",
      description: "Office stationery and supplies",
      billAmount: 18000,
      billDate: "2024-01-08",
      dueDate: "2024-01-23",
      status: "paid",
      paymentDate: "2024-01-15",
    },
    {
      _id: "4",
      billNumber: "MISC-2024-004",
      vendorName: "Tech Equipment Ltd.",
      category: "equipment",
      department: "IT",
      description: "Computer equipment purchase",
      billAmount: 350000,
      billDate: "2024-01-12",
      dueDate: "2024-01-27",
      status: "pending",
      paymentDate: null,
    },
    {
      _id: "5",
      billNumber: "MISC-2024-005",
      vendorName: "Cleaning Services Inc.",
      category: "services",
      department: "Facilities",
      description: "Monthly cleaning services",
      billAmount: 25000,
      billDate: "2024-01-01",
      dueDate: "2024-01-16",
      status: "overdue",
      paymentDate: null,
    },
    {
      _id: "6",
      billNumber: "MISC-2024-006",
      vendorName: "City Water Board",
      category: "utilities",
      department: "Administration",
      description: "Monthly water bill",
      billAmount: 15000,
      billDate: "2024-01-07",
      dueDate: "2024-01-22",
      status: "paid",
      paymentDate: "2024-01-20",
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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      setBills(bills.filter((bill) => bill._id !== id));
    }
  };

  const handleMarkPaid = (id) => {
    if (window.confirm("Mark this bill as paid?")) {
      setBills(
        bills.map((bill) =>
          bill._id === id
            ? { ...bill, status: "paid", paymentDate: new Date().toISOString().split("T")[0] }
            : bill
        )
      );
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getCategoryName = (category) => {
    const categories = {
      maintenance: "Maintenance",
      utilities: "Utilities",
      supplies: "Supplies",
      equipment: "Equipment",
      services: "Services",
      rent: "Rent",
      other: "Other",
    };
    return categories[category] || category;
  };

  const filteredAndSortedBills = React.useMemo(() => {
    const filtered = bills.filter((bill) => {
      const amount = parseFloat(bill.billAmount || 0);

      return (
        (filters.vendorName === "" ||
          bill.vendorName
            ?.toLowerCase()
            .includes(filters.vendorName.toLowerCase())) &&
        (filters.billNumber === "" ||
          bill.billNumber
            ?.toLowerCase()
            .includes(filters.billNumber.toLowerCase())) &&
        (filters.category === "" ||
          bill.category?.toLowerCase().includes(filters.category.toLowerCase())) &&
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
        if (["billDate", "dueDate", "paymentDate"].includes(sortConfig.key)) {
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
          Miscellaneous Bills Management
        </h2>
        <button
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          title="Add New Bill"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Bill
        </button>
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
                  onClick={() => requestSort("billNumber")}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Bill No.
                    {sortConfig.key === "billNumber" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("vendorName")}
                >
                  <div className="flex items-center">
                    Vendor
                    {sortConfig.key === "vendorName" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    {sortConfig.key === "category" && (
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
                  onClick={() => requestSort("dueDate")}
                >
                  <div className="flex items-center">
                    Due Date
                    {sortConfig.key === "dueDate" && (
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
                      {bill.billNumber || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {bill.vendorName || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getCategoryName(bill.category)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.department || "-"}
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
                      {bill.dueDate
                        ? new Date(bill.dueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          bill.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : bill.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {bill.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {bill.status !== "paid" && (
                          <button
                            onClick={() => handleMarkPaid(bill._id)}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                            title="Mark as Paid"
                          >
                            <DollarSign className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(bill._id)}
                          className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-600">No miscellaneous bills found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Add Bill" to create a new bill
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

export default MiscellaneousBills;

