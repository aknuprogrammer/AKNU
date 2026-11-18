import React, { useState, useEffect } from "react";
import { API, BASE_URL } from "../../config/urls";

const NotificationsCirculars = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [viewingNotification, setViewingNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    feePaymentStartDate: "",
    feeSubmissionLastDate: "",
    extendedLastDate: "",
    examinationRules: "",
    specialInstructions: "",
    pdfFile: null,
    status: "Draft",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Only show loader on initial load when there's no data
      if (initialLoading && notifications.length === 0) {
        setInitialLoading(true);
      }
      setError("");
      const response = await API.get("/notifications");
      if (response.data.success && response.data.data) {
        setNotifications(response.data.data);
      } else {
        setError("Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      if (initialLoading) {
        setInitialLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        pdfFile: file,
      }));
    }
  };

  const handleSubmit = async (e, saveAsDraft = false) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append(
        "description",
        formData.examinationRules || formData.specialInstructions || ""
      );
      formDataToSend.append(
        "date",
        formData.feePaymentStartDate || new Date().toISOString()
      );

      if (formData.pdfFile) {
        formDataToSend.append("file", formData.pdfFile);
      }

      let response;
      if (editingNotification) {
        // Update existing notification
        if (!formData.pdfFile && !editingNotification.file) {
          setError("Please upload a file");
          setLoading(false);
          return;
        }
        response = await API.put(
          `/notifications/update-notification/${editingNotification._id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Create new notification
        if (!formData.pdfFile) {
          setError("Please upload a file");
          setLoading(false);
          return;
        }
        response = await API.post(
          "/notifications/create-new-notification",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.data.success) {
        // Refresh notifications list
        await fetchNotifications();
        // Reset form
        setFormData({
          title: "",
          feePaymentStartDate: "",
          feeSubmissionLastDate: "",
          extendedLastDate: "",
          examinationRules: "",
          specialInstructions: "",
          pdfFile: null,
          status: "Draft",
        });
        setShowForm(false);
        setEditingNotification(null);
      } else {
        setError("Failed to save notification");
      }
    } catch (err) {
      console.error("Error saving notification:", err);
      setError(err.message || "Failed to save notification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to publish this notification? It will be visible to all students."
      )
    ) {
      try {
        setLoading(true);
        // Note: The API doesn't have a separate publish endpoint, so we'll just refresh
        // In a real scenario, you might want to add a publish field to the update
        await fetchNotifications();
      } catch (err) {
        console.error("Error publishing notification:", err);
        setError("Failed to publish notification");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title || "",
      feePaymentStartDate: notification.date
        ? new Date(notification.date).toISOString().split("T")[0]
        : "",
      feeSubmissionLastDate: "",
      extendedLastDate: "",
      examinationRules: notification.description || "",
      specialInstructions: "",
      pdfFile: null,
      status: "Draft",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        setLoading(true);
        setError("");
        const response = await notificationsApi.delete(id);
        if (response.success) {
          await fetchNotifications();
        } else {
          setError("Failed to delete notification");
        }
      } catch (err) {
        console.error("Error deleting notification:", err);
        setError("Failed to delete notification. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (notification) => {
    setViewingNotification(notification);
  };

  const filteredNotifications = notifications.filter((notification) =>
    notification.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Examination Notifications
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage announcements and downloadable PDF documents visible to all
            students
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
        <button
          onClick={() => {
            setShowForm(true);
            setEditingNotification(null);
            setFormData({
              title: "",
              feePaymentStartDate: "",
              feeSubmissionLastDate: "",
              extendedLastDate: "",
              examinationRules: "",
              specialInstructions: "",
              pdfFile: null,
              status: "Draft",
            });
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
          Create New Notification
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Published Notifications</h3>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm w-64"
            />
          </div>
        </div>

        <div className="p-6">
          {initialLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-8 w-8 text-gray-400 mb-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-gray-600">No notifications found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click "Create New Notification" to add one
                </p>
              </div>
            </div>
          ) : (
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
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      PDF Document
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNotifications.map((notification, index) => (
                    <tr
                      key={notification._id || notification.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {notification.title || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-md truncate">
                          {notification.description || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(notification.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.file?.fileName ? (
                          <a
                            href={`${BASE_URL}/notifications/file/${notification._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 font-medium underline"
                          >
                            {notification.file.fileName}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(notification)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="View"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(notification)}
                            className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(notification._id || notification.id)
                            }
                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Notification Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {editingNotification
                  ? "Edit Notification"
                  : "Create New Notification"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingNotification(null);
                }}
                className="text-gray-500 hover:text-gray-700"
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Examination Schedule - Semester End Exams"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="feePaymentStartDate"
                  value={formData.feePaymentStartDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Examination Rules and Guidelines
                </label>
                <textarea
                  name="examinationRules"
                  value={formData.examinationRules}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter examination rules, guidelines, and instructions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions from University/College
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter any special instructions or important announcements..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload PDF Document{" "}
                  {!editingNotification && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  {formData.pdfFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {formData.pdfFile.name} (
                      {(formData.pdfFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum file size: 10MB. Only PDF files are allowed.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNotification(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Saving..."
                    : editingNotification
                    ? "Update Notification"
                    : "Save Notification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Notification Modal */}
      {viewingNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">
                View Notification
              </h3>
              <button
                onClick={() => setViewingNotification(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[180px]">
                      Notification Title:
                    </label>
                    <p className="text-sm text-gray-900">
                      {viewingNotification.title || "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[180px]">
                      Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(viewingNotification.date)}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[180px] pt-0.5">
                      Description:
                    </label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                      {viewingNotification.description || "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[180px]">
                      PDF Document:
                    </label>
                    {viewingNotification.file?.fileName ? (
                      <a
                        href={`${BASE_URL}/notifications/file/${viewingNotification._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 font-medium underline"
                      >
                        {viewingNotification.file.fileName}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-900">-</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setViewingNotification(null)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsCirculars;
