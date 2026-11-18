import React, { useState } from "react";
import LabTypes from "./LabTypes";
import LabsList from "./LabsList";
import EquipmentCategories from "../Equipment/EquipmentCategories";
import LabIncharges from "./LabIncharges";
import { FlaskConical, Building2, ClipboardList, User } from "lucide-react";

const MasterData = () => {
  const [activeTab, setActiveTab] = useState("lab-types");

  const tabs = [
    { id: "lab-types", label: "Lab Types", icon: FlaskConical },
    { id: "labs-list", label: "Labs List", icon: Building2 },
    { id: "equipment-categories", label: "Equipment Categories", icon: ClipboardList },
    { id: "lab-incharges", label: "Lab Incharges", icon: User },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "lab-types":
        return <LabTypes />;
      case "labs-list":
        return <LabsList />;
      case "equipment-categories":
        return <EquipmentCategories />;
      case "lab-incharges":
        return <LabIncharges />;
      default:
        return <LabTypes />;
    }
  };

  return (
    <div>
      <div className="p-6 pb-0">
        <div className="flex flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Master Data
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-[#525b88] text-[#525b88] bg-[#525b88]/5"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div>
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterData;

