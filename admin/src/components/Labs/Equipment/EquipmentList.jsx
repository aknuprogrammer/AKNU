import React, { useEffect, useState, useMemo } from "react";
import { Plus, Eye, Search, Calendar, Building2 } from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import {
  equipmentApi,
  equipmentCategoriesApi,
  labsApi,
} from "../../../services/apiService";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../../config/Toast";

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    equipmentName: "",
    category: "",
    serialNumber: "",
    assetId: "",
    purchaseDate: "",
    vendor: "",
    warranty: "",
    condition: "working",
    assignedLab: "",
    price: "",
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState([]);
  const [labs, setLabs] = useState([]);

  // Fetch equipment, categories, and labs from API
  useEffect(() => {
    fetchEquipment();
    fetchCategories();
    fetchLabs();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await equipmentCategoriesApi.getAll({
        status: "Active",
      });
      let categoriesData = [];
      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        categoriesData = response.data;
      }
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchLabs = async () => {
    try {
      // Lab model uses lowercase status: "active", "maintenance", "inactive"
      // Fetching from labs collection where the key name is "labName"
      const response = await labsApi.getAll({ status: "active" });
      let labsData = [];
      if (Array.isArray(response)) {
        labsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        labsData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        labsData = response.data;
      }

      // Ensure all labs have labName property from the labs collection
      const validLabs = labsData.filter((lab) => lab && lab.labName);
      setLabs(validLabs);
    } catch (error) {
      console.error("Error fetching labs from labs collection:", error);
      showAxiosError(error, "Failed to load labs");
      setLabs([]);
    }
  };

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentApi.getAll({});

      let equipmentData = [];
      if (Array.isArray(response)) {
        equipmentData = response;
      } else if (response.data && Array.isArray(response.data)) {
        equipmentData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        equipmentData = response.data;
      }

      // Map backend data to frontend format (handle populated category and assignedLab)
      // Backend already sorts by createdAt descending (newest first)
      const mappedEquipment = equipmentData.map((item) => ({
        ...item,
        category: item.category?.name || item.category || "-",
        assignedLab: item.assignedLab?.labName || item.assignedLab || "-",
      }));

      setEquipment(mappedEquipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      showAxiosError(error, "Failed to load equipment");
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = useMemo(() => {
    let filtered = equipment;

    // Apply search query across all fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = equipment.filter((item) => {
        const equipmentName = (item.equipmentName || "").toLowerCase();
        const serialNumber = (item.serialNumber || "").toLowerCase();
        const assetId = (item.assetId || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const assignedLab = (item.assignedLab || "").toLowerCase();
        const condition = (item.condition || "").toLowerCase();
        const vendor = (item.vendor || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const warranty = (item.warranty || "").toLowerCase();
        const price = String(item.price || "").toLowerCase();

        return (
          equipmentName.includes(query) ||
          serialNumber.includes(query) ||
          assetId.includes(query) ||
          category.includes(query) ||
          assignedLab.includes(query) ||
          condition.includes(query) ||
          vendor.includes(query) ||
          description.includes(query) ||
          warranty.includes(query) ||
          price.includes(query)
        );
      });
    }

    return filtered;
  }, [equipment, searchQuery]);

  const handleAdd = () => {
    setFormData({
      equipmentName: "",
      category: "",
      serialNumber: "",
      assetId: "",
      purchaseDate: "",
      vendor: "",
      warranty: "",
      condition: "working",
      assignedLab: "",
      price: "",
      description: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    // Handle assignedLab: if it's "-" or empty, set to empty string, otherwise use the lab name
    const assignedLabValue =
      item.assignedLab && item.assignedLab !== "-" ? item.assignedLab : "";

    setFormData({
      equipmentName: item.equipmentName || "",
      category: item.category || "",
      serialNumber: item.serialNumber || "",
      assetId: item.assetId || "",
      purchaseDate: item.purchaseDate || "",
      vendor: item.vendor || "",
      warranty: item.warranty || "",
      condition: item.condition || "working",
      assignedLab: assignedLabValue,
      price: item.price || "",
      description: item.description || "",
    });
    setShowEditModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        await equipmentApi.delete(id);
        setEquipment(equipment.filter((item) => item._id !== id));
        showSuccessMessage("Equipment deleted successfully");
      } catch (error) {
        console.error("Error deleting equipment:", error);
        showAxiosError(error, "Failed to delete equipment");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find category and lab by name to get IDs
      // Lab is from labs collection with key name "labName"
      const selectedCategory = categories.find(
        (cat) => cat.name === formData.category
      );
      const selectedLab = labs.find(
        (lab) => lab && lab.labName === formData.assignedLab
      );

      const backendData = {
        ...formData,
        category: selectedCategory?._id || formData.category,
        assignedLab: selectedLab?._id || formData.assignedLab,
        price: parseFloat(formData.price) || 0,
        purchaseDate: formData.purchaseDate
          ? new Date(formData.purchaseDate)
          : undefined,
      };

      if (showAddModal) {
        const response = await equipmentApi.create(backendData);
        const newEquipment = Array.isArray(response)
          ? response[0]
          : response.data || response;

        // Map backend response to frontend format
        const mappedEquipment = {
          ...newEquipment,
          category: newEquipment.category?.name || newEquipment.category || "-",
          assignedLab:
            newEquipment.assignedLab?.labName ||
            newEquipment.assignedLab ||
            "-",
        };

        setEquipment([mappedEquipment, ...equipment]);
        setShowAddModal(false);
        showSuccessMessage("Equipment added successfully");
      } else if (showEditModal) {
        const response = await equipmentApi.update(
          selectedItem._id,
          backendData
        );
        const updatedEquipment = Array.isArray(response)
          ? response[0]
          : response.data || response;

        // Map backend response to frontend format
        const mappedEquipment = {
          ...updatedEquipment,
          category:
            updatedEquipment.category?.name || updatedEquipment.category || "-",
          assignedLab:
            updatedEquipment.assignedLab?.labName ||
            updatedEquipment.assignedLab ||
            "-",
        };

        setEquipment(
          equipment.map((item) =>
            item._id === selectedItem._id ? mappedEquipment : item
          )
        );
        setShowEditModal(false);
        setSelectedItem(null);
        showSuccessMessage("Equipment updated successfully");
      }
    } catch (error) {
      console.error("Error saving equipment:", error);
      showAxiosError(error, "Failed to save equipment");
    }

    setFormData({
      equipmentName: "",
      category: "",
      serialNumber: "",
      assetId: "",
      purchaseDate: "",
      vendor: "",
      warranty: "",
      condition: "working",
      assignedLab: "",
      price: "",
      description: "",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading equipment...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Equipment List
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </button>
        </div>

        {/* Search Input - Above Table */}
        <div className="mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment by name, serial number, asset ID, category, lab, condition, vendor, warranty, price, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        {filteredEquipment.length === 0 ? (
          <div className="flex justify-center items-center py-12 bg-white border border-gray-300 rounded-md">
            <div className="text-gray-500">
              {searchQuery
                ? "No equipment found matching your search"
                : "No equipment found"}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-[#525b88] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Equipment Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Serial Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Asset ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Assigned Lab
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Condition
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEquipment.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No equipment found
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {item.equipmentName}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.serialNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.assetId}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.assignedLab}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.condition === "working"
                              ? "bg-green-100 text-green-800"
                              : item.condition === "faulty"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.condition}
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
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-[#525b88] hover:text-[#3a4166]"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
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

      {/* Add Modal */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-3xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  Add Equipment
                </h3>
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
                        Equipment Name: *
                      </label>
                      <input
                        type="text"
                        name="equipmentName"
                        value={formData.equipmentName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            equipmentName: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category: *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Serial Number: *
                      </label>
                      <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            serialNumber: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asset ID: *
                      </label>
                      <input
                        type="text"
                        name="assetId"
                        value={formData.assetId}
                        onChange={(e) =>
                          setFormData({ ...formData, assetId: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Date: *
                      </label>
                      <input
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchaseDate: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor: *
                      </label>
                      <input
                        type="text"
                        name="vendor"
                        value={formData.vendor}
                        onChange={(e) =>
                          setFormData({ ...formData, vendor: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warranty Expiry:
                      </label>
                      <input
                        type="date"
                        name="warranty"
                        value={formData.warranty}
                        onChange={(e) =>
                          setFormData({ ...formData, warranty: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition: *
                      </label>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condition: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="working">Working</option>
                        <option value="faulty">Faulty</option>
                        <option value="damaged">Damaged</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned Lab: *
                      </label>
                      <select
                        name="assignedLab"
                        value={formData.assignedLab}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assignedLab: e.target.value,
                          })
                        }
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
                        Price (₹):
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description:
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows="3"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
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
                      Add Equipment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Edit Modal */}
      {showEditModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-3xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  Edit Equipment
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                  }}
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
                        Equipment Name: *
                      </label>
                      <input
                        type="text"
                        name="equipmentName"
                        value={formData.equipmentName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            equipmentName: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category: *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Serial Number: *
                      </label>
                      <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            serialNumber: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asset ID: *
                      </label>
                      <input
                        type="text"
                        name="assetId"
                        value={formData.assetId}
                        onChange={(e) =>
                          setFormData({ ...formData, assetId: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Date: *
                      </label>
                      <input
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchaseDate: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor: *
                      </label>
                      <input
                        type="text"
                        name="vendor"
                        value={formData.vendor}
                        onChange={(e) =>
                          setFormData({ ...formData, vendor: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Warranty Expiry:
                      </label>
                      <input
                        type="date"
                        name="warranty"
                        value={formData.warranty}
                        onChange={(e) =>
                          setFormData({ ...formData, warranty: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition: *
                      </label>
                      <select
                        name="condition"
                        value={formData.condition}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condition: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="working">Working</option>
                        <option value="faulty">Faulty</option>
                        <option value="damaged">Damaged</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned Lab: *
                      </label>
                      <select
                        name="assignedLab"
                        value={formData.assignedLab}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assignedLab: e.target.value,
                          })
                        }
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
                        Price (₹):
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description:
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
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
                        setSelectedItem(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
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

      {/* View Modal */}
      {showViewModal &&
        selectedItem &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  Equipment Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Equipment Name:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.equipmentName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Category:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.category}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Serial Number:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.serialNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Asset ID:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.assetId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Purchase Date:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedItem.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Vendor:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.vendor}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Warranty Expiry:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.warranty
                        ? new Date(selectedItem.warranty).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Condition:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedItem.condition === "working"
                            ? "bg-green-100 text-green-800"
                            : selectedItem.condition === "faulty"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedItem.condition}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Assigned Lab:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.assignedLab}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Price:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      ₹{selectedItem.price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Description:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.description || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 flex justify-end gap-3 p-5 border-t border-gray-200">
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

export default EquipmentList;
