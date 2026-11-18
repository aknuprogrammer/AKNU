import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import {
  loadLogoAsBase64,
  loadNannayaLogoAsBase64,
} from "../components/examination/masterData/utils/loadLogoAsBase64";
import JumblingCenters from "../components/examination/JumblingCenters";
import InternalMarks from "../components/examination/InternalMarks";
import InternalExamSetup from "../components/examination/InternalExamSetup";
import FacultySubjectAssignment from "../components/examination/FacultySubjectAssignment";
import StudentMarksEntry from "../components/examination/StudentMarksEntry";
import FacultySubjectDashboard from "../components/examination/FacultySubjectDashboard";
import HODReview from "../components/examination/HODReview";
import AdminFreeze from "../components/examination/AdminFreeze";
import ExamApplicationList from "../components/examination/ExamApplicationList";
import NotificationsCirculars from "../components/examination/NotificationsCirculars";
import ReceivingApplications from "../components/examination/ReceivingApplications";
import ExamAttendanceForm from "../components/examination/ExamAttendanceForm";
import ExamReportForm from "../components/examination/ExamReportForm";
import QuestionPaperTable from "../components/examination/masterData/QuestionPaperTable";
import QuestionPaperAdminView from "../components/examination/masterData/QuestionPaperAdminView";

// Admin Sub-components for Pre-Examination

