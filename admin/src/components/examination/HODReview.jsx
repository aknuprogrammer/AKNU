import React, { useState, useEffect } from "react";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";
import { initializeDummyInternalsData } from "./utils/initializeDummyInternalsData";

const HODReview = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [viewDetails, setViewDetails] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const courses = [
    { id: "course-1", name: "B.Tech CSE" },
    { id: "course-2", name: "B.Com" },
  ];

  const semesters = [
    { id: "1", name: "Semester 1" },
    { id: "2", name: "Semester 2" },
    { id: "3", name: "Semester 3" },
    { id: "4", name: "Semester 4" },
  ];

  useEffect(() => {
    // Initialize dummy data on component mount
    initializeDummyInternalsData();
  }, []);

  const resetDemoData = () => {
    // Clear existing demo internals and related flags
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("theory_internals_") ||
        key.startsWith("lab_internals_") ||
        key.startsWith("marks_entry_")
      ) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem("dummy_internals_initialized");

    // Recreate demo data
    initializeDummyInternalsData();
    showSuccessMessage("Demo data reloaded for HOD Review");

    // Refresh table if filters are set
    if (selectedCourse && selectedSemester) {
      loadSubjectStatus();
    }
  };

  useEffect(() => {
    if (selectedCourse && selectedSemester) {
      loadSubjectStatus();
    }
  }, [selectedCourse, selectedSemester]);

  const loadSubjectStatus = () => {
    // Load all marks entries from localStorage (both theory and lab)
    const entries = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach((key) => {
      if (key.startsWith("theory_internals_") || key.startsWith("lab_internals_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const isTheory = key.startsWith("theory_internals_");
          // Parse key: theory_internals_sub-1_A_2024-25_Semester 3
          const keyWithoutPrefix = key.replace(isTheory ? "theory_internals_" : "lab_internals_", "");
          
          // Split by first few underscores, then reconstruct semester (may contain spaces)
          const parts = keyWithoutPrefix.split("_");
          const subjectId = parts[0]; // sub-1
          const section = parts[1]; // A
          const academicYear = parts[2]; // 2024-25
          const semester = parts.slice(3).join(" "); // "Semester 3" (handles spaces)
          
          // Only include entries matching selected course and semester
          const selectedSemesterObj = semesters.find((s) => s.id === selectedSemester);
          const semesterMatch = selectedSemester === "" || 
                               (selectedSemesterObj && semester.includes(selectedSemesterObj.name));
          
          if (semesterMatch) {
            entries.push({
              subjectId: subjectId,
              section: section,
              type: isTheory ? "THEORY" : "LAB",
              status: data.status || "draft",
              hodStatus: data.hodStatus || "PENDING",
              submittedAt: data.submittedAt,
              marksData: data.marksData,
              academicYear: academicYear,
              semester: semester,
            });
          }
        } catch (err) {
          console.error("Error parsing entry:", key, err);
        }
      } else if (key.startsWith("marks_entry_")) {
        // Legacy format support
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const parts = key.replace("marks_entry_", "").split("_");
          entries.push({
            subjectId: parts[0],
            examType: parts.slice(1).join("_"),
            type: data.type || "THEORY",
            status: data.status || "draft",
            hodStatus: data.hodStatus || "PENDING",
            submittedAt: data.submittedAt,
            marksData: data.marksData,
          });
        } catch (err) {
          console.error("Error parsing legacy entry:", key, err);
        }
      }
    });

    // Aggregate by subject and type
    const subjectMap = {};
    entries.forEach((entry) => {
      const key = `${entry.subjectId}_${entry.type || "THEORY"}`;
      if (!subjectMap[key]) {
        subjectMap[key] = {
          subjectId: entry.subjectId,
          type: entry.type || "THEORY",
          draft: 0,
          submitted: 0,
          approved: 0,
          entries: [],
        };
      }
      subjectMap[key].entries.push(entry);
      if (entry.status === "draft") subjectMap[key].draft++;
      if (entry.status === "submitted" || entry.hodStatus === "PENDING") subjectMap[key].submitted++;
      if (entry.hodStatus === "APPROVED" || entry.status === "approved") subjectMap[key].approved++;
    });

    const subjectList = Object.values(subjectMap).map((subj) => {
      const subjectName = getSubjectName(subj.subjectId);
      const subjectCode = getSubjectCode(subj.subjectId);
      return {
        ...subj,
        subjectName: `${subjectName}${subjectCode ? ` (${subjectCode})` : ""} - ${subj.type}`,
        totalStudents: subj.entries[0] ? Object.keys(subj.entries[0].marksData || {}).length : 0,
      };
    });

    setSubjects(subjectList);
  };

  const getSubjectName = (subjectId) => {
    // Try to get from localStorage subjects first
    try {
      const subjects = JSON.parse(localStorage.getItem("exam_subjects") || "[]");
      const subject = Array.isArray(subjects) 
        ? subjects.find((s) => s._id === subjectId || s.code === subjectId)
        : null;
      if (subject) return subject.name || subject.subjectName;
    } catch (err) {
      // Fallback to hardcoded names
    }
    
    const subjects = {
      "sub-1": "Data Structures",
      "sub-2": "Database Systems",
      "sub-3": "Computer Networks",
      "lab-1": "Data Structures Lab",
      "lab-2": "Database Systems Lab",
      "lab-3": "Computer Networks Lab",
    };
    return subjects[subjectId] || subjectId;
  };

  const getSubjectCode = (subjectId) => {
    // Try to get from localStorage subjects first
    try {
      const subjects = JSON.parse(localStorage.getItem("exam_subjects") || "[]");
      const subject = Array.isArray(subjects) 
        ? subjects.find((s) => s._id === subjectId || s.code === subjectId)
        : null;
      if (subject) return subject.code || subject.subjectCode;
    } catch (err) {
      // Fallback to hardcoded codes
    }
    
    const codes = {
      "sub-1": "DSA",
      "sub-2": "DBMS",
      "sub-3": "CN",
      "lab-1": "DSA-LAB",
      "lab-2": "DBMS-LAB",
      "lab-3": "CN-LAB",
    };
    return codes[subjectId] || "";
  };

  const handleViewDetails = (subject) => {
    setViewDetails(subject);
    setShowViewModal(true);
  };

  const handleApprove = (entry) => {
    if (!window.confirm("Are you sure you want to approve these marks?")) return;

    let key;
    if (entry.type === "THEORY") {
      key = `theory_internals_${entry.subjectId}_${entry.section}_${entry.academicYear}_${entry.semester}`;
    } else if (entry.type === "LAB") {
      key = `lab_internals_${entry.subjectId}_${entry.section}_${entry.academicYear}_${entry.semester}`;
    } else {
      key = `marks_entry_${entry.subjectId}_${entry.examType}`;
    }
    
    const data = JSON.parse(localStorage.getItem(key));
    data.hodStatus = "APPROVED";
    data.status = "approved";
    data.approvedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(data));
    
    showSuccessMessage("Marks approved successfully");
    loadSubjectStatus();
    setShowViewModal(false);
  };

  const handleSendBack = (entry) => {
    if (!window.confirm("Send back for correction?")) return;

    let key;
    if (entry.type === "THEORY") {
      key = `theory_internals_${entry.subjectId}_${entry.section}_${entry.academicYear}_${entry.semester}`;
    } else if (entry.type === "LAB") {
      key = `lab_internals_${entry.subjectId}_${entry.section}_${entry.academicYear}_${entry.semester}`;
    } else {
      key = `marks_entry_${entry.subjectId}_${entry.examType}`;
    }
    
    const data = JSON.parse(localStorage.getItem(key));
    data.hodStatus = "SENT_BACK";
    data.status = "draft";
    data.sentBackAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(data));
    
    showSuccessMessage("Marks sent back for correction");
    loadSubjectStatus();
    setShowViewModal(false);
  };

  return (
    <div className="mt-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">HOD Review - Marks Approval</h3>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve internal marks submitted by faculty
        </p>
        <button
          onClick={resetDemoData}
          className="mt-3 inline-flex items-center px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"
        >
          Reset Demo Data
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course*</label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedSemester("");
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester*</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              disabled={!selectedCourse}
            >
              <option value="">Select Semester</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      {selectedCourse && selectedSemester && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Overall Progress</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {subjects.reduce((sum, s) => sum + s.draft, 0)}
              </div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {subjects.reduce((sum, s) => sum + s.submitted, 0)}
              </div>
              <div className="text-sm text-blue-700">Submitted</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {subjects.reduce((sum, s) => sum + s.approved, 0)}
              </div>
              <div className="text-sm text-green-700">Approved</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">
                {subjects.length}
              </div>
              <div className="text-sm text-gray-700">Total Subjects</div>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Table */}
      {selectedCourse && selectedSemester && subjects.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Subject</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Total Students</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Pending</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Submitted</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Approved</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.map((subject) => (
                <tr key={subject.subjectId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{subject.subjectName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{subject.totalStudents}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {subject.draft}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {subject.submitted}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {subject.approved}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleViewDetails(subject)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
          {!selectedCourse || !selectedSemester
            ? "Please select a course and semester to view subjects"
            : "No marks entries found"}
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Marks Details - {viewDetails.subjectName}</h3>
              <button onClick={() => setShowViewModal(false)} className="text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {viewDetails.entries.map((entry, idx) => (
                <div key={idx} className="mb-6 pb-6 border-b last:border-0">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-md font-semibold text-gray-800">
                        {entry.type || "THEORY"} - Section {entry.section || "A"}
                      </h4>
                      {entry.academicYear && entry.semester && (
                        <p className="text-xs text-gray-500 mt-1">
                          {entry.academicYear} - {entry.semester}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      entry.hodStatus === "PENDING" || entry.status === "submitted" ? "bg-blue-100 text-blue-800" :
                      entry.hodStatus === "APPROVED" || entry.status === "approved" ? "bg-green-100 text-green-800" :
                      entry.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {(entry.hodStatus || entry.status || "PENDING").toUpperCase()}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Roll No</th>
                          {entry.type === "THEORY" ? (
                            <>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Test-1</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Test-2</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Best Test</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Assignment</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Att. %</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Att. Marks</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Final (30)</th>
                            </>
                          ) : (
                            <>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Record</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Performance</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Internal Test</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Viva</th>
                              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Final (50)</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y">
                        {entry.marksData && Object.entries(entry.marksData).map(([studentId, marks]) => {
                          if (entry.type === "THEORY") {
                            const test1 = parseFloat(marks.test1 || 0);
                            const test2 = parseFloat(marks.test2 || 0);
                            const bestTest = Math.max(test1, test2);
                            const assignment = parseFloat(marks.assignment || 0);
                            const attendancePercentage = parseFloat(marks.attendancePercentage || 0);
                            const attendanceMarks = attendancePercentage >= 90 ? 5 :
                                                   attendancePercentage >= 80 ? 4 :
                                                   attendancePercentage >= 70 ? 3 :
                                                   attendancePercentage >= 60 ? 2 :
                                                   attendancePercentage >= 50 ? 1 : 0;
                            const total = bestTest + assignment + attendanceMarks;

                            return (
                              <tr key={studentId}>
                                <td className="px-4 py-2 text-sm">{studentId}</td>
                                <td className="px-4 py-2 text-center text-sm">{marks.test1 || "-"}</td>
                                <td className="px-4 py-2 text-center text-sm">{marks.test2 || "-"}</td>
                                <td className="px-4 py-2 text-center text-sm font-semibold text-blue-600">{bestTest.toFixed(1)}</td>
                                <td className="px-4 py-2 text-center text-sm">{marks.assignment || "-"}</td>
                                <td className="px-4 py-2 text-center text-sm">{marks.attendancePercentage || "-"}</td>
                                <td className="px-4 py-2 text-center text-sm font-semibold text-green-600">{attendanceMarks}</td>
                                <td className="px-4 py-2 text-center text-sm font-bold text-emerald-600">
                                  {marks.absent ? "0" : total.toFixed(1)}
                                </td>
                              </tr>
                            );
                          } else {
                            const record = parseFloat(marks.record || 0);
                            const performance = parseFloat(marks.performance || 0);
                            const internalTest = parseFloat(marks.internalTest || 0);
                            const viva = parseFloat(marks.viva || 0);
                            const total = record + performance + internalTest + viva;

                            return (
                              <tr key={studentId}>
                                <td className="px-4 py-2 text-sm">{studentId}</td>
                                <td className="px-4 py-2 text-center text-sm">{marks.record || "-"}</td>
                                <td className="px-4 py-2 text-center text-sm">{marks.performance || "-"}</td>
                                <td className="px-4 py-2 text-center text-sm">{marks.internalTest || "-"}</td>
                                <td className="px-4 py-2 text-center text-sm">{marks.viva || "-"}</td>
                                <td className="px-4 py-2 text-center text-sm font-bold text-emerald-600">
                                  {marks.absent ? "0" : total.toFixed(1)}
                                </td>
                              </tr>
                            );
                          }
                        })}
                      </tbody>
                    </table>
                  </div>

                  {(entry.status === "submitted" || entry.hodStatus === "PENDING") && (
                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        onClick={() => handleSendBack(entry)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                      >
                        Send Back
                      </button>
                      <button
                        onClick={() => handleApprove(entry)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODReview;

