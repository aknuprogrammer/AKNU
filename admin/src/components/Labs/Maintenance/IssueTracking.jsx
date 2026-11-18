import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Eye,
  Search,
  CheckCircle,
} from "lucide-react";
import { PencilIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { maintenanceIssueApi, labsApi, equipmentApi } from "../../../services/apiService";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../../config/Toast";

const IssueTracking = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  // Add these state variables after the existing state declarations
const [showResolveModal, setShowResolveModal] = useState(false);
const [resolveFormData, setResolveFormData] = useState({
  technicianName: "",
  technicianId: "",
  phoneNumber: "",
  cost: "",
});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    labName: "",
    equipmentName: "",
    reportedBy: "",
    reportedById: "",
    reportedByType: "student",
    priority: "medium",
    status: "open",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const [labs, setLabs] = useState([]);
  const [equipment, setEquipment] = useState([]);

  // Fetch issues, labs, and equipment from API
  useEffect(() => {
    fetchIssues();
    fetchLabs();
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const { equipmentApi } = await import("../../../services/apiService");
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

  const fetchLabs = async () => {
    try {
      const response = await labsApi.getAll({});
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
      showAxiosError(error, "Failed to load labs");
    }
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await maintenanceIssueApi.getAll({});

      let issuesData = [];
      if (Array.isArray(response)) {
        issuesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        issuesData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        issuesData = response.data;
      }

      // Map backend data to frontend format
      const mappedIssues = issuesData.map((issue) => ({
        ...issue,
        title: issue.issueTitle || issue.title || "-",
        labName: issue.labId?.labName || issue.labName || "-",
        equipmentName: issue.equipmentId?.equipmentName || issue.equipmentName || "-",
        reportedDate: issue.createdAt || issue.reportedDate,
        resolvedDate: issue.resolvedAt || issue.resolvedDate,
        status: issue.status === "open" ? "open" : issue.status === "in_progress" ? "in_progress" : issue.status === "resolved" ? "resolved" : issue.status === "closed" ? "closed" : "open",
      }));

      setIssues(mappedIssues);
    } catch (error) {
      console.error("Error fetching issues:", error);
      showAxiosError(error, "Failed to load issues");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = useMemo(() => {
    let filtered = issues;

    // Apply search query across all fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = issues.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const labName = (item.labName || "").toLowerCase();
        const equipmentName = (item.equipmentName || "").toLowerCase();
        const reportedBy = (item.reportedBy || "").toLowerCase();
        const status = (item.status || "").toLowerCase();
        const priority = (item.priority || "").toLowerCase();
        const reportedById = (item.reportedById || "").toLowerCase();

        return (
          title.includes(query) ||
          description.includes(query) ||
          labName.includes(query) ||
          equipmentName.includes(query) ||
          reportedBy.includes(query) ||
          status.includes(query) ||
          priority.includes(query) ||
          reportedById.includes(query)
        );
      });
    }

    return filtered;
  }, [issues, searchQuery]);


  const handleAdd = () => {
    setFormData({
      title: "",
      description: "",
      labName: "",
      equipmentName: "",
      reportedBy: "",
      reportedById: "",
      reportedByType: "student",
      priority: "medium",
      status: "open",
    });
    setShowAddModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

// const handleResolve = async (id) => {
//   // Find the issue
//   const issue = issues.find((item) => item._id === id);
//   if (!issue) {
//     showErrorMessage("Issue not found");
//     return;
//   }
  
//   // Set the selected item and show the resolve modal
//   setSelectedItem(issue);
//   setResolveFormData({
//     technicianName: "",
//     technicianId: "",
//     phoneNumber: "",
//     cost: "",
//   });
//   setShowResolveModal(true);
// };

const handleResolve = async (id) => {
  // Find the issue
  const issue = issues.find((item) => item._id === id);
  if (!issue) {
    showErrorMessage("Issue not found");
    return;
  }
  
  // Set the selected item and show the resolve modal
  setSelectedItem(issue);
  setResolveFormData({
    technicianName: "",
    technicianId: "",
    phoneNumber: "",
    cost: "",
  });
  setShowResolveModal(true);
};

const handleResolveSubmit = async (e) => {
  e.preventDefault();
  
  try {
    if (!selectedItem) {
      showErrorMessage("No issue selected");
      return;
    }

    // Prepare the update data with technician details matching backend schema
    const updateData = {
      status: "resolved",
      resolvedAt: new Date().toISOString(),
      technicianName: resolveFormData.technicianName,
      technicianId: resolveFormData.technicianId || null,
      technicianContact: resolveFormData.phoneNumber,
      actualCost: parseFloat(resolveFormData.cost),
      resolutionDate: new Date().toISOString(),
    };

    // Call the API to update the issue with resolution details
    const response = await maintenanceIssueApi.update(selectedItem._id, updateData);
    const updatedIssue = Array.isArray(response) ? response[0] : response.data || response;

    // Update the issue in the list with resolution details
    const updatedIssueWithDetails = {
      ...selectedItem,
      ...updatedIssue,
      title: updatedIssue.issueTitle || selectedItem.title,
      labName: updatedIssue.labId?.labName || selectedItem.labName,
      equipmentName: updatedIssue.equipmentId?.equipmentName || selectedItem.equipmentName,
    };

    setIssues(
      issues.map((item) =>
        item._id === selectedItem._id ? updatedIssueWithDetails : item
      )
    );

    // Update selectedItem if it's in the view modal
    if (showViewModal) {
      setSelectedItem(updatedIssueWithDetails);
    }

    // Close the resolve modal
    setShowResolveModal(false);
    setResolveFormData({
      technicianName: "",
      technicianId: "",
      phoneNumber: "",
      cost: "",
    });
    
    showSuccessMessage("Issue marked as resolved with technician details");
    
  } catch (error) {
    console.error("Error resolving issue:", error);
    showAxiosError(error, "Failed to mark issue as resolved");
  }
};


  const handleAssign = (id, technician) => {
    setIssues(
      issues.map((item) =>
        item._id === id
          ? {
              ...item,
              status: "in_progress",
              assignedTo: technician,
            }
          : item
      )
    );
    showSuccessMessage("Issue assigned successfully");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find lab and equipment by name to get IDs
      const selectedLab = labs.find((lab) => lab.labName === formData.labName);
      const selectedEquipment = equipment.find(
        (eq) => eq.equipmentName === formData.equipmentName
      );

      if (!selectedLab) {
        showErrorMessage("Please select a valid lab");
        return;
      }

      // Convert priority to match backend enum (capitalized)
      const priorityMap = {
        low: "Low",
        medium: "Medium",
        high: "High",
        critical: "Critical",
      };
      const priorityValue = priorityMap[formData.priority.toLowerCase()] || "Medium";

      const backendData = {
        issueTitle: formData.title,
        issueDescription: formData.description,
        labId: selectedLab._id,
        equipmentId: selectedEquipment?._id || undefined,
        reportedBy: formData.reportedBy,
        reportedById: formData.reportedById || undefined,
        priority: priorityValue,
        status: formData.status || "open",
      };

      const response = await maintenanceIssueApi.create(backendData);
      const newIssue = Array.isArray(response)
        ? response[0]
        : response.data || response;

      // Map backend response to frontend format
      const mappedIssue = {
        ...newIssue,
        title: newIssue.issueTitle || newIssue.title || "-",
        labName: newIssue.labId?.labName || formData.labName || "-",
        equipmentName: newIssue.equipmentId?.equipmentName || formData.equipmentName || "-",
        reportedDate: newIssue.createdAt || new Date().toISOString(),
        resolvedDate: newIssue.resolvedAt || null,
      };

      setIssues([mappedIssue, ...issues]);
      setShowAddModal(false);
      showSuccessMessage("Issue reported successfully");
      setFormData({
        title: "",
        description: "",
        labName: "",
        equipmentName: "",
        reportedBy: "",
        reportedById: "",
        reportedByType: "student",
        priority: "medium",
        status: "open",
      });
    } catch (error) {
      console.error("Error creating issue:", error);
      showAxiosError(error, "Failed to report issue");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading issues...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Issue Tracking
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Report Issue
          </button>
        </div>

        {/* Search Input - Above Table */}
        <div className="mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues by title, description, lab, equipment, reporter, status, or priority..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        {filteredIssues.length === 0 ? (
          <div className="flex justify-center items-center py-12 bg-white border border-gray-300 rounded-md">
            <div className="text-gray-500">
              {searchQuery
                ? "No issues found matching your search"
                : "No issues found"}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Lab</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Equipment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Reported By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase whitespace-nowrap">Reported Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No issues found
                  </td>
                </tr>
              ) : (
                filteredIssues.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.labName}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{item.equipmentName}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div>{item.reportedBy}</div>
                      <div className="text-xs text-gray-500">{item.reportedById}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : item.priority === "medium"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status === "open"
                            ? "bg-red-100 text-red-800"
                            : item.status === "in_progress"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.reportedDate).toLocaleDateString()}
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
                        {item.status !== "resolved" && (
                          <button
                            onClick={() => handleResolve(item._id)}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                            title="Mark as Resolved"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
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

      {/* Add Modal */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-3xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">Report Issue</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title: *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Name: *
                      </label>
                      <select
                        name="labName"
                        value={formData.labName}
                        onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Lab</option>
                        {labs.map((lab) => (
                          <option key={lab._id} value={lab.labName}>
                            {lab.labName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment Name: *
                      </label>
                      <select
                        name="equipmentName"
                        value={formData.equipmentName}
                        onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Equipment</option>
                        {equipment.map((eq) => (
                          <option key={eq._id} value={eq.equipmentName}>
                            {eq.equipmentName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority: *
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reported By: *
                      </label>
                      <input
                        type="text"
                        name="reportedBy"
                        value={formData.reportedBy}
                        onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reported By ID: *
                      </label>
                      <input
                        type="text"
                        name="reportedById"
                        value={formData.reportedById}
                        onChange={(e) => setFormData({ ...formData, reportedById: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reported By Type: *
                      </label>
                      <select
                        name="reportedByType"
                        value={formData.reportedByType}
                        onChange={(e) => setFormData({ ...formData, reportedByType: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description: *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows="4"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
                    >
                      Report Issue
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* View Modal */}
      {showViewModal && selectedItem && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Issue Details</h3>
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
                    Title:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.title}
                  </p>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Lab:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.labName}
                  </p>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Equipment:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.equipmentName}
                  </p>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Priority:
                  </label>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedItem.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : selectedItem.priority === "medium"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedItem.priority}
                  </span>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Status:
                  </label>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedItem.status === "open"
                        ? "bg-red-100 text-red-800"
                        : selectedItem.status === "in_progress"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedItem.status}
                  </span>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Reported Date:
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedItem.reportedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Reported By:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.reportedBy}
                  </p>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Reported By ID:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.reportedById}
                  </p>
                </div>
                <div className="mb-5 flex items-center">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Reported By Type:
                  </label>
                  <p className="text-sm text-gray-900 capitalize">
                    {selectedItem.reportedByType}
                  </p>
                </div>
                {selectedItem.assignedTo && (
                  <div className="mb-5 flex items-center">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Assigned To:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedItem.assignedTo}
                    </p>
                  </div>
                )}
                {selectedItem.resolvedDate && (
                  <div className="mb-5 flex items-center">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Resolved Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedItem.resolvedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {selectedItem.technicianName && (
                  <>
                    <div className="mb-5 flex items-center col-span-2 border-t pt-4 mt-4">
                      <label className="text-sm font-semibold text-gray-700 min-w-[140px]">
                        Resolution Details:
                      </label>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Technician Name:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.technicianName}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Technician ID:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.technicianId || "N/A"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Technician Contact:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.technicianContact || "N/A"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Actual Cost:
                      </label>
                      <p className="text-sm text-gray-900 font-semibold text-green-600">
                        ₹{selectedItem.actualCost || 0}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Resolution Date:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.resolutionDate ? new Date(selectedItem.resolutionDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </>
                )}
                <div className="mb-5 flex items-center col-span-2 border-t pt-4">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                    Description:
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedItem.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3 flex-shrink-0">
              {selectedItem.status !== "resolved" && (
                <button
                  onClick={async () => {
                    await handleResolve(selectedItem._id);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Mark as Resolved
                </button>
              )}
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
      {/* Resolve Modal */}
{showResolveModal && selectedItem && createPortal(
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
    <div className="flex flex-col w-full max-w-md border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
      <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-green-600 to-green-500">
        <h3 className="text-lg font-semibold text-white">
          Mark as Resolved
        </h3>
        <button
          onClick={() => {
            setShowResolveModal(false);
          }}
          className="text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technician Name: *
            </label>
            <input
              type="text"
              name="technicianName"
              value={resolveFormData.technicianName}
              onChange={(e) => setResolveFormData({
                ...resolveFormData,
                technicianName: e.target.value
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
              placeholder="Enter technician name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technician ID (Optional):
            </label>
            <input
              type="text"
              name="technicianId"
              value={resolveFormData.technicianId}
              onChange={(e) => setResolveFormData({
                ...resolveFormData,
                technicianId: e.target.value
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              placeholder="Enter technician ID"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number: *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={resolveFormData.phoneNumber}
              onChange={(e) => setResolveFormData({
                ...resolveFormData,
                phoneNumber: e.target.value
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost: *
            </label>
            <input
              type="number"
              name="cost"
              value={resolveFormData.cost}
              onChange={(e) => setResolveFormData({
                ...resolveFormData,
                cost: e.target.value
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
              placeholder="Enter cost"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowResolveModal(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Mark as Resolved
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>,
  document.body
)}
    </>
  );
};

export default IssueTracking;

