import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Eye,
  Filter,
  Search,
} from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { showSuccessMessage, showAxiosError } from "../../../config/Toast";
import { bookCategoriesApi } from "../../../services/apiService";

const BookCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const data = await bookCategoriesApi.getAll(params);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Failed to fetch categories");
      showAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []); // Fetch on mount

  // Refetch when filter changes (optional - can be done client-side too)
  // useEffect(() => {
  //   fetchCategories();
  // }, [filterStatus]);

  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    return filtered;
  }, [categories, searchQuery, filterStatus]);

  const handleAdd = () => {
    setFormData({ name: "", description: "", code: "" });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      code: item.code || "",
    });
    setShowEditModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        setLoading(true);
        await bookCategoriesApi.delete(id);
        setCategories(categories.filter((item) => item._id !== id));
        showSuccessMessage("Category deleted successfully");
      } catch (err) {
        console.error("Error deleting category:", err);
        showAxiosError(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (showAddModal) {
        // Create new category
        const newCategory = await bookCategoriesApi.create({
          code: formData.code,
          name: formData.name,
          description: formData.description || "",
          status: "active",
        });
        setCategories([...categories, newCategory]);
        setShowAddModal(false);
        showSuccessMessage("Category added successfully");
      } else if (showEditModal) {
        // Update existing category
        const updatedCategory = await bookCategoriesApi.update(selectedItem._id, {
          code: formData.code,
          name: formData.name,
          description: formData.description || "",
        });
        setCategories(
          categories.map((item) =>
            item._id === selectedItem._id ? updatedCategory : item
          )
        );
        setShowEditModal(false);
        setSelectedItem(null);
        showSuccessMessage("Category updated successfully");
      }
      setFormData({ name: "", description: "", code: "" });
    } catch (err) {
      console.error("Error saving category:", err);
      showAxiosError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading categories...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Book Categories Management
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.code}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {item.description || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status || "active"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(item)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="View"
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
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
              <p className="font-medium">Error loading categories</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={fetchCategories}
                className="mt-2 text-sm text-red-700 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!error && filteredCategories.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {categories.length === 0
              ? "No categories found. Click 'Add Category' to create one."
              : "No categories match your search criteria."}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  {showAddModal ? "Add Category" : "Edit Category"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setFormData({ name: "", description: "", code: "" });
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Code: *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      required
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name: *
                    </label>
                    <input
                      type="text"
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
                      Description:
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows="3"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setFormData({ name: "", description: "", code: "" });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? showAddModal
                          ? "Adding..."
                          : "Updating..."
                        : showAddModal
                        ? "Add"
                        : "Update"}
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
                  Category Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Category Code:
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedItem.code}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Category Name:
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedItem.name}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Description:
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedItem.description || "-"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Status:
                      </label>
                      <span
                        className={`px-2 py-1 rounded-full text-xs mt-1 inline-block ${
                          selectedItem.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedItem.status || "active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default BookCategories;

