import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import AddFormModal from "./AddFormModal";
import { maintenanceLogApi, labsApi, equipmentApi, maintenanceIssueApi } from "../../services/apiService";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../config/Toast";
import {
  Search,
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  XCircle,
} from "lucide-react";
import {
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const MaintenanceTable = ({
  maintenance,
  onView,
  onEdit,
  onDelete,
  onResolveIssue,
  onRejectIssue,
  sortConfig,
  requestSort,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div>
      {/* Search Input - Above Table */}
      <div className="mb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search maintenance by item name, lab name, maintenance type, status, technician, or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] placeholder-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      {maintenance.length === 0 ? (
        <div className="flex justify-center items-center py-12 bg-white border border-gray-300 rounded-md">
          <div className="text-gray-500">
            {searchQuery
              ? "No maintenance records found matching your search"
              : "No maintenance records found"}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88] sticky top-0 z-10 shadow-sm">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("itemName")}
            >
              <div className="flex items-center">
                Item Name
                {sortConfig.key === "itemName" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("labName")}
            >
              <div className="flex items-center">
                Lab Name
                {sortConfig.key === "labName" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("maintenanceType")}
            >
              <div className="flex items-center">
                Type
                {sortConfig.key === "maintenanceType" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("requestDate")}
            >
              <div className="flex items-center">
                Request Date
                {sortConfig.key === "requestDate" && (
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
          {maintenance.map((record) => (
            <tr key={record._id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {record.itemName || "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.labName || "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs capitalize">
                  {record.maintenanceType || "-"}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {record.requestDate
                  ? new Date(record.requestDate).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    record.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : record.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : record.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : record.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {record.status || "pending"}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(record._id)}
                    className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onEdit(record._id)}
                    className="text-[#525b88] hover:text-[#3a4166]"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(record._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  {record.issueId && (
                    <>
                      <button
                        onClick={() => onResolveIssue(record._id, record)}
                        className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                        title="Resolve Issue"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onRejectIssue(record._id, record)}
                        className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                        title="Reject/Close Issue"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LabMaintenance = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  const [labs, setLabs] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [maintenanceIssues, setMaintenanceIssues] = useState([]);

  // Fetch maintenance logs, labs, equipment, and issues from API
  useEffect(() => {
    fetchMaintenance();
    fetchLabs();
    fetchEquipment();
    fetchMaintenanceIssues();
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

  const fetchMaintenanceIssues = async () => {
    try {
      const response = await maintenanceIssueApi.getAll({});
      let issuesData = [];
      if (Array.isArray(response)) {
        issuesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        issuesData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        issuesData = response.data;
      }
      // Filter to only open/in_progress issues
      const openIssues = issuesData.filter(
        (issue) => issue.status === "open" || issue.status === "in_progress"
      );
      setMaintenanceIssues(openIssues);
    } catch (error) {
      console.error("Error fetching maintenance issues:", error);
    }
  };

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await maintenanceLogApi.getAll({});

      let maintenanceData = [];
      if (Array.isArray(response)) {
        maintenanceData = response;
      } else if (response.data && Array.isArray(response.data)) {
        maintenanceData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        maintenanceData = response.data;
      }

      // Map backend data to frontend format
      const mappedMaintenance = maintenanceData.map((log) => ({
        ...log,
        itemName: log.equipmentId?.equipmentName || log.itemName || "-",
        labName: log.labId?.labName || log.labName || "-",
        requestDate: log.maintenanceDate || log.requestDate,
        completionDate: log.status === "Completed" ? log.maintenanceDate : null,
        technician: log.performedBy || log.technician || "-",
        cost: log.cost || 0,
        description: log.description || "-",
        notes: log.notes || log.actionsTaken || "-",
        maintenanceType: log.maintenanceType || "Routine",
        status: log.status === "Completed" ? "completed" : log.status === "Pending" ? "pending" : log.status === "Cancelled" ? "cancelled" : "in-progress",
        issueId: log.issueId?._id || log.issueId || null,
      }));

      setMaintenance(mappedMaintenance);
    } catch (error) {
      console.error("Error fetching maintenance logs:", error);
      setError("Failed to load maintenance records");
      showAxiosError(error, "Failed to load maintenance records");
      setMaintenance([]);
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedMaintenance = useMemo(() => {
    let sortableItems = [...maintenance];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sort: newest first (by createdAt descending)
      sortableItems.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.requestDate || a._id || 0);
        const dateB = new Date(b.createdAt || b.requestDate || b._id || 0);
        return dateB - dateA; // Descending order (newest first)
      });
    }
    return sortableItems;
  }, [maintenance, sortConfig]);

  const filteredAndSortedMaintenance = useMemo(() => {
    let filtered = sortedMaintenance;

    // Apply search query across all fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = sortedMaintenance.filter((record) => {
        const itemName = (record.itemName || "").toLowerCase();
        const labName = (record.labName || "").toLowerCase();
        const maintenanceType = (record.maintenanceType || "").toLowerCase();
        const status = (record.status || "").toLowerCase();
        const technician = (record.technician || "").toLowerCase();
        const description = (record.description || "").toLowerCase();
        const notes = (record.notes || "").toLowerCase();

        return (
          itemName.includes(query) ||
          labName.includes(query) ||
          maintenanceType.includes(query) ||
          status.includes(query) ||
          technician.includes(query) ||
          description.includes(query) ||
          notes.includes(query)
        );
      });
    }

    return filtered;
  }, [sortedMaintenance, searchQuery]);

  const pendingMaintenance = filteredAndSortedMaintenance.filter(
    (r) => r.status === "pending"
  ).length;
  const inProgressMaintenance = filteredAndSortedMaintenance.filter(
    (r) => r.status === "in-progress"
  ).length;
  const completedMaintenance = filteredAndSortedMaintenance.filter(
    (r) => r.status === "completed"
  ).length;
  const totalMaintenance = filteredAndSortedMaintenance.length;

  const handleView = (id) => {
    const record = maintenance.find((r) => r._id === id);
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEdit = (id) => {
    const record = maintenance.find((r) => r._id === id);
    setEditFormData({
      _id: record._id,
      itemName: record.itemName || "",
      labName: record.labName || "",
      maintenanceType: record.maintenanceType || "",
      requestDate: record.requestDate || "",
      completionDate: record.completionDate || "",
      status: record.status || "pending",
      technician: record.technician || "",
      cost: record.cost || "",
      description: record.description || "",
      notes: record.notes || "",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this maintenance record?")) {
      try {
        await maintenanceLogApi.delete(id);
        setMaintenance(maintenance.filter((record) => record._id !== id));
        showSuccessMessage("Maintenance record deleted successfully");
      } catch (error) {
        console.error("Error deleting maintenance record:", error);
        showAxiosError(error, "Failed to delete maintenance record");
      }
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      // Find lab and equipment by name to get IDs
      const selectedLab = labs.find((lab) => lab.labName === formData.labName);
      const selectedEquipment = equipment.find((eq) => eq.equipmentName === formData.itemName);
      
      const backendData = {
        labId: selectedLab?._id || formData.labId,
        equipmentId: selectedEquipment?._id || formData.equipmentId,
        maintenanceType: formData.maintenanceType || "Routine",
        maintenanceDate: formData.requestDate ? new Date(formData.requestDate) : new Date(),
        performedBy: formData.technician || formData.performedBy || "-",
        performedById: formData.performedById || "",
        description: formData.description || "-",
        actionsTaken: formData.notes || formData.actionsTaken || "",
        cost: parseFloat(formData.cost) || 0,
        status: formData.status === "completed" ? "Completed" : formData.status === "pending" ? "Pending" : formData.status === "cancelled" ? "Cancelled" : "Pending",
        notes: formData.notes || "",
      };

      const response = await maintenanceLogApi.update(editFormData._id, backendData);
      const updatedLog = Array.isArray(response)
        ? response[0]
        : response.data || response;
      
      // Map backend response to frontend format
      const mappedLog = {
        ...updatedLog,
        itemName: updatedLog.equipmentId?.equipmentName || updatedLog.itemName || "-",
        labName: updatedLog.labId?.labName || updatedLog.labName || "-",
        requestDate: updatedLog.maintenanceDate || updatedLog.requestDate,
        completionDate: updatedLog.status === "Completed" ? updatedLog.maintenanceDate : null,
        technician: updatedLog.performedBy || updatedLog.technician || "-",
        cost: updatedLog.cost || 0,
        description: updatedLog.description || "-",
        notes: updatedLog.notes || updatedLog.actionsTaken || "-",
        maintenanceType: updatedLog.maintenanceType || "Routine",
        status: updatedLog.status === "Completed" ? "completed" : updatedLog.status === "Pending" ? "pending" : updatedLog.status === "Cancelled" ? "cancelled" : "in-progress",
      };

      setMaintenance(
        maintenance.map((record) =>
          record._id === editFormData._id ? mappedLog : record
        )
      );
      setShowEditModal(false);
      setEditFormData(null);
      showSuccessMessage("Maintenance record updated successfully");
    } catch (error) {
      console.error("Error updating maintenance record:", error);
      showAxiosError(error, "Failed to update maintenance record");
    }
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = async (formData) => {
    try {
      // Find lab and equipment by name to get IDs
      const selectedLab = labs.find((lab) => lab.labName === formData.labName);
      const selectedEquipment = equipment.find((eq) => eq.equipmentName === formData.itemName);
      
      const backendData = {
        labId: selectedLab?._id || formData.labId,
        equipmentId: selectedEquipment?._id || formData.equipmentId,
        issueId: formData.issueId || undefined,
        maintenanceType: formData.maintenanceType || "Routine",
        maintenanceDate: formData.requestDate ? new Date(formData.requestDate) : new Date(),
        performedBy: formData.technician || formData.performedBy || "-",
        performedById: formData.performedById || "",
        description: formData.description || "-",
        actionsTaken: formData.notes || formData.actionsTaken || "",
        cost: parseFloat(formData.cost) || 0,
        status: formData.status === "completed" ? "Completed" : formData.status === "pending" ? "Pending" : formData.status === "cancelled" ? "Cancelled" : "Pending",
        notes: formData.notes || "",
      };

      const response = await maintenanceLogApi.create(backendData);
      const newLog = Array.isArray(response)
        ? response[0]
        : response.data || response;
      
      // Map backend response to frontend format
      const mappedLog = {
        ...newLog,
        itemName: newLog.equipmentId?.equipmentName || newLog.itemName || "-",
        labName: newLog.labId?.labName || newLog.labName || "-",
        requestDate: newLog.maintenanceDate || newLog.requestDate,
        completionDate: newLog.status === "Completed" ? newLog.maintenanceDate : null,
        technician: newLog.performedBy || newLog.technician || "-",
        cost: newLog.cost || 0,
        description: newLog.description || "-",
        notes: newLog.notes || newLog.actionsTaken || "-",
        maintenanceType: newLog.maintenanceType || "Routine",
        status: newLog.status === "Completed" ? "completed" : newLog.status === "Pending" ? "pending" : newLog.status === "Cancelled" ? "cancelled" : "in-progress",
      };

      setMaintenance([mappedLog, ...maintenance]);
      setShowAddModal(false);
      showSuccessMessage("Maintenance record created successfully");
    } catch (error) {
      console.error("Error creating maintenance record:", error);
      showAxiosError(error, "Failed to create maintenance record");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading maintenance records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Lab Maintenance Management
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          title="Add Maintenance Record"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-[#525b88]">
                {totalMaintenance}
              </p>
            </div>
            <Wrench className="w-8 h-8 text-[#525b88]" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingMaintenance}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {inProgressMaintenance}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {completedMaintenance}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Table */}
      <MaintenanceTable
        maintenance={filteredAndSortedMaintenance}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResolveIssue={handleResolveIssue}
        onRejectIssue={handleRejectIssue}
        sortConfig={sortConfig}
        requestSort={requestSort}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* View Modal */}
      {showViewModal &&
        selectedRecord &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">Maintenance Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Item Name:
                      </label>
                      <p className="text-sm text-gray-900">{selectedRecord.itemName || "-"}</p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Lab Name:
                      </label>
                      <p className="text-sm text-gray-900">{selectedRecord.labName || "-"}</p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Maintenance Type:
                      </label>
                      <p className="text-sm text-gray-900 capitalize">
                        {selectedRecord.maintenanceType || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Status:
                      </label>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedRecord.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : selectedRecord.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : selectedRecord.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedRecord.status || "pending"}
                      </span>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Request Date:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedRecord.requestDate
                          ? new Date(selectedRecord.requestDate).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Completion Date:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedRecord.completionDate
                          ? new Date(selectedRecord.completionDate).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Technician:
                      </label>
                      <p className="text-sm text-gray-900">{selectedRecord.technician || "-"}</p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Cost:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedRecord.cost ? `₹${selectedRecord.cost.toLocaleString()}` : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="mb-5 flex items-start gap-3 col-span-2">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Description:
                    </label>
                    <p className="text-sm text-gray-900">{selectedRecord.description || "-"}</p>
                  </div>
                  <div className="mb-5 flex items-start gap-3 col-span-2">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Notes:
                    </label>
                    <p className="text-sm text-gray-900">{selectedRecord.notes || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Edit Modal */}
      {showEditModal &&
        editFormData &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">Edit Maintenance Record</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditFormData(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEditSubmit(editFormData);
                  }}
                  className="p-6 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name:
                      </label>
                      <input
                        type="text"
                        value={editFormData.itemName}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, itemName: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Name:
                      </label>
                      <input
                        type="text"
                        value={editFormData.labName}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, labName: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maintenance Type:
                      </label>
                      <select
                        value={editFormData.maintenanceType}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, maintenanceType: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="repair">Repair</option>
                        <option value="calibration">Calibration</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="inspection">Inspection</option>
                        <option value="preventive">Preventive</option>
                      </select>
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status:
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, status: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="mb-5 col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description:
                      </label>
                      <textarea
                        value={editFormData.description}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, description: e.target.value })
                        }
                        rows="3"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditFormData(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166] transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Add Modal */}
      {showAddModal && (
        <AddFormModal
          formType="labMaintenance"
          initialData={null}
          onSubmit={handleAddSubmit}
          onClose={() => setShowAddModal(false)}
          labs={labs}
          maintenanceIssues={maintenanceIssues}
        />
      )}
    </div>
  );
};

export default LabMaintenance;

