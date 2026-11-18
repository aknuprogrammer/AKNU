import React, { useState } from "react";
import axios from "axios";
import { BackButton } from "../components/BackButton";
import {
  MapPin,
  Calendar,
  CheckCircle,
  FileText,
  BarChart3,
  Database,
  Shield,
  Users,
  Clock,
  FileCheck,
  TrendingUp,
  FileX,
  Download,
  X,
} from "lucide-react";

export default function FieldTracker() {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [credentials, setCredentials] = useState({
    phoneNumber: "",
    pin: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    phoneNumber: "",
    pin: "",
  });

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
    setError("");
    setSuccess("");
    setCredentials({ phoneNumber: "", pin: "" });
    setFieldErrors({ phoneNumber: "", pin: "" });
  };

  const handleCloseModal = () => {
    setShowDownloadModal(false);
    setError("");
    setSuccess("");
    setCredentials({ phoneNumber: "", pin: "" });
    setFieldErrors({ phoneNumber: "", pin: "" });
  };

  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber.trim()) {
      return "Phone number is required";
    }
    if (!/^\d{10}$/.test(phoneNumber.trim())) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const validatePin = (pin) => {
    if (!pin.trim()) {
      return "PIN is required";
    }
    if (!/^\d{6}$/.test(pin)) {
      return "PIN must be exactly 6 numbers";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For PIN, only allow numbers and limit to 6 digits
    // For phoneNumber, only allow numbers and limit to 10 digits
    let processedValue = value;
    if (name === "pin") {
      processedValue = value.replace(/\D/g, "").slice(0, 6);
    } else if (name === "phoneNumber") {
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setCredentials((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear general error and success messages
    setError("");
    setSuccess("");

    // Validate field and set field-specific error
    let fieldError = "";
    if (name === "phoneNumber") {
      fieldError = validatePhoneNumber(processedValue);
    } else if (name === "pin") {
      fieldError = validatePin(processedValue);
    }

    setFieldErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsDownloading(true);

    // Validate inputs
    const phoneNumberError = validatePhoneNumber(credentials.phoneNumber);
    const pinError = validatePin(credentials.pin);

    setFieldErrors({
      phoneNumber: phoneNumberError,
      pin: pinError,
    });

    if (phoneNumberError || pinError) {
      setIsDownloading(false);
      return;
    }

    try {
      // Verify credentials with backend API
      // NOTE: This endpoint should NOT require authentication middleware
      // since we're verifying public credentials (phone number and PIN).
      // Backend route should be: router.post("/verify-credentials", verifyCredentials);
      // Remove authenticationMiddleware from this route for public access.
      const verifyResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}api/field-tracking/verify-credentials`,
        {
          phoneNumber: credentials.phoneNumber.trim(),
          pin: credentials.pin.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(verifyResponse.data);

      const verifyData = verifyResponse.data;

      // Check if response has data (indicating successful verification)
      if (!verifyData || !verifyData.data) {
        setError(
          verifyData?.message ||
            "Invalid Phone Number or PIN. Please try again."
        );
        setSuccess("");
        setIsDownloading(false);
        return;
      }

      // Check if status is active
      if (verifyData.data.status !== "active") {
        setError(
          "Your account is not active. Please contact support for assistance."
        );
        setSuccess("");
        setIsDownloading(false);
        return;
      }

      // If credentials are valid and status is active, show success message
      setSuccess(verifyData.message || "Verification successful");
      setError("");

      // Proceed with download
      // Use download URL from backend if available, otherwise fallback to default APK
      let downloadUrl =
        verifyData.data.downloadUrl ||
        verifyData.data.apkUrl ||
        verifyData.data.fileUrl;

      if (!downloadUrl) {
        // Fallback to default APK if no URL in backend
        const apkModule = await import(
          "../assets/APK/application-0b2187bc-996d-4756-974b-c6b1ee8ea47f.apk?url"
        );
        downloadUrl = apkModule.default;
      }

      // Fetch the file as blob to ensure proper download
      const fileResponse = await fetch(downloadUrl);
      if (!fileResponse.ok) {
        throw new Error("Failed to fetch APK file");
      }

      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);

      // Get filename from backend or use default
      const fileName =
        verifyData.data.fileName ||
        verifyData.data.apkFileName ||
        "FieldTracker.apk";

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      window.URL.revokeObjectURL(url);

      // Reset downloading state
      setIsDownloading(false);

      // Close modal after successful download
      setTimeout(() => {
        handleCloseModal();
      }, 500);
    } catch (err) {
      console.error("Error downloading APK:", err);
      setSuccess("");
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          "Invalid Phone Number or PIN. Please try again.";
        setError(errorMessage);
      } else if (err.request) {
        // The request was made but no response was received
        setError("Network error. Please check your connection and try again.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(
          "Failed to download APK. Please try again or contact support."
        );
      }
      setIsDownloading(false);
    }
  };
  const features = [
    {
      icon: <Calendar size={24} />,
      title: "Visit Planning & Assignment",
      description:
        "Create and assign field visits with location, date, and purpose details.",
    },
    {
      icon: <MapPin size={24} />,
      title: "GPS-based Check-in/Check-out",
      description:
        "Ensure accurate attendance and visit verification through location tracking.",
    },
    {
      icon: <FileText size={24} />,
      title: "Report Submission",
      description:
        "Allow staff to upload visit reports, images, and remarks directly on the platform.",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Dashboard Monitoring",
      description:
        "Admins can view real-time visit status, progress, and summaries.",
    },
    {
      icon: <Database size={24} />,
      title: "Data Management",
      description:
        "Automatically maintain a digital record of all visits for future reference and reports.",
    },
  ];

  const benefits = [
    {
      icon: <Shield size={24} />,
      title: "Highly Secure",
      description:
        "Protects all visit data with verified logins and controlled access.",
    },
    {
      icon: <Users size={24} />,
      title: "Improved Accountability",
      description:
        "Tracks staff movement and visit completion with real-time visibility.",
    },
    {
      icon: <Clock size={24} />,
      title: "Operational Efficiency",
      description:
        "Automates scheduling, attendance, and reporting to save time and effort.",
    },
    {
      icon: <FileCheck size={24} />,
      title: "Data Transparency",
      description:
        "Maintains accurate digital records for audits and performance analysis.",
    },
    {
      icon: <Users size={24} />,
      title: "Enhanced Coordination",
      description:
        "Strengthens communication between staff and administration.",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Performance Insights",
      description:
        "Provides detailed analytics and reports to evaluate field activities.",
    },
    {
      icon: <FileX size={24} />,
      title: "Paperless Management",
      description:
        "Reduces manual documentation through a fully digital workflow.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-16 py-8">
        <BackButton />

        {/* Main Heading */}
        {/* <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-800 pb-2 sm:pb-3">
          Field Visit Tracker
        </h1> */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-800">
            Overview of the Application
          </h2>
          <button
            onClick={handleDownloadClick}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors duration-200 text-sm sm:text-base font-medium shadow-md hover:shadow-lg"
          >
            <Download size={18} />
            <span>Download APK</span>
          </button>
        </div>
        {/* Overview Section */}
        <div className="bg-white p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <p className="text-sm sm:text-base md:text-md text-gray-700 leading-relaxed text-[16px] text-justify">
            The Field Visit Tracker provides a secure and smart way for
            colleges/ universities to plan, monitor, and record academic or
            industrial visits in real time. Integrated with GPS-based tracking
            and map coordinates, it ensures accurate location verification and
            transparent reporting. Staff can check in/out at designated sites,
            upload photos, notes, and documents, and maintain complete visit
            logs within the app.
          </p>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-teal-700 mb-4 sm:mb-6">
            Features of the Product
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-teal-100 hover:border-teal-300 transition-colors duration-300"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 text-teal-700 mt-1">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-[16px] text-justify">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-teal-700 mb-4 sm:mb-6">
            Benefits of the Product
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-teal-100 hover:border-teal-300 transition-colors duration-300"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 text-teal-700 mt-1">
                    {benefit.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-[16px] text-justify">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download APK Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg md:rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6 relative">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            {/* Modal Header */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-teal-700 mb-2">
                Download Field Tracker APK
              </h3>
              <p className="text-sm sm:text-base text-gray-600 text-[16px] text-justify">
                Please enter your Phone Number and PIN to download the
                application.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleDownload} className="space-y-4">
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={credentials.phoneNumber}
                  onChange={handleInputChange}
                  maxLength={10}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base ${
                    fieldErrors.phoneNumber
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter Phone Number (10 digits)"
                  required
                />
                {fieldErrors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.phoneNumber}
                  </p>
                )}
                {!fieldErrors.phoneNumber && credentials.phoneNumber && (
                  <p className="mt-1 text-xs text-gray-500">
                    {credentials.phoneNumber.length < 10
                      ? `${10 - credentials.phoneNumber.length} more digit${10 - credentials.phoneNumber.length === 1 ? "" : "s"} needed`
                      : "✓ Phone number is valid"}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  PIN
                </label>
                <input
                  type="password"
                  id="pin"
                  name="pin"
                  value={credentials.pin}
                  onChange={handleInputChange}
                  maxLength={6}
                  autoComplete="current-password"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base ${
                    fieldErrors.pin
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter PIN (6 digits)"
                  required
                />
                {fieldErrors.pin && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.pin}</p>
                )}
                {!fieldErrors.pin && credentials.pin && (
                  <p className="mt-1 text-xs text-gray-500">
                    {credentials.pin.length < 6
                      ? `${6 - credentials.pin.length} more digit${6 - credentials.pin.length === 1 ? "" : "s"} needed`
                      : "✓ PIN is valid"}
                  </p>
                )}
              </div>

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDownloading}
                  className="flex-1 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Note about forgotten PIN */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                <span className="font-semibold text-teal-700">Note!</span>{" "}
                <span className="italic">
                  If you forgot the PIN, please contact the Administration.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
