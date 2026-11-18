import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import AddFormModal from "./AddFormModal";
import { labsApi, labTypesApi } from "../../services/apiService";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../config/Toast";
import { Search, Eye, Plus } from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const LabsTable = ({
  labs,
  onView,
  onEdit,
  onDelete,
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
            placeholder="Search labs by name, building, location, capacity, status, in charge, contact, or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] placeholder-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      {labs.length === 0 ? (
        <div className="flex justify-center items-center py-12 bg-white border border-gray-300 rounded-md">
          <div className="text-gray-500">
            {searchQuery
              ? "No labs found matching your search"
              : "No labs found"}
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
                  onClick={() => requestSort("building")}
                >
                  <div className="flex items-center">
                    Building
                    {sortConfig.key === "building" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("location")}
                >
                  <div className="flex items-center">
                    Location
                    {sortConfig.key === "location" && (
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
                  Capacity
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
              {labs.map((lab) => (
                <tr key={lab._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {lab.labName || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lab.building || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lab.location || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lab.capacity || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        lab.status === "active"
                          ? "bg-green-100 text-green-800"
                          : lab.status === "maintenance"
                          ? "bg-yellow-100 text-yellow-800"
                          : lab.status === "inactive"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {lab.status || "active"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(lab._id)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onEdit(lab._id)}
                        className="text-[#525b88] hover:text-[#3a4166]"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(lab._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [labTypes, setLabTypes] = useState([]);

  // Fetch labs and lab types from API
  useEffect(() => {
    fetchLabs();
    fetchLabTypes();
  }, []);

  const fetchLabTypes = async () => {
    try {
      const response = await labTypesApi.getAll({ status: "Active" });
      let labTypesData = [];
      if (Array.isArray(response)) {
        labTypesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        labTypesData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        labTypesData = response.data;
      }
      setLabTypes(labTypesData);
    } catch (error) {
      console.error("Error fetching lab types:", error);
    }
  };

  const fetchLabs = async () => {
    try {
      setLoading(true);
      setError(null);
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
      setError("Failed to load labs");
      showAxiosError(error, "Failed to load labs");
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  // Static data removed - now using fetchLabs() API call

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedLabs = useMemo(() => {
    let sortableItems = [...labs];
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
        const dateA = new Date(a.createdAt || a._id || 0);
        const dateB = new Date(b.createdAt || b._id || 0);
        return dateB - dateA; // Descending order (newest first)
      });
    }
    return sortableItems;
  }, [labs, sortConfig]);

  const filteredAndSortedLabs = useMemo(() => {
    let filtered = sortedLabs;

    // Apply search query across all fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = sortedLabs.filter((lab) => {
        const labName = (lab.labName || "").toLowerCase();
        const building = (lab.building || "").toLowerCase();
        const location = (lab.location || "").toLowerCase();
        const capacity = String(lab.capacity || "").toLowerCase();
        const status = (lab.status || "").toLowerCase();
        const inCharge = (lab.inCharge || "").toLowerCase();
        const contact = (lab.contact || "").toLowerCase();
        const description = (lab.description || "").toLowerCase();

        return (
          labName.includes(query) ||
          building.includes(query) ||
          location.includes(query) ||
          capacity.includes(query) ||
          status.includes(query) ||
          inCharge.includes(query) ||
          contact.includes(query) ||
          description.includes(query)
        );
      });
    }

    return filtered;
  }, [sortedLabs, searchQuery]);

  const handleView = (id) => {
    const lab = labs.find((l) => l._id === id);
    setSelectedLab(lab);
    setShowViewModal(true);
  };

  const handleEdit = (id) => {
    const lab = labs.find((l) => l._id === id);
    setEditFormData({
      _id: lab._id,
      labName: lab.labName || "",
      labTypeId: lab.labTypeId?._id || lab.labTypeId || "",
      building: lab.building || "",
      location: lab.location || "",
      capacity: lab.capacity || 0,
      status: lab.status || "active",
      description: lab.description || "",
      equipmentCount: lab.equipmentCount || 0,
      inCharge: lab.inCharge || "",
      contact: lab.contact || "",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lab?")) {
      try {
        await labsApi.delete(id);
        setLabs(labs.filter((lab) => lab._id !== id));
        showSuccessMessage("Lab deleted successfully");
      } catch (error) {
        console.error("Error deleting lab:", error);
        showAxiosError(error);
      }
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      const response = await labsApi.update(editFormData._id, formData);
      const updatedLab = Array.isArray(response)
        ? response[0]
        : response.data || response;
      setLabs(
        labs.map((lab) => (lab._id === editFormData._id ? updatedLab : lab))
      );
      setShowEditModal(false);
      setEditFormData(null);
      showSuccessMessage("Lab updated successfully");
    } catch (error) {
      console.error("Error updating lab:", error);
      showAxiosError(error);
    }
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = async (formData) => {
    try {
      const response = await labsApi.create(formData);
      const newLab = Array.isArray(response)
        ? response[0]
        : response.data || response;
      setLabs([newLab, ...labs]);
      setShowAddModal(false);
      showSuccessMessage("Lab added successfully");
    } catch (error) {
      console.error("Error creating lab:", error);
      showAxiosError(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading labs...</div>
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
          Labs Management
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          title="Add Lab"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lab
        </button>
      </div>

      {/* Table */}
      <LabsTable
        labs={filteredAndSortedLabs}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortConfig={sortConfig}
        requestSort={requestSort}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* View Modal */}
      {showViewModal &&
        selectedLab &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  Lab Details
                </h3>
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
                        Lab Name:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLab.labName || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Building:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLab.building || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Location:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLab.location || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Capacity:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLab.capacity || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Status:
                      </label>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedLab.status === "active"
                            ? "bg-green-100 text-green-800"
                            : selectedLab.status === "maintenance"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedLab.status || "active"}
                      </span>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Equipment Count:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLab.equipmentCount || 0}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        In Charge:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLab.inCharge || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Contact:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLab.contact || "-"}
                      </p>
                    </div>
                    <div className="mb-5 col-span-2 flex items-start gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Description:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLab.description || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Equipment List Section */}
                  {selectedLab.equipment &&
                    selectedLab.equipment.length > 0 && (
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Equipment Details ({selectedLab.equipment.length}{" "}
                          items)
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {selectedLab.equipment.map((eq, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-md border ${
                                  eq.condition === "working"
                                    ? "bg-green-50 border-green-200"
                                    : eq.condition === "spoiled"
                                    ? "bg-red-50 border-red-200"
                                    : "bg-orange-50 border-orange-200"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-600">
                                    {eq.equipmentId}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      eq.condition === "working"
                                        ? "bg-green-100 text-green-800"
                                        : eq.condition === "spoiled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-orange-100 text-orange-800"
                                    }`}
                                  >
                                    {eq.condition === "working"
                                      ? "OK"
                                      : eq.condition === "spoiled"
                                      ? "Spoiled"
                                      : "Faulty"}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                  {eq.name}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                              <span className="text-gray-700">
                                Working:{" "}
                                {
                                  selectedLab.equipment.filter(
                                    (e) => e.condition === "working"
                                  ).length
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                              <span className="text-gray-700">
                                Spoiled:{" "}
                                {
                                  selectedLab.equipment.filter(
                                    (e) => e.condition === "spoiled"
                                  ).length
                                }
                              </span>
                            </div>
                            {selectedLab.equipment.filter(
                              (e) => e.condition === "faulty"
                            ).length > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                                <span className="text-gray-700">
                                  Faulty:{" "}
                                  {
                                    selectedLab.equipment.filter(
                                      (e) => e.condition === "faulty"
                                    ).length
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
                <h3 className="text-lg font-semibold text-white">Edit Lab</h3>
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
                        Lab Type: *
                      </label>
                      <select
                        value={editFormData.labTypeId || ""}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            labTypeId: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Lab Type</option>
                        {labTypes.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.name} ({type.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lab Name: *
                      </label>
                      <input
                        type="text"
                        value={editFormData.labName}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            labName: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Building: *
                      </label>
                      <input
                        type="text"
                        value={editFormData.building}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            building: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location: *
                      </label>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            location: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity: *
                      </label>
                      <input
                        type="number"
                        value={editFormData.capacity}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            capacity: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                        min="0"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status: *
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            status: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">Under Maintenance</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment Count:
                      </label>
                      <input
                        type="number"
                        value={editFormData.equipmentCount}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            equipmentCount: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        In Charge:
                      </label>
                      <input
                        type="text"
                        value={editFormData.inCharge}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            inCharge: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact:
                      </label>
                      <input
                        type="text"
                        value={editFormData.contact}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            contact: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>
                    <div className="mb-5 col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description:
                      </label>
                      <textarea
                        value={editFormData.description}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            description: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        rows="3"
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

      {/* Add Form Modal */}
      {showAddModal && (
        <AddFormModal
          formType="labs"
          initialData={null}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
          labTypes={labTypes}
        />
      )}
    </div>
  );
};

export default Labs;
