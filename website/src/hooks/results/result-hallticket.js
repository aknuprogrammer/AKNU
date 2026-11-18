import axios from "axios";
import { useState } from "react";

// Generate alphanumeric CAPTCHA
const generateCaptcha = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};

export const useResultHallTickerHook = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreviousResults, setShowPreviousResults] = useState(false);
  const [previousResults, setPreviousResults] = useState([]);
  const [foundState, setFoundStudent] = useState(null);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError("");
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a registration number");
      return;
    }

    if (!captchaInput.trim()) {
      setCaptchaError("Please enter the CAPTCHA code");
      return;
    }

    if (captchaInput !== captcha) {
      setCaptchaError("CAPTCHA code is incorrect. Please try again.");
      refreshCaptcha();
      return;
    }

    setLoading(true);
    setError("");
    setCaptchaError("");
    setShowPreviousResults(false);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}api/results/latest-result`,
        {
          params: {
            RegisterNumber: searchTerm,
          },
        }
      );

      console.log("_______response", response);
      if (response.data.success && !!response.data.data) {
        setFoundStudent(response.data.data);
      } else {
        setFoundStudent(null);
        setError("No results found for the provided details.");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Server error. Please try again later.");
      setFoundStudent(null);
    } finally {
      setLoading(false);
      // Refresh captcha after every search attempt (success or failure)
      refreshCaptcha();
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    error,
    loading,
    showPreviousResults,
    handleSearch,
    captcha,
    captchaInput,
    setCaptchaInput,
    captchaError,
    setCaptchaError,
    refreshCaptcha,
  };
};
