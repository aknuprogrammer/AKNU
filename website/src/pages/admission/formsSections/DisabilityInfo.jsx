import React, { useState } from "react";

const DisabilityInfo = ({ formData, handleInputChange, handleFileUpload }) => {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      handleFileUpload("disabilityCertificate", file);
    }
  };

  return (
    <div className="">
      {/* <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
        Disability Information
      </h3> */}

      <div className="">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Do you have any disability?{" "}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center">
            <input
              type="radio"
              id="disabilityYes"
              name="hasDisability"
              value="yes"
              checked={formData.hasDisability === "yes"}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              required
            />
            <label
              htmlFor="disabilityYes"
              className="ml-2 text-sm text-gray-700"
            >
              Yes
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="disabilityNo"
              name="hasDisability"
              value="no"
              checked={formData.hasDisability === "no"}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label
              htmlFor="disabilityNo"
              className="ml-2 text-sm text-gray-700"
            >
              No
            </label>
          </div>
        </div>
      </div>

      {formData.hasDisability === "yes" && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Disability Certificate Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disability Certificate{" "}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required={formData.hasDisability === "yes"}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {fileName || "PDF, JPG or PNG up to 10MB"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisabilityInfo;
