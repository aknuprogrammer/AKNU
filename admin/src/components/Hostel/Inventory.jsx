import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import AddFormModal from "./AddFormModal";
import {
  Filter,
  Package,
  Home,
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
  XMarkIcon,
} from "@heroicons/react/24/outline";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    itemName: "",
    category: "",
    hostelName: "",
    location: "",
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
          <option value="kitchen">Kitchen Equipment</option>
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

      {/* Location */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="location"
          placeholder="Location/Room"
          value={filters.location}
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
          <option value="available">Available</option>
          <option value="in-use">In Use</option>
          <option value="maintenance">Under Maintenance</option>
          <option value="damaged">Damaged</option>
          <option value="disposed">Disposed</option>
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

const InventoryTable = ({
  inventory,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading inventory...</div>
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

  if (inventory.length === 0) {
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
              onClick={() => requestSort("hostelName")}
            >
              <div className="flex items-center">
                Hostel
                {sortConfig.key === "hostelName" && (
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
              Location/Room
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
                {item.hostelName || "-"}
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
  );
};

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    itemName: "",
    category: "",
    hostelName: "",
    location: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  // Static data for Inventory
  const staticData = [
    // {
    //   _id: "1",
    //   itemName: "Single Bed Frame",
    //   category: "furniture",
    //   hostelName: "Saraswati Girls Hostel",
    //   location: "Room 101",
    //   quantity: 2,
    //   purchaseDate: "2023-06-15",
    //   purchasePrice: 5000,
    //   supplier: "Furniture Mart",
    //   warrantyExpiry: "2026-06-15",
    //   status: "in-use",
    //   description: "Metal frame single bed",
    //   condition: "Good",
    // },
    // {
    //   _id: "2",
    //   itemName: "Ceiling Fan",
    //   category: "appliances",
    //   hostelName: "Vishwakarma Boys Hostel",
    //   location: "Room 205",
    //   quantity: 1,
    //   purchaseDate: "2023-08-20",
    //   purchasePrice: 2500,
    //   supplier: "Electro World",
    //   warrantyExpiry: "2025-08-20",
    //   status: "available",
    //   description: "52 inch ceiling fan with remote",
    //   condition: "Excellent",
    // },
    // {
    //   _id: "3",
    //   itemName: "Geyser",
    //   category: "appliances",
    //   hostelName: "Lakshmi Girls Hostel",
    //   location: "Bathroom Block A",
    //   quantity: 1,
    //   purchaseDate: "2023-05-10",
    //   purchasePrice: 8000,
    //   supplier: "Home Appliances Co",
    //   warrantyExpiry: "2026-05-10",
    //   status: "maintenance",
    //   description: "25L water geyser",
    //   condition: "Needs repair",
    // },
    // {
    //   _id: "4",
    //   itemName: "Study Table",
    //   category: "furniture",
    //   hostelName: "Vivekananda Boys Hostel",
    //   location: "Room 301",
    //   quantity: 1,
    //   purchaseDate: "2023-07-12",
    //   purchasePrice: 3500,
    //   supplier: "Furniture Mart",
    //   warrantyExpiry: "2025-07-12",
    //   status: "in-use",
    //   description: "Wooden study table with drawer",
    //   condition: "Good",
    // },
    // {
    //   _id: "5",
    //   itemName: "LED Light Bulb",
    //   category: "electronics",
    //   hostelName: "Staff Quarters Block A",
    //   location: "Corridor",
    //   quantity: 20,
    //   purchaseDate: "2024-01-05",
    //   purchasePrice: 200,
    //   supplier: "Lighting Solutions",
    //   warrantyExpiry: "2025-01-05",
    //   status: "available",
    //   description: "12W LED bulb",
    //   condition: "New",
    // },
    // {
    //   _id: "6",
    //   itemName: "Mattress",
    //   category: "bedding",
    //   hostelName: "Saraswati Girls Hostel",
    //   location: "Room 102",
    //   quantity: 1,
    //   purchaseDate: "2023-06-15",
    //   purchasePrice: 3000,
    //   supplier: "Comfort Bedding",
    //   warrantyExpiry: "2024-06-15",
    //   status: "in-use",
    //   description: "6 inch foam mattress",
    //   condition: "Good",
    // },
    // {
    //   _id: "7",
    //   itemName: "Water Purifier",
    //   category: "appliances",
    //   hostelName: "Vishwakarma Boys Hostel",
    //   location: "Common Area",
    //   quantity: 1,
    //   purchaseDate: "2023-09-01",
    //   purchasePrice: 12000,
    //   supplier: "Aqua Pure Systems",
    //   warrantyExpiry: "2026-09-01",
    //   status: "in-use",
    //   description: "RO water purifier",
    //   condition: "Excellent",
    // },
    // {
    //   _id: "8",
    //   itemName: "Chair",
    //   category: "furniture",
    //   hostelName: "Lakshmi Girls Hostel",
    //   location: "Room 201",
    //   quantity: 2,
    //   purchaseDate: "2023-07-20",
    //   purchasePrice: 1500,
    //   supplier: "Furniture Mart",
    //   warrantyExpiry: "2025-07-20",
    //   status: "damaged",
    //   description: "Plastic chair",
    //   condition: "Needs replacement",
    // },
    // {
    //   _id: "9",
    //   itemName: "Refrigerator",
    //   category: "appliances",
    //   hostelName: "Staff Quarters Block B",
    //   location: "Common Kitchen",
    //   quantity: 1,
    //   purchaseDate: "2023-04-15",
    //   purchasePrice: 15000,
    //   supplier: "Home Appliances Co",
    //   warrantyExpiry: "2026-04-15",
    //   status: "in-use",
    //   description: "200L double door refrigerator",
    //   condition: "Good",
    // },
    // {
    //   _id: "10",
    //   itemName: "Wardrobe",
    //   category: "furniture",
    //   hostelName: "Vivekananda Boys Hostel",
    //   location: "Room 401",
    //   quantity: 1,
    //   purchaseDate: "2023-08-10",
    //   purchasePrice: 6000,
    //   supplier: "Furniture Mart",
    //   warrantyExpiry: "2025-08-10",
    //   status: "available",
    //   description: "Steel wardrobe with 3 compartments",
    //   condition: "New",
    // },
    // {
    //   _id: "11",
    //   itemName: "Gas Stove",
    //   category: "kitchen",
    //   hostelName: "Saraswati Girls Hostel",
    //   location: "Kitchen Block A",
    //   quantity: 2,
    //   purchaseDate: "2023-09-15",
    //   purchasePrice: 3500,
    //   supplier: "Kitchen Appliances Ltd",
    //   warrantyExpiry: "2025-09-15",
    //   status: "in-use",
    //   description: "2 burner gas stove with auto-ignition",
    //   condition: "Good",
    // },
    // {
    //   _id: "12",
    //   itemName: "Pressure Cooker",
    //   category: "kitchen",
    //   hostelName: "Vishwakarma Boys Hostel",
    //   location: "Kitchen Block B",
    //   quantity: 5,
    //   purchaseDate: "2023-10-01",
    //   purchasePrice: 1200,
    //   supplier: "Kitchen Essentials",
    //   warrantyExpiry: "2025-10-01",
    //   status: "in-use",
    //   description: "5L stainless steel pressure cooker",
    //   condition: "Good",
    // },
    // {
    //   _id: "13",
    //   itemName: "Dining Table",
    //   category: "kitchen",
    //   hostelName: "Lakshmi Girls Hostel",
    //   location: "Dining Hall",
    //   quantity: 4,
    //   purchaseDate: "2023-07-20",
    //   purchasePrice: 8000,
    //   supplier: "Furniture Mart",
    //   warrantyExpiry: "2025-07-20",
    //   status: "in-use",
    //   description: "8-seater wooden dining table",
    //   condition: "Good",
    // },
    // {
    //   _id: "14",
    //   itemName: "Dishwasher",
    //   category: "kitchen",
    //   hostelName: "Staff Quarters Block A",
    //   location: "Common Kitchen",
    //   quantity: 1,
    //   purchaseDate: "2023-11-10",
    //   purchasePrice: 25000,
    //   supplier: "Home Appliances Co",
    //   warrantyExpiry: "2026-11-10",
    //   status: "in-use",
    //   description: "12-place setting dishwasher",
    //   condition: "Excellent",
    // },
    // {
    //   _id: "15",
    //   itemName: "Microwave Oven",
    //   category: "kitchen",
    //   hostelName: "Vivekananda Boys Hostel",
    //   location: "Kitchen Block A",
    //   quantity: 2,
    //   purchaseDate: "2023-08-25",
    //   purchasePrice: 6000,
    //   supplier: "Electro World",
    //   warrantyExpiry: "2025-08-25",
    //   status: "in-use",
    //   description: "20L capacity microwave oven",
    //   condition: "Good",
    // },
    // {
    //   _id: "16",
    //   itemName: "Cooking Utensils Set",
    //   category: "kitchen",
    //   hostelName: "Saraswati Girls Hostel",
    //   location: "Kitchen Block A",
    //   quantity: 10,
    //   purchaseDate: "2024-01-10",
    //   purchasePrice: 5000,
    //   supplier: "Kitchen Essentials",
    //   warrantyExpiry: "2025-01-10",
    //   status: "in-use",
    //   description: "Complete set of cooking utensils (pans, pots, ladles)",
    //   condition: "New",
    // },
    // {
    //   _id: "17",
    //   itemName: "Water Dispenser",
    //   category: "kitchen",
    //   hostelName: "Vishwakarma Boys Hostel",
    //   location: "Dining Hall",
    //   quantity: 1,
    //   purchaseDate: "2023-09-05",
    //   purchasePrice: 4500,
    //   supplier: "Aqua Pure Systems",
    //   warrantyExpiry: "2025-09-05",
    //   status: "in-use",
    //   description: "Hot and cold water dispenser",
    //   condition: "Good",
    // },
    // {
    //   _id: "18",
    //   itemName: "Dining Chairs",
    //   category: "kitchen",
    //   hostelName: "Lakshmi Girls Hostel",
    //   location: "Dining Hall",
    //   quantity: 32,
    //   purchaseDate: "2023-07-20",
    //   purchasePrice: 800,
    //   supplier: "Furniture Mart",
    //   warrantyExpiry: "2025-07-20",
    //   status: "in-use",
    //   description: "Plastic dining chairs",
    //   condition: "Good",
    // },
    // {
    //   _id: "19",
    //   itemName: "Mixer Grinder",
    //   category: "kitchen",
    //   hostelName: "Staff Quarters Block B",
    //   location: "Common Kitchen",
    //   quantity: 2,
    //   purchaseDate: "2023-10-15",
    //   purchasePrice: 3500,
    //   supplier: "Kitchen Appliances Ltd",
    //   warrantyExpiry: "2025-10-15",
    //   status: "in-use",
    //   description: "750W mixer grinder with 3 jars",
    //   condition: "Good",
    // },
    // {
    //   _id: "20",
    //   itemName: "Storage Rack",
    //   category: "kitchen",
    //   hostelName: "Vivekananda Boys Hostel",
    //   location: "Kitchen Block B",
    //   quantity: 3,
    //   purchaseDate: "2023-08-30",
    //   purchasePrice: 2500,
    //   supplier: "Furniture Mart",
    //   warrantyExpiry: "2025-08-30",
    //   status: "available",
    //   description: "Steel storage rack for kitchen supplies",
    //   condition: "New",
    // },
    // {
    //   _id: "21",
    //   itemName: "Rice Cooker",
    //   category: "kitchen",
    //   hostelName: "Saraswati Girls Hostel",
    //   location: "Kitchen Block A",
    //   quantity: 3,
    //   purchaseDate: "2023-11-20",
    //   purchasePrice: 2800,
    //   supplier: "Kitchen Appliances Ltd",
    //   warrantyExpiry: "2025-11-20",
    //   status: "in-use",
    //   description: "5L capacity rice cooker",
    //   condition: "Good",
    // },
    // {
    //   _id: "22",
    //   itemName: "Cutlery Set",
    //   category: "kitchen",
    //   hostelName: "Vishwakarma Boys Hostel",
    //   location: "Dining Hall",
    //   quantity: 50,
    //   purchaseDate: "2024-01-15",
    //   purchasePrice: 8000,
    //   supplier: "Kitchen Essentials",
    //   warrantyExpiry: "2025-01-15",
    //   status: "in-use",
    //   description: "Stainless steel cutlery set (spoons, forks, knives)",
    //   condition: "New",
    // },
    {
      _id: "23",
      itemName: "Kitchen Sink",
      category: "kitchen",
      hostelName: "Lakshmi Girls Hostel",
      location: "Kitchen Block A",
      quantity: 2,
      purchaseDate: "2023-06-01",
      purchasePrice: 12000,
      supplier: "Plumbing Solutions",
      warrantyExpiry: "2026-06-01",
      status: "in-use",
      description: "Stainless steel double bowl kitchen sink",
      condition: "Good",
    },
    {
      _id: "24",
      itemName: "Coffee Maker",
      category: "kitchen",
      hostelName: "Staff Quarters Block A",
      location: "Common Kitchen",
      quantity: 1,
      purchaseDate: "2023-12-05",
      purchasePrice: 4500,
      supplier: "Kitchen Appliances Ltd",
      warrantyExpiry: "2025-12-05",
      status: "in-use",
      description: "12-cup coffee maker",
      condition: "Excellent",
    },
    {
      _id: "25",
      itemName: "Rice",
      category: "kitchen",
      hostelName: "Saraswati Girls Hostel",
      location: "Kitchen Storage",
      quantity: 500,
      purchaseDate: "2024-01-20",
      purchasePrice: 2500,
      supplier: "Grocery Supplies",
      warrantyExpiry: "2024-07-20",
      status: "in-use",
      description: "Basmati rice - 50kg bags (10 bags)",
      condition: "Good",
    },
    {
      _id: "26",
      itemName: "Cooking Oil",
      category: "kitchen",
      hostelName: "Vishwakarma Boys Hostel",
      location: "Kitchen Storage",
      quantity: 100,
      purchaseDate: "2024-01-15",
      purchasePrice: 12000,
      supplier: "Grocery Supplies",
      warrantyExpiry: "2024-12-15",
      status: "in-use",
      description: "Sunflower oil - 5L bottles (20 bottles)",
      condition: "Good",
    },
    {
      _id: "27",
      itemName: "Wheat Flour",
      category: "kitchen",
      hostelName: "Lakshmi Girls Hostel",
      location: "Kitchen Storage",
      quantity: 200,
      purchaseDate: "2024-01-18",
      purchasePrice: 4000,
      supplier: "Grocery Supplies",
      warrantyExpiry: "2024-07-18",
      status: "in-use",
      description: "Whole wheat flour - 10kg bags (20 bags)",
      condition: "Good",
    },
    {
      _id: "28",
      itemName: "Spices Set",
      category: "kitchen",
      hostelName: "Vivekananda Boys Hostel",
      location: "Kitchen Storage",
      quantity: 50,
      purchaseDate: "2024-01-10",
      purchasePrice: 5000,
      supplier: "Spice World",
      warrantyExpiry: "2025-01-10",
      status: "in-use",
      description: "Complete spice set (turmeric, red chili, coriander, cumin, etc.)",
      condition: "Good",
    },
    {
      _id: "29",
      itemName: "Lentils (Dal)",
      category: "kitchen",
      hostelName: "Saraswati Girls Hostel",
      location: "Kitchen Storage",
      quantity: 150,
      purchaseDate: "2024-01-12",
      purchasePrice: 4500,
      supplier: "Grocery Supplies",
      warrantyExpiry: "2024-10-12",
      status: "in-use",
      description: "Mixed lentils - 5kg bags (30 bags)",
      condition: "Good",
    },
    {
      _id: "30",
      itemName: "Sugar",
      category: "kitchen",
      hostelName: "Vishwakarma Boys Hostel",
      location: "Kitchen Storage",
      quantity: 100,
      purchaseDate: "2024-01-14",
      purchasePrice: 3500,
      supplier: "Grocery Supplies",
      warrantyExpiry: "2025-01-14",
      status: "in-use",
      description: "White sugar - 5kg bags (20 bags)",
      condition: "Good",
    },
    {
      _id: "31",
      itemName: "Salt",
      category: "kitchen",
      hostelName: "Lakshmi Girls Hostel",
      location: "Kitchen Storage",
      quantity: 200,
      purchaseDate: "2024-01-16",
      purchasePrice: 1000,
      supplier: "Grocery Supplies",
      warrantyExpiry: "2025-01-16",
      status: "in-use",
      description: "Iodized salt - 1kg packets (200 packets)",
      condition: "Good",
    },
    {
      _id: "32",
      itemName: "Tea",
      category: "kitchen",
      hostelName: "Vivekananda Boys Hostel",
      location: "Kitchen Storage",
      quantity: 50,
      purchaseDate: "2024-01-08",
      purchasePrice: 2500,
      supplier: "Grocery Supplies",
      warrantyExpiry: "2025-01-08",
      status: "in-use",
      description: "Tea leaves - 500g packets (100 packets)",
      condition: "Good",
    },
    {
      _id: "33",
      itemName: "Coffee Powder",
      category: "kitchen",
      hostelName: "Staff Quarters Block A",
      location: "Common Kitchen",
      quantity: 20,
      purchaseDate: "2024-01-05",
      purchasePrice: 1800,
      supplier: "Grocery Supplies",
      warrantyExpiry: "2025-01-05",
      status: "in-use",
      description: "Instant coffee powder - 200g jars (100 jars)",
      condition: "Good",
    },
    {
      _id: "34",
      itemName: "Onions",
      category: "kitchen",
      hostelName: "Saraswati Girls Hostel",
      location: "Kitchen Storage",
      quantity: 200,
      purchaseDate: "2024-01-22",
      purchasePrice: 2000,
      supplier: "Vegetable Market",
      warrantyExpiry: "2024-02-22",
      status: "in-use",
      description: "Fresh onions - 25kg bags (8 bags)",
      condition: "Good",
    },
    {
      _id: "35",
      itemName: "Potatoes",
      category: "kitchen",
      hostelName: "Vishwakarma Boys Hostel",
      location: "Kitchen Storage",
      quantity: 300,
      purchaseDate: "2024-01-22",
      purchasePrice: 3000,
      supplier: "Vegetable Market",
      warrantyExpiry: "2024-03-22",
      status: "in-use",
      description: "Fresh potatoes - 25kg bags (12 bags)",
      condition: "Good",
    },
    {
      _id: "36",
      itemName: "Tomatoes",
      category: "kitchen",
      hostelName: "Lakshmi Girls Hostel",
      location: "Kitchen Storage",
      quantity: 100,
      purchaseDate: "2024-01-22",
      purchasePrice: 1500,
      supplier: "Vegetable Market",
      warrantyExpiry: "2024-02-05",
      status: "in-use",
      description: "Fresh tomatoes - 10kg crates (10 crates)",
      condition: "Good",
    },
    {
      _id: "37",
      itemName: "Milk",
      category: "kitchen",
      hostelName: "Vivekananda Boys Hostel",
      location: "Kitchen Storage",
      quantity: 50,
      purchaseDate: "2024-01-23",
      purchasePrice: 2500,
      supplier: "Dairy Products Ltd",
      warrantyExpiry: "2024-01-25",
      status: "in-use",
      description: "Fresh milk - 1L packets (50 packets)",
      condition: "Fresh",
    },
    {
      _id: "38",
      itemName: "Bread",
      category: "kitchen",
      hostelName: "Staff Quarters Block B",
      location: "Common Kitchen",
      quantity: 30,
      purchaseDate: "2024-01-23",
      purchasePrice: 900,
      supplier: "Bakery Products",
      warrantyExpiry: "2024-01-25",
      status: "in-use",
      description: "White bread - 400g loaves (30 loaves)",
      condition: "Fresh",
    },
  ];

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setInventory(staticData);
    } catch (error) {
      console.error("Error fetching inventory:", error);
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
    const item = inventory.find((i) => i._id === id);
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
    setInventory([...inventory, newItem]);
    setShowAddModal(false);
  };

  const handleEdit = (id) => {
    const item = inventory.find((i) => i._id === id);
    if (item) {
      setEditFormData({ ...item });
      setShowEditModal(true);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editFormData) {
      setInventory(
        inventory.map((item) =>
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
    if (window.confirm("Are you sure you want to delete this inventory item?")) {
      setInventory((prev) => prev.filter((item) => item._id !== id));
    }
  };

  const filteredAndSortedInventory = useMemo(() => {
    let filtered = inventory.filter((item) => {
      return (
        (filters.itemName === "" ||
          item.itemName
            ?.toLowerCase()
            .includes(filters.itemName.toLowerCase())) &&
        (filters.category === "" || item.category === filters.category) &&
        (filters.hostelName === "" ||
          item.hostelName
            ?.toLowerCase()
            .includes(filters.hostelName.toLowerCase())) &&
        (filters.location === "" ||
          item.location?.toLowerCase().includes(filters.location.toLowerCase())) &&
        (filters.status === "" || item.status === filters.status)
      );
    });

    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        if (sortConfig.key === "quantity" || sortConfig.key === "purchasePrice") {
          const aValue = parseFloat(a[sortConfig.key] || 0);
          const bValue = parseFloat(b[sortConfig.key] || 0);
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        if (sortConfig.key === "purchaseDate") {
          const dateA = new Date(a[sortConfig.key] || 0);
          const dateB = new Date(b[sortConfig.key] || 0);
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
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
  }, [inventory, filters, sortConfig]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const totalItems = filteredAndSortedInventory.reduce(
    (sum, item) => sum + (parseInt(item.quantity) || 0),
    0
  );

  const totalValue = filteredAndSortedInventory.reduce(
    (sum, item) => sum + (parseFloat(item.purchasePrice || 0) * parseInt(item.quantity || 0)),
    0
  );

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Hostel Inventory Management
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
                <p className="text-2xl font-bold text-[#525b88]">{totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-[#525b88]" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-[#525b88]">
                  ₹{totalValue.toLocaleString("en-IN")}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[#525b88]" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Items</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    filteredAndSortedInventory.filter((item) => item.status === "available")
                      .length
                  }
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
                  {
                    filteredAndSortedInventory.filter((item) => item.status === "in-use")
                      .length
                  }
                </p>
              </div>
              <Home className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar onFilter={handleFilter} />

        {/* Table */}
        <InventoryTable
          inventory={filteredAndSortedInventory}
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
                        Location/Room:
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editFormData.location || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity:
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={editFormData.quantity || 0}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        min="0"
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status:
                      </label>
                      <select
                        name="status"
                        value={editFormData.status || ""}
                        onChange={handleEditChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      >
                        <option value="available">Available</option>
                        <option value="in-use">In Use</option>
                        <option value="maintenance">Under Maintenance</option>
                        <option value="damaged">Damaged</option>
                        <option value="disposed">Disposed</option>
                      </select>
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
              <h3 className="text-lg font-semibold text-white">Inventory Item Details</h3>
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
                      Location/Room:
                    </label>
                    <p className="text-sm text-gray-900">{selectedItem.location || "-"}</p>
                  </div>

                  {/* Quantity */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Quantity:
                    </label>
                    <p className="text-sm text-gray-900">{selectedItem.quantity || 0}</p>
                  </div>

                  {/* Purchase Date */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Purchase Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedItem.purchaseDate
                        ? new Date(selectedItem.purchaseDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>

                  {/* Purchase Price */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Purchase Price:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedItem.purchasePrice
                        ? `₹${selectedItem.purchasePrice.toLocaleString("en-IN")}`
                        : "-"}
                    </p>
                  </div>

                  {/* Supplier */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Supplier:
                    </label>
                    <p className="text-sm text-gray-900">{selectedItem.supplier || "-"}</p>
                  </div>

                  {/* Warranty Expiry */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Warranty Expiry:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedItem.warrantyExpiry
                        ? new Date(selectedItem.warrantyExpiry).toLocaleDateString("en-IN", {
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
                      Status:
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedItem.status === "available"
                          ? "bg-green-100 text-green-800"
                          : selectedItem.status === "in-use"
                          ? "bg-blue-100 text-blue-800"
                          : selectedItem.status === "maintenance"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedItem.status === "damaged"
                          ? "bg-red-100 text-red-800"
                          : selectedItem.status === "disposed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedItem.status || "available"}
                    </span>
                  </div>

                  {/* Condition */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Condition:
                    </label>
                    <p className="text-sm text-gray-900">{selectedItem.condition || "-"}</p>
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
          formType="inventory"
          initialData={null}
          onSubmit={handleAddSubmit}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
};

export default Inventory;

