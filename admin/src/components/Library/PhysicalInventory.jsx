import React, { useState, useMemo, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Filter,
    Download,
    Armchair,
    Laptop,
    BookOpen,
    Package,
    AlertCircle,
    X
} from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { physicalInventoryApi, libraryInfoApi } from "../../services/apiService";
import { toast } from "react-hot-toast";
import { exportToCSV } from "../../utils/exportUtils";

const FilterBar = ({ onFilter }) => {
    const [filters, setFilters] = useState({
        itemName: "",
        category: "",
        location: "",
        condition: "",
        status: ""
    });

    const handleChange = (e) => {
        const newFilters = { ...filters, [e.target.name]: e.target.value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    return (
        <form className="flex flex-col md:flex-row md:items-center gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-4">
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

            <div className="flex-1 min-w-[120px]">
                <select
                    name="category"
                    value={filters.category}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                >
                    <option value="">All Categories</option>
                    <option value="furniture">Furniture</option>
                    <option value="electronics">Electronics</option>
                    <option value="equipment">Equipment</option>
                </select>
            </div>

            <div className="flex-1 min-w-[120px]">
                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={filters.location}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                />
            </div>

            <div className="flex-1 min-w-[120px]">
                <select
                    name="condition"
                    value={filters.condition}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                >
                    <option value="">All Conditions</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="damaged">Damaged</option>
                </select>
            </div>

            <div className="flex-1 min-w-[120px]">
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="under_maintenance">Under Maintenance</option>
                    <option value="retired">Retired</option>
                </select>
            </div>

            <div>
                <button
                    type="submit"
                    className="flex items-center justify-center px-4 py-2 h-[37px] rounded-md text-sm font-medium transition-colors bg-[#525B88] text-white hover:bg-[#3a4166]"
                >
                    <Filter className="h-4 w-4" />
                </button>
            </div>
        </form>
    );
};

const InventoryTable = ({ inventory, onEdit, onDelete, sortConfig, requestSort }) => {
    const getCategoryIcon = (category) => {
        switch (category) {
            case "furniture":
                return <Armchair className="w-4 h-4 inline mr-1" />;
            case "electronics":
                return <Laptop className="w-4 h-4 inline mr-1" />;
            case "equipment":
                return <Package className="w-4 h-4 inline mr-1" />;
            default:
                return <BookOpen className="w-4 h-4 inline mr-1" />;
        }
    };

    const getConditionBadge = (condition) => {
        const badges = {
            excellent: "bg-green-100 text-green-800",
            good: "bg-blue-100 text-blue-800",
            fair: "bg-yellow-100 text-yellow-800",
            poor: "bg-orange-100 text-orange-800",
            damaged: "bg-red-100 text-red-800"
        };
        return badges[condition] || "bg-gray-100 text-gray-800";
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: "bg-green-100 text-green-800",
            under_maintenance: "bg-yellow-100 text-yellow-800",
            retired: "bg-gray-100 text-gray-800"
        };
        return badges[status] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-[#525b88]">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => requestSort("itemCode")}>
                            <div className="flex items-center">
                                Item Code
                                {sortConfig.key === "itemCode" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => requestSort("itemName")}>
                            <div className="flex items-center">
                                Item Name
                                {sortConfig.key === "itemName" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => requestSort("quantity")}>
                            <div className="flex items-center">
                                Quantity
                                {sortConfig.key === "quantity" && <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Condition</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemCode}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getCategoryIcon(item.category)}
                                <span className="capitalize">{item.category}</span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{item.quantity}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs capitalize ${getConditionBadge(item.condition)}`}>
                                    {item.condition}
                                </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusBadge(item.status)}`}>
                                    {item.status.replace("_", " ")}
                                </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEdit(item)}
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

const AddEditModal = ({ isOpen, onClose, onSubmit, editData, libraries = [] }) => {
    const [formData, setFormData] = useState({
        itemType: "",
        itemName: "",
        itemCode: "",
        category: "",
        quantity: 1,
        condition: "good",
        location: "",
        purchaseDate: "",
        purchasePrice: 0,
        vendor: "",
        warrantyExpiry: "",
        status: "active",
        notes: "",
        library: ""
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                ...editData,
                library: typeof editData.library === 'object' ? editData.library?._id : (editData.library || ""),
                purchaseDate: editData.purchaseDate ? editData.purchaseDate.split('T')[0] : "",
                warrantyExpiry: editData.warrantyExpiry ? editData.warrantyExpiry.split('T')[0] : ""
            });
        } else {
            setFormData({
                itemType: "",
                itemName: "",
                itemCode: "",
                category: "",
                quantity: 1,
                condition: "good",
                location: "",
                purchaseDate: "",
                purchasePrice: 0,
                vendor: "",
                warrantyExpiry: "",
                status: "active",
                notes: "",
                library: ""
            });
        }
    }, [editData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-[#525b88] to-[#3a4377] px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">
                        {editData ? "Edit Item" : "Add New Item"}
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Library *</label>
                            <select
                                value={formData.library}
                                onChange={(e) => setFormData({ ...formData, library: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            >
                                <option value="">Select Library</option>
                                {libraries.map((lib) => (
                                    <option key={lib._id} value={lib._id}>
                                        {lib.name} ({lib.libraryCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Type *</label>
                            <select
                                value={formData.itemType}
                                onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="chair">Chair</option>
                                <option value="table">Table</option>
                                <option value="desk">Desk</option>
                                <option value="shelf">Shelf</option>
                                <option value="computer">Computer</option>
                                <option value="printer">Printer</option>
                                <option value="projector">Projector</option>
                                <option value="ac">AC</option>
                                <option value="fan">Fan</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                            <input
                                type="text"
                                value={formData.itemName}
                                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Code *</label>
                            <input
                                type="text"
                                value={formData.itemCode}
                                onChange={(e) => setFormData({ ...formData, itemCode: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                                disabled={!!editData}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="furniture">Furniture</option>
                                <option value="electronics">Electronics</option>
                                <option value="equipment">Equipment</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                min="0"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                            <select
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            >
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                                <option value="damaged">Damaged</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                            <input
                                type="date"
                                value={formData.purchaseDate}
                                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (₹)</label>
                            <input
                                type="number"
                                value={formData.purchasePrice}
                                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                            <input
                                type="text"
                                value={formData.vendor}
                                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
                            <input
                                type="date"
                                value={formData.warrantyExpiry}
                                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                required
                            >
                                <option value="active">Active</option>
                                <option value="under_maintenance">Under Maintenance</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#525b88] focus:border-[#525b88]"
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166]"
                        >
                            {editData ? "Update" : "Add"} Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PhysicalInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [libraries, setLibraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        itemName: "",
        category: "",
        location: "",
        condition: "",
        status: ""
    });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        fetchInventory();
        fetchLibraries();
    }, [filters]);

    const fetchLibraries = async () => {
        try {
            const data = await libraryInfoApi.getAll();
            setLibraries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching libraries:", error);
            toast.error("Failed to load libraries");
        }
    };

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.itemName) params.itemName = filters.itemName;
            if (filters.category) params.category = filters.category;
            if (filters.location) params.location = filters.location;
            if (filters.condition) params.condition = filters.condition;
            if (filters.status) params.status = filters.status;

            const data = await physicalInventoryApi.getAll(params);
            setInventory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            toast.error("Failed to load inventory");
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (newFilters) => {
        setFilters(newFilters);
    };

    const filteredInventory = useMemo(() => {
        return inventory;
    }, [inventory]);

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedInventory = useMemo(() => {
        let sortableItems = [...filteredInventory];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredInventory, sortConfig]);

    const handleAdd = () => {
        setEditData(null);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditData(item);
        setShowModal(true);
    };

    const handleSubmit = async (formData) => {
        try {
            if (editData) {
                await physicalInventoryApi.update(editData._id, formData);
                toast.success("Item updated successfully!");
            } else {
                await physicalInventoryApi.create(formData);
                toast.success("Item added successfully!");
            }
            setShowModal(false);
            fetchInventory();
        } catch (error) {
            console.error("Error saving item:", error);
            toast.error(error.response?.data?.message || "Failed to save item");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await physicalInventoryApi.delete(id);
                toast.success("Item deleted successfully!");
                fetchInventory();
            } catch (error) {
                console.error("Error deleting item:", error);
                toast.error("Failed to delete item");
            }
        }
    };

    const handleExport = () => {
        if (sortedInventory.length === 0) {
            toast.error("No data to export");
            return;
        }
        const columns = [
            { key: "itemCode", label: "Item Code" },
            { key: "itemName", label: "Item Name" },
            { key: "itemType", label: "Type" },
            { key: "category", label: "Category" },
            { key: "quantity", label: "Quantity" },
            { key: "condition", label: "Condition" },
            { key: "location", label: "Location" },
            { key: "purchasePrice", label: "Purchase Price" },
            { key: "vendor", label: "Vendor" },
            { key: "status", label: "Status" },
        ];
        exportToCSV(sortedInventory, columns, "physical_inventory");
        toast.success("Inventory exported successfully!");
    };

    const summaryStats = useMemo(() => {
        const categoryCount = inventory.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.quantity;
            return acc;
        }, {});

        return {
            totalItems: inventory.reduce((sum, item) => sum + item.quantity, 0),
            furniture: categoryCount.furniture || 0,
            electronics: categoryCount.electronics || 0,
            equipment: categoryCount.equipment || 0,
            activeItems: inventory.filter(item => item.status === "active").length
        };
    }, [inventory]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-gray-600">Loading inventory...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex flex-row justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
                    Physical Inventory Management
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        title="Export Inventory"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
                        title="Add New Item"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Items</p>
                            <p className="text-2xl font-bold text-[#525b88]">{summaryStats.totalItems}</p>
                        </div>
                        <Package className="w-8 h-8 text-[#525b88]" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Furniture</p>
                            <p className="text-2xl font-bold text-blue-600">{summaryStats.furniture}</p>
                        </div>
                        <Armchair className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Electronics</p>
                            <p className="text-2xl font-bold text-purple-600">{summaryStats.electronics}</p>
                        </div>
                        <Laptop className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Items</p>
                            <p className="text-2xl font-bold text-green-600">{summaryStats.activeItems}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <FilterBar onFilter={handleFilter} />

            {/* Table */}
            <InventoryTable
                inventory={sortedInventory}
                onEdit={handleEdit}
                onDelete={handleDelete}
                sortConfig={sortConfig}
                requestSort={requestSort}
            />

            {sortedInventory.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No items found matching your filters
                </div>
            )}

            {/* Add/Edit Modal */}
            <AddEditModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                editData={editData}
                libraries={libraries}
            />
        </div>
    );
};

export default PhysicalInventory;
