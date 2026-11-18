import React, { useEffect, useState, useMemo } from "react";
import {
  Eye,
  Search,
} from "lucide-react";
import { createPortal } from "react-dom";
import { maintenanceLogApi, labsApi, equipmentApi, maintenanceIssueApi } from "../../../services/apiService";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../../config/Toast";

const MaintenanceLog = () => {
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [labs, setLabs] = useState([]);
  const [equipment, setEquipment] = useState([]);

  // Fetch maintenance logs, resolved issues, labs, and equipment from API
  useEffect(() => {
    fetchMaintenanceLogs();
    fetchResolvedIssues();
    fetchLabs();
    fetchEquipment();
  }, []);

  const fetchLabs = async () => {
    try {
      const response = await labsApi.getAll({ status: "Active" });
      let labsData = [];
      if (Array.isArray(response)) {
        labsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        labsData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        labsData = response.data;
      }
      setLabs(labsData);
    } catch (error) {
      console.error("Error fetching labs:", error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await equipmentApi.getAll({});
      let equipmentData = [];
      if (Array.isArray(response)) {
        equipmentData = response;
      } else if (response.data && Array.isArray(response.data)) {
        equipmentData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        equipmentData = response.data;
      }
      setEquipment(equipmentData);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };

  const fetchMaintenanceLogs = async () => {
    try {
      setLoading(true);
      const response = await maintenanceLogApi.getAll({});

      let logsData = [];
      if (Array.isArray(response)) {
        logsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        logsData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        logsData = response.data;
      }

      // Map backend data to frontend format
      const mappedLogs = logsData.map((log) => ({
        ...log,
        recordType: "maintenance_log",
        issueTitle: log.equipmentId?.equipmentName || log.issueTitle || "-",
        labName: log.labId?.labName || log.labName || "-",
        equipmentName: log.equipmentId?.equipmentName || log.equipmentName || "-",
        technician: log.performedBy || log.technician || "-",
        startDate: log.maintenanceDate || log.startDate,
        endDate: log.status === "Completed" ? log.maintenanceDate : log.endDate,
        cost: log.cost || 0,
        status: log.status === "Completed" ? "completed" : log.status === "Pending" ? "pending" : log.status === "Cancelled" ? "cancelled" : "in_progress",
        description: log.description || log.actionsTaken || "-",
        resolutionDate: log.resolutionDate || null,
      }));

      setMaintenanceLogs(mappedLogs);
    } catch (error) {
      console.error("Error fetching maintenance logs:", error);
      setMaintenanceLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResolvedIssues = async () => {
    try {
      const response = await maintenanceIssueApi.getAll({ status: "resolved" });

      let issuesData = [];
      if (Array.isArray(response)) {
        issuesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        issuesData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        issuesData = response.data;
      }

      // Map backend data to frontend format to match maintenance logs structure
      const mappedIssues = issuesData.map((issue) => ({
        ...issue,
        recordType: "resolved_issue",
        issueTitle: issue.issueTitle || issue.title || "-",
        labName: issue.labId?.labName || issue.labName || "-",
        equipmentName: issue.equipmentId?.equipmentName || issue.equipmentName || "-",
        technician: issue.assignedTo || "-",
        maintenanceType: "Issue Resolution",
        startDate: issue.createdAt || issue.reportedDate,
        endDate: issue.resolvedAt || issue.resolvedDate,
        cost: issue.actualCost || issue.estimatedCost || 0,
        status: "completed",
        description: issue.issueDescription || issue.description || "-",
        resolutionDate: issue.resolutionDate || issue.resolvedAt || issue.resolvedDate,
      }));

      setResolvedIssues(mappedIssues);
    } catch (error) {
      console.error("Error fetching resolved issues:", error);
      setResolvedIssues([]);
    }
  };

  const filteredLogs = useMemo(() => {
    // Combine maintenance logs and resolved issues
    const allRecords = [...maintenanceLogs, ...resolvedIssues];
    let filtered = allRecords;

    // Apply search query across all fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = allRecords.filter((item) => {
        const issueTitle = (item.issueTitle || "").toLowerCase();
        const labName = (item.labName || "").toLowerCase();
        const equipmentName = (item.equipmentName || "").toLowerCase();
        const technician = (item.technician || "").toLowerCase();
        const status = (item.status || "").toLowerCase();
        const maintenanceType = (item.maintenanceType || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const cost = String(item.cost || "").toLowerCase();

        return (
          issueTitle.includes(query) ||
          labName.includes(query) ||
          equipmentName.includes(query) ||
          technician.includes(query) ||
          status.includes(query) ||
          maintenanceType.includes(query) ||
          description.includes(query) ||
          cost.includes(query)
        );
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.endDate || a.startDate || a.createdAt || 0);
      const dateB = new Date(b.endDate || b.startDate || b.createdAt || 0);
      return dateB - dateA;
    });

    return filtered;
  }, [maintenanceLogs, resolvedIssues, searchQuery]);


  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading maintenance logs...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Maintenance Log
          </h2>
        </div>


        {/* Search Input - Above Table */}
        <div className="mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search maintenance logs by issue, lab, equipment, technician, status, type, description, or cost..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        {filteredLogs.length === 0 ? (
          <div className="flex justify-center items-center py-12 bg-white border border-gray-300 rounded-md">
            <div className="text-gray-500">
              {searchQuery
                ? "No maintenance logs found matching your search"
                : "No maintenance logs found"}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Issue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Lab</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Equipment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Technician</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Resolved Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                    No maintenance records found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.issueTitle}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.labName}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{item.equipmentName}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.maintenanceType}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <p>{item.technicianName}</p>
                      <p className="text-xs text-gray-500">{item.technicianId}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.resolutionDate ? new Date(item.resolutionDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.cost}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedItem && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Maintenance Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Issue:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.issueTitle || "-"}
                  </p>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Lab:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.labName || "-"}
                  </p>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Equipment:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.equipmentName || "-"}
                  </p>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Type:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.maintenanceType || "-"}
                  </p>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Technician:
                  </label>
                  <div className="text-sm text-gray-900">
                    <p>{selectedItem.technicianName}</p>
                    <p className="text-xs text-gray-500">{selectedItem.technicianId}</p>
                  </div>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Status:
                  </label>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedItem.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {selectedItem.status}
                  </span>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Resolved Date:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.resolutionDate
                      ? new Date(selectedItem.resolutionDate).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Cost:
                  </label>
                  <p className="text-sm text-gray-900">
                    ₹{selectedItem.cost || 0}
                  </p>
                </div>
                <div className="mb-5 flex items-center col-span-2">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Description:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.description || "-"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MaintenanceLog;

