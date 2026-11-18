import React, { useState, useEffect, useMemo } from "react";
import InternalTheoryForm from "./InternalTheoryForm";
import InternalLabForm from "./InternalLabForm";
import { initializeDummyInternalsData } from "./utils/initializeDummyInternalsData";
import { showSuccessMessage } from "../../config/Toast";
import { professorsApi, subjectsApi } from "../../services/apiService";

const FacultySubjectDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard"); // dashboard, theory, lab
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current faculty ID - In real app, this comes from auth context
  // For demo, using first professor or localStorage
  const getCurrentFacultyId = () => {
    // In production: return auth.user.professorId or auth.user._id
    // For demo: return first professor ID or stored value
    const stored = localStorage.getItem("current_faculty_id");
    if (stored) return stored;
    
    // Default to first professor for demo
    const professors = JSON.parse(localStorage.getItem("exam_professors") || "[]");
    if (professors.length > 0) {
      const defaultId = professors[0]._id || professors[0].professorId;
      localStorage.setItem("current_faculty_id", defaultId);
      return defaultId;
    }
    return null;
  };

  useEffect(() => {
    // Initialize dummy data on component mount (only once)
    initializeDummyInternalsData();
    loadAssignedSubjects();
  }, []);

  const loadAssignedSubjects = async () => {
    try {
      setLoading(true);
      
      // Get current faculty ID
      const currentFacultyId = getCurrentFacultyId();
      if (!currentFacultyId) {
        console.warn("No faculty ID found. Using demo data.");
        loadDemoSubjects();
        return;
      }

      // Load faculty subject assignments from localStorage (or API in production)
      // Structure: faculty_subject_assignments table
      const assignments = JSON.parse(localStorage.getItem("faculty_subject_assignments") || "[]");
      
      // Filter assignments for current faculty
      const myAssignments = assignments.filter(
        (assignment) => 
          assignment.facultyId === currentFacultyId || 
          assignment.professorId === currentFacultyId ||
          assignment.facultyId?._id === currentFacultyId
      );

      if (myAssignments.length === 0) {
        // Fallback to faculty_subject_mappings if assignments don't exist
        const mappings = JSON.parse(localStorage.getItem("faculty_subject_mappings") || "[]");
        const myMappings = mappings.filter(
          (m) => m.facultyId === currentFacultyId
        );
        
        if (myMappings.length > 0) {
          // Convert mappings to assignments format
          const converted = myMappings.map((m) => ({
            subjectId: m.subjectId,
            subjectCode: m.subjectCode,
            subjectName: m.subjectName,
            subjectType: "THEORY", // Default, will be determined from subject
            academicYear: "2024-25", // Default
            semester: `Semester ${m.semester}`,
            branch: "CSE", // Default
            section: "A", // Default
            subjectCategory: "Core", // Default
            facultyId: currentFacultyId,
          }));
          setAssignedSubjects(converted);
        } else {
          loadDemoSubjects();
        }
      } else {
        // Load subject details from subjects API/localStorage
        const subjects = await subjectsApi.getAll().catch(() => {
          const stored = JSON.parse(localStorage.getItem("exam_subjects") || "[]");
          return stored;
        });

        const subjectsWithDetails = myAssignments.map((assignment) => {
          const subject = Array.isArray(subjects) 
            ? subjects.find((s) => s._id === assignment.subjectId || s.code === assignment.subjectCode)
            : null;
          
          return {
            id: assignment.subjectId,
            code: assignment.subjectCode || subject?.code || "N/A",
            name: assignment.subjectName || subject?.name || "Unknown Subject",
            type: assignment.subjectType || determineSubjectType(assignment.subjectCode || subject?.code),
            sections: assignment.sections || [assignment.section || "A"],
            semester: assignment.semester || "Semester 3",
            academicYear: assignment.academicYear || "2024-25",
            branch: assignment.branch || assignment.stream || "CSE",
            category: assignment.subjectCategory || (assignment.isCore ? "Core" : "Elective"),
            originalAssignment: assignment,
          };
        });

        setAssignedSubjects(subjectsWithDetails);
      }
    } catch (err) {
      console.error("Error loading assigned subjects:", err);
      loadDemoSubjects();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoSubjects = () => {
    // Fallback demo data if no assignments found
    const demo = [
      {
        id: "sub-1",
        code: "DSA",
        name: "Data Structures",
        type: "THEORY",
        sections: ["A", "B"],
        semester: "Semester 3",
        academicYear: "2024-25",
        branch: "CSE",
        category: "Core",
      },
      {
        id: "lab-1",
        code: "DSA-LAB",
        name: "Data Structures Lab",
        type: "LAB",
        sections: ["A", "B"],
        semester: "Semester 3",
        academicYear: "2024-25",
        branch: "CSE",
        category: "Lab",
      },
      {
        id: "sub-2",
        code: "DBMS",
        name: "Database Systems",
        type: "THEORY",
        sections: ["A"],
        semester: "Semester 4",
        academicYear: "2024-25",
        branch: "CSE",
        category: "Core",
      },
    ];
    setAssignedSubjects(demo);
  };

  const determineSubjectType = (code) => {
    if (!code) return "THEORY";
    const upperCode = code.toUpperCase();
    if (upperCode.includes("LAB") || upperCode.includes("PRACTICAL")) {
      return "LAB";
    }
    return "THEORY";
  };

  // Check status of each subject
  const getSubjectStatus = (subject) => {
    const statuses = [];
    subject.sections.forEach((section) => {
      const key = `${subject.type === "THEORY" ? "theory_internals_" : "lab_internals_"}${subject.id}_${section}_${subject.academicYear}_${subject.semester}`;
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status === "submitted" || parsed.hodStatus === "PENDING") {
            statuses.push(`${section}: Submitted`);
          } else if (parsed.hodStatus === "APPROVED" || parsed.status === "approved") {
            statuses.push(`${section}: Approved`);
          } else if (parsed.status === "locked") {
            statuses.push(`${section}: Frozen`);
          } else {
            statuses.push(`${section}: Draft`);
          }
        } catch (err) {
          statuses.push(`${section}: No data`);
        }
      } else {
        statuses.push(`${section}: No entry`);
      }
    });
    return statuses.join(", ");
  };

  if (activeView === "theory") {
    return (
      <div>
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={() => {
              setActiveView("dashboard");
              setSelectedSubject(null);
            }}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          {selectedSubject && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{selectedSubject.name}</span> - {selectedSubject.semester} - {selectedSubject.academicYear}
            </div>
          )}
        </div>
        <InternalTheoryForm preSelectedSubject={selectedSubject} />
      </div>
    );
  }

  if (activeView === "lab") {
    return (
      <div>
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={() => {
              setActiveView("dashboard");
              setSelectedSubject(null);
            }}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          {selectedSubject && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{selectedSubject.name}</span> - {selectedSubject.semester} - {selectedSubject.academicYear}
            </div>
          )}
        </div>
        <InternalLabForm preSelectedSubject={selectedSubject} />
      </div>
    );
  }

  const handleInitializeDemo = () => {
    // Clear existing data and re-initialize
    localStorage.removeItem("dummy_internals_initialized");
    
    // Clear all existing internal marks
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("theory_internals_") || key.startsWith("lab_internals_")) {
        localStorage.removeItem(key);
      }
    });
    
    // Re-initialize
    initializeDummyInternalsData();
    showSuccessMessage("Demo data reset successfully! Please refresh the page.");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">My Assigned Subjects</h3>
          <p className="text-sm text-gray-500 mt-1">
            Subjects assigned to you for internal marks entry
          </p>
          <p className="text-xs text-blue-600 mt-2">
            💡 Showing subjects from faculty_subject_assignments. Only your assigned subjects are displayed.
          </p>
        </div>
        <button
          onClick={handleInitializeDemo}
          className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 border border-blue-300"
          title="Reset and reload demo data"
        >
          Reset Demo Data
        </button>
      </div>

      {assignedSubjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No subjects assigned</p>
          <p className="text-sm">
            Contact your HOD or Admin to get subjects assigned to you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedSubjects.map((subject) => (
            <div
              key={`${subject.id}-${subject.code}`}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-800">{subject.name}</h4>
                  <p className="text-sm text-gray-600 font-mono">{subject.code}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    subject.type === "THEORY"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {subject.type}
                </span>
              </div>

              {/* Subject Details */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Semester:</strong> {subject.semester}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span><strong>Academic Year:</strong> {subject.academicYear}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span><strong>Branch:</strong> {subject.branch}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span><strong>Sections:</strong> {subject.sections.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span><strong>Category:</strong> {subject.category}</span>
                </div>
              </div>

              <div className="space-y-2">
                {subject.type === "THEORY" && (
                  <button
                    onClick={() => {
                      setSelectedSubject(subject);
                      setActiveView("theory");
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Enter Theory Internals
                  </button>
                )}
                {subject.type === "LAB" && (
                  <button
                    onClick={() => {
                      setSelectedSubject(subject);
                      setActiveView("lab");
                    }}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Enter Lab Internals
                  </button>
                )}
                <div className="text-xs text-gray-500 pt-2 border-t">
                  <div className="font-semibold mb-1">Status:</div>
                  <div>{getSubjectStatus(subject)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultySubjectDashboard;
