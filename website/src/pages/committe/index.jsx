import React, { useState } from "react";
import UGCCell from "./UgcCell";
import EqualOpportunityCell from "../../components/home/EqualOpportunityCell";
import STCell from "../../components/home/STCell";
import WomenCell from "../WomenCell";
import { BackButton } from "../../components/BackButton";

const CommitteeCell = () => {
  const [activeCommittee, setActiveCommittee] = useState("ugc");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const committees = [
    { id: "ugc", name: "UGC", component: <UGCCell /> },
    {
      id: "equal-opportunity-cell",
      name: "Equal Opportunity Cell",
      component: <EqualOpportunityCell />,
    },
    { id: "sc-st-cell", name: "SC/ST Cell", component: <STCell /> },
    { id: "women-cell", name: "Women Cell", component: <WomenCell /> },
  ];

  return (
    <div className="w-full px-4 sm:px-16 py-8">
      <BackButton />
      <div className="flex flex-col md:flex-row gap-6 min-h-screen">
        {/* Mobile Header */}
        <div className="bg-teal-900 text-white md:hidden rounded-lg">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Committee Cell</h1>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
          {isSidebarOpen && (
            <nav className="p-2 border-t border-teal-800">
              <ul>
                {committees.map((committee) => (
                  <li key={committee.id} className="mb-1">
                    <button
                      onClick={() => {
                        setActiveCommittee(committee.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                        activeCommittee === committee.id
                          ? "bg-teal-700 text-white font-semibold"
                          : "text-teal-200 hover:bg-teal-800 hover:text-white"
                      }`}
                    >
                      {committee.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 bg-teal-900 text-white flex-shrink-0 rounded-lg shadow-lg sticky top-8 h-fit">
          <div className="p-4 border-b border-teal-800">
            <h1 className="text-xl font-bold">Committee Cell</h1>
            <p className="text-sm text-teal-200">Management Dashboard</p>
          </div>
          <nav className="p-2">
            <ul>
              {committees.map((committee) => (
                <li key={committee.id} className="mb-1">
                  <button
                    onClick={() => {
                      setActiveCommittee(committee.id);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                      activeCommittee === committee.id
                        ? "bg-teal-700 text-white font-semibold"
                        : "text-teal-200 hover:bg-teal-800 hover:text-white"
                    }`}
                  >
                    {committee.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full min-w-0">
          <div className="w-full">
            {committees.find((c) => c.id === activeCommittee)?.component}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitteeCell;
