import React, { useEffect, useState, useMemo } from "react";
import { Plus, Eye, Search } from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { consumableApi, labsApi } from "../../../services/apiService";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../../config/Toast";

const Consumables = () => {
  const [consumables, setConsumables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    threshold: "",
    purchaseDate: "",
    expiryDate: "",
    assignedLab: "",
    supplier: "",
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const [labs, setLabs] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch consumables, labs, and categories from API
  useEffect(() => {
    fetchConsumables();
    fetchLabs();
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
    try {
      // Fetch unique categories from backend API
      // Categories are extracted dynamically from the consumables collection
      const response = await consumableApi.getCategories();
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
      console.error("Error fetching consumable categories:", error);
      // Don't show error to user, just log it - categories are optional
      setCategories([]);
    }
  };

  const fetchConsumables = async () => {
    try {
      setLoading(true);
      const response = await consumableApi.getAll({});

      let consumablesData = [];
      if (Array.isArray(response)) {
        consumablesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        consumablesData = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        consumablesData = response.data;
      }

      // Map backend data to frontend format (handle populated assignedLab)
      const mappedConsumables = consumablesData.map((item) => ({
        ...item,
        assignedLab: item.assignedLab?.labName || item.assignedLab || "-",
        supplier: item.vendor || item.supplier || "-",
      }));

      setConsumables(mappedConsumables);
    } catch (error) {
      console.error("Error fetching consumables:", error);
      showAxiosError(error, "Failed to load consumables");
      setConsumables([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsumables = useMemo(() => {
    let filtered = [...consumables];
    const today = new Date();

    // Apply search query across all fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = consumables.filter((item) => {
        const name = (item.name || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const assignedLab = (item.assignedLab || "").toLowerCase();
        const supplier = (item.supplier || item.vendor || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const unit = (item.unit || "").toLowerCase();
        const quantity = String(item.quantity || "").toLowerCase();
        const threshold = String(item.threshold || "").toLowerCase();

        // Check status indicators
        const isExpired =
          item.expiryDate !== "N/A" &&
          item.expiryDate &&
          new Date(item.expiryDate) < today;
        const isLowStock = item.quantity <= item.threshold;
        const isExpiringSoon =
          item.expiryDate !== "N/A" &&
          item.expiryDate &&
          (() => {
            const expiry = new Date(item.expiryDate);
            const daysUntilExpiry = Math.ceil(
              (expiry - today) / (1000 * 60 * 60 * 24)
            );
            return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
          })();

        return (
          name.includes(query) ||
          category.includes(query) ||
          assignedLab.includes(query) ||
          supplier.includes(query) ||
          description.includes(query) ||
          unit.includes(query) ||
          quantity.includes(query) ||
          threshold.includes(query) ||
          (query.includes("expired") && isExpired) ||
          (query.includes("low") && isLowStock) ||
          (query.includes("expiring") && isExpiringSoon) ||
          (query.includes("stock") && isLowStock)
        );
      });
    }

    return filtered;
  }, [consumables, searchQuery]);

  const handleAdd = () => {
    setFormData({
      name: "",
      category: "",
      quantity: "",
      unit: "",
      threshold: "",
      purchaseDate: "",
      expiryDate: "",
      assignedLab: "",
      supplier: "",
      description: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    // Handle assignedLab: if it's "-" or empty, set to empty string, otherwise use the lab name
    const assignedLabValue =
      item.assignedLab && item.assignedLab !== "-" ? item.assignedLab : "";

    // Format dates for input fields (YYYY-MM-DD format)
    const purchaseDate = item.purchaseDate
      ? new Date(item.purchaseDate).toISOString().split("T")[0]
      : "";
    const expiryDate =
      item.expiryDate && item.expiryDate !== "N/A"
        ? new Date(item.expiryDate).toISOString().split("T")[0]
        : "";

    setFormData({
      name: item.name || "",
      category: item.category || "",
      quantity: item.quantity || "",
      unit: item.unit || "",
      threshold: item.threshold || "",
      purchaseDate: purchaseDate,
      expiryDate: expiryDate,
      assignedLab: assignedLabValue,
      supplier: item.supplier || item.vendor || "",
      description: item.description || "",
    });
    setShowEditModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this consumable?")) {
      try {
        await consumableApi.delete(id);
        setConsumables(consumables.filter((item) => item._id !== id));
        showSuccessMessage("Consumable deleted successfully");
      } catch (error) {
        console.error("Error deleting consumable:", error);
        showAxiosError(error, "Failed to delete consumable");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find lab by name to get labId
      // Lab is from labs collection with key name "labName"
      const selectedLab = labs.find(
        (lab) => lab && lab.labName === formData.assignedLab
      );

      const backendData = {
        ...formData,
        assignedLab: selectedLab?._id || formData.assignedLab,
        quantity: parseFloat(formData.quantity) || 0,
        threshold: parseFloat(formData.threshold) || 10,
        unit: formData.unit || "units",
        vendor: formData.supplier || formData.vendor,
        purchaseDate: formData.purchaseDate
          ? new Date(formData.purchaseDate)
          : undefined,
        // Use calculated expiry date if shelf life is provided, otherwise use manually entered expiry date
        expiryDate:
          formData.expiryDate && formData.expiryDate !== "N/A"
            ? new Date(formData.expiryDate)
            : undefined,
        price: parseFloat(formData.price) || 0,
      };

      if (showAddModal) {
        const response = await consumableApi.create(backendData);
        const newConsumable = Array.isArray(response)
          ? response[0]
          : response.data || response;

        // Map backend response to frontend format
        const mappedConsumable = {
          ...newConsumable,
          assignedLab:
            newConsumable.assignedLab?.labName ||
            newConsumable.assignedLab ||
            "-",
          supplier: newConsumable.vendor || newConsumable.supplier || "-",
        };

        setConsumables([...consumables, mappedConsumable]);
        setShowAddModal(false);
        showSuccessMessage("Consumable added successfully");
        // Refresh categories after adding a new consumable (in case new category was added)
        fetchCategories();
      } else if (showEditModal) {
        const response = await consumableApi.update(
          selectedItem._id,
          backendData
        );
        const updatedConsumable = Array.isArray(response)
          ? response[0]
          : response.data || response;

        // Map backend response to frontend format
        const mappedConsumable = {
          ...updatedConsumable,
          assignedLab:
            updatedConsumable.assignedLab?.labName ||
            updatedConsumable.assignedLab ||
            "-",
          supplier:
            updatedConsumable.vendor || updatedConsumable.supplier || "-",
        };

        setConsumables(
          consumables.map((item) =>
            item._id === selectedItem._id ? mappedConsumable : item
          )
        );
        setShowEditModal(false);
        setSelectedItem(null);
        showSuccessMessage("Consumable updated successfully");
        // Refresh categories after updating (in case category was changed)
        fetchCategories();
        // Refresh categories after updating (in case category was changed)
        fetchCategories();
      }
    } catch (error) {
      console.error("Error saving consumable:", error);
      showAxiosError(error, "Failed to save consumable");
    }
  };

  const isExpired = (expiryDate) => {
    if (expiryDate === "N/A") return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate) => {
    if (expiryDate === "N/A") return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading consumables...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Consumables Management
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Consumable
          </button>
        </div>

        {/* Search Input - Above Table */}
        <div className="mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search consumables by name, category, lab, supplier, quantity, unit, or status (expired, low stock, expiring soon)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        {filteredConsumables.length === 0 ? (
          <div className="flex justify-center items-center py-12 bg-white border border-gray-300 rounded-md">
            <div className="text-gray-500">
              {searchQuery
                ? "No consumables found matching your search"
                : "No consumables found"}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-[#525b88] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Threshold
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Expiry Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Assigned Lab
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConsumables.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No consumables found
                    </td>
                  </tr>
                ) : (
                  filteredConsumables.map((item) => {
                    const expired = isExpired(item.expiryDate);
                    const expiringSoon = isExpiringSoon(item.expiryDate);
                    const lowStock = item.quantity <= item.threshold;

                    return (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.category}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.threshold} {item.unit}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.expiryDate === "N/A"
                            ? "N/A"
                            : new Date(item.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.assignedLab}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {expired ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              Expired
                            </span>
                          ) : expiringSoon ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              Expiring Soon
                            </span>
                          ) : lowStock ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              OK
                            </span>
                          )}
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
                    );
                  })
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
                  Add Consumable
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
                        Name: *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category: *
                      </label>
                      <input
                        type="text"
                        name="category"
                        list="category-list"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="Type or select a category"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                      <datalist id="category-list">
                        {categories.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity: *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit: *
                      </label>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        placeholder="e.g., Liters, Kg, Pieces"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Threshold: *
                      </label>
                      <input
                        type="number"
                        name="threshold"
                        value={formData.threshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            threshold: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Date:
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date:
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expiryDate: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
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
                        Supplier:
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={(e) =>
                          setFormData({ ...formData, supplier: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
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
                      Add Consumable
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
                  Edit Consumable
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
                        Name: *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category: *
                      </label>
                      <input
                        type="text"
                        name="category"
                        list="category-list-edit"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="Type or select a category"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                      <datalist id="category-list-edit">
                        {categories.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity: *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit: *
                      </label>
                      <input
                        type="text"
                        name="unit"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Threshold: *
                      </label>
                      <input
                        type="number"
                        name="threshold"
                        value={formData.threshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            threshold: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Date:
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date:
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expiryDate: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
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
                        Supplier:
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        value={formData.supplier}
                        onChange={(e) =>
                          setFormData({ ...formData, supplier: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
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
                  Consumable Details
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
                      Name:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.name}
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
                      Quantity:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.quantity} {selectedItem.unit}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Threshold:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.threshold} {selectedItem.unit}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Expiry Date:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.expiryDate === "N/A" ||
                      !selectedItem.expiryDate
                        ? "N/A"
                        : new Date(
                            selectedItem.expiryDate
                          ).toLocaleDateString()}
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
                      Supplier:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.supplier || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Status:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {isExpired(selectedItem.expiryDate) ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : isExpiringSoon(selectedItem.expiryDate) ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          Expiring Soon
                        </span>
                      ) : selectedItem.quantity <= selectedItem.threshold ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          OK
                        </span>
                      )}
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

export default Consumables;
