// UploadPdfForm.jsx
import React, { useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../../config/urls";

const UploadPdfForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    file: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const apiUrl = `${BASE_URL}/pdfUpload`;
  // handle text/date changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          file: "File size must be less than 2MB",
        }));
        setFormData((prev) => ({ ...prev, file: null }));
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setFormData((prev) => ({ ...prev, file }));
      setErrors((prev) => ({ ...prev, file: undefined }));
    } else {
      setFormData((prev) => ({ ...prev, file: null }));
    }
  };

  // validation
  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.file) newErrors.file = "PDF file is required.";
    else if (formData.file.type !== "application/pdf")
      newErrors.file = "Only PDF files are allowed.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("date", formData.date);
      data.append("file", formData.file);

      await axios.post(apiUrl, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("PDF uploaded successfully ✅");
      setFormData({ title: "", date: "", file: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setErrors({});
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload PDF ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-8 shadow">
      <h2 className="text-xl font-semibold text-[#525B88] mb-4">Upload PDF</h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        {/* Title + Date in row (responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2"
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
              placeholder="Enter PDF title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-gray-700 font-medium mb-2"
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
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label
            htmlFor="file"
            className="block text-gray-700 font-medium mb-2"
          >
            PDF File <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <input
              type="file"
              id="file"
              name="file"
              accept="application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500 
                         file:mr-4 file:py-2 file:px-4 
                         file:rounded file:border-0 
                         file:text-sm file:font-semibold 
                         file:bg-[#525B88] file:text-white 
                         hover:file:bg-blue-700"
            />
            {formData.file && (
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, file: null }));
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="ml-2 p-1 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
          {errors.file && (
            <p className="mt-1 text-sm text-red-500">{errors.file}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Accepted format: PDF only (Max 2MB)
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload PDF"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPdfForm;
