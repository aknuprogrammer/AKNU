import { useState, useEffect } from "react";
import AddFormModal from "./AddFormModal";
import { certificateChecklistApi } from "../../../services/apiService";

const CertificateCheckList = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch certificate checklists
  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        setLoading(true);
        const data = await certificateChecklistApi.getAll();
        setChecklists(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklists();
  }, []);

  // Filter checklists based on search term
  const filteredChecklists = checklists.filter((checklist) =>
    checklist.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await certificateChecklistApi.delete(id);
      // Refetch the data to ensure UI is in sync with backend
      const data = await certificateChecklistApi.getAll();
      setChecklists(data);
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
      setDeleteConfirm(null);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      if (editingChecklist) {
        const updatedChecklist = await certificateChecklistApi.update(
          editingChecklist._id,
          formData
        );
        setChecklists(
          checklists.map((c) =>
            c._id === editingChecklist._id ? updatedChecklist : c
          )
        );
      } else {
        // Create new checklist and then refetch all data
        await certificateChecklistApi.create(formData);
        // Refetch all checklists to ensure UI is in sync with backend
        const data = await certificateChecklistApi.getAll();
        setChecklists(data);
      }
      setShowAddForm(false);
      setEditingChecklist(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = (checklist) => {
    setDeleteConfirm({
      id: checklist._id,
      title: checklist.title,
    });
  };

  // Handle check/uncheck
  const handleCheckToggle = async (checklist) => {
    try {
      const updatedChecklist = await certificateChecklistApi.update(
        checklist._id,
        { check: !checklist.check } // toggle
      );

      // Update state locally
      setChecklists((prev) =>
        prev.map((c) =>
          c._id === checklist._id ? { ...c, check: updatedChecklist.check } : c
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Certificate Checklist
        </h3>
        <button
          onClick={() => {
            setEditingChecklist(null);
            setShowAddForm(true);
          }}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Item
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Required
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Check
              </th>

              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredChecklists.length > 0 ? (
              filteredChecklists.map((checklist, index) => (
                <tr key={checklist._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {checklist.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        checklist.required
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {checklist.required ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={checklist.check || false}
                      onChange={() => handleCheckToggle(checklist)}
                      className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingChecklist(checklist);
                        setShowAddForm(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(checklist)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-600">No checklist items found</p>
                    {searchTerm && (
                      <p className="text-sm text-gray-500 mt-1">
                        Try adjusting your search terms
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-md border border-gray-100 rounded-xl shadow-2xl bg-white">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-red-600 to-red-500">
              <h3 className="text-lg font-semibold text-white">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 text-center mb-2">
                  Delete Checklist Item?
                </h4>
                <p className="text-gray-600 text-center">
                  Are you sure you want to delete the checklist item{" "}
                  <strong>"{deleteConfirm.title}"</strong>? This action cannot
                  be undone.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 p-6 border-t border-gray-100">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="px-5 py-2.5 transition-all text-white rounded-lg shadow-md shadow-red-100 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <AddFormModal
          tabKey="certificateChecklist"
          initialData={editingChecklist}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingChecklist(null);
          }}
        />
      )}
    </div>
  );
};

export default CertificateCheckList;
