// src/pages/NotFound.js
import React from "react";
import { useNavigate } from "react-router-dom";

import { page404 } from "../assets";
import { BackButton } from "./BackButton";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="px-10 pt-5">
        <BackButton />
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        {/* Image - will be hidden if it fails to load */}
        <img
          src={page404}
          alt="404 Not Found"
          className="w-full max-w-md mb-8"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />

        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          The page you're looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 cursor-pointer bg-teal-700 text-white font-medium rounded-lg hover:bg-blue-600 transition-all hover:-translate-y-1 active:translate-y-0"
        >
          Go Back Home
        </button>
      </div>
    </>
  );
};

export default NotFound;
