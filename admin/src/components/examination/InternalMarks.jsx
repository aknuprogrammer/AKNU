import React, { useState, useEffect, useMemo } from "react";
import { initializeDummyInternalsData } from "./utils/initializeDummyInternalsData";

const InternalMarks = () => {
  const [marksEntries, setMarksEntries] = useState([]);
  const [filters, setFilters] = useState({
    course: "",
    branch: "",
    academicYear: "",
    semester: "",
    subject: "",
    section: "",
    type: "",
  });

  // Initialize dummy data on mount
  useEffect(() => {
    initializeDummyInternalsData();
    loadMarksData();
  }, []);

  const loadMarksData = () => {
    const entries = [];
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith("theory_internals_") || key.startsWith("lab_internals_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const isTheory = key.startsWith("theory_internals_");
          const keyWithoutPrefix = key.replace(isTheory ? "theory_internals_" : "lab_internals_", "");
          
          // Parse key: subjectId_section_academicYear_semester
          const parts = keyWithoutPrefix.split("_");
          const subjectId = parts[0];
          const section = parts[1];
          const academicYear = parts[2];
          const semester = parts.slice(3).join(" ");

          // Get subject details
          const subjectName = getSubjectName(subjectId);
          const subjectCode = getSubjectCode(subjectId);

          // Create entries for each student
          if (data.marksData && typeof data.marksData === "object") {
            Object.entries(data.marksData).forEach(([studentId, marks]) => {
              entries.push({
                studentId,
                subjectId,
                subjectName,
                subjectCode,
                section,
                academicYear,
                semester,
                type: isTheory ? "THEORY" : "LAB",
                marks: marks,
                status: data.status || "draft",
                hodStatus: data.hodStatus || "PENDING",
                submittedAt: data.submittedAt,
              });
            });
          }
        } catch (err) {
          console.error("Error parsing entry:", key, err);
        }
      }
    });

    setMarksEntries(entries);
  };

  const getSubjectName = (subjectId) => {
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

  // Filter options
  const courses = ["B.Tech CSE", "B.Com", "B.Tech ECE"];
  const branches = ["CSE", "ECE", "EEE", "ME", "CE"];
  const academicYears = ["2023-24", "2024-25", "2025-26"];
  const semesters = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"];
  const sections = ["A", "B", "C", "D", "E"];
  const types = ["THEORY", "LAB"];

  // Get unique values from data
  const availableSubjects = useMemo(() => {
    return Array.from(new Set(marksEntries.map((e) => `${e.subjectCode} - ${e.subjectName}`)));
  }, [marksEntries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return marksEntries.filter((entry) => {
      if (filters.academicYear && entry.academicYear !== filters.academicYear) return false;
      if (filters.semester && entry.semester !== filters.semester) return false;
      if (filters.type && entry.type !== filters.type) return false;
      if (filters.section && entry.section !== filters.section) return false;
      if (filters.subject) {
        const subjectMatch = `${entry.subjectCode} - ${entry.subjectName}` === filters.subject;
        if (!subjectMatch) return false;
      }
      return true;
    });
  }, [marksEntries, filters]);

  // Calculate totals for theory
  const calculateTheoryTotal = (marks) => {
    if (!marks || marks.absent) return 0;
    const test1 = parseFloat(marks.test1 || 0);
    const test2 = parseFloat(marks.test2 || 0);
    const assignment = parseFloat(marks.assignment || 0);
    const attendancePercentage = parseFloat(marks.attendancePercentage || 0);
    const attendanceMarks = attendancePercentage >= 90 ? 5 :
                           attendancePercentage >= 80 ? 4 :
                           attendancePercentage >= 70 ? 3 :
                           attendancePercentage >= 60 ? 2 :
                           attendancePercentage >= 50 ? 1 : 0;
    const bestTest = Math.max(test1, test2);
    return bestTest + assignment + attendanceMarks;
  };

  // Calculate totals for lab
  const calculateLabTotal = (marks) => {
    if (!marks || marks.absent) return 0;
    const record = parseFloat(marks.record || 0);
    const performance = parseFloat(marks.performance || 0);
    const internalTest = parseFloat(marks.internalTest || 0);
    const viva = parseFloat(marks.viva || 0);
    return record + performance + internalTest + viva;
  };

  // Get student name from ID (mock - in real app, fetch from students API)
  const getStudentName = (studentId) => {
    // Try to extract from student IDs or use mock data
    const studentNames = {
      "stu-1": "Rajesh Kumar",
      "stu-2": "Priya Sharma",
      "stu-3": "Amit Patel",
      "stu-4": "Sneha Reddy",
      "stu-5": "Vikram Singh",
    };
    return studentNames[studentId] || studentId.replace("stu-", "Student ");
  };

  const handleDownload = () => {
    const header = [
      "Roll Number",
      "Name",
      "Subject Code",
      "Subject Name",
      "Type",
      "Section",
      "Academic Year",
      "Semester",
      ...(filters.type === "THEORY" || !filters.type
        ? ["Test-1", "Test-2", "Best Test", "Assignment", "Attendance %", "Att. Marks", "Total (30)"]
        : ["Record", "Performance", "Internal Test", "Viva", "Total (50)"]),
      "Status",
      "HOD Status",
    ];

    const rows = filteredEntries.map((entry) => {
      const marks = entry.marks;
      const row = [
        entry.studentId,
        getStudentName(entry.studentId),
        entry.subjectCode,
        entry.subjectName,
        entry.type,
        entry.section,
        entry.academicYear,
        entry.semester,
      ];

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
        row.push(
          marks.test1 || "0",
          marks.test2 || "0",
          bestTest.toFixed(1),
          marks.assignment || "0",
          marks.attendancePercentage || "0",
          attendanceMarks,
          calculateTheoryTotal(marks).toFixed(1)
        );
      } else {
        row.push(
          marks.record || "0",
          marks.performance || "0",
          marks.internalTest || "0",
          marks.viva || "0",
          calculateLabTotal(marks).toFixed(1)
        );
      }

      row.push(entry.status, entry.hodStatus || "PENDING");
      return row;
    });

    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `internal_marks_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Internal Marks</h3>
          <p className="text-sm text-gray-500">
            View all uploaded internal marks filtered by course, branch, academic year, and semester
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Download CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Academic Year</label>
            <select
              value={filters.academicYear}
              onChange={(e) => setFilters((f) => ({ ...f, academicYear: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Semester</label>
            <select
              value={filters.semester}
              onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Subject</label>
            <select
              value={filters.subject}
              onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {availableSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Section</label>
            <select
              value={filters.section}
              onChange={(e) => setFilters((f) => ({ ...f, section: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2 flex items-end gap-2">
            <button
              onClick={loadMarksData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Refresh Data
            </button>
            <button
              onClick={() => setFilters({ course: "", branch: "", academicYear: "", semester: "", subject: "", section: "", type: "" })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredEntries.length}</span> student marks entries
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No marks entries found. Please adjust your filters or ensure marks have been uploaded.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Roll No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Section</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Academic Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Semester</th>
                {filters.type === "THEORY" || !filters.type ? (
                  <>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Test-1</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Test-2</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Best Test</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Assignment</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Att. %</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Att. Marks</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Total (30)</th>
                  </>
                ) : null}
                {filters.type === "LAB" || !filters.type ? (
                  <>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Record</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Performance</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Internal Test</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Viva</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Total (50)</th>
                  </>
                ) : null}
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">HOD Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry, idx) => {
                const marks = entry.marks;
                const isAbsent = marks.absent;

                return (
                  <tr key={`${entry.studentId}-${entry.subjectId}-${entry.section}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{entry.studentId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{getStudentName(entry.studentId)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      <div>{entry.subjectCode}</div>
                      <div className="text-xs text-gray-500">{entry.subjectName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.type === "THEORY" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Section {entry.section}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{entry.academicYear}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{entry.semester}</td>

                    {entry.type === "THEORY" && (filters.type === "THEORY" || !filters.type) && (
                      <>
                        <td className="px-4 py-3 text-center text-sm">{isAbsent ? "Abs" : marks.test1 || "0"}</td>
                        <td className="px-4 py-3 text-center text-sm">{isAbsent ? "Abs" : marks.test2 || "0"}</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600">
                          {isAbsent ? "0" : Math.max(parseFloat(marks.test1 || 0), parseFloat(marks.test2 || 0)).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-center text-sm">{isAbsent ? "Abs" : marks.assignment || "0"}</td>
                        <td className="px-4 py-3 text-center text-sm">{isAbsent ? "-" : marks.attendancePercentage || "0"}%</td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">
                          {isAbsent ? "0" : (
                            parseFloat(marks.attendancePercentage || 0) >= 90 ? 5 :
                            parseFloat(marks.attendancePercentage || 0) >= 80 ? 4 :
                            parseFloat(marks.attendancePercentage || 0) >= 70 ? 3 :
                            parseFloat(marks.attendancePercentage || 0) >= 60 ? 2 :
                            parseFloat(marks.attendancePercentage || 0) >= 50 ? 1 : 0
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-emerald-600">
                          {isAbsent ? "0" : calculateTheoryTotal(marks).toFixed(1)}
                        </td>
                      </>
                    )}

                    {entry.type === "LAB" && (filters.type === "LAB" || !filters.type) && (
                      <>
                        <td className="px-4 py-3 text-center text-sm">{isAbsent ? "Abs" : marks.record || "0"}</td>
                        <td className="px-4 py-3 text-center text-sm">{isAbsent ? "Abs" : marks.performance || "0"}</td>
                        <td className="px-4 py-3 text-center text-sm">{isAbsent ? "Abs" : marks.internalTest || "0"}</td>
                        <td className="px-4 py-3 text-center text-sm">{isAbsent ? "Abs" : marks.viva || "0"}</td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-emerald-600">
                          {isAbsent ? "0" : calculateLabTotal(marks).toFixed(1)}
                        </td>
                      </>
                    )}

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.status === "submitted" || entry.status === "approved" ? "bg-green-100 text-green-800" :
                        entry.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {entry.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.hodStatus === "APPROVED" ? "bg-green-100 text-green-800" :
                        entry.hodStatus === "PENDING" ? "bg-blue-100 text-blue-800" :
                        entry.hodStatus === "SENT_BACK" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {entry.hodStatus || "PENDING"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InternalMarks;
