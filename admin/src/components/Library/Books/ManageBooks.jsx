import React, { useState } from "react";
import LibraryInventory from "../LibraryInventory";
import OverdueBooksReport from "../Reports/OverdueBooksReport";
import IssuedBooks from "../IssuedBooks";
import { Download, BookOpen, AlertCircle, BookCheck } from "lucide-react";
import { showSuccessMessage } from "../../../config/Toast";

const ManageBooks = () => {
  const [activeTab, setActiveTab] = useState("manage");

  const tabs = [
    { id: "manage", label: "Manage Books", icon: BookOpen },
    { id: "issued", label: "Issued Books", icon: BookCheck },
    { id: "overdue", label: "Overdue Books", icon: AlertCircle },
  ];

  const handleExportReport = () => {
    // Each tab now has its own export button
    showSuccessMessage("Please use the Export button in the respective section");
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "manage":
        return (
          <div>
            <div className="flex flex-row justify-end items-center mb-4">
              {/* <button
                onClick={handleExportReport}
                className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button> */}
            </div>
            <LibraryInventory />
          </div>
        );
      case "issued":
        return (
          <div className="-m-6">
            <IssuedBooks />
          </div>
        );
      case "overdue":
        return <OverdueBooksReport />;
      default:
        return <LibraryInventory />;
    }
  };

  return (
    <div>
      <div className="p-6 pb-0">
        <div className="flex flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Book Management
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
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">{renderActiveTab()}</div>
        </div>
      </div>
    </div>
  );
};

export default ManageBooks;
