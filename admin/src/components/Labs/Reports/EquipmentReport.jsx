import React, { useEffect, useState, useMemo } from "react";
import { Download, Package, Wrench, AlertCircle, AlertTriangle } from "lucide-react";
import { labReportsApi } from "../../../services/apiService";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";

const EquipmentReport = () => {
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEquipmentReport();
  }, []);

  const fetchEquipmentReport = async () => {
    try {
      setLoading(true);
      const response = await labReportsApi.getEquipmentReport();
      let reportData = [];
      
      if (Array.isArray(response)) {
        reportData = response;
      } else if (response.data && Array.isArray(response.data)) {
        reportData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        reportData = response.data;
      }
      
      setEquipmentData(reportData);
    } catch (error) {
      console.error("Error fetching equipment report:", error);
      showErrorMessage("Failed to fetch equipment report");
      setEquipmentData([]);
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    return {
      totalEquipment: equipmentData.reduce((sum, item) => sum + item.totalEquipment, 0),
      working: equipmentData.reduce((sum, item) => sum + item.working, 0),
      faulty: equipmentData.reduce((sum, item) => sum + item.faulty, 0),
      damaged: equipmentData.reduce((sum, item) => sum + item.damaged, 0),
      totalValue: equipmentData.reduce((sum, item) => sum + item.totalValue, 0),
    };
  }, [equipmentData]);

  const insights = useMemo(() => {
    if (equipmentData.length === 0) return null;
    
    const workingRatio = totals.totalEquipment > 0 
      ? Math.round((totals.working / totals.totalEquipment) * 100) 
      : 0;
    
    const faultyRatio = totals.totalEquipment > 0 
      ? Math.round((totals.faulty / totals.totalEquipment) * 100) 
      : 0;

    const labsNeedingAttention = equipmentData.filter(item => {
      const faultyPercent = item.totalEquipment > 0 
        ? (item.faulty / item.totalEquipment) * 100 
        : 0;
      return faultyPercent > 20;
    });

    const highValueLabs = equipmentData
      .filter(item => item.totalValue > 0)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 3);

    return {
      workingRatio,
      faultyRatio,
      labsNeedingAttention: labsNeedingAttention.length,
      highValueLabs,
    };
  }, [equipmentData, totals]);

  const exportToCSV = () => {
    const headers = ["Lab Name", "Total Equipment", "Working", "Faulty", "Damaged", "Total Value (₹)"];
    const csvRows = [
      headers.join(","),
      ...equipmentData.map(item => [
        `"${item.labName || ""}"`,
        item.totalEquipment || 0,
        item.working || 0,
        item.faulty || 0,
        item.damaged || 0,
        item.totalValue || 0
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `equipment_report_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessMessage("Report exported successfully");
  };

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
            Equipment & Asset Report
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitoring laboratory equipment status and valuation
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Equipment</p>
              <p className="text-2xl font-bold text-[#525b88] mt-1">{totals.totalEquipment}</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Package className="w-6 h-6 text-[#525b88]" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Working</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{totals.working}</p>
              {insights && (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">{insights.workingRatio}% Healthy</span>
              )}
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Wrench className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Faulty</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{totals.faulty}</p>
              {insights && (
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase">{insights.faultyRatio}% Needs Care</span>
              )}
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Broken/Damaged</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{totals.damaged}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Inventory Value</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">₹{totals.totalValue.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {insights.labsNeedingAttention > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider">Critical Maintenance Needed</h3>
                  <p className="text-xs text-orange-600">Labs with &gt;20% faulty equipment</p>
                </div>
              </div>
              <p className="text-4xl font-extrabold text-orange-700">{insights.labsNeedingAttention}</p>
              <p className="text-sm text-orange-600 mt-2 font-medium">Laboratories require immediate technical inspection</p>
            </div>
          )}
          {insights.highValueLabs.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Top Asset Value Labs</h3>
              </div>
              <div className="space-y-3">
                {insights.highValueLabs.map((lab, index) => (
                  <div key={lab._id} className="flex justify-between items-center group">
                    <span className="text-sm text-gray-700 font-medium group-hover:text-[#525b88] transition-colors capitalize">
                      {index + 1}. {lab.labName}
                    </span>
                    <span className="text-sm font-bold text-blue-700">₹{lab.totalValue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#525b88]" />
            Asset Health Inventory
          </h3>
       
        </div>
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-[#525b88]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Lab Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Total Equipment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Working</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Faulty</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Damaged</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Total Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipmentData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                  No equipment data found
                </td>
              </tr>
            ) : (
              equipmentData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800 capitalize">
                    {item.labName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold border border-indigo-100">
                      {item.totalEquipment} Items
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="flex items-center gap-1.5 text-green-600 font-medium">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {item.working}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="flex items-center gap-1.5 text-orange-600 font-medium">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      {item.faulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="flex items-center gap-1.5 text-red-600 font-medium">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      {item.damaged}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    ₹{item.totalValue.toLocaleString()}
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

export default EquipmentReport;

