import React, { useEffect, useState, useMemo } from "react";
import { Download, Wrench, DollarSign, Calendar, Filter, AlertTriangle } from "lucide-react";
import { labReportsApi } from "../../../services/apiService";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";

const MaintenanceReport = () => {
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchMaintenanceReport();
  }, []);

  const fetchMaintenanceReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const response = await labReportsApi.getMaintenanceReport(params);
      let reportData = [];
      
      if (Array.isArray(response)) {
        reportData = response;
      } else if (response.data && Array.isArray(response.data)) {
        reportData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        reportData = response.data;
      }
      
      setMaintenanceData(reportData);
    } catch (error) {
      console.error("Error fetching maintenance report:", error);
      showErrorMessage("Failed to fetch maintenance report");
      setMaintenanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showErrorMessage("Start date must be before end date");
      return;
    }
    fetchMaintenanceReport();
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    fetchMaintenanceReport();
  };

  const exportToCSV = () => {
    const headers = ["Lab Name", "Total Maintenance", "Completed", "In Progress", "Total Cost (₹)", "Average Cost (₹)"];
    const csvRows = [
      headers.join(","),
      ...maintenanceData.map(item => [
        `"${item.labName || ""}"`,
        item.totalMaintenance || 0,
        item.completed || 0,
        item.inProgress || 0,
        item.totalCost || 0,
        item.avgCost || 0
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `maintenance_report_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessMessage("Report exported successfully");
  };

  const totals = useMemo(() => {
    return {
      totalMaintenance: maintenanceData.reduce((sum, item) => sum + item.totalMaintenance, 0),
      completed: maintenanceData.reduce((sum, item) => sum + item.completed, 0),
      inProgress: maintenanceData.reduce((sum, item) => sum + item.inProgress, 0),
      totalCost: maintenanceData.reduce((sum, item) => sum + item.totalCost, 0),
    };
  }, [maintenanceData]);

  const insights = useMemo(() => {
    if (maintenanceData.length === 0) return null;
    
    const highCostLabs = maintenanceData.filter(item => item.totalCost > 0)
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 3);
    
    const pendingRatio = totals.totalMaintenance > 0 
      ? Math.round((totals.inProgress / totals.totalMaintenance) * 100) 
      : 0;
    
    const avgCostPerLab = maintenanceData.length > 0 
      ? totals.totalCost / maintenanceData.length 
      : 0;

    return {
      highCostLabs,
      pendingRatio,
      avgCostPerLab: Math.round(avgCostPerLab),
      completionRate: totals.totalMaintenance > 0 
        ? Math.round((totals.completed / totals.totalMaintenance) * 100) 
        : 0,
    };
  }, [maintenanceData, totals]);

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
            Maintenance & Service Report
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Analyzing maintenance frequency, costs, and resolution efficiency
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Filter className="w-5 h-5 text-[#525b88]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 uppercase tracking-wider">Report Filter</p>
              <p className="text-xs text-gray-500">Select period for maintenance analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#525b88] focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#525b88] focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={handleFilter}
                className="px-6 py-2 bg-[#525b88] text-white text-sm font-bold rounded-lg hover:bg-[#3a4166] transition-all shadow-sm hover:shadow"
              >
                Apply Analysis
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={handleResetFilter}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Services</p>
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <Wrench className="w-5 h-5 text-[#525b88]" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#2a3563]">{totals.totalMaintenance}</p>
          <p className="text-[10px] text-gray-500 mt-1 italic">Total maintenance actions performed</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resolved</p>
            <div className="p-1.5 bg-green-50 rounded-lg">
              <Wrench className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-green-600">{totals.completed}</p>
          {insights && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">{insights.completionRate}% Efficiency</span>
            </div>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">In Progress</p>
            <div className="p-1.5 bg-orange-50 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-orange-600">{totals.inProgress}</p>
          {insights && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase">{insights.pendingRatio}% Pending</span>
            </div>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Expenditure</p>
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-600">₹{totals.totalCost.toLocaleString()}</p>
          {insights && (
            <p className="text-[10px] text-blue-600 mt-1 font-medium">Avg: ₹{insights.avgCostPerLab.toLocaleString()} / lab</p>
          )}
        </div>
      </div>

      {/* Insights - High Cost Labs */}
    

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#525b88]" />
            Maintenance Ledger Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Lab Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Total Actions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Completed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">In Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Total Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Average Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maintenanceData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                    No maintenance data found for selected period
                  </td>
                </tr>
              ) : (
                maintenanceData.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 capitalize">
                      {item.labName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold border border-indigo-100">
                        {item.totalMaintenance} Actions
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="flex items-center gap-1.5 text-green-600 font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        {item.completed}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="flex items-center gap-1.5 text-orange-600 font-medium">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        {item.inProgress}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ₹{item.totalCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ₹{item.avgCost.toLocaleString()}
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

export default MaintenanceReport;

