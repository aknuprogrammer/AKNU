import React from "react";
import { RefreshCw } from "lucide-react";

const ResultHallTicketInput = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  loading,
  error,
  captcha,
  captchaInput,
  setCaptchaInput,
  captchaError,
  setCaptchaError,
  refreshCaptcha,
}) => {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-2xl font-bold text-teal-800 mb-2">
        Check Your Results
      </h2>
      <p className="text-gray-600 mb-4">
        Enter your registration number to view your result
      </p>

      <div className="flex gap-2 mb-4 no-print">
        <input
          type="text"
          placeholder="Enter registration number..."
          className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#21605A] focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-[#21605A] text-white rounded-md hover:bg-[#1a4a45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Searching...
            </span>
          ) : (
            "Search"
          )}
        </button>
      </div>

      {/* CAPTCHA Section */}
      <div className="flex items-center justify-center gap-2 mb-4 no-print">
        <span
          className="font-semibold tracking-widest px-4 py-2 border-2 border-gray-400 rounded-md bg-gray-100 text-lg text-gray-800 whitespace-nowrap select-none"
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          {captcha}
        </span>
        <button
          type="button"
          onClick={refreshCaptcha}
          className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Refresh Captcha"
        >
          <RefreshCw size={20} stroke="#21605A" />
        </button>
        <input
          type="text"
          placeholder="Enter CAPTCHA"
          value={captchaInput}
          onChange={(e) => {
            setCaptchaInput(e.target.value);
            setCaptchaError("");
            setError("");
          }}
          className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#21605A] focus:outline-none w-40"
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>

      {captchaError && (
        <p className="mt-2 text-red-500 no-print flex items-center justify-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {captchaError}
        </p>
      )}

      {error && (
        <p className="mt-2 text-red-500 no-print flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default ResultHallTicketInput;
