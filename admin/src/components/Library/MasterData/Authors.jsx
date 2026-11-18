import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Eye,
  Search,
  User,
} from "lucide-react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { showSuccessMessage, showAxiosError } from "../../../config/Toast";
import { authorsApi } from "../../../services/apiService";

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    authorCode: "",
    name: "",
    alternativeNames: "",
    nationality: "",
    bio: "",
    website: "",
    specialization: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch authors from API
  const fetchAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchQuery) {
        params.search = searchQuery;
      }
      const data = await authorsApi.getAll(params);
      setAuthors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching authors:", err);
      setError(err.message || "Failed to fetch authors");
      showAxiosError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []); // Fetch on mount

  const filteredAuthors = useMemo(() => {
    if (!searchQuery) return authors;
    return authors.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authorCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nationality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [authors, searchQuery]);

  const handleAdd = () => {
    setFormData({
      authorCode: "",
      name: "",
      alternativeNames: "",
      nationality: "",
      bio: "",
      website: "",
      specialization: "",
    });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      ...item,
      alternativeNames: Array.isArray(item.alternativeNames)
        ? item.alternativeNames.join(", ")
        : item.alternativeNames || "",
    });
    setShowEditModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this author?")) {
      try {
        setLoading(true);
        await authorsApi.delete(id);
        setAuthors(authors.filter((item) => item._id !== id));
        showSuccessMessage("Author deleted successfully");
      } catch (err) {
        console.error("Error deleting author:", err);
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
        // Create new author
        const alternativeNamesArray = formData.alternativeNames
          ? formData.alternativeNames.split(",").map((name) => name.trim()).filter((name) => name)
          : [];

        const newAuthor = await authorsApi.create({
          authorCode: formData.authorCode,
          name: formData.name,
          alternativeNames: alternativeNamesArray,
          nationality: formData.nationality || "",
          bio: formData.bio || "",
          website: formData.website || "",
          specialization: formData.specialization || "",
        });
        setAuthors([...authors, newAuthor]);
        setShowAddModal(false);
        showSuccessMessage("Author added successfully");
      } else if (showEditModal) {
        // Update existing author
        const alternativeNamesArray = formData.alternativeNames
          ? formData.alternativeNames.split(",").map((name) => name.trim()).filter((name) => name)
          : [];

        const updatedAuthor = await authorsApi.update(selectedItem._id, {
          authorCode: formData.authorCode,
          name: formData.name,
          alternativeNames: alternativeNamesArray,
          nationality: formData.nationality || "",
          bio: formData.bio || "",
          website: formData.website || "",
          specialization: formData.specialization || "",
        });
        setAuthors(
          authors.map((item) =>
            item._id === selectedItem._id ? updatedAuthor : item
          )
        );
        setShowEditModal(false);
        setSelectedItem(null);
        showSuccessMessage("Author updated successfully");
      }
        setFormData({
          authorCode: "",
          name: "",
          alternativeNames: "",
          nationality: "",
          bio: "",
          website: "",
          specialization: "",
        });
    } catch (err) {
      console.error("Error saving author:", err);
      showAxiosError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && authors.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading authors...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Authors Management
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Author
          </button>
        </div>

        <div className="flex gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search authors..."
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
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Nationality</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Specialization</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAuthors.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.authorCode}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.nationality || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.specialization || "-"}
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
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
              <p className="font-medium">Error loading authors</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={fetchAuthors}
                className="mt-2 text-sm text-red-700 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!error && filteredAuthors.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {authors.length === 0
              ? "No authors found. Click 'Add Author' to create one."
              : "No authors match your search criteria."}
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
                  {showAddModal ? "Add Author" : "Edit Author"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
        setFormData({
          authorCode: "",
          name: "",
          alternativeNames: "",
          nationality: "",
          bio: "",
          website: "",
          specialization: "",
        });
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
                        Author Code: *
                      </label>
                      <input
                        type="text"
                        value={formData.authorCode}
                        onChange={(e) =>
                          setFormData({ ...formData, authorCode: e.target.value.toUpperCase() })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                        maxLength={20}
                        placeholder="e.g., AUTH001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author Name: *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alternative Names / Pseudonyms:
                      </label>
                      <input
                        type="text"
                        value={formData.alternativeNames}
                        onChange={(e) =>
                          setFormData({ ...formData, alternativeNames: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        placeholder="Separate multiple names with commas (e.g., J.K. Rowling, Joanne Rowling)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter alternative names or pseudonyms separated by commas
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality:
                      </label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) =>
                          setFormData({ ...formData, nationality: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        placeholder="e.g., Indian, American"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization / Genre:
                      </label>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) =>
                          setFormData({ ...formData, specialization: e.target.value })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        placeholder="e.g., Computer Science, Fiction, History"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website / URL:
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Biography:
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows="4"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                        placeholder="Brief biography of the author..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
        setFormData({
          authorCode: "",
          name: "",
          alternativeNames: "",
          nationality: "",
          bio: "",
          website: "",
          specialization: "",
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
      {showViewModal && selectedItem && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-2xl border border-gray-100 rounded-xl shadow-2xl bg-white">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Author Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Author Code:</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedItem.authorCode || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Author Name:</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedItem.name}</p>
                </div>
                {selectedItem.alternativeNames && selectedItem.alternativeNames.length > 0 && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Alternative Names:
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {Array.isArray(selectedItem.alternativeNames)
                        ? selectedItem.alternativeNames.join(", ")
                        : selectedItem.alternativeNames}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Nationality:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedItem.nationality || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Specialization:</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedItem.specialization || "-"}
                  </p>
                </div>
                {selectedItem.website && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Website:</label>
                    <p className="text-sm text-gray-900 mt-1">
                      <a
                        href={selectedItem.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedItem.website}
                      </a>
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Biography:</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedItem.bio || "-"}</p>
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

export default Authors;

