import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/urls";
import { showErrorMessage, showSuccessMessage } from "../config/Toast";

// Helper component for error messages
const ErrorMessage = ({ message }) => (
  <p className="mt-1 text-sm text-red-500">{message}</p>
);

// Main App component
const LoginPage = ({ setIsAuthenticated }) => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    let newErrors = {};

    // Username validation: minimum 8 characters
    // if (!formData.username.trim()) {
    //   newErrors.username = "Username is required.";
    // } else if (formData.username.trim().length < 8) {
    //   newErrors.username = "Username must be at least 8 characters long.";
    // }

    // Password validation: alphanumeric, minimum 8 characters, must contain @ or #
    // if (!formData.password.trim()) {
    //   newErrors.password = "Password is required.";
    // } else {
    //   const password = formData.password;

    //   // Check minimum length
    //   if (password.length < 8) {
    //     newErrors.password = "Password must be at least 8 characters long.";
    //   }
    //   // Check if alphanumeric (letters and numbers only, but can have @ or #)
    //   else if (!/^[a-zA-Z0-9@#]+$/.test(password)) {
    //     newErrors.password =
    //       "Password must contain only alphanumeric characters and @ or #.";
    //   }
    //   // Check if contains at least one @ or #
    //   else if (!/[@#]/.test(password)) {
    //     newErrors.password =
    //       "Password must contain at least one special character (@ or #).";
    //   }
    //   // Check if contains at least one letter and one number
    //   else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    //     newErrors.password = "Password must contain both letters and numbers.";
    //   }
    // }

    // setErrors(newErrors);
    // return Object.keys(newErrors).length === 0;
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (validateForm()) {
      try {
        const payload = {
          role: formData.username,
          password: formData.password,
        };
        const response = await axios.post(`${BASE_URL}/login`, payload);
        // Login success
        setIsAuthenticated(true);

        const token =
          response.data.token ||
          (response.data.data && response.data.data.token);

        if (token) {
          console.log("response", response);
          showSuccessMessage("Login successful!");
          localStorage.setItem("token", token);
          localStorage.setItem("role", response.data.user.role);
          localStorage.setItem("name", response.data.user.fullName || response.data.user.role || "User");

          navigate("/");
        } else {
          showSuccessMessage(
            "Login successful, but token not found in response."
          );
          setMessage("Login successful, but token not found in response.");
        }
      } catch (error) {
        console.error("Login error:", error);

        if (error.response && error.response.status === 401) {
          // Failed login
          showErrorMessage("Login failed: " + "Invalid username or password");
          setMessage(error.response.data.message || "Invalid role or password");
        } else {
          // Server error or other unknown errors
          showErrorMessage("An error occurred while logging in.");
          setMessage("An error occurred while logging in. Please try again.");
        }
      }
    } else {
      setMessage("Please correct the errors in the form.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 h-screen overflow-hidden bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] flex items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-[#525B88] relative overflow-hidden">
        {/* Decorative elements */}

        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="bg-white w-28 h-28 flex items-center justify-center rounded-full shadow-lg border-2 border-[#525B88]/10">
              <img
                src="./aknu-logo_new.png"
                alt="University Logo"
                className="h-20 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/150x80/cccccc/525B88?text=AKNU";
                }}
              />
            </div>
          </div>

          <div className="text-center mb-4">
            <h1 className="text-lg font-bold text-[#525B88] mb-0.5 tracking-wide">
              ADIKAVI NANNAYA UNIVERSITY
            </h1>
            <h2 className="text-sm font-medium text-gray-500">
              Administrative Portal
            </h2>

            <div className="mt-3 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-sm text-gray-500">
                  Secure Login
                </span>
              </div>
            </div>
          </div>
          {/* Radio Buttons */}
          {/* <div className="flex justify-center space-x-4 mb-4">
            {[
              { label: "Admin", value: "admin" },
              { label: "Super Admin", value: "super_admin" },
              { label: "User", value: "user" },
            ].map(({ label, value }) => (
              <label
                key={value}
                className="flex items-center space-x-1 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  className="accent-[#525B88]"
                  checked={role === value}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }));
                  }}
                />
                <span>{label}</span>
              </label>
            ))}
          </div> */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            autoComplete="off"
          >
            <div className="space-y-1">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-[#525B88]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  autoComplete="off"
                  className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                    errors.username
                      ? "border-red-500"
                      : "border-gray-300 focus:border-[#525B88]"
                  } focus:outline-none focus:ring-2 focus:ring-[#525B88]/50 transition duration-200`}
                  aria-invalid={errors.username ? "true" : "false"}
                  aria-describedby={
                    errors.username ? "username-error" : "username-help"
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-[#525B88]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className={`pl-10 w-full px-4 py-3 rounded-lg border ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-300 focus:border-[#525B88]"
                  } focus:outline-none focus:ring-2 focus:ring-[#525B88]/50 transition duration-200`}
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={
                    errors.password ? "password-error" : "password-help"
                  }
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#525B88] hover:bg-[#3e4566] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88] transition duration-300 transform hover:scale-[1.02] disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <svg
                      className="-ml-1 mr-3 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>
          <div className="flex justify-end mb-2">
            <button
              type="button"
              className="text-sm text-[#525B88] hover:underline hover:text-[#3e4566] transition"
              onClick={() => navigate("/forgot-password")}
              tabIndex={0}
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
