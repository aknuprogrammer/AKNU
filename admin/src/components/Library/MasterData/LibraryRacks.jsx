import React, { useEffect, useState, useMemo } from "react";
import { Plus, Eye, Search, MapPin } from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { showSuccessMessage, showAxiosError } from "../../../config/Toast";
import { libraryInfoApi, racksApi } from "../../../services/apiService";

const LibraryRacks = () => {
  const [racks, setRacks] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLibraries, setLoadingLibraries] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    library: "",
    rackNumber: "",
    rackName: "",
    location: "",
    floor: "",
    section: "",
    capacity: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch libraries from API
  const fetchLibraries = async () => {
    try {
      setLoadingLibraries(true);
      const response = await libraryInfoApi.getAll();
      setLibraries(response || []);
    } catch (err) {
      console.error("Error fetching libraries:", err);
      showAxiosError(err);
    } finally {
      setLoadingLibraries(false);
    }
  };

  // Fetch racks from API
  const fetchRacks = async () => {
    try {
      setLoading(true);
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await racksApi.getAll(params);
      setRacks(response || []);
    } catch (err) {
      console.error("Error fetching racks:", err);
      showAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraries();
    fetchRacks();
  }, []);

  // Refetch racks when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRacks();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Note: Search is now handled server-side via API, but keeping this for client-side filtering if needed
  const filteredRacks = racks;

  const handleAdd = () => {
    setFormData({
      library: "",
      rackNumber: "",
      rackName: "",
      location: "",
      floor: "",
      section: "",
      capacity: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      library: typeof item.library === "object" ? item.library._id : item.library,
      rackNumber: item.rackNumber || "",
      rackName: item.rackName || "",
      location: item.location || "",
      floor: item.floor || "",
      section: item.section || "",
      capacity: item.capacity || "",
    });
    setShowEditModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rack?")) {
      try {
        await racksApi.delete(id);
        showSuccessMessage("Rack deleted successfully");
        fetchRacks();
      } catch (err) {
        console.error("Error deleting rack:", err);
        showAxiosError(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showAddModal) {
        await racksApi.create(formData);
        showSuccessMessage("Rack added successfully");
        setShowAddModal(false);
        fetchRacks();
      } else if (showEditModal) {
        await racksApi.update(selectedItem._id, formData);
        showSuccessMessage("Rack updated successfully");
        setShowEditModal(false);
        setSelectedItem(null);
        fetchRacks();
      }
      setFormData({
        library: "",
        rackNumber: "",
        rackName: "",
        location: "",
        floor: "",
        section: "",
        capacity: "",
      });
    } catch (err) {
      console.error("Error saving rack:", err);
      showAxiosError(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading racks...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Library Sections / Racks Management
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rack
          </button>
        </div>

        <div className="flex gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search racks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Library
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Rack Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Rack Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Floor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Section
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Capacity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRacks.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    {loading ? "Loading racks..." : "No racks found"}
                  </td>
                </tr>
              ) : (
                filteredRacks.map((item) => {
                  // Handle library - it might be populated object or just ID
                  const library =
                    typeof item.library === "object"
                      ? item.library
                      : libraries.find((lib) => lib._id === item.library);
                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {library
                          ? `${library.name} (${library.libraryCode})`
                          : "-"}
                      </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.rackNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.rackName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.location}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.floor || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.section || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.capacity || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">{showAddModal ? "Add Rack" : "Edit Rack"}</h3>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Library: *
                    </label>
                    <select
                      value={formData.library}
                      onChange={(e) =>
                        setFormData({ ...formData, library: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      required
                      disabled={loadingLibraries}
                    >
                      <option value="">
                        {loadingLibraries
                          ? "Loading libraries..."
                          : "Select a library"}
                      </option>
                      {libraries.map((library) => (
                        <option key={library._id} value={library._id}>
                          {library.name} ({library.libraryCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rack Number: *
                    </label>
                    <input
                      type="text"
                      value={formData.rackNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, rackNumber: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rack Name: *
                    </label>
                    <input
                      type="text"
                      value={formData.rackName}
                      onChange={(e) =>
                        setFormData({ ...formData, rackName: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Physical Location: *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor:
                    </label>
                    <input
                      type="text"
                      value={formData.floor}
                      onChange={(e) =>
                        setFormData({ ...formData, floor: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section:
                    </label>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) =>
                        setFormData({ ...formData, section: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity:
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]">{showAddModal ? "Add" : "Update"}</button>
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
          <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Rack Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedItem.library && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Library:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {(() => {
                        const library =
                          typeof selectedItem.library === "object"
                            ? selectedItem.library
                            : libraries.find(
                                (lib) => lib._id === selectedItem.library
                              );
                        return library
                          ? `${library.name} (${library.libraryCode})`
                          : "-";
                      })()}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Rack Number:
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedItem.rackNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Rack Name:
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedItem.rackName}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Location:
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedItem.location}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Floor:
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedItem.floor || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Section:
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedItem.section || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Capacity:
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedItem.capacity || "-"}
                  </p>
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

export default LibraryRacks;