const QuestionPaperManagement = () => {
  const [papers, setPapers] = useState([
    {
      subject: "Advanced Algorithms",
      faculty: "Dr. Sharma",
      status: "Uploaded",
      moderation: "Pending",
    },
    {
      subject: "Database Systems",
      faculty: "Prof. Kumar",
      status: "Pending",
      moderation: "Pending",
    },
  ]);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Question Paper Management
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage question papers, uploads, and moderation status
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Question Paper Status</h3>
        </div>
        <div className="p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Faculty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Upload Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Moderation
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {papers.map((paper, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {paper.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {paper.faculty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        paper.status === "Uploaded"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {paper.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      {paper.moderation}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors">
                        View
                      </button>
                      <button className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors">
                        Approve
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secure Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border mt-6">
        <h3 className="text-lg font-semibold mb-4">Secure Upload Portal</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="text-4xl mb-2">📎</div>
          <p className="text-gray-600 mb-4">
            Drag and drop question papers here or click to browse
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Select Files
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Maximum file size: 10MB per paper
          </p>
        </div>
      </div>
    </div>
  );
};

const PreExamination = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname;
    if (path.includes("/notifications")) return "notifications";
    if (path.includes("/receiving-applications"))
      return "receiving-applications";
    if (path.includes("/question-papers")) return "question-papers";
    if (path.includes("/question-paper-view")) return "question-paper-view";
    if (path.includes("/jumbling-centers")) return "jumbling-centers";
    if (path.includes("/internal-exam-setup")) return "internal-exam-setup";
    // if (path.includes("/hod-review")) return "hod-review";
    // if (path.includes("/admin-freeze")) return "admin-freeze";
    // if (path.includes("/internal-marks")) return "internal-marks";
    if (path.includes("/exam-application-list")) return "exam-application-list";
    if (path.includes("/exam-attendance")) return "exam-attendance";
    if (path.includes("/exam-reports")) return "exam-reports";
    return "notifications";
  });

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/notifications")) {
      setActiveTab("notifications");
    } else if (path.includes("/receiving-applications")) {
      setActiveTab("receiving-applications");
    } else if (path.includes("/question-papers")) {
      setActiveTab("question-papers");
    } else if (path.includes("/jumbling-centers")) {
      setActiveTab("jumbling-centers");
    } else if (path.includes("/internal-exam-setup")) {
      setActiveTab("internal-exam-setup");
      // } else if (path.includes("/faculty-subject-assignment")) {
      //   setActiveTab("faculty-subject-assignment");
      // } else if (path.includes("/faculty-subjects")) {
      //   setActiveTab("faculty-subjects");
      // } else if (path.includes("/hod-review")) {
      //   setActiveTab("hod-review");
      // } else if (path.includes("/admin-freeze")) {
      //   setActiveTab("admin-freeze");
      // } else if (path.includes("/internal-marks")) {
      //   setActiveTab("internal-marks");
      // } else if (path.includes("/student-marks-entry")) {
      //   setActiveTab("student-marks-entry");
    } else if (path.includes("/exam-application-list")) {
      setActiveTab("exam-application-list");
    } else if (path.includes("/exam-attendance")) {
      setActiveTab("exam-attendance");
    } else if (path.includes("/exam-reports")) {
      setActiveTab("exam-reports");
    } else {
      setActiveTab("notifications");
    }
  }, [location.pathname]);

  const tabs = [
    { id: "notifications", name: "Notifications", path: "/notifications" },

    // {
    //   id: "exam-application-list",
    //   name: "Receiving Applications",
    //   path: "/exam-application-list",
    // },
    {
      id: "receiving-applications",
      name: "Receiving Applications",
      path: "/receiving-applications",
    },
    {
      id: "question-papers",
      name: "Question Papers",
      path: "/question-papers",
    },
    {
      id: "question-paper-view",
      name: "Review Question Papers",
      path: "/question-paper-view",
    },
    {
      id: "jumbling-centers",
      name: "Jumbling Centers",
      path: "/jumbling-centers",
    },

    {
      id: "internal-exam-setup",
      name: "Exam Setup",
      path: "/internal-exam-setup",
    },
    {
      id: "exam-attendance",
      name: "Exam Attendance",
      path: "/exam-attendance",
    },
    {
      id: "exam-reports",
      name: "Exam Reports",
      path: "/exam-reports",
    },
    // {
    //   id: "faculty-subject-assignment",
    //   name: "Subject Assignment",
    //   path: "/faculty-subject-assignment",
    // },
    // {
    //   id: "faculty-subjects",
    //   name: "Faculty Subjects",
    //   path: "/faculty-subjects",
    // },
    // {
    //   id: "hod-review",
    //   name: "HOD Review",
    //   path: "/hod-review",
    // },
    // {
    //   id: "admin-freeze",
    //   name: "Freeze Marks",
    //   path: "/admin-freeze",
    // },
    // {
    //   id: "internal-marks",
    //   name: "Internal Marks",
    //   path: "/internal-marks",
    // },
    // {
    //   id: "student-marks-entry",
    //   name: "Student Marks Entry",
    //   path: "/student-marks-entry",
    // },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab.id);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Pre-Examination Management
      </h1>

      <div className="flex space-x-4 border-b overflow-x-auto pb-3">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={`/pre-examination${tab.path}`}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Routes>
          <Route path="/" element={<NotificationsCirculars />} />
          <Route path="/notifications" element={<NotificationsCirculars />} />
          <Route
            path="/receiving-applications"
            element={<ReceivingApplications />}
          />
          <Route
            path="/question-papers"
            // element={<QuestionPaperManagement />}
            element={<QuestionPaperTable />}
          />
          <Route
            path="/question-paper-view"
            element={<QuestionPaperAdminView tabKey="question-paper-view" />}
          />
          <Route path="/jumbling-centers" element={<JumblingCenters />} />
          <Route path="/internal-exam-setup" element={<InternalExamSetup />} />
          {/* <Route
            path="/faculty-subject-assignment"
            element={<FacultySubjectAssignment />}
          />
          <Route
            path="/faculty-subjects"
            element={<FacultySubjectDashboard />}
          />
          <Route path="/hod-review" element={<HODReview />} />
          <Route path="/admin-freeze" element={<AdminFreeze />} />
          <Route path="/internal-marks" element={<InternalMarks />} />
          <Route path="/student-marks-entry" element={<StudentMarksEntry />} /> */}
          <Route
            path="/exam-application-list"
            element={<ExamApplicationList />}
          />
          <Route path="/exam-attendance" element={<ExamAttendanceForm />} />
          <Route path="/exam-reports" element={<ExamReportForm />} />
        </Routes>
      </div>
    </div>
  );
};

export default PreExamination;
