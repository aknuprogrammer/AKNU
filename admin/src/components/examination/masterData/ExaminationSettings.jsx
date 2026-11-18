import { useState, useEffect } from "react";
import AddFormModal from "../../admission/College_and_fees.jsx/AddFormModal";
import { datePicker } from "../../../services/apiService";
import { showSuccessMessage, showErrorMessage } from "../../../config/Toast";

const ExaminationSettings = ({ tabKey }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Using existing datePicker API (can be filtered by type if needed)
      const data = await datePicker.getAll();
      // Filter for examination-related events if there's a type field
      setEvents(data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load examination settings");
      showErrorMessage("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this examination setting?")) {
      try {
        await datePicker.delete(id);
        setEvents(events.filter((event) => event._id !== id));
        showSuccessMessage("Setting deleted successfully");
      } catch (err) {
        showErrorMessage("Failed to delete setting");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingEvent) {
        response = await datePicker.update(editingEvent._id, formData);
        setEvents(
          events.map((e) => (e._id === editingEvent._id ? response : e))
        );
        showSuccessMessage("Setting updated successfully");
      } else {
        response = await datePicker.create(formData);
        setEvents([...events, response]);
        showSuccessMessage("Setting created successfully");
      }
      await fetchEvents();
      setShowAddForm(false);
      setEditingEvent(null);
    } catch (err) {
      showErrorMessage("Failed to save setting");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Examination Settings
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Timeline and date settings for examinations 
          </p>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
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
          Add Setting
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Start Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                End Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.length > 0 ? (
              events.map((event, index) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {event.title || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.startDate && event.startTime
                      ? `${new Date(event.startDate).toLocaleDateString()} ${event.startTime}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.endDate && event.endTime
                      ? `${new Date(event.endDate).toLocaleDateString()} ${event.endTime}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {event.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setShowAddForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
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
                  colSpan="6"
                  className="px-6 py-12 text-center text-sm text-gray-500"
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-600">No examination settings found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click "Add Setting" to create one
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddFormModal
          tabKey="datePicker"
          initialData={editingEvent}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default ExaminationSettings;





