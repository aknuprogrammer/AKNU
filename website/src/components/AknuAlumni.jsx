import React, { useEffect, useState } from "react";
import { Handshake } from "lucide-react";
import { Users, Globe, Award } from "lucide-react";
import { aknuNewLogo, allumni1, memory1, memory2, memory3, memory4, memory5, memory6 } from "../assets";
import RAM_7473 from "../assets/allumni/RAM_7473.JPG";
import RAM_7571 from "../assets/allumni/RAM_7571.JPG";
import RAM_7575 from "../assets/allumni/RAM_7575.JPG";
import RAM_7669 from "../assets/allumni/RAM_7669.JPG";
import RAM_7932 from "../assets/allumni/RAM_7932.JPG";
import ReCAPTCHA from "react-google-recaptcha";
import { BackButton } from "./BackButton";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import AlumniDonationForm from "../forms/AlumniDonationForm";
import AlumniLoginForm from "../forms/AlumniLoginForm";
import ForgotPassword from "../forms/ForgotPassword";
import HashModal from "./HashModal";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import AlumniTextSphere from "../sections/page_alumni_profile/AlumniTextSphere";
import KnowYourAlmamater from "../sections/page_alumni_profile/KnowYourAlumni";
import AlumniAmbassadors from "../sections/page_alumni_profile/AlumniAmbassadors";
import ParticipationSection from "../sections/page_alumni_profile/ParticipationSection";
import PastEventsSection from "../sections/page_alumni_profile/PastEventsSection";
import CelebrateAlumni from "../sections/page_alumni_profile/CelebrateALumni";
import TimelineSection from "../sections/page_alumni_profile/TimeLineSection";
import VolunteerSection from "../sections/page_alumni_profile/VolunteerSection";
import ConnectWithUs from "../sections/page_alumni_profile/ConnectWithUs";
import HostEventSection from "../sections/page_alumni_profile/HostEvent";

