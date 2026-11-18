/**
 * Hostel Management Components Index
 * Central export point for all hostel management components
 */

// Master Data
export { default as HostelMasterLayout } from "./MasterData/HostelMasterLayout";
export { default as HostelMaster } from "./MasterData/HostelMaster";
export { default as HostelTypeManagement } from "./MasterData/HostelTypeManagement";
export { default as WardenManagement } from "./MasterData/WardenManagement";
export { default as BlocksRoomsBeds } from "./MasterData/BlocksRoomsBeds";

// Applications
export { default as ApplicationManagement } from "./Applications/ApplicationManagement";

// Allocations
export { default as RoomAllocation } from "./Allocations/RoomAllocation";

// Fees
export { default as FeeManagement } from "./Fees/FeeManagement";

// Attendance
export { default as AttendanceManagement } from "./Attendance/AttendanceManagement";

// Maintenance
export { default as MaintenanceManagement } from "./Maintenance/MaintenanceManagement";

// Mess
export { default as MessManagement } from "./Mess/MessManagement";

// Complaints
export { default as ComplaintManagement } from "./Complaints/ComplaintManagement";

// Security
export { default as SecurityManagement } from "./Security/SecurityManagement";

// Reports
export { default as HostelDashboard } from "./Reports/HostelDashboard";

// Existing Components (Enhanced)
export { default as Hostels } from "./Hostels";
export { default as Inventory } from "./Inventory";
export { default as Spend } from "./Spend";

// Shared Components
export * from "./shared";

