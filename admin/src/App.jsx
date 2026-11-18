// import React, { useState } from "react";
// import SideBar from "./components/SideBar";
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
// } from "react-router-dom";
// import Notifications from "./components/Notifications";
// import Latestnews from "./components/Latestnews";
// import LatestEvents from "./components/LatestEvents";
// import VoiceAtAknu from "./components/VoiceAtAknu";
// import AdminDashboard from "./components/AdminDashboard";
// import Page_Results from "./components/important_information/Page_Results";
// import Page_Examination from "./components/important_information/Page_Examination";
// import Page_Circular from "./components/important_information/Page_Circular";
// import Page_Jobs from "./components/important_information/Page_Jobs";
// import Page_Tenders from "./components/important_information/Page_Tenders";
// import EventDetails from "./components/AKNU_FormData/EventDetails";
// import AdmissionDetails from "./components/AKNU_FormData/AdmissionDetails";
// import CertificationDetails from "./components/AKNU_FormData/CertificationDetails";
// import AlumniDetails from "./components/AKNU_FormData/AlumniDetails";
// import FeedBackDetails from "./components/AKNU_FormData/FeedBackDetails";
// import AdhocFaculty from "./components/AdhocFaculty";
// import LoginPage from "./components/LoginPage";
// import NavBar from "./components/NavBar";
// import ChatWithUs from "./components/ChatWithUs";

// export default function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(() => {
//     return !!localStorage.getItem("token"); // Returns true if token exists
//   });

//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Login route */}
//         <Route
//           path="/login-page"
//           element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
//         />

//         {/* Protected Routes */}
//         <Route
//           path="/*"
//           element={
//             isAuthenticated ? (
//               <ProtectedLayout />
//             ) : (
//               <Navigate to="/login-page" replace />
//             )
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// const ProtectedLayout = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   return (
//     <div className="flex h-screen overflow-hidden">
//       {/* Sidebar */}
//       <SideBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

//       {/* Right section */}
//       <div className="flex-1 flex flex-col min-w-0">
//         <NavBar onToggleSidebar={() => setIsSidebarOpen(true)} />

//         <div className="flex-1 overflow-y-auto p-4 bg-white">
//           <Routes>
//             <Route path="/" element={<AdminDashboard />} />
//             <Route path="/notifications" element={<Notifications />} />
//             <Route path="/latest-news" element={<Latestnews />} />
//             <Route path="/latest-events" element={<LatestEvents />} />
//             <Route path="/voices-at-aknu" element={<VoiceAtAknu />} />
//             <Route path="/info/results" element={<Page_Results />} />
//             <Route path="/info/examination" element={<Page_Examination />} />
//             <Route path="/info/circular" element={<Page_Circular />} />
//             <Route path="/info/jobs" element={<Page_Jobs />} />
//             <Route path="/info/tenders" element={<Page_Tenders />} />
//             <Route path="/Events-Form-Data" element={<EventDetails />} />
//             <Route path="/Admission-Form-Data" element={<AdmissionDetails />} />
//             <Route
//               path="/Certification-Form-Data"
//               element={<CertificationDetails />}
//             />
//             <Route path="/Alumni-Form-Data" element={<AlumniDetails />} />
//             <Route path="/Feedback-Form-Data" element={<FeedBackDetails />} />
//             <Route path="/Ad-hoc-Faculty" element={<AdhocFaculty />} />
//             <Route path="/chat-with-us" element={<ChatWithUs />} />
//           </Routes>
//         </div>
//       </div>
//     </div>
//   );
// };
import React, { useState } from "react";
import SideBar from "./components/SideBar";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";

import Notifications from "./components/Notifications";
import Latestnews from "./components/Latestnews";
import LatestEvents from "./components/LatestEvents";
import VoiceAtAknu from "./components/VoiceAtAknu";
import AdminDashboard from "./components/AdminDashboard";

