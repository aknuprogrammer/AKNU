import React, { useEffect, useState, useMemo } from "react";
import {
  Download,
  ChartBarIcon,
  Calendar,
  FlaskConical,
  Filter,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { labReportsApi } from "../../../services/apiService";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";

const LabUsageReport = () => {
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchUsageReport();
  }, []);

  const fetchUsageReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const response = await labReportsApi.getUsageReport(params);
      let reportData = [];

      if (Array.isArray(response)) {
        reportData = response;
      } else if (response.data && Array.isArray(response.data)) {
        reportData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        reportData = response.data;
      }

      setUsageData(reportData);
    } catch (error) {
      console.error("Error fetching lab usage report:", error);
      showErrorMessage("Failed to fetch lab usage report");
      setUsageData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showErrorMessage("Start date must be before end date");
      return;
    }
    fetchUsageReport();
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    fetchUsageReport();
  };

  const exportToCSV = () => {
    const headers = [
      "Lab Name",
      "Total Bookings",
      "Total Hours",
      "Utilization Rate (%)",
      "Most Used Day",
      "Peak Hours",
    ];
    const csvRows = [
      headers.join(","),
      ...usageData.map((item) =>
        [
          `"${item.labName || ""}"`,
          item.totalBookings || 0,
          item.totalHours || 0,
          item.utilizationRate || 0,
          `"${item.mostUsedDay || "N/A"}"`,
          `"${item.peakHours || "N/A"}"`,
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `lab_usage_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessMessage("Report exported successfully");
  };

  const totalBookings = useMemo(() => {
    return usageData.reduce((sum, item) => sum + item.totalBookings, 0);
  }, [usageData]);

  const totalHours = useMemo(() => {
    return usageData.reduce((sum, item) => sum + item.totalHours, 0);
  }, [usageData]);

  const insights = useMemo(() => {
    if (usageData.length === 0) return null;

    const highUtilization = usageData.filter(
      (item) => item.utilizationRate >= 80
    );
    const lowUtilization = usageData.filter(
      (item) => item.utilizationRate < 30
    );
    const avgUtilization =
      usageData.reduce((sum, item) => sum + item.utilizationRate, 0) /
      usageData.length;

    const mostUsedLab = usageData.reduce(
      (max, item) =>
        item.totalBookings > (max?.totalBookings || 0) ? item : max,
      null
    );

    return {
      highUtilization: highUtilization.length,
      lowUtilization: lowUtilization.length,
      avgUtilization: Math.round(avgUtilization),
      mostUsedLab: mostUsedLab?.labName || "N/A",
    };
  }, [usageData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading report...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Lab Usage Report
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Analyzing lab utilization and booking patterns
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] shadow-sm hover:shadow transition-all duration-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Filter by Date Range:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-[#525b88] text-white text-sm rounded-md hover:bg-[#3a4166] transition-colors"
          >
            Apply Filter
          </button>
          {(startDate || endDate) && (
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-[#525b88]">
                {totalBookings}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-[#525b88]" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalHours.toFixed(2)}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Labs</p>
              <p className="text-2xl font-bold text-green-600">
                {usageData.length}
              </p>
            </div>
            <FlaskConical className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Insights Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">
                  High Utilization Labs
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {insights.highUtilization}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Labs with ≥80% utilization
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">
                  Low Utilization Labs
                </p>
                <p className="text-2xl font-bold text-orange-700">
                  {insights.lowUtilization}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Labs with &lt;30% utilization
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  Average Utilization
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {insights.avgUtilization}%
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Most Used: {insights.mostUsedLab}
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-[#525b88]" />
            Lab Utilization Breakdown
          </h3>
          <span className="text-xs text-gray-500 italic">
            Based on 160 available hours per month
          </span>
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-[#525b88]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                Lab Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                Total Bookings
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                Total Hours
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                Utilization Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                Most Used Day
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                Peak Hours
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usageData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                  No lab usage data found for the selected period
                </td>
              </tr>
            ) : (
              usageData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    {item.labName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-100">
                      {item.totalBookings} Bookings
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.totalHours.toFixed(1)} hrs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col gap-1 min-w-[150px]">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-bold uppercase ${
                          item.utilizationRate >= 80 ? "text-green-600" : item.utilizationRate >= 40 ? "text-blue-600" : "text-gray-500"
                        }`}>
                          {item.utilizationRate >= 80 ? 'Optimal' : item.utilizationRate >= 40 ? 'Active' : 'Underutilized'}
                        </span>
                        <span className="text-xs font-bold text-gray-700">
                          {item.utilizationRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden border border-gray-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            item.utilizationRate >= 80
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                              : item.utilizationRate >= 60
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                              : item.utilizationRate >= 30
                              ? "bg-gradient-to-r from-blue-400 to-blue-600"
                              : "bg-gradient-to-r from-gray-300 to-gray-400"
                          }`}
                          style={{ width: `${item.utilizationRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.totalBookings > 0 ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#525b88]" />
                        {item.mostUsedDay}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.totalBookings > 0 ? (
                       <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[11px] border border-gray-200">
                        {item.peakHours}
                       </span>
                    ) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};

export default LabUsageReport;
