import { useState, useEffect } from "react";
import AddFormModal from "./AddFormModal";
import { apscheAllotmentsApi } from "../../../services/apiService";

const ApscheAllotments = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAllotment, setEditingAllotment] = useState(null);

  // Fetch all records directly
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await apscheAllotmentsApi.getAll();
      setRecords(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRecords();
  }, []);

  // Handle delete single record
  const handleDelete = async (id) => {
    try {
      await apscheAllotmentsApi.delete(id);
      setRecords(records.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle Excel form submit
  const handleFormSubmit = async (formData) => {
    try {
      const payload = new FormData();
      payload.append("title", formData.title); // append title
      payload.append("date", formData.date); // append date
      if (formData.file) payload.append("file", formData.file);

      let response;
      if (editingAllotment) {
        response = await apscheAllotmentsApi.update(
          editingAllotment._id,
          payload
        );
        // setRecords(records.map((r) => (r._id === editingAllotment._id ? response : r)));
      } else {
        response = await apscheAllotmentsApi.create(payload);
        // setRecords([...records, response]); // server returns full allotment
      }

      setShowAddForm(false);
      setEditingAllotment(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          APSCHE Allotments
        </h3>
        <button
          onClick={() => {
            setEditingAllotment(null);
            setShowAddForm(true);
          }}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          + Upload Excel
        </button>
      </div>

      {/* Single Table for all records */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium">SN</th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Hall Ticket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Applicant Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">Caste</th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Alloted Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records && records.length > 0 ? (
              records.map((rec, i) => (
                <tr key={rec._id || i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{i + 1}</td>
                  <td className="px-6 py-4 text-sm">{rec.hallTicket}</td>
                  <td className="px-6 py-4 text-sm">{rec.applicantName}</td>
                  <td className="px-6 py-4 text-sm">{rec.rank}</td>
                  <td className="px-6 py-4 text-sm">{rec.gender}</td>
                  <td className="px-6 py-4 text-sm">{rec.caste}</td>
                  <td className="px-6 py-4 text-sm">{rec.region}</td>
                  <td className="px-6 py-4 text-sm">{rec.allotedCategory}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => {
                        setEditingAllotment(rec);
                        setShowAddForm(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rec._id)}
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
                  colSpan="9"
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
          tabKey="apscheAllotments"
          initialData={editingAllotment}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingAllotment(null);
          }}
        />
      )}
    </div>
  );
};

export default ApscheAllotments;
