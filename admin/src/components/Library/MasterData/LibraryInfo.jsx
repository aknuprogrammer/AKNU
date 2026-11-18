import React, { useEffect, useState, useMemo } from "react";
import { Plus, Eye, Search } from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { showSuccessMessage, showAxiosError } from "../../../config/Toast";
import { libraryInfoApi } from "../../../services/apiService";

const LibraryInfo = () => {
  const [libraryInfo, setLibraryInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    libraryCode: "",
    name: "",
    establishedYear: "",
    libraryType: "",
    description: "",
    address: "",
    openingTime: "",
    closingTime: "",
    headLibrarianName: "",
    headLibrarianContact: "",
    headLibrarianEmail: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const libraryTypes = ["School", "College", "University", "Public", "Private"];

  // Fetch library info from API
  const fetchLibraryInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await libraryInfoApi.getAll({ search: searchQuery });
      setLibraryInfo(response);
    } catch (err) {
      setError("Failed to fetch library information");
      showAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryInfo();
  }, []);

  // Filter library info based on search query
  const filteredLibraryInfo = useMemo(() => {
    if (!searchQuery) return libraryInfo;
    return libraryInfo.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.libraryCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [libraryInfo, searchQuery]);

  const handleAdd = () => {
    setFormData({
      libraryCode: "",
      name: "",
      establishedYear: "",
      libraryType: "",
      description: "",
      address: "",
      openingTime: "",
      closingTime: "",
      headLibrarianName: "",
      headLibrarianContact: "",
      headLibrarianEmail: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      ...item,
      establishedYear: item.establishedYear ? String(item.establishedYear) : "",
    });
    setShowEditModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this library information?")) {
      try {
        setLoading(true);
        await libraryInfoApi.delete(id);
        setLibraryInfo(libraryInfo.filter((item) => item._id !== id));
        showSuccessMessage("Library information deleted successfully");
      } catch (err) {
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
        // Create new library info
        const newLibraryInfo = await libraryInfoApi.create({
          libraryCode: formData.libraryCode,
          name: formData.name,
          establishedYear: formData.establishedYear
            ? parseInt(formData.establishedYear)
            : null,
          libraryType: formData.libraryType,
          description: formData.description || "",
          address: formData.address || "",
          openingTime: formData.openingTime || "",
          closingTime: formData.closingTime || "",
          headLibrarianName: formData.headLibrarianName || "",
          headLibrarianContact: formData.headLibrarianContact || "",
          headLibrarianEmail: formData.headLibrarianEmail || "",
        });
        setLibraryInfo([...libraryInfo, newLibraryInfo]);
        setShowAddModal(false);
        showSuccessMessage("Library information added successfully");
      } else if (showEditModal) {
        // Update existing library info
        const updatedLibraryInfo = await libraryInfoApi.update(selectedItem._id, {
          libraryCode: formData.libraryCode,
          name: formData.name,
          establishedYear: formData.establishedYear
            ? parseInt(formData.establishedYear)
            : null,
          libraryType: formData.libraryType,
          description: formData.description || "",
          address: formData.address || "",
          openingTime: formData.openingTime || "",
          closingTime: formData.closingTime || "",
          headLibrarianName: formData.headLibrarianName || "",
          headLibrarianContact: formData.headLibrarianContact || "",
          headLibrarianEmail: formData.headLibrarianEmail || "",
        });
        setLibraryInfo(
          libraryInfo.map((item) =>
            item._id === selectedItem._id ? updatedLibraryInfo : item
          )
        );
        setShowEditModal(false);
        setSelectedItem(null);
        showSuccessMessage("Library information updated successfully");
      }
      setFormData({
        libraryCode: "",
        name: "",
        establishedYear: "",
        libraryType: "",
        description: "",
        address: "",
        openingTime: "",
        closingTime: "",
        headLibrarianName: "",
        headLibrarianContact: "",
        headLibrarianEmail: "",
      });
    } catch (err) {
      showAxiosError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && libraryInfo.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading library information...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Library Information
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Library Information
          </button>
        </div>

        <div className="flex gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search library information..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

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
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Established Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Head Librarian
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLibraryInfo.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No library information found
                  </td>
                </tr>
              ) : (
                filteredLibraryInfo.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.libraryCode}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.libraryType}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.establishedYear || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.headLibrarianName || "-"}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  {showAddModal ? "Add Library Information" : "Edit Library Information"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setFormData({
                      libraryCode: "",
                      name: "",
                      establishedYear: "",
                      libraryType: "",
                      description: "",
                      address: "",
                      openingTime: "",
                      closingTime: "",
                      headLibrarianName: "",
                      headLibrarianContact: "",
                      headLibrarianEmail: "",
                    });
                  }}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Basic Information */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Library Code: *
                        </label>
                        <input
                          type="text"
                          value={formData.libraryCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              libraryCode: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                          required
                          maxLength={50}
                          placeholder="e.g., LIB001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Library Name: *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                          required
                          maxLength={150}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Library Type: *
                        </label>
                        <select
                          value={formData.libraryType}
                          onChange={(e) =>
                            setFormData({ ...formData, libraryType: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                          required
                        >
                          <option value="">Select Type</option>
                          {libraryTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Established Year:
                        </label>
                        <input
                          type="number"
                          value={formData.establishedYear}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              establishedYear: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                          min="1000"
                          max={new Date().getFullYear()}
                          placeholder="e.g., 1990"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address & Description */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">
                      Address & Description
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address:
                        </label>
                        <textarea
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          rows="3"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                          placeholder="Complete address..."
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
                          placeholder="About the library..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">
                      Operating Hours
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Opening Time:
                        </label>
                        <input
                          type="time"
                          value={formData.openingTime}
                          onChange={(e) =>
                            setFormData({ ...formData, openingTime: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Closing Time:
                        </label>
                        <input
                          type="time"
                          value={formData.closingTime}
                          onChange={(e) =>
                            setFormData({ ...formData, closingTime: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Authority Details */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">
                      Authority Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Head Librarian Name:
                        </label>
                        <input
                          type="text"
                          value={formData.headLibrarianName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              headLibrarianName: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Head Librarian Contact:
                        </label>
                        <input
                          type="text"
                          value={formData.headLibrarianContact}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              headLibrarianContact: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                          maxLength={20}
                          placeholder="Phone number"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Head Librarian Email:
                        </label>
                        <input
                          type="email"
                          value={formData.headLibrarianEmail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              headLibrarianEmail: e.target.value.toLowerCase(),
                            })
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                          maxLength={100}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setFormData({
                          libraryCode: "",
                          name: "",
                          establishedYear: "",
                          libraryType: "",
                          description: "",
                          address: "",
                          openingTime: "",
                          closingTime: "",
                          headLibrarianName: "",
                          headLibrarianContact: "",
                          headLibrarianEmail: "",
                        });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
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
      {showViewModal && selectedItem &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
            <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
              <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <h3 className="text-lg font-semibold text-white">
                  Library Information Details
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 border-b pb-2">
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Library Code:
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedItem.libraryCode || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Library Name:
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedItem.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Library Type:
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedItem.libraryType || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Established Year:
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedItem.establishedYear || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address & Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 border-b pb-2">
                      Address & Description
                    </h4>
                    <div className="space-y-4">
                      {selectedItem.address && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Address:
                          </label>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedItem.address}
                          </p>
                        </div>
                      )}
                      {selectedItem.description && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Description:
                          </label>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedItem.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operating Hours */}
                  {(selectedItem.openingTime || selectedItem.closingTime) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-4 border-b pb-2">
                        Operating Hours
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Opening Time:
                          </label>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedItem.openingTime || "-"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Closing Time:
                          </label>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedItem.closingTime || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Authority Details */}
                  {(selectedItem.headLibrarianName ||
                    selectedItem.headLibrarianContact ||
                    selectedItem.headLibrarianEmail) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-4 border-b pb-2">
                        Authority Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedItem.headLibrarianName && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Head Librarian Name:
                            </label>
                            <p className="text-sm text-gray-900 mt-1">
                              {selectedItem.headLibrarianName}
                            </p>
                          </div>
                        )}
                        {selectedItem.headLibrarianContact && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              Head Librarian Contact:
                            </label>
                            <p className="text-sm text-gray-900 mt-1">
                              {selectedItem.headLibrarianContact}
                            </p>
                          </div>
                        )}
                        {selectedItem.headLibrarianEmail && (
                          <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">
                              Head Librarian Email:
                            </label>
                            <p className="text-sm text-gray-900 mt-1">
                              {selectedItem.headLibrarianEmail}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default LibraryInfo;