const AknuAlumni = () => {
  const [showForm, setShowForm] = useState(false);
  const currentYear = new Date().getFullYear();
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const navigate = useNavigate();
  const [isRegNoExists, setIsRegNoExists] = useState("NONE");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Read the token from cookie
    const token = Cookies.get("alumni_token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (showForm) {
      // Store the current scroll position
      const scrollY = window.scrollY;

      // Lock the scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      // Cleanup function to restore scroll
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [showForm]);

  // Only show pass out years from 2006 to current year
  const passOutYears = Array.from(
    { length: currentYear - 2006 + 1 },
    (_, i) => 2006 + i
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    passOutYear: currentYear,
    branch: "",
    email: "",
    currentOccupation: "",
    // New fields
    college: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    photo: null,
    photoPreview: "",
    description: "",
    currentDesignation: "",
    currentCompany: "",
    highestQualification: "",
    terms: false,
    // NEW FIELDS
    reg_no: "",
    username: "",
    password: "",
    password_confirm: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    password: "",
    password_confirm: "",
  });

  // Validation functions
  const validateUsername = (username) => {
    if (!username) {
      return "Username is required";
    }
    if (username.length < 8) {
      return "Username must be at least 8 characters long";
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return "Username must contain only letters and numbers";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      return "Password must contain only letters and numbers";
    }
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (name === "reg_no") {
      value = value.replace(/\D/g, "");
    }
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Real-time validation
      if (name === "username") {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          username: validateUsername(value),
        }));
      } else if (name === "password") {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          password: validatePassword(value),
          password_confirm:
            prev.password_confirm && value !== prev.password_confirm
              ? "Passwords do not match"
              : validateConfirmPassword(value, prev.password_confirm),
        }));
      } else if (name === "password_confirm") {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          password_confirm: validateConfirmPassword(prev.password, value),
        }));
      }

      return updated;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.match("image.*")) {
      setError("Please select an image file (JPEG/PNG)");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size too large (max 2MB)");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      photo: file,
      photoPreview: previewUrl,
    }));
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (formData.photoPreview) {
        URL.revokeObjectURL(formData.photoPreview);
      }
    };
  }, [formData.photoPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate all fields
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.password_confirm
    );

    setValidationErrors({
      username: usernameError,
      password: passwordError,
      password_confirm: confirmPasswordError,
    });

    if (usernameError || passwordError || confirmPasswordError) {
      setError("Please fix the validation errors before submitting.");
      setIsSubmitting(false);
      return;
    }

    if (!recaptchaValue) {
      setError("Please complete the captcha.");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError("Password didnt match");
      setIsSubmitting(false);
      return;
    }

    if (!formData.terms) {
      setError("Please accept the terms and conditions");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Append all fields except photoPreview
      Object.keys(formData).forEach((key) => {
        if (key !== "photoPreview") {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}api/alumni-form/alumni-registration`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        throw new Error("Registration failed. Please try again.");
      }

      const data = await response.json();

      setSubmitSuccess(true);
      // Reset form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        passOutYear: currentYear,
        branch: "",
        email: "",
        currentOccupation: "",
        college: "",
        phone: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        country: "",
        photo: null,
        photoPreview: "",
        description: "",
        currentDesignation: "",
        currentCompany: "",
        highestQualification: "",
        terms: false,
        // NEW FIELDS
        reg_no: "",
        username: "",
        password: "",
        password_confirm: "",
      });
      setRecaptchaValue(null);
      // Redirect to Home Page
      navigate("/");
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <img
          src="https://old.aknu.edu.in/images/Gallery/11-03-2025%20(3).jpeg"
          alt="aknu alumni"
          className="w-full h-[500px] md:h-[500px] object-cover"
        />
        <div className="absolute inset-0 pb-5 flex items-end justify-center">
          <div className="text-center px-4">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">
              AKNU Alumni Network
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Connecting generations of excellence. Stay connected, stay
              involved.
            </p>

            <button
              onClick={toggleForm}
              className="bg-[#00786F] text-white font-semibold px-7 py-3 mb-2 shadow-lg hover:bg-teal-900 transition-all duration-300 inline-block text-center hover:shadow-xl transform hover:-translate-y-1 mt-2"
            >
              Join Our Network
            </button>
            <a
              href="#alumni/login"
              className="bg-[#00786F] text-white font-semibold px-7 py-3 shadow-lg hover:bg-teal-900 transition-all duration-300 inline-block text-center hover:shadow-xl transform hover:-translate-y-1 ml-2"
            >
              Login
            </a>

            <a
              href="#alumni/donation"
              className="bg-[#00786F] text-white font-semibold px-7 py-3 shadow-lg hover:bg-teal-900 transition-all duration-300 inline-block text-center hover:shadow-xl transform hover:-translate-y-1 ml-2"
            >
              Donate
            </a>
          </div>
        </div>
        {/* <div>
          <AlumniTextSphere
            className="flex-1"
            items={[
              "Entrepreneurship", "Leadership", "Nostalgia", "Reconnect",
              "Heritage", "Futuristic", "Giving Back", "Networking"
            ]}
          />
        </div> */}
      </div>
      {/* Stats Section */}
      <div className="py-10 bg-white pt-7">
        <button
          onClick={() => navigate("/")}
          className={`flex items-center ml-6 text-teal-700 text-[14px] hover:text-[#005f53] font-semibold text-base mb-2 px-4 md:px-6 cursor-pointer py-2 rounded-lg`}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to main site
        </button>
        <KnowYourAlmamater />
        <div className="relative pt-16">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50 to-white z-0"></div>

          <div className="relative z-10 mx-auto px-4 sm:px-16" id="association">
            <div className="mt-5 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                {
                  number: "12K+",
                  label: "Alumni Members",
                  color: "text-yellow-500",
                  icon: Users,
                },
                {
                  number: "15",
                  label: "Countries Represented",
                  color: "text-red-500",
                  icon: Globe,
                },
                {
                  number: "18+",
                  label: "Years of Legacy",
                  color: "text-blue-500",
                  icon: Award,
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-teal-50/30 shadow-lg transition-all duration-300 border border-teal-100 hover:shadow-2xl hover:scale-105 hover:border-teal-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-6 sm:p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#00786F] to-teal-600 text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-teal-500/50">
                      <stat.icon
                        size={24}
                        className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                      />
                    </div>

                    <h3
                      className={`mt-5 sm:mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#00786F] to-teal-600 bg-clip-text text-transparent group-hover:from-teal-600 group-hover:to-[#00786F] transition-all duration-300`}
                    >
                      {stat.number}
                    </h3>

                    <p className="mt-3 text-sm sm:text-base font-semibold text-gray-700 group-hover:text-[#00786F] transition-colors duration-300">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="
        bg-white rounded-xl shadow-2xl w-full max-w-[95vw] lg:max-w-[1150px] relative
        transform transition-all duration-300 ease-out
        animate-slide-up
      "
          >
            <style>{`
              @keyframes slideUp {
                0% {
                  transform: translateY(50px);
                  opacity: 0;
                }
                100% {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
              .animate-slide-up {
                animation: slideUp 0.3s ease-out forwards;
              }
            `}</style>

            {/* Success/Error Modal Overlay */}
            {(submitSuccess || error) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" />
                <div
                  className={`relative bg-white rounded-lg shadow-xl px-8 py-6 min-w-[280px] max-w-xs mx-auto text-center flex flex-col items-center ${
                    submitSuccess
                      ? "border border-green-400"
                      : "border border-red-400"
                  }`}
                  style={{ zIndex: 100 }}
                >
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setError(null);
                    }}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 p-1 rounded-full focus:outline-none"
                    aria-label="Close"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div
                    className={`mb-2 text-lg font-semibold ${
                      submitSuccess ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {submitSuccess ? "Registered!" : "Error"}
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                </div>
              </div>
            )}

            {/* Main Modal Layout */}
            <div className="relative flex flex-col h-[95vh] max-h-[95vh]">
              {/* Close Button */}
              <button
                onClick={toggleForm}
                className="absolute top-4 right-4 text-white hover:text-gray-400 transition"
              >
                ✕
              </button>

              {/* Header */}
              <div className="p-4 bg-teal-800 text-white shadow-md flex-shrink-0">
                <h2 className="text-2xl font-bold">Alumni Registration</h2>
              </div>

              {/* Scrollable Content */}
              <div className="flex flex-col flex-1 min-h-0">
                {/* Main Form Container */}
                <div id="alumniFormScroll" className="flex-1 overflow-y-auto">
                  <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 lg:grid-cols-2 w-full gap-2"
                  >
                    {/* Left Column - Personal & Academic Info */}
                    <div className="p-4 md:p-6 lg:pr-3 space-y-4">
                      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                        <div
                          className={`flex gap-3 ${isRegNoExists === "CHECKING" ? "text-gray-400 cursor-wait" : ""}`}
                        >
                          <div className="flex-1">
                            <label
                              htmlFor="reg_no"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Registration No*
                            </label>
                            <input
                              disabled={isRegNoExists === "CHECKING"}
                              type="text"
                              id="reg_no"
                              name="reg_no"
                              value={formData.reg_no}
                              maxLength={30}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all ${isRegNoExists === "CHECKING" ? "text-gray-400 cursor-wait" : ""}`}
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 opacity-0 select-none pointer-events-none">
                              .
                            </label>
                            <button
                              disabled={isRegNoExists === "CHECKING"}
                              onClick={async (e) => {
                                e.preventDefault();
                                setIsRegNoExists("CHECKING");
                                const res = await axios.get(
                                  `${import.meta.env.VITE_API_URL}api/alumni/alumni-reg-check/${formData.reg_no}`
                                );
                                if (res.data.exists) {
                                  setIsRegNoExists("EXISTS");
                                } else {
                                  setIsRegNoExists("NOT_EXISTS");
                                }
                                setTimeout(() => {
                                  setIsRegNoExists("NONE");
                                }, 5000);
                              }}
                              className={`bg-[#00786F] text-white w-full px-4 py-2 rounded-lg font-medium hover:bg-[#00665c] transition-all shadow-sm hover:shadow-md ${isRegNoExists === "CHECKING" ? "text-gray-400 cursor-wait opacity-75" : ""}`}
                            >
                              Search
                            </button>
                          </div>
                        </div>
                        {isRegNoExists === "CHECKING" ? (
                          <div className="text-gray-500 mt-2 text-sm">
                            Checking . . .
                          </div>
                        ) : null}
                        {isRegNoExists === "EXISTS" ? (
                          <div className="text-green-600 mt-2 text-sm font-medium">
                            Registration Number exists
                          </div>
                        ) : null}
                        {isRegNoExists === "NOT_EXISTS" ? (
                          <div className="text-red-500 mt-2 text-sm font-medium">
                            Registration Number not exists
                          </div>
                        ) : null}
                      </div>

                      {/* Personal Information Section */}
                      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-xl font-semibold text-teal-700 mb-4 pb-2 border-b border-gray-200">
                          Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="firstName"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              First Name*
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              onInput={(e) => {
                                e.target.value = e.target.value.replace(
                                  /[^a-zA-Z' ]/g,
                                  ""
                                );
                              }}
                              required
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="lastName"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Last Name*
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              onInput={(e) => {
                                e.target.value = e.target.value.replace(
                                  /[^a-zA-Z' ]/g,
                                  ""
                                );
                              }}
                              required
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor="photo"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Profile Photo
                          </label>
                          <input
                            type="file"
                            id="photo"
                            name="photo"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                          />
                          <p className="text-xs text-gray-500 mt-1.5">
                            Maximum file size: 100kb (JPEG/PNG)
                          </p>
                          {formData.photoPreview && (
                            <div className="mt-2">
                              <img
                                src={formData.photoPreview}
                                alt="Profile preview"
                                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Academic Information Section */}
                      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-xl font-semibold text-teal-700 mb-4 pb-2 border-b border-gray-200">
                          Academic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="college"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              College/University*
                            </label>
                            <input
                              type="text"
                              id="college"
                              name="college"
                              value={formData.college}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="passOutYear"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Pass Out Year*
                            </label>
                            <select
                              id="passOutYear"
                              name="passOutYear"
                              value={formData.passOutYear}
                              onChange={handleChange}
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                              required
                            >
                              <option value="" disabled>
                                Select Year
                              </option>
                              {Array.from(
                                { length: 50 },
                                (_, i) => new Date().getFullYear() - i
                              ).map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="branch"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Branch/Department*
                            </label>
                            <select
                              id="branch"
                              name="branch"
                              value={formData.branch}
                              onChange={handleChange}
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                              required
                            >
                              <option value="">Select Branch</option>
                              <option value="B.A">B.A</option>
                              <option value="B.Com">B.Com</option>
                              <option value="B.Sc">B.Sc</option>
                              <option value="B.Ed">B.Ed</option>
                              <option value="B.Tech">B.Tech</option>
                              <option value="B.P.Ed">B.P.Ed</option>
                              <option value="BBA">BBA</option>
                              <option value="BCA">BCA</option>
                              <option value="BFA">BFA</option>
                              <option value="BHM">BHM</option>
                              <option value="B.Li.Sc">B.Li.Sc</option>
                              <option value="B.Pharma">B.Pharma</option>
                              <option value="B.S.W">B.S.W</option>
                              <option value="B.Voc">B.Voc</option>
                              <option value="M.A">M.A</option>
                              <option value="M.Com">M.Com</option>
                              <option value="M.Sc">M.Sc</option>
                              <option value="M.Ed">M.Ed</option>
                              <option value="M.Tech">M.Tech</option>
                              <option value="M.P.Ed">M.P.Ed</option>
                              <option value="MBA">MBA</option>
                              <option value="MCA">MCA</option>
                              <option value="MFA">MFA</option>
                              <option value="MHM">MHM</option>
                              <option value="M.Li.Sc">M.Li.Sc</option>
                              <option value="M.Pharma">M.Pharma</option>
                              <option value="M.S.W">M.S.W</option>
                              <option value="M.Voc">M.Voc</option>
                              <option value="PG Diploma">PG Diploma</option>
                              <option value="Ph.D">Ph.D</option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="highestQualification"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Highest Qualification*
                            </label>
                            <select
                              id="highestQualification"
                              name="highestQualification"
                              value={formData.highestQualification}
                              onChange={handleChange}
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                              required
                            >
                              <option value="">Select Qualification</option>
                              <option value="High School">High School</option>
                              <option value="Diploma">Diploma</option>
                              <option value="Bachelor's Degree">
                                Bachelor's Degree
                              </option>
                              <option value="Master's Degree">
                                Master's Degree
                              </option>
                              <option value="Doctorate">Doctorate</option>
                              <option value="Post Doctorate">
                                Post Doctorate
                              </option>
                              <option value="Professional Certification">
                                Professional Certification
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-xl font-semibold text-teal-700 mb-4 pb-2 border-b border-gray-200">
                          Account Credentials
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label
                              htmlFor="username"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Username*
                            </label>
                            <input
                              type="text"
                              id="username"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                              required
                              className={`w-full px-4 py-2 text-base border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all ${
                                validationErrors.username
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {validationErrors.username ? (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors.username}
                              </p>
                            ) : (
                              <p className="text-gray-500 text-xs mt-1">
                                Minimum 8 alphanumeric characters
                              </p>
                            )}
                          </div>
                          <div>
                            <label
                              htmlFor="password"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Password*
                            </label>
                            <input
                              type="password"
                              id="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              required
                              className={`w-full px-4 py-2 text-base border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all ${
                                validationErrors.password
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {validationErrors.password ? (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors.password}
                              </p>
                            ) : (
                              <p className="text-gray-500 text-xs mt-1">
                                Minimum 8 alphanumeric characters
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="password_confirm"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Confirm Password*
                            </label>
                            <input
                              type="password"
                              id="password_confirm"
                              name="password_confirm"
                              value={formData.password_confirm}
                              onChange={handleChange}
                              required
                              className={`w-full px-4 py-2 text-base border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all ${
                                validationErrors.password_confirm
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                            {validationErrors.password_confirm ? (
                              <p className="text-red-500 text-xs mt-1">
                                {validationErrors.password_confirm}
                              </p>
                            ) : (
                              <p className="text-gray-500 text-xs mt-1">
                                Must match password
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Contact & Professional Info */}
                    <div className="p-4 md:p-6 lg:pl-3 space-y-4">
                      {/* Contact Information Section */}
                      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-xl font-semibold text-teal-700 mb-4 pb-2 border-b border-gray-200">
                          Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Email Address*
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="phone"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Phone Number*
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              pattern="[0-9]{10}"
                              maxLength="10"
                              required
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                              placeholder="10-digit number"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor="address1"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Address Line 1*
                          </label>
                          <input
                            type="text"
                            id="address1"
                            name="address1"
                            value={formData.address1}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            placeholder="Street address, P.O. box, company name"
                          />
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor="address2"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            id="address2"
                            name="address2"
                            value={formData.address2}
                            onChange={handleChange}
                            className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            placeholder="Apartment, suite, unit, building, floor, etc."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <label
                              htmlFor="city"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              City*
                            </label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="state"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              State/Province*
                            </label>
                            <input
                              type="text"
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="country"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Country*
                            </label>
                            <select
                              id="country"
                              name="country"
                              value={formData.country}
                              onChange={handleChange}
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                              required
                            >
                              <option value="">Select Country</option>
                              <option value="India">India</option>
                              <option value="United States">
                                United States
                              </option>
                              <option value="United Kingdom">
                                United Kingdom
                              </option>
                              <option value="Canada">Canada</option>
                              <option value="Australia">Australia</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Professional Information Section */}
                      <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                        <h3 className="text-xl font-semibold text-teal-700 mb-4 pb-2 border-b border-gray-200">
                          Professional Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="currentOccupation"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Current Occupation*
                            </label>
                            <input
                              type="text"
                              id="currentOccupation"
                              name="currentOccupation"
                              value={formData.currentOccupation}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                              placeholder="e.g., Software Engineer, Teacher, etc."
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="currentDesignation"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Current Designation*
                            </label>
                            <input
                              type="text"
                              id="currentDesignation"
                              name="currentDesignation"
                              value={formData.currentDesignation}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                              placeholder="e.g., Senior Developer, Manager, etc."
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="currentCompany"
                              className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                              Current Company
                            </label>
                            <input
                              type="text"
                              id="currentCompany"
                              name="currentCompany"
                              value={formData.currentCompany}
                              onChange={handleChange}
                              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor="description"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Profile Description* (Max 500 characters)
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            maxLength="500"
                            rows="4"
                            required
                            className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
                            placeholder="Tell us about your professional journey, achievements, and interests..."
                          ></textarea>
                          <p className="text-xs text-gray-500 mt-1.5">
                            {formData.description.length}/500 characters
                          </p>
                        </div>
                      </div>

                      {/* USERNAME PASSWORD */}

                      {/* Terms and Submission */}
                    </div>
                    <div className="bg-white p-5 lg:p-6 col-span-1 lg:col-span-2 rounded-xl shadow-md border border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-3">
                          <div className="text-sm flex items-start">
                            <input
                              id="terms"
                              name="terms"
                              type="checkbox"
                              checked={formData.terms}
                              onChange={handleChange}
                              required
                              className="focus:ring-teal-500 h-5 w-5 text-teal-600 border-gray-300 rounded mt-0.5 flex-shrink-0 cursor-pointer"
                            />
                            <label
                              htmlFor="terms"
                              className="font-medium text-gray-700 cursor-pointer pl-2 select-none"
                            >
                              I agree to the terms and conditions and privacy policy*
                            </label>
                          </div>
                          <div className="transform scale-75 origin-left ml-3">
                            <ReCAPTCHA
                              sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
                              onChange={handleRecaptchaChange}
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting || !recaptchaValue}
                          className="bg-teal-600 cursor-pointer hover:bg-teal-700 text-white font-semibold py-2.5 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg flex-shrink-0 w-full sm:w-auto text-center"
                        >
                          {isSubmitting ? "Submitting..." : "Register"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlumniAmbassadors />
      <ParticipationSection />
      <PastEventsSection />
      {/* <CelebrateAlumni /> */}
      <TimelineSection />
      <VolunteerSection />
      <HostEventSection />
      {/* Gallery Section */}
      <div className="py-10" id="memories">
        <div className="mx-auto px-4 sm:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-teal-800 sm:text-3xl">
              Memories & Moments
            </h2>

            <p className="text-gray-600 mb-8 text-[16px] leading-relaxed">
              Relive the cherished moments from our alumni community
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              // "https://old.aknu.edu.in/images/Gallery/11-03-2025%20(14).jpeg",
              // "https://old.aknu.edu.in/images/Gallery/11-03-2025%20(8).jpeg",
                      memory1,
              memory2,
              memory3,
              memory4,
              memory5,
              memory6,
              RAM_7473,
              RAM_7571,
              RAM_7575,
              RAM_7669,
              RAM_7932
              // "https://old.aknu.edu.in/images/Gallery/11-03-2025%20(13).jpeg",
              // "https://old.aknu.edu.in/images/Gallery/11-03-2025%20(12).jpeg",
              // "https://old.aknu.edu.in/images/Gallery/11-03-2025%20(31).jpeg",
              // "https://old.aknu.edu.in/images/Gallery/TG%20Governor%20.jpeg",
              // "https://old.aknu.edu.in/images/Gallery/27-03-2025%20(6).jpeg",
              // "https://old.aknu.edu.in/images/Gallery/27-03-2025%20(7).jpeg",

          
            ].map((src, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition duration-300"
              >
                <img
                  src={src}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <ConnectWithUs />

      {/* Latest Members */}
      {/* <div className="py-16 bg-teal-900 text-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold sm:text-4xl font-serif">
              Welcome Our Newest Members
            </h2>
            <p className="mt-4 text-xl text-teal-200 max-w-2xl mx-auto">
              Recent alumni who have joined our growing network
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
            {[
              {
                name: "Sai Ram Kishore Durbhs",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_4959fe3be4d6a447d69d99f82293d624_thumb.jpeg",
              },
              {
                name: "Nitisha Pinninti",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_0774d85043e86b9ac2738e0697c9f12b_thumb.jpg",
              },
              {
                name: "Mohan Sai Kumar Reddy Nakka",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_4959fe3be4d6a447d69d99f82293d624_thumb.jpeg",
              },
              {
                name: "Akella Karthik",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_106c9ff4e00af537215de4a971f40746_thumb.jpg",
              },
              {
                name: "Sai Ram Kishore Durbhs",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_0a2740b5f001736acc5ce243aa683300_thumb.jpg",
              },
              {
                name: "Nitisha Pinninti",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_0774d85043e86b9ac2738e0697c9f12b_thumb.jpg",
              },
              {
                name: "Mohan Sai Kumar Reddy Nakka",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_4959fe3be4d6a447d69d99f82293d624_thumb.jpeg",
              },
              {
                name: "Akella Karthik",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_106c9ff4e00af537215de4a971f40746_thumb.jpg",
              },
              {
                name: "Sai Ram Kishore Durbhs",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_0a2740b5f001736acc5ce243aa683300_thumb.jpg",
              },
              {
                name: "Nitisha Pinninti",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_0774d85043e86b9ac2738e0697c9f12b_thumb.jpg",
              },
              {
                name: "Mohan Sai Kumar Reddy Nakka",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_4959fe3be4d6a447d69d99f82293d624_thumb.jpeg",
              },
              {
                name: "Akella Karthik",
                src: "https://vaave.s3.amazonaws.com/album_photos/851f5ac9941d720844d143ed9cfcf60a_106c9ff4e00af537215de4a971f40746_thumb.jpg",
              },
            ].map((member, index) => (
              <div key={index} className="relative group">
                <img
                  src={member.src}
                  alt={member.name}
                  className="w-full h-24 object-cover rounded-lg shadow-md group-hover:shadow-lg transition duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <span className="text-white text-xs font-medium text-center px-1">
                    {member.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* CTA Section */}
      {/* <div className="py-16  bg-[#f4e4c9]">
        <div className="container-wide text-center">
          <h2 className="text-3xl  text-teal-700 sm:text-4xl font-bolder">
            Ready to Reconnect?
          </h2>
          <p className="mt-4 text-xl text-teal-700 max-w-3xl mx-auto">
            Join thousands of alumni who are networking, mentoring, and giving
            back to the AKNU community.
          </p>
          <div className=" flex justify-center space-x-4">
            {isLoggedIn ? (
              <Link
                to="/alumni/profile"
                className="mt-8 px-8 py-3 bg-teal-700 hover:bg-teal-700 text-white font-semibold  transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Profile
              </Link>
            ) : (
              <a
                href="#alumni/login"
                className="mt-8 px-8 py-3 bg-teal-700 hover:bg-teal-700 text-white font-semibold  transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Login
              </a>
            )}
            <button
              onClick={toggleForm}
              className="mt-8 px-8 py-3 bg-teal-700 hover:bg-teal-700 text-white font-semibold  transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Register Now
            </button>
            <a
              href="#alumni/donation"
              className="mt-8 px-8 py-3 bg-teal-700 hover:bg-teal-700 text-white font-semibold  transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Donate
            </a>
          </div>
        </div>
      </div> */}
      <HashModal hash="#alumni/donation">
        <AlumniDonationForm />
      </HashModal>
      <HashModal hash="#alumni/login">
        <AlumniLoginForm />
      </HashModal>
      <HashModal hash="#alumni/forgot-password">
        <ForgotPassword />
      </HashModal>
    </div>
  );
};

export default AknuAlumni;
