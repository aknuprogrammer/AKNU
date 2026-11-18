/**
 * Hostel Master Data Layout Component
 * Tab-based layout for managing hostel master data
 */
import React from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import HostelTypeManagement from "./HostelTypeManagement";
import HostelMaster from "./HostelMaster";
import WardenManagement from "./WardenManagement";
import BlocksRoomsBeds from "./BlocksRoomsBeds";
import FacilitiesManagement from "./FacilitiesManagement";

const HostelMasterLayout = () => {
  const location = useLocation();
  
  const tabs = [
    { path: "/types", label: "Hostel Types" },
    { path: "/hostels", label: "Hostels" },
    { path: "/wardens", label: "Wardens" },
    // { path: "/blocks-rooms-beds", label: "Blocks, Rooms & Beds" },
    { path: "/facilities", label: "Facilities" },
  ];

  // Base path for hostel master
  const basePath = "/hostel/master";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Hostel Master Data</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab, index) => {
            const tabPath = `${basePath}${tab.path}`;
            const isActive = location.pathname === tabPath || 
              (tab.path === "/hostels" && (location.pathname === basePath || location.pathname === `${basePath}/`));
            
            return (
              <Link
                key={index}
                to={tabPath}
                className={`flex-1 min-w-max px-6 py-4 text-center border-b-2 font-medium transition-colors ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to={`${basePath}/hostels`} replace />} />
            <Route path="/types" element={<HostelTypeManagement />} />
            <Route path="/hostels" element={<HostelMaster />} />
            <Route path="/wardens" element={<WardenManagement />} />
            <Route path="/blocks-rooms-beds" element={<BlocksRoomsBeds />} />
            <Route path="/facilities" element={<FacilitiesManagement />} />
            <Route path="*" element={<Navigate to={`${basePath}/hostels`} replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default HostelMasterLayout;

