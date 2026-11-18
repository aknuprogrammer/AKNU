import { useState, useEffect } from "react";
import CommencementForm from "./CommencementForm";
import { toast } from "react-hot-toast";
import { admissionCommunicationsApi } from "../../services/apiService";

const CommencementComm = () => {
  const [communications, setCommunications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const data = await admissionCommunicationsApi.get("commencement");
      setCommunications(data);
    } catch (error) {
      console.error("Error fetching communications:", error);
      toast.error("Failed to load communications");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const data = await admissionCommunicationsApi.create({ ...formData, type: "commencement" });
      toast.success("Commencement notification sent");
      setShowAddForm(false);
      fetchCommunications();
    } catch (error) {
      toast.error(error.message || "Failed to send");
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">College Start Date & Timings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage commencement notifications and timings</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Notify Start Date
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Stream</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Commencement Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sent Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Timings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sent Count</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
            ) : communications.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No previous notifications</td></tr>
            ) : (
              communications.map((comm) => (
                <tr key={comm._id} className="hover:bg-gray-50 transition-colors">
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comm.courseId?.name || (comm.branchId ? "-" : "All")}
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {comm.branchId?.name || (comm.courseId ? "All" : "All")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(comm.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {comm.startDate ? new Date(comm.startDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comm.timings}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">{comm.sentCount} Students</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <CommencementForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default CommencementComm;
