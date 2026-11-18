import React from "react";

const CounsellorForm = ({
  formData,
  errors,
  handleChange,
  handleSubmit,
  isSubmitted,
}) => {
  return (
    <div className="flex">
      <div className=" w-full bg-white rounded-2xl shadow-xl overflow-hidden mt-6">
        <div className="bg-[#525B88] py-4 px-6 ">
          <h2 className="text-xl font-bold text-white flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
           Verification Officer Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {isSubmitted && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Successfully submitted!</p>
            </div>
          )}

          <div className="flex w-full space-x-4">
            {/* Counsellor Name */}
            <div className="flex-1">
              <label
                htmlFor="counsellorName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Verification Officer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="counsellorName"
                name="counsellorName"
                value={formData.counsellorName || ""}
                onChange={handleChange}
                placeholder="Enter counsellor name"
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ${
                  errors.counsellorName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.counsellorName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.counsellorName}
                </p>
              )}
            </div>

            {/* Counsellor ID */}
            <div className="flex-1">
              <label
                htmlFor="counsellorId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Verification Officer ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="counsellorId"
                name="counsellorId"
                value={formData.counsellorId || ""}
                onChange={handleChange}
                placeholder="Enter counsellor ID"
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ${
                  errors.counsellorId ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.counsellorId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.counsellorId}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CounsellorForm;
