import React, { useState, useEffect } from "react";
import ManagerPerformanceConsole from "../../components/performance/ManagerPerformanceConsole";
import ResignationReview from "./ResignationReview";
import { XMarkIcon } from "@heroicons/react/24/outline";

const EmployeeReviews = () => {
  const [activeTab, setActiveTab] = useState("performance"); // "performance" or "resignation"

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#525B88]">Employee Reviews</h1>
        <p className="text-gray-600 mt-1">
          Review employee performance evaluations and resignation requests
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("performance")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "performance"
                ? "border-[#525B88] text-[#525B88]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Performance Review
          </button>
          <button
            onClick={() => setActiveTab("resignation")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "resignation"
                ? "border-[#525B88] text-[#525B88]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Resignation
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "performance" && <ManagerPerformanceConsole />}
        {activeTab === "resignation" && <ResignationReview />}
      </div>
    </div>
  );
};

export default EmployeeReviews;

