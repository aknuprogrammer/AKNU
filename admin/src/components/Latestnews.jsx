import {
  CalendarIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

import React, { useState, useEffect, useRef } from "react";

import axios from "axios";
import { BASE_URL } from "../config/urls";

const Latestnews = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isImportant: false,
    date: "",
    file: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [newss, setnewss] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [news, setNews] = useState([]);
  const formRef = useRef();
  const fileInputRef = useRef();
  const samplenewss = [
    {
      id: 1,
      title: "University Open Day",
      description: "Annual open day for prospective students",
      date: "2025-11-15",
      file: "open-day.png",
    },
    {
      id: 2,
      title: "Science Symposium",
      description: "Presentations from leading researchers",
      date: "2025-12-05",
      file: "symposium.png",
    },
  ];
  const fetchNews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/news/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNews(response.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  // ✅ Initialize with sample data only once
  useEffect(() => {
    if (newss.length === 0) {
      setnewss(samplenewss);
    }
  }, [newss]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          file: "Only image files (JPG, PNG) are allowed",
        });
        return;
      }

      if (file.size > 500 * 1024) {
        setErrors({
          ...errors,
          file: "Image size must be less than 500kb",
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

    // if (!formData.title.trim()) {
    //   newErrors.title = "News title is required";
    // }

    // if (!formData.description.trim()) {
    //   newErrors.description = "Description is required";
    // }

    if (!formData.date) {
      newErrors.date = "News date is required";
    }
    if (!formData.file) {
      newErrors.file = "File is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const formPayload = new FormData();
    formPayload.append("title", formData.title);
    formPayload.append("isImportant", formData.isImportant ? "true" : "false");
    formPayload.append("description", formData.description);
    formPayload.append("date", formData.date);
    if (formData.file) {
      formPayload.append("file", formData.file);
    }
    try {
      const token = localStorage.getItem("token");
      if (editingId) {
        await axios.put(
          `${BASE_URL}/news/update-news/${editingId}`,
          formPayload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setNews(
          news.map((event) =>
            event.id === editingId
              ? { ...formData, id: editingId, file: formData.file.name }
              : event
          )
        );
        setSubmitMessage("news updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/news/create-new-news`, formPayload, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        await fetchNews();
        setSubmitMessage("News added successfully!");
      }

      // Reset form
      setFormData({
        title: "",
        isImportant: false,
        description: "",
        date: "",
        file: null,
      });
      setEditingId(null);

      // Clear message after 3 seconds
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting news:", error);
      setSubmitMessage("Failed to submit news.");
    }

    const newsData = {
      ...formData,
      id: editingId || Date.now(),
      file: formData.file ? formData.file.name : null,
    };

    if (editingId) {
      setnewss(newss.map((news) => (news.id === editingId ? newsData : news)));
      setSubmitMessage("News updated successfully!");
    } else {
      setnewss([...newss, newsData]);
      setSubmitMessage("News added successfully!");
    }

    setFormData({
      title: "",
      description: "",
      date: "",
      file: null,
    });
    setEditingId(null);

    setTimeout(() => setSubmitMessage(""), 3000);
  };

  const handleEdit = (news) => {
    setFormData({
      title: news.title,
      isImportant: news.isImportant,

      description: news.description,
      date: news.date ? news.date.split("T")[0] : "",
      file: news.file ? news.file : null,
    });
    setEditingId(news._id);
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this news?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BASE_URL}/news/delete-news/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNews((prevNews) => prevNews.filter((event) => event._id !== id));
        if (editingId === id) {
          setFormData({
            title: "",
            isImportant: false,
            description: "",
            date: "",
            file: null,
          });
          setEditingId(null);
        }
        alert("News deleted successfully.");
        await fetchNews();
      } catch (error) {
        console.error("Delete Error:", error);
        alert("Failed to delete the news.");
      }
    }
  };

  return (
    <div ref={formRef} className="max-w-5xl  mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId ? "Edit Latest news" : "Add Latest News"}
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

      {/* news Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 mb-4">
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
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
              }}
              placeholder="Enter News title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Date input */}
          <div>
            <label
              htmlFor="date"
              className="block text-gray-700 font-medium mb-1.5 text-sm sr-only"
            >
              News Date <span className="text-red-500">*</span>
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
            placeholder="Enter News description ( Max 200 Characters)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-4">
          {/* Mark as Important Checkbox */}

          {/* File Upload Section */}
          <div>
            <div className="flex items-center">
              {/* The label for file input */}
              <label className="flex flex-col items-center px-3 py-4 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                <DocumentTextIcon className="h-6 w-6 text-[#525B88] mb-1.5" />
                <span className="text-xs text-gray-600">
                  {formData.file instanceof File
                    ? formData.file.name // ✅ When uploading a new file
                    : formData.file && formData.file.fileName // ✅ When editing existing notification
                    ? formData.file.fileName
                    : "Choose a file"}
                </span>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                  ref={fileInputRef}
                />
              </label>

              {/* The "X" mark button moved here */}
              {formData.file && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, file: null });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="ml-3 p-1.5 text-red-500 hover:text-red-700"
                  title="Remove file"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Moved this paragraph outside the previous flex container but still within the file upload div */}
            <p className="mt-1 text-xs text-gray-500">
              Accepted formats: PDF, Word (DOC/DOCX), JPG, PNG (Max 500kb)
            </p>
          </div>
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

        {/* Removed redundant errors.file and Accepted formats paragraph from here */}
        {errors.file && (
          <p className="mt-1 text-sm text-red-500">{errors.file}</p>
        )}

        <div className="flex justify-end space-x-3 mt-6">
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
                Update news
              </>
            ) : (
              "Create news"
            )}
          </button>
        </div>
      </form>

      {/* newss List */}
      <div className="bg-white w-full shadow-sm rounded-lg ">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Upcoming news
          </h2>
        </div>
        <div className="overflow-y-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88]">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Document
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {news.length > 0 ? (
                  news.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {event.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.file ? (
                          <a
                            href={`${BASE_URL}/news/file/${event._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View File
                          </a>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <PencilIcon className="h-4 w-4 inline mr-1" />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4 inline mr-1" />
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
                      No news found. Create your first news!
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

export default Latestnews;