import Page_Examination from "./components/important_information/Page_Examination";
import Page_Circular from "./components/important_information/Page_Circular";
import Page_Jobs from "./components/important_information/Page_Jobs";
import Page_Tenders from "./components/important_information/Page_Tenders";
import Page_GOs from "./components/important_information/Page_GOs";
import EventDetails from "./components/AKNU_FormData/EventDetails";
import AdmissionDetails from "./components/AKNU_FormData/AdmissionDetails";
import CertificationDetails from "./components/Fees/CertificationDetails";
import AlumniDetails from "./components/AKNU_FormData/AlumniDetails";
import FeedBackDetails from "./components/AKNU_FormData/FeedBackDetails";
import AdhocFaculty from "./components/AdhocFaculty";
import LoginPage from "./components/LoginPage";

import NavBar from "./components/NavBar";
import ChatWithUs from "./components/ChatWithUs";
import ProtectedRoute from "./ProtectedRoute";
import Unauthorized from "./components/Unauthorized";
import FeesForm from "./components/Fees/FeesForm";
import AdmissionFeeDetails from "./components/Fees/AdmissionFeeDetails";
import Carousel from "./components/Carousel";
import ImportantDates from "./components/ImportantDates";
import Gallery from "./components/Gallery";
import Adhocform from "./components/forms/Adhocform";
import ForgotPassword from "./components/ForgotPassword";
import WomenCell from "./components/forms/womenCell";
import CDCComplaint from "./components/forms/cdcComplaint";
import NannayaVaniAdmin from "./components/NannayaVani/NannayaVani";
import ApplicationTabs from "./components/Fees/certificateSelector";
import SportsDetails from "./components/Fees/Sports";
import HostelDetails from "./components/Fees/Hostel";
import Hostels from "./components/Hostel/Hostels";
import Inventory from "./components/Hostel/Inventory";
import Spend from "./components/Hostel/Spend";
import HostelManagement from "./components/Hostel/HostelManagement";
import HostelMaster from "./components/Hostel/MasterData/HostelMaster";
import ApplicationManagement from "./components/Hostel/Applications/ApplicationManagement";
import RoomAllocation from "./components/Hostel/Allocations/RoomAllocation";
import LibraryInventory from "./components/Library/LibraryInventory";
import IssuedBooks from "./components/Library/IssuedBooks";
import BookCategories from "./components/Library/MasterData/BookCategories";
import Authors from "./components/Library/MasterData/Authors";
import Publishers from "./components/Library/MasterData/Publishers";
import LibraryRacks from "./components/Library/MasterData/LibraryRacks";
import LibraryInfo from "./components/Library/MasterData/LibraryInfo";
import FineRules from "./components/Library/FineRules";
import ManageBooks from "./components/Library/Books/ManageBooks";
import PhysicalInventory from "./components/Library/PhysicalInventory";
import DigitalLibrary from "./components/Library/DigitalLibrary";
import Students from "./components/Library/Users/Students";
import Faculty from "./components/Library/Users/Faculty";
import EmployeeHiringConsole from "./components/departments/EmployeeHiring/EmployeeHiringConsole";
import MyBooks from "./components/Library/MyBooks";
import Vehicles from "./components/Transportation/Vehicles";
import TransportationRoutes from "./components/Transportation/Routes";
import Assignments from "./components/Transportation/Assignments";
import TransportationTabs from "./components/Transportation/TransportationTabs"; // Added
import Drivers from "./components/Transportation/Drivers";
import LabInventory from "./components/Labs/LabInventory";
import LabBookings from "./components/Labs/LabBookings";
import Labs from "./components/Labs/Labs";
import MasterData from "./components/Labs/MasterData/MasterData";
import EquipmentCategories from "./components/Labs/Equipment/EquipmentCategories";
import EquipmentList from "./components/Labs/Equipment/EquipmentList";
import Consumables from "./components/Labs/Equipment/Consumables";
import LabSchedule from "./components/Labs/Schedule/LabSchedule";
import IssueTracking from "./components/Labs/Maintenance/IssueTracking";
import MaintenanceLog from "./components/Labs/Maintenance/MaintenanceLog";
import LabUsageReport from "./components/Labs/Reports/LabUsageReport";
import EquipmentReport from "./components/Labs/Reports/EquipmentReport";
import MaintenanceReport from "./components/Labs/Reports/MaintenanceReport";
import AffiliationFeeApplications from "./components/Fees/AfffilitiedForm";
import AdmissionFeeApplications from "./components/Fees/AdmissionFee";
import ApplicationFeeApplications from "./components/Fees/ApplicationFee";
import RevaluationFeeApplications from "./components/Fees/RevaluationFee";
import RatificationFeeApplications from "./components/Fees/RatificationFee";
import CondonationFeeApplications from "./components/Fees/CondonationFee";
import FinanceDashboard from "./components/Finance/FinanceDashboard";
import EmployeeBills from "./components/Finance/EmployeeBills";
import MiscellaneousBills from "./components/Finance/MiscellaneousBills";
import EmployeePayroll from "./components/Finance/EmployeePayroll";
import ExpensesInventory from "./components/Finance/ExpensesInventory";
import LetterGenerator from "./components/LetterHead/LetterGenerator";
import Page_Results from "./components/important_information/results/Page_Results";
import AdmissionModule from "./components/admission/Admission";
import AdmissionTabs from "./components/admission/College_and_fees.jsx";
import AdmissionCommunicationConsole from "./components/admission/AdmissionCommunicationConsole.jsx";
import PaymentPage from "./components/admission/College_and_fees.jsx/Payment.jsx";
import EditAdmission from "./components/admission/EditAdmission.jsx";
import LetterTracker from "./components/LetterHead/LetterTracker.jsx";
import SyllabusManager from "./components/website/syllabus/SyllabusManager.jsx";
import SeminarManager from "./components/website/departments/SeminarManager.jsx";

