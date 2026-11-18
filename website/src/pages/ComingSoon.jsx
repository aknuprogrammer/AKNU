import React from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import comingSoonImg from "@/assets/coming-soon/come.jpg";

function ComingSoon() {
  const navigate = useNavigate();

  return (
    <>
      <div className="px-10 pt-5">
        <BackButton />
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <img
          src={comingSoonImg}
          alt="Coming Soon"
          className="w-full max-w-md mb-0"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />

        <h1 className="-mt-12 sm:-mt-14 text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          Coming Soon
        </h1>

        <p className="text-xl text-gray-600 mb-2 max-w-2xl">
          The page you’re trying to access is under construction. Please check
          back soon!
        </p>

        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-teal-700 text-white font-medium rounded-lg hover:bg-blue-600 transition-all hover:-translate-y-1 active:translate-y-0 cursor-pointer"
        >
          Go Back Home
        </button>
      </div>
    </>
  );
}

export default ComingSoon;
