import { useState, useEffect } from "react";
// import { otherFeesApi } from '../../../services/apiService';
import AddFormModal from "./AddFormModal";
import { otherFeesApi } from "../../../services/apiService";

const tuitionSubFees = {
  Arts: [
    { name: "Lab Fee", amount: 1000 },
    { name: "Field Work", amount: 800 },
    { name: "UDF Fee", amount: 1000 },
    { name: "Placement Fee", amount: 100 },
  ],
  MBA: [
    { name: "Lab Fee", amount: 3000 },
    { name: "Field Work", amount: 2000 },
    { name: "UDF Fee", amount: 1000 },
    { name: "Placement Fee", amount: 100 },
  ],
  Science: [
    { name: "Lab Fee", amount: 3000 },
    { name: "Field Work", amount: 2000 },
    { name: "UDF Fee", amount: 1000 },
    { name: "Placement Fee", amount: 100 },
  ],
};

const OtherFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFee, setEditingFee] = useState(null);

  // Fetch fees
  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const data = await otherFeesApi.getAll();
        setFees(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await otherFeesApi.delete(id);
      setFees(fees.filter((f) => f.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (formData) => {
    // Auto-fill tuition sub-fees if course type is selected
    if (formData.feeCategory === "Tuition" && formData.courseType) {
      formData.subFees = tuitionSubFees[formData.courseType] || [];
      formData.amount = formData.subFees.reduce(
        (sum, sf) => sum + sf.amount,
        0
      );
    }

    try {
      if (editingFee) {
        const updatedFee = await otherFeesApi.update(editingFee._id, formData);
        setFees(fees.map((f) => (f.id === editingFee.id ? updatedFee : f)));
      } else {
        const newFee = await otherFeesApi.create(formData);
        setFees([...fees, newFee]);
      }
      setShowAddForm(false);
      setEditingFee(null);
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
        <h3 className="text-xl font-semibold text-gray-800">Other Fees</h3>
        <button
          onClick={() => {
            setEditingFee(null);
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
          Add Fee
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SN
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                College
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Fee Type
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Course Type / Sub
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Frequency
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fees.length > 0 ? (
              fees.map((fee, index) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index}
                  </td>

                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.college}
                  </td> */}
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.feeCategory}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.feeCategory === "Tuition"
                      ? fee.courseType
                      : fee.subCategory || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.feeCategory === "Tuition" && fee.subFees?.length > 0
                      ? fee.subFees
                          .map((sf) => `${sf.name}: ₹${sf.amount}`)
                          .join(", ")
                      : `₹${fee.amount}`}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fee.frequency || "One-time"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingFee(fee);
                        setShowAddForm(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(fee._id)}
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
                  colSpan="7"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No other fees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddFormModal
          tabKey="otherFees"
          initialData={editingFee}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingFee(null);
          }}
        />
      )}
    </div>
  );
};

export default OtherFees;
