import React from "react";

export default function Footer({ footerText }) {
  return (
    <div
      className="flex items-center justify-center text-center text-[8pt] py-2 px-4 border-t w-full"
      style={{
        borderColor: "#D1D5DB",
        color: "#374151",
        backgroundColor: "#ffffff",
        minHeight: "40px",
      }}
    >
      {Array.isArray(footerText) ? (
        <div className="flex flex-col gap-0.5">
          {footerText.map((text, i) => (
            <p key={i}>{text || (i === 0 ? "Official Letterhead of Adikavi Nannaya University" : "")}</p>
          ))}
        </div>
      ) : (
        footerText || "Official Letterhead of Adikavi Nannaya University"
      )}
    </div>
  );
}

{
  /* <div className="flex space-x-6 border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab("uploaded")}
          className={`pb-2 text-sm font-medium ${
            activeTab === "uploaded"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Uploaded Letters
        </button>
       <button
    onClick={() => setActiveTab("create")}
    className={`pb-2 text-sm font-medium ${
      activeTab === "create"
        ? "border-b-2 border-blue-600 text-blue-600"
        : "text-gray-500 hover:text-gray-700"
    }`}
  >
    Create Letter
  </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-2 text-sm font-medium ${
            activeTab === "requests"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Letter Requests
        </button>
      </div> */
}
