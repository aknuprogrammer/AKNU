// UploadResultForm.jsx
import React, { useRef } from "react";

const UploadResultForm = ({
  formData,
  setFormData,
  errors,
  loading,
  handleSubmit,
  handleChange,
  handleFileChange,
}) => {
  const formRef = useRef(null);
  const fileInputRef = useRef(null);

  return (
    <div className="bg-white rounded-lg p-6 mb-8 shadow">
      <h2 className="text-xl font-semibold text-[#525B88] mb-4">
        Upload New Result
      </h2>

      <form ref={formRef} onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-gray-700 font-medium mb-2"
          >
            Result Title <span className="text-red-500">*</span>
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
            placeholder="Enter result title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Level Radio */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Level <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-6">
            {["ug", "pg", "other"].map((level) => (
              <label key={level} className="inline-flex items-center">
                <input
                  type="radio"
                  name="level"
                  value={level}
                  checked={formData.level === level}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2">{level.toUpperCase()}</span>
              </label>
            ))}
          </div>
          {errors.level && (
            <p className="mt-1 text-sm text-red-500">{errors.level}</p>
          )}
        </div>

        {/* Type Radio */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Result Type <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="regular"
                checked={formData.type === "regular"}
                onChange={handleChange}
                className="form-radio"
              />
              <span className="ml-2">Regular</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="rv"
                checked={formData.type === "rv"}
                onChange={handleChange}
                className="form-radio"
              />
              <span className="ml-2">RV (Revaluation)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="rANDb"
                checked={formData.type === "rANDb"}
                onChange={handleChange}
                className="form-radio"
              />
              <span className="ml-2">Regular & Backlog</span>
            </label>
          </div>
          {errors.type && (
            <p className="mt-1 text-sm text-red-500">{errors.type}</p>
          )}
        </div>

        {/* Date */}
        <div className="mb-6">
          <label
            htmlFor="date"
            className="block text-gray-700 font-medium mb-2"
          >
            Result Date <span className="text-red-500">*</span>
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

        {/* File Upload */}
        <div className="mb-6">
          <label
            htmlFor="file"
            className="block text-gray-700 font-medium mb-2"
          >
            Result File (XLSX / CSV) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center">
            <input
              type="file"
              id="file"
              name="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#525B88] file:text-white hover:file:bg-blue-700"
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
            Accepted formats: XLSX, XLS, CSV (Unlimited size)
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading.upload}
          >
            {loading.upload ? "Uploading..." : "Upload Result"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadResultForm;
