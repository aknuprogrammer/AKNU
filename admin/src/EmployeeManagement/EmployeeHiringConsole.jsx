import { useState } from "react";
import HiringNotification from "./HiringNotification";
import ReceivingApplications from "./ReceivingApplications";
import FollowUpShortlisting from "./FollowUpShortlisting";
import SelectedCandidates from "./SelectedCandidates";

const EmployeeHiringConsole = () => {
  const [activeTab, setActiveTab] = useState("notification");

  const tabs = [
    { id: "notification", name: "Hiring Notification" },
    { id: "applications", name: "Receiving Applications" },
    { id: "followup", name: "Follow-Up / Shortlisting" },
    { id: "selected", name: "Selected Candidates" },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "notification":
        return <HiringNotification />;
      case "applications":
        return <ReceivingApplications />;
      case "followup":
        return <FollowUpShortlisting />;
      case "selected":
        return <SelectedCandidates />;
      default:
        return <HiringNotification />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Employee Hiring Center
        </h1>
        <p className="text-gray-500 mt-2">
          Manage hiring notifications, applications, and candidate selection.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b overflow-x-auto pb-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default EmployeeHiringConsole;