import LetterEditor from "./components/LetterHead/editor/Index.jsx";
import LetterHeadDesign from "./components/LetterHead/LetterHeadDesign.jsx";
import LetterHeadLibrary from "./components/LetterHead/LetterHeadLibrary.jsx";
import PreExamination from "./pages/PreExamination.jsx";
import PostExamination from "./pages/PostExamination.jsx";
import Results from "./pages/Results.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ReValuation from "./pages/ReValuation.jsx";
import ExampleUsage from "./utils/GlobalComponents/table/TableExample.jsx";
import CompleteFormExample from "./utils/GlobalComponents/form/CompleteFormExample.jsx";
import { Toaster } from "react-hot-toast";
import Departments from "./pages/EmployeeManagement/Departments.jsx";
import Onboarding from "./pages/EmployeeManagement/Onboarding.jsx";
import Roles from "./pages/EmployeeManagement/Roles.jsx";
import Permissions from "./pages/EmployeeManagement/Permissions.jsx";
import PaySlip from "./pages/EmployeeManagement/PaySlip.jsx";
import UploadPaySlip from "./pages/EmployeeManagement/UploadPaySlip.jsx";
import Timesheet from "./pages/EmployeeManagement/Timesheet.jsx";
import Leave from "./pages/EmployeeManagement/Leave.jsx";
import EmployeeAttendance from "./pages/EmployeeManagement/Attendance.jsx";
import SubmitQuery from "./pages/EmployeeManagement/SubmitQuery.jsx";
import Communication from "./pages/EmployeeManagement/Communication.jsx";
import Inquiries from "./pages/StudentManagement/Inquiries.jsx";
import Complaints from "./pages/StudentManagement/Complaints.jsx";
import OnboardingExam from "./pages/StudentManagement/OnboardingExam.jsx";
import StudentAttendance from "./pages/StudentManagement/Attendance.jsx";
import TimeTable from "./pages/StudentManagement/TimeTable.jsx";
import StudentResults from "./pages/StudentManagement/Results.jsx";
import PracticalsSubmission from "./pages/StudentManagement/PracticalsSubmission.jsx";
import Certificate from "./pages/StudentManagement/Certificate.jsx";
import Performance from "./pages/StudentManagement/Performance.jsx";
import DocumentReceipt from "./pages/StudentManagement/DocumentReceipt.jsx";
import AcknowledgedDocuments from "./pages/StudentManagement/AcknowledgedDocuments.jsx";
import SubmitBills from "./pages/EmployeeManagement/SubmitBills.jsx";
import Resignation from "./pages/EmployeeManagement/Resignation.jsx";
import LiveTrackingData from "./components/LiveTracking/LiveTrackingData.jsx";
import MapView from "./components/MapView.jsx";
import JourneyDetails from "./components/LiveTracking/JourneyDetails.jsx";
import FieldTracker from "./components/FieldTracker.jsx";
import ExaminationMasterData from "./components/examination/masterData";

