import React, { useEffect, useState, useMemo } from "react";
import { Plus, Eye, Search, FlaskConical } from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../../config/Toast";
import { labTypesApi } from "../../../services/apiService";

const LabTypes = () => {
  const [labTypes, setLabTypes] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Fetch lab types from API
  useEffect(() => {
    const fetchLabTypes = async () => {
      try {
        setLoading(true);
        const response = await labTypesApi.getAll({ status: "Active" });

        // Handle different response formats
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
        showAxiosError(error);
        setLabTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLabTypes();
  }, []);

  const filteredLabTypes = useMemo(() => {
    if (!searchQuery.trim()) {
      return labTypes;
    }

    const query = searchQuery.toLowerCase().trim();
    return labTypes.filter((item) => {
      const code = (item.code || "").toLowerCase();
      const name = (item.name || "").toLowerCase();
      const description = (item.description || "").toLowerCase();
      const status = (item.status || "").toLowerCase();

      return (
        code.includes(query) ||
        name.includes(query) ||
        description.includes(query) ||
        status.includes(query)
      );
    });
  }, [labTypes, searchQuery]);

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
    if (window.confirm("Are you sure you want to delete this lab type?")) {
      try {
        await labTypesApi.delete(id);
        setLabTypes(labTypes.filter((item) => item._id !== id));
        showSuccessMessage("Lab type deleted successfully");
      } catch (error) {
        console.error("Error deleting lab type:", error);
        showAxiosError(error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showAddModal) {
        const response = await labTypesApi.create({
          code: formData.code,
          name: formData.name,
          description: formData.description,
          status: "Active",
        });

        const newItem = Array.isArray(response)
          ? response
          : response.data || response;
        setLabTypes([...labTypes, newItem]);
        setShowAddModal(false);
        showSuccessMessage("Lab type added successfully");
      } else if (showEditModal && selectedItem) {
        const response = await labTypesApi.update(selectedItem._id, {
          code: formData.code,
          name: formData.name,
          description: formData.description,
        });

        const updatedItem = Array.isArray(response)
          ? response[0]
          : response.data || response;
        setLabTypes(
          labTypes.map((item) =>
            item._id === selectedItem._id ? updatedItem : item
          )
        );
        setShowEditModal(false);
        setSelectedItem(null);
        showSuccessMessage("Lab type updated successfully");
      }
      setFormData({ name: "", description: "", code: "" });
    } catch (error) {
      console.error("Error saving lab type:", error);
      showAxiosError(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading lab types...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Lab Types
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lab Type
          </button>
        </div>

        {/* Search Input - Above Table */}
        <div className="mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search lab types by code, name, description, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88] placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Description
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
              {filteredLabTypes.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No lab types found
                  </td>
                </tr>
              ) : (
                filteredLabTypes.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.code}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {item.status}
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
      </div>

      {/* Add Modal */}
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  Add Lab Type
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
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
                    Description
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
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
                  >
                    Add Lab Type
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Edit Modal */}
      {showEditModal &&
        selectedItem &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  Edit Lab Type
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
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
                    Description
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
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
                  >
                    Update Lab Type
                  </button>
                </div>
              </form>
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
                  Lab Type Details
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
                      Code:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedItem.code}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Name:
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
                      {selectedItem.description}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Status:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {selectedItem.status}
                      </span>
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

export default LabTypes;
