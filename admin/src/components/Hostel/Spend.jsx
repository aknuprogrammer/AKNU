import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import AddFormModal from "./AddFormModal";
import {
  Filter,
  Package,
  Home,
  Calendar,
  Hash,
  Eye,
  Plus,
  Tag,
  AlertCircle,
  TrendingDown,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    itemName: "",
    category: "",
    hostelName: "",
    status: "",
  });

  const handleChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row md:items-center gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-4"
    >
      {/* Item Name */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="itemName"
          placeholder="Item Name"
          value={filters.itemName}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Category */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Categories</option>
          <option value="furniture">Furniture</option>
          <option value="appliances">Appliances</option>
          <option value="maintenance">Maintenance Supplies</option>
          <option value="electronics">Electronics</option>
          <option value="bedding">Bedding</option>
          <option value="kitchen">Kitchen</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Hostel Name */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="hostelName"
          placeholder="Hostel Name"
          value={filters.hostelName}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Status */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Statuses</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
          <option value="needs-restock">Needs Restock</option>
        </select>
      </div>

      {/* Apply Filter Button */}
      <div>
        <button
          type="submit"
          className={`flex items-center justify-center px-4 py-2 h-[37px] rounded-md text-sm font-medium transition-colors bg-[#525B88] text-white hover:bg-[#3a4166]`}
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

const SpendTable = ({
  items,
  filters,
  sortConfig,
  requestSort,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
}) => {
  const getCategoryName = (category) => {
    const categories = {
      furniture: "Furniture",
      appliances: "Appliances",
      maintenance: "Maintenance",
      electronics: "Electronics",
      bedding: "Bedding",
      kitchen: "Kitchen",
      other: "Other",
    };
    return categories[category] || category;
  };

  const getStockStatus = (remaining, required) => {
    if (remaining <= 0) return "out-of-stock";
    if (remaining < required) return "low-stock";
    if (remaining < required * 1.5) return "needs-restock";
    return "in-stock";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading inventory usage...</div>
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

  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">No inventory items found</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-[#525b88]">
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
              onClick={() => requestSort("initialQuantity")}
            >
              <div className="flex items-center">
                Initial Qty
                {sortConfig.key === "initialQuantity" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("usedQuantity")}
            >
              <div className="flex items-center">
                Used Qty
                {sortConfig.key === "usedQuantity" && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort("remainingQuantity")}
            >
              <div className="flex items-center">
                Remaining
                {sortConfig.key === "remainingQuantity" && (
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
          {items.map((item) => {
            const stockStatus = getStockStatus(item.remainingQuantity, item.requiredQuantity);
            return (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {item.itemName || "-"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.initialQuantity || 0}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-red-600">
                  {item.usedQuantity || 0}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {item.remainingQuantity || 0}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      stockStatus === "in-stock"
                        ? "bg-green-100 text-green-800"
                        : stockStatus === "low-stock"
                        ? "bg-yellow-100 text-yellow-800"
                        : stockStatus === "out-of-stock"
                        ? "bg-red-100 text-red-800"
                        : stockStatus === "needs-restock"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {stockStatus === "in-stock"
                      ? "In Stock"
                      : stockStatus === "low-stock"
                      ? "Low Stock"
                      : stockStatus === "out-of-stock"
                      ? "Out of Stock"
                      : "Needs Restock"}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Spend = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    itemName: "",
    category: "",
    hostelName: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  // Static data for Inventory Usage/Consumption
  const staticData = [
    {
      _id: "1",
      itemName: "Rice",
      category: "kitchen",
      hostelName: "Saraswati Girls Hostel",
      location: "Kitchen Storage",
      initialQuantity: 500,
      usedQuantity: 350,
      remainingQuantity: 150,
      requiredQuantity: 200,
      lastUsedDate: "2024-01-23",
      unit: "kg",
      description: "Basmati rice consumption tracking",
    },
    {
      _id: "2",
      itemName: "Cooking Oil",
      category: "kitchen",
      hostelName: "Vishwakarma Boys Hostel",
      location: "Kitchen Storage",
      initialQuantity: 100,
      usedQuantity: 85,
      remainingQuantity: 15,
      requiredQuantity: 50,
      lastUsedDate: "2024-01-23",
      unit: "L",
      description: "Sunflower oil consumption",
    },
    {
      _id: "3",
      itemName: "Cleaning Detergent",
      category: "cleaning",
      hostelName: "Lakshmi Girls Hostel",
      location: "Storage Room",
      initialQuantity: 50,
      usedQuantity: 45,
      remainingQuantity: 5,
      requiredQuantity: 30,
      lastUsedDate: "2024-01-22",
      unit: "kg",
      description: "Laundry and cleaning detergent",
    },
    {
      _id: "4",
      itemName: "LED Light Bulb",
      category: "electronics",
      hostelName: "Vivekananda Boys Hostel",
      location: "Corridor",
      initialQuantity: 20,
      usedQuantity: 12,
      remainingQuantity: 8,
      requiredQuantity: 15,
      lastUsedDate: "2024-01-20",
      unit: "pieces",
      description: "12W LED bulbs for replacement",
    },
    {
      _id: "5",
      itemName: "Wheat Flour",
      category: "kitchen",
      hostelName: "Saraswati Girls Hostel",
      location: "Kitchen Storage",
      initialQuantity: 200,
      usedQuantity: 180,
      remainingQuantity: 20,
      requiredQuantity: 100,
      lastUsedDate: "2024-01-23",
      unit: "kg",
      description: "Whole wheat flour consumption",
    },
    {
      _id: "6",
      itemName: "Spices Set",
      category: "kitchen",
      hostelName: "Vishwakarma Boys Hostel",
      location: "Kitchen Storage",
      initialQuantity: 50,
      usedQuantity: 48,
      remainingQuantity: 2,
      requiredQuantity: 25,
      lastUsedDate: "2024-01-23",
      unit: "sets",
      description: "Complete spice set consumption",
    },
    {
      _id: "7",
      itemName: "Lentils (Dal)",
      category: "kitchen",
      hostelName: "Lakshmi Girls Hostel",
      location: "Kitchen Storage",
      initialQuantity: 150,
      usedQuantity: 140,
      remainingQuantity: 10,
      requiredQuantity: 75,
      lastUsedDate: "2024-01-23",
      unit: "kg",
      description: "Mixed lentils consumption",
    },
    {
      _id: "8",
      itemName: "Sugar",
      category: "kitchen",
      hostelName: "Vivekananda Boys Hostel",
      location: "Kitchen Storage",
      initialQuantity: 100,
      usedQuantity: 75,
      remainingQuantity: 25,
      requiredQuantity: 50,
      lastUsedDate: "2024-01-22",
      unit: "kg",
      description: "White sugar consumption",
    },
    {
      _id: "9",
      itemName: "Salt",
      category: "kitchen",
      hostelName: "Saraswati Girls Hostel",
      location: "Kitchen Storage",
      initialQuantity: 200,
      usedQuantity: 150,
      remainingQuantity: 50,
      requiredQuantity: 100,
      lastUsedDate: "2024-01-23",
      unit: "kg",
      description: "Iodized salt consumption",
    },
    {
      _id: "10",
      itemName: "Tea",
      category: "kitchen",
      hostelName: "Vishwakarma Boys Hostel",
      location: "Kitchen Storage",
      initialQuantity: 50,
      usedQuantity: 40,
      remainingQuantity: 10,
      requiredQuantity: 25,
      lastUsedDate: "2024-01-23",
      unit: "kg",
      description: "Tea leaves consumption",
    },
    {
      _id: "11",
      itemName: "Toilet Paper",
      category: "cleaning",
      hostelName: "Lakshmi Girls Hostel",
      location: "Storage Room",
      initialQuantity: 100,
      usedQuantity: 95,
      remainingQuantity: 5,
      requiredQuantity: 50,
      lastUsedDate: "2024-01-23",
      unit: "rolls",
      description: "Toilet paper consumption",
    },
    {
      _id: "12",
      itemName: "Soap",
      category: "cleaning",
      hostelName: "Vivekananda Boys Hostel",
      location: "Storage Room",
      initialQuantity: 200,
      usedQuantity: 180,
      remainingQuantity: 20,
      requiredQuantity: 100,
      lastUsedDate: "2024-01-22",
      unit: "bars",
      description: "Bathing soap consumption",
    },
    {
      _id: "13",
      itemName: "Onions",
      category: "kitchen",
      hostelName: "Saraswati Girls Hostel",
      location: "Kitchen Storage",
      initialQuantity: 200,
      usedQuantity: 190,
      remainingQuantity: 10,
      requiredQuantity: 100,
      lastUsedDate: "2024-01-23",
      unit: "kg",
      description: "Fresh onions consumption",
    },
    {
      _id: "14",
      itemName: "Potatoes",
      category: "kitchen",
      hostelName: "Vishwakarma Boys Hostel",
      location: "Kitchen Storage",
      initialQuantity: 300,
      usedQuantity: 280,
      remainingQuantity: 20,
      requiredQuantity: 150,
      lastUsedDate: "2024-01-23",
      unit: "kg",
      description: "Fresh potatoes consumption",
    },
    {
      _id: "15",
      itemName: "Tomatoes",
      category: "kitchen",
      hostelName: "Lakshmi Girls Hostel",
      location: "Kitchen Storage",
      initialQuantity: 100,
      usedQuantity: 95,
      remainingQuantity: 5,
      requiredQuantity: 50,
      lastUsedDate: "2024-01-23",
      unit: "kg",
      description: "Fresh tomatoes consumption",
    },
  ];

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setItems(staticData);
    } catch (error) {
      console.error("Error fetching inventory usage:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    setFilters(filters);
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleView = (id) => {
    const item = items.find((i) => i._id === id);
    if (item) {
      setSelectedItem(item);
      setShowViewModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedItem(null);
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = (formData) => {
    const newItem = {
      _id: String(Date.now()),
      ...formData,
    };
    setItems([...items, newItem]);
    setShowAddModal(false);
  };

  const handleEdit = (id) => {
    const item = items.find((i) => i._id === id);
    if (item) {
      setEditFormData({ ...item });
      setShowEditModal(true);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editFormData) {
      setItems(
        items.map((item) =>
          item._id === editFormData._id ? editFormData : item
        )
      );
      setShowEditModal(false);
      setEditFormData(null);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this usage record?")) {
      setItems((prev) => prev.filter((item) => item._id !== id));
    }
  };

  const getStockStatus = (remaining, required) => {
    if (remaining <= 0) return "out-of-stock";
    if (remaining < required) return "low-stock";
    if (remaining < required * 1.5) return "needs-restock";
    return "in-stock";
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item) => {
      const stockStatus = getStockStatus(item.remainingQuantity, item.requiredQuantity);
      return (
        (filters.itemName === "" ||
          item.itemName?.toLowerCase().includes(filters.itemName.toLowerCase())) &&
        (filters.category === "" || item.category === filters.category) &&
        (filters.hostelName === "" ||
          item.hostelName?.toLowerCase().includes(filters.hostelName.toLowerCase())) &&
        (filters.status === "" || stockStatus === filters.status)
      );
    });

    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        if (["initialQuantity", "usedQuantity", "remainingQuantity", "requiredQuantity"].includes(sortConfig.key)) {
          const aValue = parseFloat(a[sortConfig.key] || 0);
          const bValue = parseFloat(b[sortConfig.key] || 0);
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [items, filters, sortConfig]);

  useEffect(() => {
    fetchItems();
  }, []);

  const totalItems = filteredAndSortedItems.length;
  const lowStockItems = filteredAndSortedItems.filter(
    (item) => getStockStatus(item.remainingQuantity, item.requiredQuantity) === "low-stock"
  ).length;
  const outOfStockItems = filteredAndSortedItems.filter(
    (item) => getStockStatus(item.remainingQuantity, item.requiredQuantity) === "out-of-stock"
  ).length;
  const needsRestockItems = filteredAndSortedItems.filter(
    (item) => getStockStatus(item.remainingQuantity, item.requiredQuantity) === "needs-restock"
  ).length;

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Inventory Usage & Consumption
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
            title="Add Usage Record"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Usage
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-[#525b88]">{totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-[#525b88]" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockItems}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Restock</p>
                <p className="text-2xl font-bold text-orange-600">{needsRestockItems}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar onFilter={handleFilter} />

        {/* Table */}
        <SpendTable
          items={filteredAndSortedItems}
          filters={filters}
          sortConfig={sortConfig}
          requestSort={requestSort}
          loading={loading}
          error={error}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Edit Modal */}
      {showEditModal &&
        editFormData &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">Edit Inventory Usage</h3>
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
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Item Name */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name:
                      </label>
                      <input
                        type="text"
                        name="itemName"
                        value={editFormData.itemName || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category:
                      </label>
                      <select
                        name="category"
                        value={editFormData.category || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="kitchen">Kitchen</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="electronics">Electronics</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Hostel Name */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hostel Name:
                      </label>
                      <input
                        type="text"
                        name="hostelName"
                        value={editFormData.hostelName || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>

                    {/* Location */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location:
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editFormData.location || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>

                    {/* Initial Quantity */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial Quantity:
                      </label>
                      <input
                        type="number"
                        name="initialQuantity"
                        value={editFormData.initialQuantity || 0}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>

                    {/* Used Quantity */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Used Quantity:
                      </label>
                      <input
                        type="number"
                        name="usedQuantity"
                        value={editFormData.usedQuantity || 0}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>

                    {/* Remaining Quantity */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remaining Quantity:
                      </label>
                      <input
                        type="number"
                        name="remainingQuantity"
                        value={editFormData.remainingQuantity || 0}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>

                    {/* Required Quantity */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Required Quantity:
                      </label>
                      <input
                        type="number"
                        name="requiredQuantity"
                        value={editFormData.requiredQuantity || 0}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>

                    {/* Unit */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit:
                      </label>
                      <input
                        type="text"
                        name="unit"
                        value={editFormData.unit || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        placeholder="kg, L, pieces, etc."
                      />
                    </div>

                    {/* Last Used Date */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Used Date:
                      </label>
                      <input
                        type="date"
                        name="lastUsedDate"
                        value={editFormData.lastUsedDate || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-5 col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description:
                      </label>
                      <textarea
                        name="description"
                        value={editFormData.description || ""}
                        onChange={handleEditChange}
                        rows="3"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
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

      {/* View Details Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Inventory Usage Details</h3>
              <button
                onClick={handleCloseModal}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Item Name */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Item Name:
                    </label>
                    <p className="text-sm text-gray-900">{selectedItem.itemName || "-"}</p>
                  </div>

                  {/* Category */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Category:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedItem.category
                        ? selectedItem.category.charAt(0).toUpperCase() +
                          selectedItem.category.slice(1)
                        : "-"}
                    </p>
                  </div>

                  {/* Hostel Name */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Hostel Name:
                    </label>
                    <p className="text-sm text-gray-900">{selectedItem.hostelName || "-"}</p>
                  </div>

                  {/* Location */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Location:
                    </label>
                    <p className="text-sm text-gray-900">{selectedItem.location || "-"}</p>
                  </div>

                  {/* Initial Quantity */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Initial Quantity:
                    </label>
                    <p className="text-sm text-gray-900 font-medium">
                      {selectedItem.initialQuantity || 0} {selectedItem.unit || ""}
                    </p>
                  </div>

                  {/* Used Quantity */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Used Quantity:
                    </label>
                    <p className="text-sm text-gray-900 font-medium text-red-600">
                      {selectedItem.usedQuantity || 0} {selectedItem.unit || ""}
                    </p>
                  </div>

                  {/* Remaining Quantity */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Remaining Quantity:
                    </label>
                    <p className="text-sm text-gray-900 font-medium">
                      {selectedItem.remainingQuantity || 0} {selectedItem.unit || ""}
                    </p>
                  </div>

                  {/* Required Quantity */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Required Quantity:
                    </label>
                    <p className="text-sm text-gray-900 font-medium text-blue-600">
                      {selectedItem.requiredQuantity || 0} {selectedItem.unit || ""}
                    </p>
                  </div>

                  {/* Last Used Date */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Last Used Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedItem.lastUsedDate
                        ? new Date(selectedItem.lastUsedDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Stock Status:
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        getStockStatus(selectedItem.remainingQuantity, selectedItem.requiredQuantity) === "in-stock"
                          ? "bg-green-100 text-green-800"
                          : getStockStatus(selectedItem.remainingQuantity, selectedItem.requiredQuantity) === "low-stock"
                          ? "bg-yellow-100 text-yellow-800"
                          : getStockStatus(selectedItem.remainingQuantity, selectedItem.requiredQuantity) === "out-of-stock"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {getStockStatus(selectedItem.remainingQuantity, selectedItem.requiredQuantity) === "in-stock"
                        ? "In Stock"
                        : getStockStatus(selectedItem.remainingQuantity, selectedItem.requiredQuantity) === "low-stock"
                        ? "Low Stock"
                        : getStockStatus(selectedItem.remainingQuantity, selectedItem.requiredQuantity) === "out-of-stock"
                        ? "Out of Stock"
                        : "Needs Restock"}
                    </span>
                  </div>
                </div>

                {/* Description - Full Width */}
                <div className="mb-5 flex items-start gap-3">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                    Description:
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                    {selectedItem.description || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddFormModal
          formType="spend"
          initialData={null}
          onSubmit={handleAddSubmit}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
};

export default Spend;
