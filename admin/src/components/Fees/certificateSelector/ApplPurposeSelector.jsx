import { useState, useEffect } from 'react';
import { applicationPurposeApi } from '../../../services/apiService';
import AddFormModal from './AddFormModal';

const ApplicationPurpose = () => {
  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState(null);

  // Fetch application purposes
  useEffect(() => {
    const fetchPurposes = async () => {
      try {
        setLoading(true);
        const data = await applicationPurposeApi.getAll();
        setPurposes(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPurposes();
  }, []);

  // Handle delete
  const handleDelete = async (_id) => {
    try {
      await applicationPurposeApi.delete(_id);
      setPurposes(purposes.filter(purpose => purpose._id !== _id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    try {
      if (editingPurpose) {
        const updatedPurpose = await applicationPurposeApi.update(editingPurpose._id, formData);
        setPurposes(purposes.map(p => 
          p._id === editingPurpose._id ? updatedPurpose : p
        ));
      } else {
        const newPurpose = await applicationPurposeApi.create(formData);
        setPurposes([...purposes, newPurpose]);
      }
      setShowAddForm(false);
      setEditingPurpose(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading purposes...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Application Purposes</h3>
        <button
          onClick={() => {
            setEditingPurpose(null);
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
          New Purpose
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Purpose Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Belated Fee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Revised Rate Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Required Docs
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purposes.length > 0 ? (
              purposes.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.purpose_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.fee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.belated_fee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.revised_rate_year}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.required_docs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => {
                        setEditingPurpose(item);
                        setShowAddForm(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-900 mr-3"
                    >
                      Edit
                    </button>
                  
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddFormModal
          tabKey="applicationPurpose"
          initialData={editingPurpose}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingPurpose(null);
          }}
        />
      )}
    </div>
  );
};

export default ApplicationPurpose;