import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import AddFormModal from "./AddFormModal";
import { equipmentApi, consumableApi } from "../../services/apiService";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../config/Toast";
import {
  Search,
  Package,
  FlaskConical,
  Hash,
  Calendar,
  DollarSign,
  Eye,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const InventoryTable = ({
  inventory,
  onView,
  onEdit,
  onDelete,
  sortConfig,
  requestSort,
  searchQuery,
  onSearchChange,
}) => {
  const getCategoryName = (category) => {
    const categories = {
      equipment: "Equipment",
      chemicals: "Chemicals",
      glassware: "Glassware",
      instruments: "Instruments",
      safety: "Safety Equipment",
      consumables: "Consumables",
      other: "Other",
    };
    return categories[category] || category;
  };

  if (inventory.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">No inventory items found</div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Input - Above Table */}
      <div className="mb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory by item name, category, lab name, location, status, or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] placeholder-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      {inventory.length === 0 ? (
        <div className="flex justify-center items-center py-12 bg-white border border-gray-300 rounded-md">
          <div className="text-gray-500">
            {searchQuery
              ? "No inventory items found matching your search"
              : "No inventory items found"}
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
              onClick={() => requestSort("category")}
            >
              <div className="flex items-center">
                Category
                {sortConfig.key === "category" && (
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
                Lab
                {sortConfig.key === "labName" && (
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
              Location/Cabinet
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("quantity")}
            >
              <div className="flex items-center">
                Quantity
                {sortConfig.key === "quantity" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("purchaseDate")}
            >
              <div className="flex items-center">
                Purchase Date
                {sortConfig.key === "purchaseDate" && (
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
          {inventory.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {item.itemName || "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                  {getCategoryName(item.category)}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.labName || "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.location || "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.quantity || 0}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.purchaseDate
                  ? new Date(item.purchaseDate).toLocaleDateString()
                  : "-"}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    item.status === "available"
                      ? "bg-green-100 text-green-800"
                      : item.status === "in-use"
                      ? "bg-blue-100 text-blue-800"
                      : item.status === "maintenance"
                      ? "bg-yellow-100 text-yellow-800"
                      : item.status === "damaged"
                      ? "bg-red-100 text-red-800"
                      : item.status === "disposed"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.status || "available"}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(item._id)}
                    className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onEdit(item._id)}
                    className="text-[#525b88] hover:text-[#3a4166]"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
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

const LabInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  // Fetch inventory from Equipment and Consumable APIs
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both equipment and consumables
      const [equipmentResponse, consumablesResponse] = await Promise.all([
        equipmentApi.getAll({}),
        consumableApi.getAll({}),
      ]);

      // Process equipment data
      let equipmentData = [];
      if (Array.isArray(equipmentResponse)) {
        equipmentData = equipmentResponse;
      } else if (equipmentResponse.data && Array.isArray(equipmentResponse.data)) {
        equipmentData = equipmentResponse.data;
      } else if (equipmentResponse.success && Array.isArray(equipmentResponse.data)) {
        equipmentData = equipmentResponse.data;
      }

      // Process consumables data
      let consumablesData = [];
      if (Array.isArray(consumablesResponse)) {
        consumablesData = consumablesResponse;
      } else if (consumablesResponse.data && Array.isArray(consumablesResponse.data)) {
        consumablesData = consumablesResponse.data;
      } else if (consumablesResponse.success && Array.isArray(consumablesResponse.data)) {
        consumablesData = consumablesResponse.data;
      }

      // Map equipment to inventory format
      const mappedEquipment = equipmentData.map((item) => ({
        _id: item._id,
        itemName: item.equipmentName || "-",
        category: item.category?.name || item.category || "equipment",
        labName: item.assignedLab?.labName || item.assignedLab || "-",
        location: item.assignedLab?.location || "-",
        quantity: 1, // Equipment items are typically single units
        purchaseDate: item.purchaseDate,
        purchasePrice: item.price || 0,
        supplier: item.vendor || "-",
        warrantyExpiry: item.warranty || "-",
        status: item.condition === "working" ? "available" : item.condition === "faulty" ? "maintenance" : item.condition || "available",
        description: item.description || "-",
        condition: item.condition || "working",
        itemType: "equipment",
      }));

      // Map consumables to inventory format
      const mappedConsumables = consumablesData.map((item) => ({
        _id: item._id,
        itemName: item.name || "-",
        category: item.category || "consumables",
        labName: item.assignedLab?.labName || item.assignedLab || "-",
        location: item.assignedLab?.location || "-",
        quantity: item.quantity || 0,
        purchaseDate: item.purchaseDate,
        purchasePrice: item.price || 0,
        supplier: item.vendor || "-",
        warrantyExpiry: item.expiryDate || "-",
        status: item.quantity > (item.threshold || 0) ? "available" : "low-stock",
        description: item.description || "-",
        condition: "Good",
        itemType: "consumable",
      }));

      // Combine both into unified inventory
      setInventory([...mappedEquipment, ...mappedConsumables]);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setError("Failed to load inventory");
      showAxiosError(error, "Failed to load inventory");
      setInventory([]);
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

  const sortedInventory = useMemo(() => {
    let sortableItems = [...inventory];
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
        const dateA = new Date(a.createdAt || a.purchaseDate || a._id || 0);
        const dateB = new Date(b.createdAt || b.purchaseDate || b._id || 0);
        return dateB - dateA; // Descending order (newest first)
      });
    }
    return sortableItems;
  }, [inventory, sortConfig]);

  const filteredAndSortedInventory = useMemo(() => {
    let filtered = sortedInventory;

    // Apply search query across all fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = sortedInventory.filter((item) => {
        const itemName = (item.itemName || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const labName = (item.labName || "").toLowerCase();
        const location = (item.location || "").toLowerCase();
        const status = (item.status || "").toLowerCase();
        const supplier = (item.supplier || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const quantity = String(item.quantity || "").toLowerCase();
        const purchasePrice = String(item.purchasePrice || "").toLowerCase();

        return (
          itemName.includes(query) ||
          category.includes(query) ||
          labName.includes(query) ||
          location.includes(query) ||
          status.includes(query) ||
          supplier.includes(query) ||
          description.includes(query) ||
          quantity.includes(query) ||
          purchasePrice.includes(query)
        );
      });
    }

    return filtered;
  }, [sortedInventory, searchQuery]);

  const totalItems = filteredAndSortedInventory.length;
  const totalValue = filteredAndSortedInventory.reduce(
    (sum, item) => sum + (item.purchasePrice || 0) * (item.quantity || 0),
    0
  );
  const availableItems = filteredAndSortedInventory.filter(
    (item) => item.status === "available"
  ).length;
  const inUseItems = filteredAndSortedInventory.filter(
    (item) => item.status === "in-use"
  ).length;

  const handleView = (id) => {
    const item = inventory.find((i) => i._id === id);
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleEdit = (id) => {
    const item = inventory.find((i) => i._id === id);
    setEditFormData({
      _id: item._id,
      itemName: item.itemName || "",
      category: item.category || "",
      labName: item.labName || "",
      location: item.location || "",
      quantity: item.quantity || 0,
      purchaseDate: item.purchaseDate || "",
      purchasePrice: item.purchasePrice || 0,
      supplier: item.supplier || "",
      warrantyExpiry: item.warrantyExpiry || "",
      condition: item.condition || "",
      status: item.status || "available",
      description: item.description || "",
    });
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setInventory(inventory.filter((item) => item._id !== id));
    }
  };

  const handleEditSubmit = (formData) => {
    setInventory(
      inventory.map((item) =>
        item._id === editFormData._id ? { ...item, ...formData } : item
      )
    );
    setShowEditModal(false);
    setEditFormData(null);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = (formData) => {
    const newItem = {
      _id: Date.now().toString(),
      ...formData,
    };
    setInventory([newItem, ...inventory]);
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading lab inventory...</div>
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
          Lab Inventory Management
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          title="Add New Item"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-[#525b88]">
                {totalItems}
              </p>
            </div>
            <Package className="w-8 h-8 text-[#525b88]" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-[#525b88]">
                ₹{totalValue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-[#525b88]" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {availableItems}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Use</p>
              <p className="text-2xl font-bold text-blue-600">
                {inUseItems}
              </p>
            </div>
            <FlaskConical className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Table */}
      <InventoryTable
        inventory={filteredAndSortedInventory}
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
        selectedItem &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">Item Details</h3>
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
                      <p className="text-sm text-gray-900">{selectedItem.itemName || "-"}</p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Category:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.category || "-"}</p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Lab Name:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.labName || "-"}</p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Location/Cabinet:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.location || "-"}</p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Quantity:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.quantity || 0}</p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Status:
                      </label>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          selectedItem.status === "available"
                            ? "bg-green-100 text-green-800"
                            : selectedItem.status === "in-use"
                            ? "bg-blue-100 text-blue-800"
                            : selectedItem.status === "maintenance"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedItem.status === "damaged"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedItem.status || "available"}
                      </span>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Purchase Date:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.purchaseDate
                          ? new Date(selectedItem.purchaseDate).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Purchase Price:
                      </label>
                      <p className="text-sm text-gray-900">
                        ₹{selectedItem.purchasePrice?.toLocaleString() || "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Supplier:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.supplier || "-"}</p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Warranty Expiry:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedItem.warrantyExpiry === "N/A"
                          ? "N/A"
                          : selectedItem.warrantyExpiry
                          ? new Date(selectedItem.warrantyExpiry).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Condition:
                      </label>
                      <p className="text-sm text-gray-900">{selectedItem.condition || "-"}</p>
                    </div>
                  </div>
                  <div className="mb-5 flex items-start gap-3 col-span-2">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Description:
                    </label>
                    <p className="text-sm text-gray-900">{selectedItem.description || "-"}</p>
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
                <h3 className="text-lg font-semibold text-white">Edit Inventory Item</h3>
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
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleEditSubmit(editFormData);
                }} className="p-6 space-y-4">
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
                        Category:
                      </label>
                      <select
                        value={editFormData.category}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, category: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="equipment">Equipment</option>
                        <option value="chemicals">Chemicals</option>
                        <option value="glassware">Glassware</option>
                        <option value="instruments">Instruments</option>
                        <option value="safety">Safety Equipment</option>
                        <option value="consumables">Consumables</option>
                        <option value="other">Other</option>
                      </select>
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
                        Location/Cabinet:
                      </label>
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, location: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity:
                      </label>
                      <input
                        type="number"
                        value={editFormData.quantity}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, quantity: parseInt(e.target.value) })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
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
                        <option value="available">Available</option>
                        <option value="in-use">In Use</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="damaged">Damaged</option>
                        <option value="disposed">Disposed</option>
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
          formType="labInventory"
          initialData={null}
          onSubmit={handleAddSubmit}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default LabInventory;

