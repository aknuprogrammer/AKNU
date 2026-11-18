import dayjs from "dayjs";
import React from "react";

const ProfileDetails = ({ formData, handleInputChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
        Personal Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        {/* Middle Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Middle Name
          </label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        {/* Father's Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Father's Name <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        {/* Father's Occupation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Father's Occupation
          </label>
          <input
            type="text"
            name="fatherOccupation"
            value={formData.fatherOccupation}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        {/* Father's Income */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Father's Income
          </label>
          <input
            type="text"
            name="fatherIncome"
            value={formData.fatherIncome}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault(); // block non-numeric
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        {/* Mother's Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mother's Name <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="motherName"
            value={formData.motherName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        {/* Mother's Occupation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mother's Occupation
          </label>
          <input
            type="text"
            name="motherOccupation"
            value={formData.motherOccupation}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        {/* Mother's Income */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mother's Income
          </label>
          <input
            type="text"
            name="motherIncome"
            value={formData.motherIncome}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault(); // block non-numeric
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob || ""}
            onChange={handleInputChange}
            max={dayjs().subtract(16, "year").format("YYYY-MM-DD")} // at least 16 years old
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nationality <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        {/* Caste */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="caste"
            value={formData.caste}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          >
            <option value="">Select Category</option>
            <option value="oc">OC</option>
            <option value="bc-a">BC-A</option>
            <option value="bc-b">BC-B</option>
            <option value="bc-c">BC-C</option>
            <option value="bc-d">BC-D</option>
            <option value="bc-e">BC-E</option>
            <option value="sc">SC</option>
            <option value="st">ST</option>
            <option value="obc">OBC</option>
            <option value="other">Other</option>
          </select>
        </div>
        {/* Religion */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Religion <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            name="religion"
            value={formData.religion}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          >
            <option value="">Select Religion</option>
            <option value="Hinduism">Hinduism</option>
            <option value="Islam">Islam</option>
            <option value="Christianity">Christianity</option>
            <option value="Sikhism">Sikhism</option>
            <option value="Buddhism">Buddhism</option>
            <option value="Jainism">Jainism</option>
            <option value="Zoroastrianism">Zoroastrianism (Parsis)</option>
            <option value="Judaism">Judaism</option>
            <option value="Others">Others</option>
          </select>
        </div>
        {/* Aadhar Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Aadhar Number <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            name="aadharNumber"
            value={formData.aadharNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
            maxLength="12"
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault(); // block non-numeric
              }
            }}
          />
        </div>
        {/* PAN / Apar Id */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            APAAR Id
          </label>
          <input
            type="text"
            name="aparId"
            value={formData.aparId}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault(); // block non-numeric
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            maxLength="10"
          />
        </div>
        {/* Personal Identification Marks */}
        <div className="md:col-span-3 mt-4">
          <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
            Personal Identification Marks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Mark 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mark 1 <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="personalMark1"
                value={formData.personalMark1 || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            {/* Mark 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mark 2 <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="personalMark2"
                value={formData.personalMark2 || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
