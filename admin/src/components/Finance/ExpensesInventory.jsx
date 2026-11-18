import React, { useEffect, useState } from "react";
import {
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Building,
  Tag,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    expenseName: "",
    category: "",
    department: "",
    vendorName: "",
    status: "",
    amountMin: "",
    amountMax: "",
    dateFrom: "",
    dateTo: "",
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
      {/* Expense Name */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="expenseName"
          placeholder="Expense Name"
          value={filters.expenseName}
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
          <option value="marketing">Marketing</option>
          <option value="travel">Travel</option>
          <option value="training">Training</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Department */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={filters.department}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
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
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
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

const ExpensesInventory = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    expenseName: "",
    category: "",
    department: "",
    vendorName: "",
    status: "",
    amountMin: "",
    amountMax: "",
    dateFrom: "",
    dateTo: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Static data for Expenses Inventory
  const staticData = [
    {
      _id: "1",
      expenseName: "Building Maintenance",
      category: "maintenance",
      department: "Facilities",
      vendorName: "ABC Maintenance Services",
      description: "Quarterly building maintenance and repairs",
      amount: 150000,
      expenseDate: "2024-01-10",
      status: "approved",
      approvedBy: "Admin",
      approvedDate: "2024-01-11",
    },
    {
      _id: "2",
      expenseName: "Office Supplies",
      category: "supplies",
      department: "HR",
      vendorName: "Office Supplies Co.",
      description: "Monthly office stationery and supplies",
      amount: 25000,
      expenseDate: "2024-01-08",
      status: "approved",
      approvedBy: "HR Manager",
      approvedDate: "2024-01-09",
    },
    {
      _id: "3",
      expenseName: "Training Program",
      category: "training",
      department: "IT",
      vendorName: "Tech Training Institute",
      description: "Employee technical training program",
      amount: 75000,
      expenseDate: "2024-01-12",
      status: "pending",
      approvedBy: null,
      approvedDate: null,
    },
    {
      _id: "4",
      expenseName: "Marketing Campaign",
      category: "marketing",
      department: "Marketing",
      vendorName: "Digital Marketing Agency",
      description: "Quarterly marketing campaign expenses",
      amount: 200000,
      expenseDate: "2024-01-05",
      status: "approved",
      approvedBy: "Marketing Head",
      approvedDate: "2024-01-06",
    },
    {
      _id: "5",
      expenseName: "Equipment Purchase",
      category: "equipment",
      department: "IT",
      vendorName: "Tech Equipment Ltd.",
      description: "Computer equipment and hardware purchase",
      amount: 350000,
      expenseDate: "2024-01-14",
      status: "pending",
      approvedBy: null,
      approvedDate: null,
    },
    {
      _id: "6",
      expenseName: "Utilities Payment",
      category: "utilities",
      department: "Administration",
      vendorName: "XYZ Power Corporation",
      description: "Monthly electricity and water bills",
      amount: 125000,
      expenseDate: "2024-01-07",
      status: "approved",
      approvedBy: "Admin",
      approvedDate: "2024-01-08",
    },
    {
      _id: "7",
      expenseName: "Cleaning Services",
      category: "services",
      department: "Facilities",
      vendorName: "Cleaning Services Inc.",
      description: "Monthly cleaning and janitorial services",
      amount: 30000,
      expenseDate: "2024-01-09",
      status: "rejected",
      approvedBy: "Admin",
      approvedDate: "2024-01-10",
    },
  ];

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExpenses(staticData);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setError(error.message);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    setFilters(filters);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setExpenses(expenses.filter((expense) => expense._id !== id));
    }
  };

  const handleApprove = (id) => {
    if (window.confirm("Approve this expense?")) {
      setExpenses(
        expenses.map((expense) =>
          expense._id === id
            ? {
                ...expense,
                status: "approved",
                approvedBy: "Admin",
                approvedDate: new Date().toISOString().split("T")[0],
              }
            : expense
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
      marketing: "Marketing",
      travel: "Travel",
      training: "Training",
      other: "Other",
    };
    return categories[category] || category;
  };

  const filteredAndSortedExpenses = React.useMemo(() => {
    const filtered = expenses.filter((expense) => {
      const amount = parseFloat(expense.amount || 0);

      return (
        (filters.expenseName === "" ||
          expense.expenseName
            ?.toLowerCase()
            .includes(filters.expenseName.toLowerCase())) &&
        (filters.category === "" ||
          expense.category?.toLowerCase().includes(filters.category.toLowerCase())) &&
        (filters.department === "" ||
          expense.department
            ?.toLowerCase()
            .includes(filters.department.toLowerCase())) &&
        (filters.vendorName === "" ||
          expense.vendorName
            ?.toLowerCase()
            .includes(filters.vendorName.toLowerCase())) &&
        (filters.status === "" ||
          expense.status?.toLowerCase().includes(filters.status.toLowerCase())) &&
        (filters.amountMin === "" || amount >= parseFloat(filters.amountMin)) &&
        (filters.amountMax === "" || amount <= parseFloat(filters.amountMax))
      );
    });

    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        if (sortConfig.key === "amount") {
          const aValue = parseFloat(a.amount || 0);
          const bValue = parseFloat(b.amount || 0);
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        if (["expenseDate", "approvedDate"].includes(sortConfig.key)) {
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
  }, [expenses, filters, sortConfig]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const totalAmount = filteredAndSortedExpenses.reduce(
    (sum, expense) => sum + (parseFloat(expense.amount) || 0),
    0
  );

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Expenses Inventory
        </h2>
        <button
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          title="Add New Expense"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-gray-900">
            ₹{totalAmount.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-600">
            ₹
            {filteredAndSortedExpenses
              .filter((e) => e.status === "approved")
              .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
              .toLocaleString("en-IN")}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            ₹
            {filteredAndSortedExpenses
              .filter((e) => e.status === "pending")
              .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
              .toLocaleString("en-IN")}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Total Records</div>
          <div className="text-2xl font-bold text-gray-900">
            {filteredAndSortedExpenses.length}
          </div>
        </div>
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
            onClick={fetchExpenses}
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
                  onClick={() => requestSort("expenseName")}
                >
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    Expense Name
                    {sortConfig.key === "expenseName" && (
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
                  Vendor
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
                  onClick={() => requestSort("amount")}
                >
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Amount (₹)
                    {sortConfig.key === "amount" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("expenseDate")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Date
                    {sortConfig.key === "expenseDate" && (
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
              {filteredAndSortedExpenses.length > 0 ? (
                filteredAndSortedExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {expense.expenseName || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                        {getCategoryName(expense.category)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.department || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.vendorName || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                      {expense.description || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ₹{expense.amount?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.expenseDate
                        ? new Date(expense.expenseDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          expense.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : expense.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {expense.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {expense.status === "pending" && (
                          <button
                            onClick={() => handleApprove(expense._id)}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                            title="Approve"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
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
                    colSpan="9"
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-600">No expenses found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Add Expense" to create a new expense record
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

export default ExpensesInventory;

