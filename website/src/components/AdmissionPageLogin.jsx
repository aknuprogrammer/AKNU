import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "./BackButton";

export default function AdmissionPageLogin() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState(null);
  const [citizenshipType, setCitizenshipType] = useState("foreign");
  const [loginMethod, setLoginMethod] = useState("mobile");
  const [selectedDiscipline] = useState("Admissions"); // Assuming this is set elsewhere

  function handleLogin(e) {
    e.preventDefault();
    // Add your login logic here (API call, validation, etc.)
    alert("Login submitted!");
    navigate("/")
  }

  function handleRegister(e) {
    e.preventDefault();
    // Add your register logic here (API call, validation, etc.)
    alert("Register submitted!");
    navigate("/")
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 pt-7">
      <BackButton className="mb-5" />
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-teal-700 py-6 px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            University Admissions Portal
          </h2>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {!authMode ? (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 ">
                Welcome to {selectedDiscipline}
              </h3>

              <div className="space-y-4">
                <button
                  onClick={() => setAuthMode("login")}
                  className="w-full py-3 px-4 bg-white border-2 border-teal-700 text-teal-700 font-medium rounded-lg transition duration-200 hover:bg-[#f0f9f8] shadow-sm hover:shadow-md"
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthMode("register")}
                  className="w-full py-3 px-4 bg-white border-2 border-teal-700 text-teal-700 font-medium rounded-lg transition duration-200 hover:bg-[#f0f9f8] shadow-sm hover:shadow-md"
                >
                  Register
                </button>
              </div>

              <button
                onClick={() => navigate("/AdmissionPage")}
                className="mt-6 text-teal-700 hover:text-[#006056] font-medium flex items-center justify-center mx-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to Disciplines
              </button>
            </div>
          ) : authMode === "login" ? (
            <div className="animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Login to {selectedDiscipline}
              </h3>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Citizenship Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizenship Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCitizenshipType("indian")}
                      className={`py-2 px-3 rounded-lg border ${citizenshipType === "indian" ? "border-teal-700 bg-[#e6f5f3] text-teal-700" : "border-gray-300"} transition duration-200`}
                    >
                      Indian
                    </button>
                    <button
                      type="button"
                      onClick={() => setCitizenshipType("foreign")}
                      className={`py-2 px-3 rounded-lg border ${citizenshipType === "foreign" ? "border-teal-700 bg-[#e6f5f3] text-teal-700" : "border-gray-300"} transition duration-200`}
                    >
                      Foreign Nationals
                    </button>
                  </div>
                </div>

                {/* Login Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Login Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLoginMethod("mobile")}
                      className={`py-2 px-3 rounded-lg border ${loginMethod === "mobile" ? "border-teal-700 bg-[#e6f5f3] text-teal-700" : "border-gray-300"} transition duration-200`}
                    >
                      Mobile
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod("otp")}
                      className={`py-2 px-3 rounded-lg border ${loginMethod === "otp" ? "border-teal-700 bg-[#e6f5f3] text-teal-700" : "border-gray-300"} transition duration-200`}
                    >
                      OTP
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Registered Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                  />
                </div>

                {/* Mobile or OTP */}
                {loginMethod === "mobile" ? (
                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Registered Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      placeholder="+91 9876543210"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                    />
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      OTP
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="otp"
                        placeholder="Enter 6-digit OTP"
                        required
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-[#006056] transition duration-200"
                      >
                        Get OTP
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-teal-700 hover:bg-[#006056] text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                >
                  Login
                </button>

                {/* Back */}
                <button
                  type="button"
                  onClick={() => setAuthMode(null)}
                  className="w-full py-2 px-4 text-teal-700 hover:text-[#006056] font-medium rounded-lg transition duration-200 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Back to Options
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Register for {selectedDiscipline}
              </h3>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Citizenship Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citizenship Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCitizenshipType("indian")}
                      className={`py-2 px-3 rounded-lg border ${citizenshipType === "indian" ? "border-teal-700 bg-[#e6f5f3] text-teal-700" : "border-gray-300"} transition duration-200`}
                    >
                      Indian
                    </button>
                    <button
                      type="button"
                      onClick={() => setCitizenshipType("foreign")}
                      className={`py-2 px-3 rounded-lg border ${citizenshipType === "foreign" ? "border-teal-700 bg-[#e6f5f3] text-teal-700" : "border-gray-300"} transition duration-200`}
                    >
                      Foreign Nationals
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Applicant Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="reg-email"
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      required
                      className="w-1/3 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                    >
                      <option value="">Code</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+971">🇦🇪 +971</option>
                    </select>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="9876543210"
                      required
                      pattern="[0-9]{7,15}"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State
                    </label>
                    <select
                      id="state"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                    >
                      <option value="">Select State</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="California">California</option>
                      <option value="New South Wales">New South Wales</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City
                    </label>
                    <select
                      id="city"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                    >
                      <option value="">Select City</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Pune">Pune</option>
                      <option value="New York">New York</option>
                      <option value="Sydney">Sydney</option>
                    </select>
                  </div>
                </div>

                {/* Program */}
                <div>
                  <label
                    htmlFor="program"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Program
                  </label>
                  <select
                    id="program"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                  >
                    <option value="">Select Program</option>
                    <option value="B.Tech">B.Tech</option>
                    <option value="MBA">MBA</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Law">Law</option>
                    <option value="MBBS">MBBS</option>
                  </select>
                </div>

                {/* Campus */}
                <div>
                  <label
                    htmlFor="campus"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Preferred Campus
                  </label>
                  <select
                    id="campus"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                  >
                    <option value="">Select Campus</option>
                    <option value="North Campus">North Campus</option>
                    <option value="South Campus">South Campus</option>
                    <option value="Main Campus">Main Campus</option>
                  </select>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Create a password"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition duration-200"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-teal-700 hover:bg-[#006056] text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg mt-4"
                >
                  Register
                </button>

                {/* Back */}
                <button
                  type="button"
                  onClick={() => setAuthMode(null)}
                  className="w-full py-2 px-4 text-teal-700 hover:text-[#006056] font-medium rounded-lg transition duration-200 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Back to Options
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
