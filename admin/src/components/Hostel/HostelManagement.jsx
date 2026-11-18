/**
 * Main Hostel Management Router Component
 * Handles navigation between different hostel management modules
 */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HostelMasterLayout from "./MasterData/HostelMasterLayout";
import ApplicationManagement from "./Applications/ApplicationManagement";
import RoomAllocation from "./Allocations/RoomAllocation";
import FeeManagement from "./Fees/FeeManagement";
import AttendanceManagement from "./Attendance/AttendanceManagement";
import MaintenanceManagement from "./Maintenance/MaintenanceManagement";
import MessManagement from "./Mess/MessManagement";
import ComplaintManagement from "./Complaints/ComplaintManagement";
import SecurityManagement from "./Security/SecurityManagement";
import HostelDashboard from "./Reports/HostelDashboard";

const HostelManagement = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<HostelDashboard />} />
      <Route path="/master/*" element={<HostelMasterLayout />} />
      <Route path="/applications" element={<ApplicationManagement />} />
      <Route path="/allocations" element={<RoomAllocation />} />
      <Route path="/fees" element={<FeeManagement />} />
      <Route path="/attendance" element={<AttendanceManagement />} />
      <Route path="/maintenance" element={<MaintenanceManagement />} />
      <Route path="/mess" element={<MessManagement />} />
      <Route path="/complaints" element={<ComplaintManagement />} />
      <Route path="/security" element={<SecurityManagement />} />
      <Route path="/reports" element={<HostelDashboard />} />
      <Route path="/" element={<Navigate to="/hostel/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/hostel/dashboard" replace />} />
    </Routes>
  );
};

export default HostelManagement;

