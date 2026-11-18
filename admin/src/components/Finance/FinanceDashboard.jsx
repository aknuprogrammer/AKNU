import React from "react";
import {
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function FinanceDashboard() {
  // Date filter options
  const dateFilters = ["Today", "Week", "Month", "Quarter", "Year", "Custom"];

  // Financial stats
  const financialStats = [
    {
      label: "Total Revenue",
      value: "₹12,45,890",
      icon: CurrencyDollarIcon,
      color: "emerald",
      borderColor: "border-emerald-500",
      iconColor: "text-emerald-500",
    },
    {
      label: "Pending Payments",
      value: "₹2,34,500",
      icon: ClockIcon,
      color: "orange",
      borderColor: "border-orange-500",
      iconColor: "text-orange-500",
    },
    {
      label: "Collected Fees",
      value: "₹10,11,390",
      icon: BanknotesIcon,
      color: "blue",
      borderColor: "border-blue-500",
      iconColor: "text-blue-500",
    },
    {
      label: "Total Expenses",
      value: "₹8,92,340",
      icon: ArrowTrendingDownIcon,
      color: "red",
      borderColor: "border-red-500",
      iconColor: "text-red-500",
    },
  ];

  // Fee collection by type
  const feeTypeStats = [
    { type: "Admission Fees", collected: 245000, pending: 45000, total: 290000 },
    { type: "Tuition Fees", collected: 520000, pending: 78000, total: 598000 },
    { type: "Examination Fees", collected: 180000, pending: 35000, total: 215000 },
    { type: "Hostel Fees", collected: 156000, pending: 28000, total: 184000 },
    { type: "Certificate Fees", collected: 89000, pending: 12000, total: 101000 },
    { type: "Sports Fees", collected: 45000, pending: 8000, total: 53000 },
    { type: "Other Fees", collected: 124390, pending: 23400, total: 147790 },
  ];

  // Campus-wise financial stats
  const campusFinancialStats = [
    {
      campus: "Rajamahendravaram",
      revenue: 425000,
      expenses: 320000,
      net: 105000,
      collected: 380000,
      pending: 45000,
    },
    {
      campus: "Tadepalligudem",
      revenue: 380000,
      expenses: 280000,
      net: 100000,
      collected: 340000,
      pending: 40000,
    },
    {
      campus: "Kakinada",
      revenue: 290000,
      expenses: 215000,
      net: 75000,
      collected: 260000,
      pending: 30000,
    },
    {
      campus: "Vizianagaram",
      revenue: 150890,
      expenses: 77540,
      net: 73350,
      collected: 134390,
      pending: 16500,
    },
  ];

  // Revenue vs Expenses trend data
  const revenueExpensesData = {
    labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
    datasets: [
      {
        label: "Revenue",
        data: [980000, 1050000, 1120000, 1080000, 1150000, 1245890],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
      },
      {
        label: "Expenses",
        data: [720000, 750000, 780000, 760000, 820000, 892340],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.3,
      },
    ],
  };

  // Fee collection by type (Pie Chart)
  const feeDistributionData = {
    labels: feeTypeStats.map((fee) => fee.type),
    datasets: [
      {
        data: feeTypeStats.map((fee) => fee.collected),
        backgroundColor: [
          "#525b88",
          "#10b981",
          "#f59e0b",
          "#8b5cf6",
          "#ec4899",
          "#22c55e",
          "#eab308",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  // Monthly collection data
  const monthlyCollectionData = {
    labels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
    datasets: [
      {
        label: "Collected",
        data: [980000, 1050000, 1120000, 1080000, 1150000, 1245890],
        backgroundColor: "#525b88",
      },
      {
        label: "Pending",
        data: [120000, 140000, 150000, 130000, 160000, 234500],
        backgroundColor: "#f59e0b",
      },
    ],
  };

  // Recent transactions
  const recentTransactions = [
    {
      student: "Rajesh Kumar",
      type: "Admission Fee",
      amount: 15000,
      date: "2024-01-15",
      status: "Completed",
      method: "Online",
    },
    {
      student: "Priya Sharma",
      type: "Tuition Fee",
      amount: 25000,
      date: "2024-01-14",
      status: "Completed",
      method: "Bank Transfer",
    },
    {
      student: "Amit Patel",
      type: "Examination Fee",
      amount: 5000,
      date: "2024-01-14",
      status: "Pending",
      method: "Cash",
    },
    {
      student: "Sneha Reddy",
      type: "Hostel Fee",
      amount: 12000,
      date: "2024-01-13",
      status: "Completed",
      method: "Online",
    },
    {
      student: "Karan Singh",
      type: "Certificate Fee",
      amount: 3000,
      date: "2024-01-13",
      status: "Completed",
      method: "Online",
    },
    {
      student: "Anjali Desai",
      type: "Tuition Fee",
      amount: 25000,
      date: "2024-01-12",
      status: "Failed",
      method: "Online",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88]">Finance Dashboard</h1>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border">
            <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
            <select className="bg-transparent outline-none text-sm">
              {dateFilters.map((filter, index) => (
                <option key={index} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </div>
          <button className="flex items-center bg-[#525B88] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-[#424a70] transition">
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {financialStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${stat.borderColor}`}
            >
              <div className="flex items-center">
                <Icon className={`h-6 w-6 ${stat.iconColor} mr-3`} />
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campus-wise Financial Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Campus-wise Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BuildingLibraryIcon className="h-5 w-5 text-[#525b88] mr-2" />
            Campus-wise Financial Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campusFinancialStats.map((campus, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {campus.campus}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{campus.revenue.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{campus.expenses.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{campus.net.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fee Collection by Type */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 text-[#525b88] mr-2" />
            Fee Collection by Type
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collected
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feeTypeStats.map((fee, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fee.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{fee.collected.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{fee.pending.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{fee.total.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue vs Expenses Trend */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 text-[#525b88] mr-2" />
            Revenue vs Expenses Trend
          </h2>
          <div className="h-64">
            <Line
              data={revenueExpensesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Fee Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 text-[#525b88] mr-2" />
            Fee Collection by Type
          </h2>
          <div className="h-64">
            <Pie
              data={feeDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "right",
                    labels: {
                      boxWidth: 12,
                      font: {
                        size: 11,
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Monthly Collection Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 text-[#525b88] mr-2" />
          Monthly Collection Overview
        </h2>
        <div className="h-64">
          <Bar
            data={monthlyCollectionData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CreditCardIcon className="h-5 w-5 text-[#525b88] mr-2" />
          Recent Transactions
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.student}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{transaction.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