import Calendar from "./components/calendar";
import Home from "./pages/Home.jsx";
import NoDueForm from "./components/Student/NoDueForm.jsx";
import StudentOutpass from "./components/Student/StudentOutpass.jsx";
import StudentMaintenance from "./components/Student/StudentMaintenance.jsx";
import EmployeePerformance from "./components/performance/EmployeePerformance.jsx";
import ManagerPerformanceConsole from "./components/performance/ManagerPerformanceConsole.jsx";
import EmployeeReviews from "./pages/EmployeeManagement/EmployeeReviews.jsx";
import EmployeeLetterHeads from "./pages/EmployeeManagement/LetterHeads.jsx";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token"); // Returns true if token exists
  });

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Login route */}
        <Route
          path="/login-page"
          element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <ProtectedLayout />
            ) : (
              <Navigate to="/login-page" replace />
            )
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

import { LetterHeadProvider } from "./Context/LetterHeadContext";

const ProtectedLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const isAuthenticated = !!localStorage.getItem("token");
  console.log("isAuthenticated", isAuthenticated);
  const handleSidebarToggle = (isOpen) => {
    if (window.innerWidth >= 1024) {
      setDesktopSidebarOpen(isOpen);
    } else {
      setIsSidebarOpen(isOpen);
    }
  };

  return (
    <LetterHeadProvider>
      <div className="flex h-screen overflow-hidden overflow-x-hidden">
        <ScrollToTop />
        {/* Sidebar */}
        <SideBar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onToggle={handleSidebarToggle}
        />

        {/* Right section - automatically adjusts based on sidebar width */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 overflow-x-hidden">
          <NavBar onToggleSidebar={() => setIsSidebarOpen(true)} />
          <div className="overflow-y-auto overflow-x-hidden">
            <div className="flex-1 bg-white min-h-[90vh]">
              <Routes>
              <Route
                path="/test"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["user", "admin", "super_admin"]}
                  >
                    <CompleteFormExample />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/test1"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["user", "admin", "super_admin"]}
                  >
                    <ExampleUsage />{" "}
                  </ProtectedRoute>
                }
              />
              {/* User access only */}
              <Route
                path="/Ad-hoc-Faculty"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["user", "admin", "super_admin"]}
                  >
                    <AdhocFaculty />
                  </ProtectedRoute>
                }
              />
              {/* Admin and Super Admin access only */}
              <Route
                path="/"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc", "councellor"]}
                  >
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/departments"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <Departments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/onboarding"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin", "employee"]}
                  >
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/roles"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <Roles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/permissions"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin", "employee"]}
                  >
                    <Permissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/pay-slip"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "employee", "vc"]}
                  >
                    <PaySlip />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee-payroll"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <EmployeePayroll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload-payslip"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "employee"]}
                  >
                    <UploadPaySlip />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee-bills"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "counsellor"]}
                  >
                    <EmployeeBills />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/miscellaneous-bills"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "counsellor"]}
                  >
                    <MiscellaneousBills />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses-inventory"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "counsellor"]}
                  >
                    <ExpensesInventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/timesheet"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin", "employee", "vc", "user"]}
                  >
                    <Timesheet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/leave"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin", "employee", "vc"]}
                  >
                    <Leave />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee-attandance"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin"]}
                  >
                    <EmployeeAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit-request"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin", "employee", "vc"]}
                  >
                    <SubmitQuery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/communication"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin"]}
                  >
                    <Communication />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit-bills"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin", "employee", "vc"]}
                  >
                    <SubmitBills />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/resignation"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "employee"]}
                  >
                    <Resignation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/latest-news"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <Latestnews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admission"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "counsellor"]}
                  >
                    <AdmissionModule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/no-due-form"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "counsellor", "user"]}
                  >
                    <NoDueForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/outpass"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["user", "admin", "super_admin"]}
                  >
                    <StudentOutpass />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/maintenance"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["user", "admin", "super_admin"]}
                  >
                    <StudentMaintenance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/examination/master-data"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "counsellor", "super_admin", "vc"]}
                  >
                    <ExaminationMasterData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Women_Cell"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <WomenCell />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/CDC_Complaint"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <CDCComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/performance/employee"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["employee", "admin", "super_admin"]}
                  >
                    <EmployeePerformance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/performance/manager"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <ManagerPerformanceConsole />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/reviews"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <EmployeeReviews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/letter-heads"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin", "employee", "vc", "user"]}
                  >
                    <EmployeeLetterHeads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/generate-letter"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin", "employee", "vc", "user"]}
                  >
                     <LetterGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hiring-center"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin"]}
                  >
                    <EmployeeHiringConsole />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload-letter-heads"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                     <LetterHeadDesign />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/letterhead-design"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                     <LetterHeadDesign />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-letter-heads"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                     <LetterHeadDesign />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/available-templates"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <LetterHeadLibrary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/request-letter-heads"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                      <LetterTracker />
                  </ProtectedRoute>
                }
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pre-examination/*" element={<PreExamination />} />
              <Route
                path="/post-examination/*"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "vc", "councellor"]}
                  >
                    <PostExamination />
                  </ProtectedRoute>
                }
              />
              <Route path="/results/*" element={<Results />} />
              <Route path="/re-valuation/*" element={<ReValuation />} />
              <Route
                path="/faculty-tracking"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "admin"]}
                  >
                    <LiveTrackingData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journey-details"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <JourneyDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/latest-events"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <LatestEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/voices-at-aknu"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <VoiceAtAknu />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/info/results"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <Page_Results />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/info/examination"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <Page_Examination />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/info/circular"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <Page_Circular />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/info/jobs"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <Page_Jobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/info/tenders"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <Page_Tenders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/info/gos"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <Page_GOs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Events-Form-Data"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <EventDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/NannayaVani"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <NannayaVaniAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ApplicationSelector"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <ApplicationTabs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admission_selectors"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "counsellor", "super_admin", "vc"]}
                  >
                    <AdmissionTabs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admission-communication"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "counsellor", "super_admin", "vc"]}
                  >
                    <AdmissionCommunicationConsole />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admission-payment-fees"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "counsellor"]}
                  >
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-admission"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "counsellor"]}
                  >
                    <EditAdmission />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Admission-Form-Data"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <AdmissionDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Certification-Form-Data"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <CertificationDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sports-Form-Data"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <SportsDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Hostel-Form-Data"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <HostelDetails />
                  </ProtectedRoute>
                }
              />
              {/* Hostel Management Routes */}
              <Route
                path="/hostel/*"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <HostelManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hostels"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Hostels />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/spend"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Spend />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library/inventory"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <LibraryInventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library/issued-books"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <IssuedBooks />
                  </ProtectedRoute>
                }
              />
              {/* Library Master Data Routes */}
              <Route
                path="/library/master-data/categories"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <BookCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library/master-data/authors"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Authors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library/master-data/publishers"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Publishers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library/master-data/racks"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <LibraryRacks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library/master-data/library-info"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <LibraryInfo />
                  </ProtectedRoute>
                }
              />
              {/* Library Book Management */}
              <Route
                path="/library/books"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <ManageBooks />
                  </ProtectedRoute>
                }
              />
              {/* Physical Inventory */}
              <Route
                path="/library/physical-inventory"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <PhysicalInventory />
                  </ProtectedRoute>
                }
              />
              {/* Digital Library */}
              <Route
                path="/library/digital-library"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <DigitalLibrary />
                  </ProtectedRoute>
                }
              />
              {/* Library User Management */}
              <Route
                path="/library/users/students"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Students />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library/users/faculty"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Faculty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library/users/rules"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <FineRules />
                  </ProtectedRoute>
                }
              />
              {/* Personal Library View - Accessible to all authenticated users */}
              <Route
                path="/library/my-books"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["user", "admin", "super_admin", "student", "faculty"]}
                  >
                    <MyBooks />
                  </ProtectedRoute>
                }
              />
              {/* Consolidated Transportation Route */}
              <Route
                path="/transportation/console"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <TransportationTabs />
                  </ProtectedRoute>
                }
              />
              {/* Individual Routes (Optional: can be removed if strictly using Console) */}
              <Route
                path="/transportation/drivers"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Drivers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transportation/vehicles"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Vehicles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transportation/routes"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <TransportationRoutes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transportation/assignments"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Assignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labs/inventory"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <LabInventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labs/bookings"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <LabBookings />
                  </ProtectedRoute>
                }
              />
              {/* Labs Master Data */}
              <Route
                path="/labs/master-data"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <MasterData />
                  </ProtectedRoute>
                }
              />
              {/* Labs Equipment */}
              <Route
                path="/labs/equipment/categories"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <EquipmentCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labs/equipment/list"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <EquipmentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labs/equipment/consumables"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Consumables />
                  </ProtectedRoute>
                }
              />
              {/* Labs Schedule */}
              <Route
                path="/labs/schedule"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <LabSchedule />
                  </ProtectedRoute>
                }
              />
              {/* Labs Maintenance */}
              <Route
                path="/labs/maintenance/issues"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <IssueTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labs/maintenance/log"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <MaintenanceLog />
                  </ProtectedRoute>
                }
              />
              {/* Labs Reports */}
              <Route
                path="/labs/reports/usage"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <LabUsageReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labs/reports/equipment"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <EquipmentReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labs/reports/maintenance"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <MaintenanceReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/labs"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin"]}
                  >
                    <Labs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Alumni-Form-Data"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <AlumniDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Feedback-Form-Data"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <FeedBackDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat-with-us"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <ChatWithUs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Affiliation-Form-Data"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <AffiliationFeeApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance-dashboard"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "counsellor"]}
                  >
                    <FinanceDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admission-fees"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <AdmissionFeeApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exam-fees"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <FeesForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/application-fee"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "counsellor"]}
                  >
                    <ApplicationFeeApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/revaluation-fee"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <RevaluationFeeApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ratification-fee"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <RatificationFeeApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/condonation-fee"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <CondonationFeeApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admission-exam-fees"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <AdmissionFeeDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/carousel"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <Carousel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/important-dates"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <ImportantDates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <Gallery />
                  </ProtectedRoute>
                }
              />{" "}
              <Route
                path="/info/syllabus"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <SyllabusManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/info/department-seminars"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "vc"]}
                  >
                    <SeminarManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/adhocform"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "user"]}
                  >
                    <Adhocform />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/field-tracker"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["super_admin", "vc"]}
                  >
                    <FieldTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin", "user"]}
                  >
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/holiday-calendar"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["admin", "super_admin"]}
                  >
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              {/* Student (SMS) Routes */}
              <Route
                path="/student/inquiries"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <Inquiries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/complaints"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <Complaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/onboarding-exam"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <OnboardingExam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/attendance"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <StudentAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/timetable"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <TimeTable />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/results"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <StudentResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/practicals-submission"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <PracticalsSubmission />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/certificate"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <Certificate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/performance"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <Performance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/document-receipt"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <DocumentReceipt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/acknowledged-documents"
                element={
                  <ProtectedRoute
                    isAuthenticated={isAuthenticated}
                    allowedRoles={["counsellor", "super_admin"]}
                  >
                    <AcknowledgedDocuments />
                  </ProtectedRoute>
                }
              />
              {/* Unauthorized Page */}
              <Route path="/map-view" element={<MapView />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              {/* Default route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <div className="text-center bg-[#525B88] text-white p-2 sm:text-xs md:text-sm">
            ©2025 iUMS Designed & Developed by PINKMOON Technologies Pvt Ltd
          </div>
        </div>
      </div>
    </div>
  </LetterHeadProvider>
);
};
