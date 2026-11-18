import { useState } from "react";
import CommencementComm from "./CommencementComm";
import FeePendingComm from "./FeePendingComm";
import ExamComm from "./ExamComm";
import EventComm from "./EventComm";
import AbsentComm from "./AbsentComm";

const AdmissionCommunicationConsole = () => {
  const [activeTab, setActiveTab] = useState("commencement");

  const tabs = [
    { id: "commencement", name: "Commencement" },
    { id: "fees", name: "Fee Reminders" },
    { id: "exams", name: "Exam Timetable" },
    { id: "events", name: "Events" },
    { id: "attendance", name: "Attendance" },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "commencement":
        return <CommencementComm />;
      case "fees":
        return <FeePendingComm />;
      case "exams":
        return <ExamComm />;
      case "events":
        return <EventComm />;
      case "attendance":
        return <AbsentComm />;
      default:
        return <CommencementComm />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Communication Center</h1>
        <p className="text-gray-500 mt-2">Manage all student and parent communications across different categories.</p>
      </div>

      {/* Tabs Navigation */}
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

      {/* Dynamic Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default AdmissionCommunicationConsole;
