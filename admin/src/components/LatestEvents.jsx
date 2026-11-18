import { useRef, useState, useEffect } from "react";
import {
  CalendarIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { BASE_URL } from "../config/urls";

const LatestEvents = () => {
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    isImportant: false,
    description: "",
    date: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const formRef = useRef();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/event/`);
      setEvents(response.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => setSubmitMessage(""), 2000);
      return () => clearTimeout(timer);
    }
    const token = localStorage.getItem("token");
  }, [submitMessage]);

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
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          file: "Only JPEG, PNG, or PDF files are allowed",
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
    const eventErrors = {};

    if (!formData.title.trim()) {
      eventErrors.title = "Event title is required";
    }

    if (!formData.location.trim()) {
      eventErrors.location = "Location is required";
    }

    if (!formData.description.trim()) {
      eventErrors.description = "Description is required";
    }

    if (!formData.date) {
      eventErrors.date = "Event date is required";
    }
    // if (!formData.file) {
    //   eventErrors.file = "File is required";
    // }
    setErrors(eventErrors);
    return Object.keys(eventErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formPayload = new FormData();
    formPayload.append("title", formData.title);
    formPayload.append("isImportant", formData.isImportant);
    formPayload.append("location", formData.location);
    formPayload.append("description", formData.description);
    formPayload.append("date", formData.date);
    // if (formData.file) {
    //   formPayload.append("file", formData.file);
    // }

    const token = localStorage.getItem("token");

    try {
      if (editingId) {
        // Update existing event
        await axios.put(
          `${BASE_URL}/event/update-event/${editingId}`,
          formPayload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSubmitMessage("Event updated successfully!");
      } else {
        // Create new event
        await axios.post(`${BASE_URL}/event/create-new-event`, formPayload, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        setSubmitMessage("Event added successfully!");
      }

      // Reset form and refresh events
      setFormData({
        title: "",
        isImportant: false,
        location: "",
        description: "",
        date: "",
        file: null,
      });
      setEditingId(null);
      await fetchEvents();
    } catch (error) {
      console.error("Error submitting Event:", error);
      setSubmitMessage("Failed to submit Event. Please try again.");
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      location: event.location,
      description: event.description,
      isImportant: event.isImportant,
      date: event.date ? event.date.split("T")[0] : "",
      // file: event.file ? event.file : null,
    });
    setEditingId(event._id);
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BASE_URL}/event/delete-event/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        await fetchEvents();
        setSubmitMessage("Event deleted successfully!");
      } catch (error) {
        console.error("Delete Error:", error);
        setSubmitMessage("Failed to delete the event.");
      }
    }
  };

  return (
    <div ref={formRef} className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId ? "Edit Event" : "Create New Event"}
      </h1>

      {submitMessage && (
        <div
          className={`mb-6 p-4 border rounded ${
            submitMessage.includes("success")
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
        >
          {submitMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white  rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Title input */}
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
              placeholder="Event title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Event Date Input */}
          <div>
            <label
              htmlFor="date"
              className="block text-gray-700 font-medium mb-1.5 text-sm sr-only"
            >
              Event Date <span className="text-red-500">*</span>
            </label>
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
          {/* Description textarea */}
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.description
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            maxLength={200}
            placeholder="Event description ( Max 200 Characters)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 items-center">
          {/* Location input */}
          <div>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.location
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Event location"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Mark as Important Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="important"
              checked={formData.isImportant}
              onChange={() =>
                setFormData({ ...formData, isImportant: !formData.isImportant })
              }
              className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="important"
              className="text-gray-700 ml-1 font-medium cursor-pointer text-sm"
            >
              Mark as Important
            </label>
          </div>
        </div>

        {/* File Upload Section - now on its own row */}
        {/* <div className="mb-4">
          <label
            htmlFor="file"
            className="block text-gray-700 font-medium mb-1.5 text-sm sr-only"
          >
            Event Document
          </label>
          <div className="flex items-center w-full">
            <label className="flex flex-col items-center px-3 py-4 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 w-full max-w-[150px]">
              <DocumentTextIcon className="h-6 w-6 text-[#525B88] mb-1.5" />
              <span className="text-xs text-gray-600">
                {formData.file instanceof File
                  ? formData.file.name
                  : formData.file?.fileName || "Choose a file"}
              </span>
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
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
            Accepted formats: JPG, PNG, PDF (Max 100kb)
          </p>
        </div> */}

        <div className="flex justify-end space-x-3 mt-6">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: "",
                  location: "",
                  description: "",
                  date: "",
                  // file: null,
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
            className="px-5 py-1.5 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center text-sm"
          >
            {editingId ? (
              <>
                <CheckIcon className="h-4 w-4 inline mr-1.5" />
                Update Event
              </>
            ) : (
              "Create Event"
            )}
          </button>
        </div>
      </form>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Upcoming Events
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Document
                  </th> */}
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.length > 0 ? (
                  events.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.file ? (
                          <a
                            href={`${BASE_URL}/event/file/${event._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View File
                          </a>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4 inline" />
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
                      No events found. Create your first event!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestEvents;
