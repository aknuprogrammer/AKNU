import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  TrashIcon,
  PencilIcon,
  CheckIcon,
  UserIcon,
  KeyIcon,
  PhoneIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { BASE_URL } from "../config/urls";
import { showErrorMessage, showSuccessMessage } from "../config/Toast";

const FieldTracker = () => {
  // Form state
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    password: "",
    email: "",
    phoneNumber: "",
    status: "active",
    pin: "",
    confirmPin: "",
  });

  const [errors, setErrors] = useState({});
  const [fieldTrackers, setFieldTrackers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef();

  const token = localStorage.getItem("token");

  const fetchFieldTrackers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/field-tracking/field-trackers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFieldTrackers(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching field trackers:", error);
      // If API doesn't exist yet, use empty array
      setFieldTrackers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFieldTrackers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Real-time validation for specific fields
    let processedValue = value;

    // Phone number - only allow digits, max 10
    if (name === "phoneNumber") {
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // PIN and Confirm PIN - only allow digits, max 6
    if (name === "pin" || name === "confirmPin") {
      processedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    // Employee Name - allow only letters, spaces, and apostrophes
    if (name === "employeeName") {
      processedValue = value.replace(/[^a-zA-Z' ]/g, "");
    }

    // Employee ID - allow only alphanumeric and underscore
    if (name === "employeeId") {
      processedValue = value.replace(/[^a-zA-Z0-9_]/g, "");
    }

    setFormData({
      ...formData,
      [name]: processedValue,
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

    // Employee Name validation - letters, spaces, and apostrophes only
    if (!formData.employeeName.trim()) {
      newErrors.employeeName = "Employee name is required";
    } else if (!/^[a-zA-Z' ]+$/.test(formData.employeeName.trim())) {
      newErrors.employeeName =
        "Employee name can only contain letters, spaces, and apostrophes";
    } else if (formData.employeeName.trim().length < 2) {
      newErrors.employeeName =
        "Employee name must be at least 2 characters long";
    } else if (formData.employeeName.trim().length > 50) {
      newErrors.employeeName = "Employee name must be less than 50 characters";
    }

    // Employee ID validation - alphanumeric and underscore, minimum 3 characters
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.employeeId.trim())) {
      newErrors.employeeId =
        "Employee ID can only contain letters, numbers, and underscores";
    } else if (formData.employeeId.trim().length < 3) {
      newErrors.employeeId = "Employee ID must be at least 3 characters long";
    } else if (formData.employeeId.trim().length > 20) {
      newErrors.employeeId = "Employee ID must be less than 20 characters";
    }

    // Password validation - strong password with uppercase, lowercase, number, and special char
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else {
      const password = formData.password;
      if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!/[a-z]/.test(password)) {
        newErrors.password =
          "Password must contain at least one lowercase letter";
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password =
          "Password must contain at least one uppercase letter";
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!/[@#$!%*?&]/.test(password)) {
        newErrors.password =
          "Password must contain at least one special character (@, #, $, !, %, *, ?, &)";
      } else if (!/^[a-zA-Z0-9@#$!%*?&]+$/.test(password)) {
        newErrors.password =
          "Password can only contain letters, numbers, and special characters (@, #, $, !, %, *, ?, &)";
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.trim().length > 100) {
      newErrors.email = "Email must be less than 100 characters";
    }

    // Phone Number validation - exactly 10 digits
    const phoneDigits = formData.phoneNumber.replace(/\D/g, "");
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(phoneDigits)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = "Status is required";
    } else if (!["active", "inactive"].includes(formData.status)) {
      newErrors.status = "Status must be either active or inactive";
    }

    // PIN validation - 4-6 digits only
    if (!formData.pin.trim()) {
      newErrors.pin = "PIN is required";
    } else if (!/^\d{4,6}$/.test(formData.pin)) {
      newErrors.pin = "PIN must be 4-6 digits";
    }

    // Confirm PIN validation
    if (!formData.confirmPin.trim()) {
      newErrors.confirmPin = "Please confirm PIN";
    } else if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = "PINs do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      employeeName: formData.employeeName.trim(),
      employeeId: formData.employeeId.trim(),
      password: formData.password,
      email: formData.email.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      status: formData.status,
      pin: formData.pin,
    };

    try {
      if (editingId) {
        // Update existing field tracker
        console.log("243", editingId);
        await axios.put(
          `${BASE_URL}/field-tracking/field-trackers/${editingId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        showSuccessMessage("Field tracker updated successfully!");
        setSubmitMessage("Field tracker updated successfully!");
      } else {
        // Create new field tracker
        await axios.post(`${BASE_URL}/field-tracking/field-trackers`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        showSuccessMessage("Field tracker added successfully!");
        setSubmitMessage("Field tracker added successfully!");
      }
      await fetchFieldTrackers();

      // Reset form
      setFormData({
        employeeName: "",
        employeeId: "",
        password: "",
        email: "",
        phoneNumber: "",
        status: "active",
        pin: "",
        confirmPin: "",
      });
      setEditingId(null);

      // Clear message after 3 seconds
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting field tracker:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to submit field tracker.";
      showErrorMessage(errorMsg);
      setSubmitMessage(errorMsg);
    }
  };

  const handleEdit = (tracker) => {
    setFormData({
      employeeName: tracker.employeeName || "",
      employeeId: tracker.employeeId || "",
      password: "", // Don't show password in edit mode
      email: tracker.email || "",
      phoneNumber: tracker.phoneNumber || "",
      status: tracker.status || "active",
      pin: tracker.pin || "", // Show PIN in edit mode
      confirmPin: tracker.pin || "", // Pre-fill confirm PIN with existing PIN
    });
    setEditingId(tracker._id);
    formRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this field tracker?")) {
  //     try {
  //       await axios.delete(`${BASE_URL}/field-tracking/field-trackers/${id}`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       await fetchFieldTrackers();
  //       showSuccessMessage("Field tracker deleted successfully.");
  //       // If you are editing this tracker, reset the form
  //       if (editingId === id) {
  //         setFormData({
  //           employeeName: "",
  //           employeeId: "",
  //           password: "",
  //           email: "",
  //           phoneNumber: "",
  //           status: "active",
  //           pin: "",
  //           confirmPin: "",
  //         });
  //         setEditingId(null);
  //       }
  //     } catch (error) {
  //       console.error("Delete Error:", error);
  //       showErrorMessage("Failed to delete the field tracker.");
  //     }
  //   }
  // };

  return (
    <div ref={formRef} className="max-w-5xl mx-auto p-5">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        {editingId ? "Editing Field Tracker Access" : "Create Access"}
      </h1>

      {/* Success message */}
      {submitMessage && (
        <div
          className={`mb-6 p-4 border rounded ${
            submitMessage.toLowerCase().includes("success")
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          }`}
        >
          {submitMessage}
        </div>
      )}

      {/* Field Tracker Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Employee Name */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="employeeName"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                autoComplete="name"
                className={`pl-10 w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.employeeName
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="Employee Name"
              />
            </div>
            {errors.employeeName && (
              <p className="mt-1 text-sm text-red-500">{errors.employeeName}</p>
            )}
          </div>

          {/* Employee ID */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                autoComplete="username"
                className={`pl-10 w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.employeeId
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="Employee ID"
              />
            </div>
            {errors.employeeId && (
              <p className="mt-1 text-sm text-red-500">{errors.employeeId}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Email */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={`pl-10 w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="Email Address"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          {/* Password */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete={editingId ? "current-password" : "new-password"}
                className={`pl-10 w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="Password"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Phone Number */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                autoComplete="tel"
                className={`pl-10 w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.phoneNumber
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="Phone Number"
                maxLength="10"
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              autoComplete="off"
              className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.status
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-blue-200"
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* PIN */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="pin"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                autoComplete="off"
                className={`pl-10 w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.pin
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="PIN (4-6 digits)"
                maxLength="6"
              />
            </div>
            {errors.pin && (
              <p className="mt-1 text-sm text-red-500">{errors.pin}</p>
            )}
          </div>

          {/* Confirm PIN */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="confirmPin"
                name="confirmPin"
                value={formData.confirmPin}
                onChange={handleChange}
                autoComplete="off"
                className={`pl-10 w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.confirmPin
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                }`}
                placeholder="Confirm PIN"
                maxLength="6"
              />
            </div>
            {errors.confirmPin && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPin}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  employeeName: "",
                  employeeId: "",
                  password: "",
                  email: "",
                  phoneNumber: "",
                  status: "active",
                  pin: "",
                  confirmPin: "",
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
                Update
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>

      {/* Field Trackers Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">
            Field Trackers List
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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Employee Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Employee ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Phone Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {fieldTrackers.length > 0 ? (
                  fieldTrackers.map((tracker) => (
                    <tr
                      key={tracker._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {tracker.employeeName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tracker.employeeId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tracker.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tracker.phoneNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tracker.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tracker.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(tracker)}
                          className="text-[#525b88] hover:text-[#3a4166]"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {/* <button
                          onClick={() => handleDelete(tracker._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No field trackers found. Create your first field tracker!
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

export default FieldTracker;
