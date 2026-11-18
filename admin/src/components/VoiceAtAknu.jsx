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

const VoiceAtAknu = () => {
  // Form state
  const [formData, setFormData] = useState({
    Name: "",
    branch: "",
    city: "",
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
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/voices-at-aknu/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVoices(response.data.data || []);
    } catch (error) {
      console.error("Error fetching voices:", error);
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

    if (!formData.Name.trim()) {
      newErrors.Name = "Student Name is required";
    }
    if (!formData.branch.trim()) {
      newErrors.branch = "Student branch is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Student city is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else if (new Date(formData.date) < new Date()) {
      newErrors.date = "Date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (editingId) {
        // Update existing voice
        await axios.put(
          `${BASE_URL}/voices-at-aknu/update-new-voice/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmitMessage("Voice updated successfully!");
      } else {
        // Create new voice
        await axios.post(
          `${BASE_URL}/voices-at-aknu/create-new-voice`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmitMessage("Voice added successfully!");
      }

      // Refresh the list
      await fetchVoices();

      // Reset form
      setFormData({
        Name: "",
        branch: "",
        city: "",
        description: "",
        date: "",
      });
      setEditingId(null);

      // Clear message after 3 seconds
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting voice:", error);
      setSubmitMessage("Failed to submit voice. Please try again.");
      setTimeout(() => setSubmitMessage(""), 3000);
    }
  };

  const handleEdit = (voice) => {
    setFormData({
      Name: voice.Name,
      branch: voice.branch,
      city: voice.city,
      description: voice.description,
      date: voice.date ? voice.date.split("T")[0] : "",
    });
    setEditingId(voice._id); // Assuming the ID field is _id from API
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this voice?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${BASE_URL}/voices-at-aknu/delete-new-voice/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmitMessage("Voice deleted successfully!");
        await fetchVoices();
        setTimeout(() => setSubmitMessage(""), 3000);
      } catch (error) {
        console.error("Error deleting voice:", error);
        setSubmitMessage("Failed to delete voice.");
        setTimeout(() => setSubmitMessage(""), 3000);
      }
    }
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div ref={formRef} className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId ? "Edit Voice" : "Create New Voice"}
      </h1>

      {/* Success/Error message */}
      {submitMessage && (
        <div
          className={`mb-6 p-4 border rounded ${
            submitMessage.toLowerCase().includes("fail")
              ? "bg-red-100 border-red-400 text-red-700"
              : "bg-green-100 border-green-400 text-green-700"
          }`}
        >
          {submitMessage}
        </div>
      )}

      {/* Voice Form */}
      <form onSubmit={handleSubmit} className="bg-white  rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Student Name */}
          <div>
            <input
              type="text"
              id="Name"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.Name
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
              }}
              placeholder="Enter Student Name"
            />
            {errors.Name && (
              <p className="mt-1 text-sm text-red-500">{errors.Name}</p>
            )}
          </div>

          {/* Branch */}
          <div>
            <input
              type="text"
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.branch
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
              }}
              placeholder="Enter branch Name"
            />
            {errors.branch && (
              <p className="mt-1 text-sm text-red-500">{errors.branch}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          {/* Description */}
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full h-20 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.description
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:ring-blue-200"
            }`}
            maxLength={200}
            placeholder="Enter description ( Max 200 Characters)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* City */}
          <div>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.city
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
              placeholder="Enter City (example: city,country)"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-gray-700 font-medium mb-2 sr-only"
            >
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
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
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  sName: "",
                  branch: "",
                  city: "",
                  description: "",
                  date: "",
                });
                setEditingId(null);
                setErrors({});
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {editingId ? (
              <>
                <CheckIcon className="h-5 w-5 inline mr-2" />
                Update Voice
              </>
            ) : (
              "Create New Voice"
            )}
          </button>
        </div>
      </form>

      {/* Voices List */}
      <div className="bg-white w-full shadow-md rounded-lg">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Student Voices
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {voices.length > 0 ? (
                voices.map((voice) => (
                  <tr key={voice._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {voice.Name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {voice.branch}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {voice.city}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="line-clamp-2">{voice.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(voice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(voice)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(voice._id)}
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
                    No voices found. Create your first voice!
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

export default VoiceAtAknu;
