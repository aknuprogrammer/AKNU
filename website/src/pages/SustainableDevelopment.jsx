import React from "react";
import sdgData from "../siteData/SustainableDevelopment";
import { BackButton } from "../components/BackButton";

const SDGProgress = () => {
  return (
    <div className="min-h-screen px-6 py-12 bg-white">
      {sdgData.map((section, idx) => (
        <div key={idx} className="mb-12">
          <h2 className="text-3xl font-semibold text-teal-700 mb-4">
            {section.category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
                    />
                  </svg>
                </div>
                <span className="text-gray-800 text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function SustainableDevelopment() {
  return (
    <div className="mx-15 mt-4">
      <BackButton className="mb-4 mt-4" />
      <div className="relative w-full">
        <img
          src="./sustainabledevelopment.jpg"
          alt="Life @AKNU"
          className="w-full object-cover shadow-md"
          style={{
            borderRadius: "1.2vh",
            borderTopLeftRadius: "3vh",
          }}
        />
        <h1
          className="absolute top-0 left-0 px-6 py-2 bg-white text-teal-700 font-bold text-3xl rounded-br-[1.5rem] "
          style={{
            letterSpacing: "0.05em",
            zIndex: 10,
            height: "56px",
            display: "flex",
            alignItems: "center",
          }}
        >
          Sustainable Development
        </h1>
      </div>

      <div>
        <SDGProgress />
      </div>
    </div>
  );
}
