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
import { Import } from "lucide-react";

const ImportantDates = () => {
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    color: "#000000",
    program: "ug",
    description: "",
    date: "",
  });

  const [errors, setErrors] = useState({});
  const [voices, setVoices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const formRef = useRef();

  // Fetch voices on component mount
  useEffect(() => {
    fetchImportantDates();
  }, []);

  // Fetch important dates
  const fetchImportantDates = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/important-dates/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVoices(response.data.data || []);
    } catch (error) {
      console.error("Error fetching important dates:", error);
      setVoices([]);
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.color) {
      newErrors.color = "Color is required";
    }
    if (!formData.program) {
      newErrors.program = "Program is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else if (new Date(formData.date) < new Date(new Date().toDateString())) {
      newErrors.date = "Date must be in the future";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const token = localStorage.getItem("token");
      if (editingId) {
        // Update existing important date
        await axios.put(`${BASE_URL}/important-dates/${editingId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubmitMessage("Important date updated successfully!");
      } else {
        // Create new important date
        await axios.post(`${BASE_URL}/important-dates/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubmitMessage("Important date added successfully!");
      }
      // Refresh the list
      await fetchImportantDates();
      // Reset form
      setFormData({
        title: "",
        color: "#000000",
        program: "ug",
        description: "",
        date: "",
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error submitting important date:", error);
      setSubmitMessage("Failed to submit important date. Please try again.");
    }
  };

  const handleEdit = (date) => {
    setFormData({
      title: date.title,
      color: date.color,
      program: date.program,
      description: date.description,
      date: date.date ? date.date.split("T")[0] : "",
    });
    setEditingId(date._id);
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this important date?")
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BASE_URL}/important-dates/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubmitMessage("Important date deleted successfully!");
        await fetchImportantDates();
      } catch (error) {
        console.error("Error deleting important date:", error);
        setSubmitMessage("Failed to delete important date.");
      }
    }
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => setSubmitMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [submitMessage]);

  return (
    <div ref={formRef} className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId ? "Edit Important Date" : "Create New Important Date"}
      </h1>

      {/* Success message */}
      {submitMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {submitMessage}
        </div>
      )}

      {/* Important Date Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 mb-8">
        {/* First row: Title and Color */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.title
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
              }}
              placeholder="Enter title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>
          {/* Color */}
          <div className="space-y-2">
            <label
              htmlFor="color"
              className="block text-sm font-medium text-gray-700"
            >
              Select Color <span className="text-red-500">*</span>
            </label>
            <div className="flex items-start gap-4">
              <div className="relative">
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className={`w-12 h-12 cursor-pointer border-2 rounded-lg shadow-sm ${
                    errors.color
                      ? "border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                  title="Choose your color"
                  style={{ backgroundColor: formData.color }}
                />
                {errors.color && (
                  <p className="absolute mt-1 text-xs text-red-500">
                    {errors.color}
                  </p>
                )}
              </div>
              <div className="flex flex-col justify-center gap-1">
                <span className="text-sm text-gray-700">Selected Color:</span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full border border-gray-200"
                    style={{ backgroundColor: formData.color }}
                  ></span>
                  <span className="text-xs font-mono text-gray-600">
                    {formData.color.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second row: Program (radio buttons) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Program <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="program"
                value="ug"
                checked={formData.program === "ug"}
                onChange={handleChange}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">UG</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="program"
                value="pg"
                checked={formData.program === "pg"}
                onChange={handleChange}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">PG</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="program"
                value="others"
                checked={formData.program === "others"}
                onChange={handleChange}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">Others</span>
            </label>
          </div>
          {errors.program && (
            <p className="mt-1 text-sm text-red-500">{errors.program}</p>
          )}
        </div>

        {/* Third row: Description */}
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.description
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            maxLength={200}
            placeholder="Enter description ( Max 200 Characters)"
            rows={3}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Fourth row: Date */}
        <div className="mb-6">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.date
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date}</p>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: "",
                  color: "#000000",
                  program: "ug",
                  description: "",
                  date: "",
                });
                setEditingId(null);
                setErrors({});
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {editingId ? "Update Important Date" : "Create Important Date"}
          </button>
        </div>
      </form>

      {/* Important Dates List */}
      <div className="bg-white w-full shadow-md rounded-lg">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Important Dates
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {voices.length > 0 ? (
                voices.map((date) => (
                  <tr key={date._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {date.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {date.program && date.program.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className="inline-block w-6 h-6 rounded-full border border-gray-300 align-middle mr-2"
                        style={{ backgroundColor: date.color }}
                      ></span>
                      <span className="text-xs font-mono text-gray-600">
                        {date.color && date.color.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(date.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {date.description}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(date)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(date._id)}
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
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No important dates found. Create your first important date!
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

export default ImportantDates;
