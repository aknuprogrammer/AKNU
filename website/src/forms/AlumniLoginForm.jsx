import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

export default function AlumniLoginForm() {
  const closeModal = () => {
    window.history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
    window.dispatchEvent(new Event("hashchange")); // 🔑 notify listeners
  };

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaValue) {
      setError("Please complete the CAPTCHA verification");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}api/alumni/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ Store token in cookie (instead of localStorage)
      Cookies.set("alumni_token", data.token, {
        expires: 7, // days
        path: "/",
        // secure: window.location.protocol === "https:", // only secure cookies on https
        sameSite: "Strict",
      });

      setSuccess("Login successful! 🎉");
      navigate("/alumni/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-md  overflow-hidden">
      <div className="p-4 bg-teal-800 text-white shadow-md flex-shrink-0 relative">
        <h2 className="text-2xl font-bold">Alumni Login</h2>
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-white hover:text-gray-400 transition"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 relative p-4"
      >
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <div className="flex justify-end mt-1">
            <a
              href="#alumni/forgot-password"
              className="text-sm text-teal-700 hover:text-teal-900 hover:underline transition"
            >
              Forgot Password?
            </a>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        {/* reCAPTCHA and Submit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="transform scale-75 origin-left">
            <ReCAPTCHA
              sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
              onChange={handleRecaptchaChange}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !recaptchaValue}
            className={`bg-teal-800 text-white py-3 px-6 rounded-md hover:bg-emerald-800 transition w-full sm:w-auto text-center font-semibold flex-shrink-0 cursor-pointer ${
              loading || !recaptchaValue ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
