import { useEffect, useRef, useState } from "react";

import axios from "axios";
import {
  CalendarIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { BASE_URL } from "../config/urls";

const Notifications = () => {
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    file: null,
  });

  const [errors, setErrors] = useState({});
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const formRef = useRef();

  const token = localStorage.getItem("token");

  // Sample initial data
  const sampleEvents = [
    {
      id: 1,
      title: "University Open Day",
      description: "Annual open day for prospective students",
      date: "2023-11-15",
      file: "open-day.pdf",
    },
    {
      id: 2,
      title: "Science Symposium",
      description: "Presentations from leading researchers",
      date: "2023-12-05",
      file: "symposium.pdf",
    },
  ];

  // Initialize with sample data if empty
  if (events.length === 0) {
    setEvents(sampleEvents);
  }

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`, // 👈 Proper placement bro!
        },
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          file: "Only PDF, Word, or image files are allowed",
        });
        return;
      }

      // Validate file size (500KB max)
      if (file.size > 500 * 1024) {
        setErrors({
          ...errors,
          file: "File size must be less than 500kb",
        });
        return;
      }

      setFormData({
        ...formData,
        file,
      });
      setErrors({
        ...errors,
        file: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date) {
      newErrors.date = "Event date is required";
    }
    if (!formData.file) {
      newErrors.file = "File is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formPayload = new FormData();
    formPayload.append("title", formData.title);
    formPayload.append("description", formData.description);
    formPayload.append("date", formData.date);
    if (formData.file) {
      formPayload.append("file", formData.file);
    }

    try {
      if (editingId) {
        // Update existing event
        await axios.put(
          `${BASE_URL}/notifications/update-notification/${editingId}`,
          formPayload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setSubmitMessage("notification updated successfully!");
      } else {
        // Create new event
        await axios.post(
          `${BASE_URL}/notifications/create-new-notification`,
          formPayload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setSubmitMessage("Notification added successfully!");
      }
      await fetchNotifications();

      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        file: null,
      });
      setEditingId(null);

      // Clear message after 3 seconds
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting event:", error);
      setSubmitMessage("Failed to submit event.");
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date ? event.date.split("T")[0] : "",
      file: event.file ? event.file : null, // Store the full file object directly
    });
    setEditingId(event._id); // Make sure you're using Mongo's _id
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        // Call backend API to delete
        await axios.delete(
          `${BASE_URL}/notifications/delete-notification/${id}`
        );
        await fetchNotifications();

        // Remove from frontend state
        setEvents(events.filter((event) => event._id !== id));

        // If you are editing this event, reset the form
        if (editingId === id) {
          setFormData({
            title: "",
            description: "",
            date: "",
            file: null,
          });
          setEditingId(null);
        }

        alert("Notification deleted successfully.");
      } catch (error) {
        console.error("Delete Error:", error);
        alert("Failed to delete the notification.");
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div ref={formRef} className="max-w-5xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId ? "Edit Notification" : "Create New Notification"}
      </h1>

      {/* Success message */}
      {submitMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {submitMessage}
        </div>
      )}

      {/* Event Form */}
      <form onSubmit={handleSubmit} className="bg-white  rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Title and Date in the same row on larger screens */}
          <div>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.title
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              // onInput={(e) => {
              //   e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
              // }}
              placeholder="Notification title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                
                className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.date
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.description
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            
            placeholder="Notification description ( Max 200 characters )"
            maxLength={200}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="file"
            className="block text-gray-700 font-medium mb-1.5 text-sm"
          >
            Notification Document (PDF, Word, or Image)
          </label>

          <div className="flex items-center">
            <label className="flex flex-col items-center px-3 py-3 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 text-[#525B88] mb-1" />
              <span className="text-xs text-gray-600">
                {formData.file instanceof File
                  ? formData.file.name
                  : formData.file && formData.file.fileName
                  ? formData.file.fileName
                  : "Choose a file"}
              </span>
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>

            {formData.file && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, file: null })}
                className="ml-3 p-1.5 text-red-500 hover:text-red-700"
                title="Remove file"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {errors.file && (
            <p className="mt-1 text-sm text-red-500">{errors.file}</p>
          )}

          <p className="mt-1 text-xs text-gray-500">
            Accepted formats: PDF, Word (DOC/DOCX), JPG, PNG (Max 500kb)
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: "",
                  description: "",
                  date: "",
                  file: null,
                });
                setEditingId(null);
                setErrors({});
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-1.5 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
          >
            {editingId ? (
              <>
                <CheckIcon className="h-4 w-4 inline mr-1.5" />
                Update Notification
              </>
            ) : (
              "Create Notification"
            )}
          </button>
        </div>
      </form>

      {/* Notifications Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Upcoming Notifications
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88]">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/5"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-2/5"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-1/6"
                >
                  Document
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider w-1/10"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {notifications.length > 0 ? (
                notifications.map((event) => (
                  <tr
                    key={event._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {event.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="line-clamp-2">{event.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event.file ? (
                        <a
                          href={`${BASE_URL}/notifications/file/${event._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#525b88] hover:text-[#3a4166] font-medium"
                        >
                          View File
                        </a>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-[#525b88] hover:text-[#3a4166]"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
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
                    No notifications found. Create your first notification!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
