import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config/urls";
import axios from "axios";
import { getUserFromToken } from "../../ProtectedRoute";

const RegisterAdmission = () => {
  const userObject = getUserFromToken();
  const user = userObject.user;
  const token = localStorage.getItem("token");

  // State for all course data and filtered options
  const [allCourses, setAllCourses] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState({
    departments: [],
    branches: [],
    courses: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: user.fullName || "",
    email: user.email || "",
    phone: user.phone || "",
    dob: "",
    previousCollege: "",
    marks: "",
    campus: user.campus || "",
    branch: user.branch || "",
    department: user.department || "",
    course: "",
    documents: {
      marksheet: false,
      memo: false,
      idProof: false,
      photos: false,
    },
    paymentMode: "online",
    upiId: "",
    // Add missing fields from your form
    gender: "",
    nationality: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    qualification: "",
    completionYear: "",
    hasScholarship: "",
    scholarshipAmount: "",
    scholarshipProvider: "",
  });

  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAdmissionOptions = async () => {
    try {
      setOptionsLoading(true);
      const response = await axios.get(`${BASE_URL}/admission-fees/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Store all course data
      const coursesData = response.data.data || [];
      setAllCourses(coursesData);

      // Get unique campuses
      const campuses = [
        ...new Set(Array.isArray(coursesData) ? coursesData.map((item) => item.campus) : []),
      ].filter(Boolean);

      // Set initial filtered options based on user's campus (if available)
      updateFilteredOptions(user.campus || "");
    } catch (error) {
      console.error("Error fetching admission options:", error);
      setAllCourses([]);
      setFilteredOptions({
        departments: [],
        branches: [],
        courses: [],
      });
    } finally {
      setOptionsLoading(false);
    }
  };

  // Function to update filtered options based on selected campus
  const updateFilteredOptions = (campus, department) => {
    if (!campus) {
      setFilteredOptions({
        departments: [],
        branches: [],
        courses: [],
      });
      return;
    }

    // Filter courses by campus
    const campusCourses = Array.isArray(allCourses) 
      ? allCourses.filter((course) => course.campus === campus)
      : [];

    // Get unique departments
    const departments = [
      ...new Set(campusCourses.map((item) => item.programType)),
    ].filter(Boolean);

    // Get unique branches
    let branches = [];
    if (department) {
      // Filter courses by both campus and department
      const deptCourses = campusCourses.filter(course => course.programType === department);
      branches = [...new Set(deptCourses.map(item => item.specialization))].filter(Boolean);
    } else {
      // If no department selected, show all branches for the campus
      branches = [...new Set(campusCourses.map(item => item.specialization))].filter(Boolean);
    }

    // Get course names
    const courses = campusCourses.map((item) => item.name).filter(Boolean);

    setFilteredOptions({
      departments,
      branches,
      courses,
    });
  };

  useEffect(() => {
    fetchAdmissionOptions();
  }, []);

  useEffect(() => {
    // Pre-select the user's data on component mount
    setFormData((prev) => ({
      ...prev,
      campus: user.campus || "",
      branch: user.branch || "",
      department: user.department || "",
    }));

    // Update filtered options if user has a campus
    if (user.campus) {
      updateFilteredOptions(user.campus, user.department);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [name]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // When campus changes, update the filtered options
      if (name == "campus") {
        updateFilteredOptions(value, formData.department);

        // Reset dependent fields
        setFormData((prev) => ({
          ...prev,
          department: "",
          branch: "",
          course: "",
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMessage("Admission form submitted successfully!");
      setLoading(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    }, 1500);
  };

  const handlePayment = () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      alert("Redirecting to payment gateway...");
      // After payment success
      setShowReceipt(true);
      setLoading(false);
    }, 1500);
  };

  // Get unique campuses for the campus dropdown
  const campuses = [...new Set(Array.isArray(allCourses) ? allCourses.map((item) => item.campus) : [])].filter(
    Boolean
  );

  return (
    <div className="p-6 border-t">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Institutional Details */}
        <div>
          <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
            Institutional Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campus *
              </label>
              {optionsLoading ? (
                <div>Loading campuses...</div>
              ) : (
                <select
                  name="campus"
                  value={formData.campus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="">Select Campus</option>
                  {campuses.map((campus) => (
                    <option key={campus} value={campus}>
                      {campus.charAt(0).toUpperCase() + campus.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              {optionsLoading ? (
                <div>Loading departments...</div>
              ) : (
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                  disabled={!formData.campus}
                >
                  <option value="">Select Department</option>
                  {Array.isArray(filteredOptions.departments) && filteredOptions.departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept.charAt(0).toUpperCase() + dept.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Applying For *
              </label>
              {optionsLoading ? (
                <div>Loading branches...</div>
              ) : (
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                  disabled={!formData.campus}
                >
                  <option value="">Select Branch</option>
                  {Array.isArray(filteredOptions.branches) && filteredOptions.branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch.charAt(0).toUpperCase() + branch.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationality *
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
          </div>
        </div>

        {/* Address Details */}
        <div>
          <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
            Address Details
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows="3"
                required
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div>
          <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
            Academic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous College/University *
              </label>
              <input
                type="text"
                name="previousCollege"
                value={formData.previousCollege}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification *
              </label>
              <select
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              >
                <option value="">Select Qualification</option>
                <option value="high_school">High School</option>
                <option value="diploma">Diploma</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year of Completion *
              </label>
              <input
                type="number"
                name="completionYear"
                value={formData.completionYear}
                onChange={handleInputChange}
                min="1950"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marks Obtained (%) *
              </label>
              <input
                type="number"
                name="marks"
                value={formData.marks}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>
          </div>
        </div>

        {/* Scholarship Section */}
        <div>
          <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
            Scholarship Information
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do you have a scholarship? *
            </label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="scholarshipYes"
                  name="hasScholarship"
                  value="yes"
                  checked={formData.hasScholarship === "yes"}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600"
                  required
                />
                <label htmlFor="scholarshipYes" className="ml-2 text-gray-700">
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="scholarshipNo"
                  name="hasScholarship"
                  value="no"
                  checked={formData.hasScholarship === "no"}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600"
                />
                <label htmlFor="scholarshipNo" className="ml-2 text-gray-700">
                  No
                </label>
              </div>
            </div>
          </div>

          {formData.hasScholarship === "yes" && (
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scholarship Amount (₹) *
                </label>
                <input
                  type="number"
                  name="scholarshipAmount"
                  value={formData.scholarshipAmount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required={formData.hasScholarship === "yes"}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scholarship Provider *
                </label>
                <input
                  type="text"
                  name="scholarshipProvider"
                  value={formData.scholarshipProvider}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required={formData.hasScholarship === "yes"}
                />
              </div>
            </div>
          )}
        </div>

        {/* Document Checklist */}
        <div>
          <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
            Document Checklist
          </h3>
          <p className="text-gray-600 mb-4">
            Check the documents that have been submitted:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="marksheet"
                name="marksheet"
                checked={formData.documents.marksheet}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 rounded"
                required
              />
              <label htmlFor="marksheet" className="ml-2 text-gray-700">
                Mark Sheets *
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="memo"
                name="memo"
                checked={formData.documents.memo}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <label htmlFor="memo" className="ml-2 text-gray-700">
                Memo
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="idProof"
                name="idProof"
                checked={formData.documents.idProof}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 rounded"
                required
              />
              <label htmlFor="idProof" className="ml-2 text-gray-700">
                ID Proof *
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="photos"
                name="photos"
                checked={formData.documents.photos}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 rounded"
                required
              />
              <label htmlFor="photos" className="ml-2 text-gray-700">
                Photos *
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="transferCertificate"
                name="transferCertificate"
                checked={formData.documents.transferCertificate}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <label
                htmlFor="transferCertificate"
                className="ml-2 text-gray-700"
              >
                Transfer Certificate
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="characterCertificate"
                name="characterCertificate"
                checked={formData.documents.characterCertificate}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <label
                htmlFor="characterCertificate"
                className="ml-2 text-gray-700"
              >
                Character Certificate
              </label>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div>
          <h3 className="text-lg font-medium text-[#525B88] mb-4 border-b pb-2">
            Payment Details
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Mode *
            </label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="online"
                  name="paymentMode"
                  value="online"
                  checked={formData.paymentMode === "online"}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600"
                  required
                />
                <label htmlFor="online" className="ml-2 text-gray-700">
                  Online
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="upi"
                  name="paymentMode"
                  value="upi"
                  checked={formData.paymentMode === "upi"}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600"
                />
                <label htmlFor="upi" className="ml-2 text-gray-700">
                  UPI
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="offline"
                  name="paymentMode"
                  value="offline"
                  checked={formData.paymentMode === "offline"}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600"
                />
                <label htmlFor="offline" className="ml-2 text-gray-700">
                  Offline
                </label>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          {formData.paymentMode === "online" && (
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <p className="text-gray-700 mb-3">
                We'll send a payment link to your email. Clicking the link will
                redirect you to payment apps.
              </p>
              <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className="bg-[#525B88] hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Send Payment Link"}
              </button>
            </div>
          )}

          {formData.paymentMode === "upi" && (
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UPI ID
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  placeholder="yourname@upi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className="bg-[#525B88] hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Proceed to Pay"}
              </button>
            </div>
          )}

          {formData.paymentMode === "offline" && (
            <div className="p-4 bg-blue-50 rounded-lg mb-4">
              <p className="text-gray-700 mb-3">
                Visit the college administration office to complete your
                payment.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#525B88] hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading || optionsLoading}
            className="bg-[#525B88] hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterAdmission;
