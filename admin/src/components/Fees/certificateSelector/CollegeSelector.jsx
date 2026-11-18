import { useState, useEffect } from "react";
import AddFormModal from "./AddFormModal";
import { collegeApi } from "../../../services/apiService";

const CollegeSelectorTable = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);

  // ✅ Extracted function to fetch colleges
  const fetchColleges = async () => {
    try {
      setLoading(true);
      const data = await collegeApi.getAll();

      setColleges(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchColleges();
  }, []);

  // ✅ Handle delete
  const handleDelete = async (id) => {
    try {
      await collegeApi.delete(id);
      await fetchColleges();
    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      if (editingCollege) {
        await collegeApi.update(editingCollege._id, formData);
      } else {
        await collegeApi.create(formData);
      }
      await fetchColleges();
      setShowAddForm(false);
      setEditingCollege(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading)
    return <div className="p-4 text-center">Loading colleges...</div>;
  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Colleges</h3>
        <button
          onClick={() => {
            setEditingCollege(null);
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
          Add College
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {colleges.length > 0 ? (
              colleges.map((college) => (
                <tr
                  key={college.sid || college._id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {college.college_code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {college.college_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {college.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {college.type || "NA"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingCollege(college);
                        setShowAddForm(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(college._id)}
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
                  colSpan="5"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddFormModal
          tabKey="collegeSelector"
          initialData={editingCollege}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingCollege(null);
          }}
        />
      )}
    </div>
  );
};

export default CollegeSelectorTable;
