import React, { useState, useEffect } from "react";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";

const InternalTheoryForm = ({ preSelectedSubject = null }) => {
  const [filters, setFilters] = useState({
    academicYear: preSelectedSubject?.academicYear || "",
    course: preSelectedSubject?.courseName || "",
    branch: preSelectedSubject?.branch || "",
    semester: preSelectedSubject?.semester || "",
    subjectId: preSelectedSubject?.id || "",
    section: "",
  });

  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [entryStatus, setEntryStatus] = useState("draft");
  const [showPreview, setShowPreview] = useState(false);

  const academicYears = [
    { id: "2023-24", name: "2023-24" },
    { id: "2024-25", name: "2024-25" },
  ];

  const semesters = [
    { id: "1", name: "Semester 1" },
    { id: "2", name: "Semester 2" },
    { id: "3", name: "Semester 3" },
    { id: "4", name: "Semester 4" },
  ];

  // Mock courses and branches (would come from master data / assignment)
  const courses = [
    { id: "btech", name: "B.Tech" },
    { id: "bsc", name: "B.Sc" },
    { id: "mtech", name: "M.Tech" },
  ];

  const branches = [
    { id: "CSE", name: "CSE" },
    { id: "ECE", name: "ECE" },
    { id: "EEE", name: "EEE" },
    { id: "MECH", name: "MECH" },
    { id: "CIVIL", name: "CIVIL" },
  ];

  const subjects = [
    { id: "sub-1", code: "DSA", name: "Data Structures", type: "THEORY" },
    { id: "sub-2", code: "DBMS", name: "Database Systems", type: "THEORY" },
    { id: "sub-3", name: "Computer Networks", type: "THEORY" },
  ];

  const sections = ["A", "B", "C"];

  // Constants for Theory Internals
  const MAX_TEST_1 = 15;
  const MAX_TEST_2 = 15;
  const MAX_ASSIGNMENT = 5;
  const MAX_ATTENDANCE_MARKS = 5;
  const TOTAL_THEORY_INTERNALS = 30;

  // Attendance to marks conversion
  const calculateAttendanceMarks = (percentage) => {
    if (percentage >= 90) return 5;
    if (percentage >= 80) return 4;
    if (percentage >= 70) return 3;
    if (percentage >= 60) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Calculate final internal: Best of Test-1 and Test-2 + Assignment + Attendance
  const calculateFinalInternal = (studentId) => {
    const data = marksData[studentId];
    if (!data || data.absent) return 0;

    const test1 = parseFloat(data.test1 || 0);
    const test2 = parseFloat(data.test2 || 0);
    const assignment = parseFloat(data.assignment || 0);
    const attendancePercentage = parseFloat(data.attendancePercentage || 0);
    const attendanceMarks = calculateAttendanceMarks(attendancePercentage);

    const bestTest = Math.max(test1, test2);
    return bestTest + assignment + attendanceMarks;
  };

  useEffect(() => {
    // Auto-fill filters from pre-selected subject
    if (preSelectedSubject) {
      setFilters({
        academicYear: preSelectedSubject.academicYear || "",
        course: preSelectedSubject.courseName || "",
        branch: preSelectedSubject.branch || "",
        semester: preSelectedSubject.semester || "",
        subjectId: preSelectedSubject.id || "",
        section: preSelectedSubject.sections?.[0] || "",
      });
    }
  }, [preSelectedSubject]);

  useEffect(() => {
    // Load saved draft when section is selected
    if (filters.subjectId && filters.section && filters.academicYear && filters.semester) {
      const saved = localStorage.getItem(
        `theory_internals_${filters.subjectId}_${filters.section}_${filters.academicYear}_${filters.semester}`
      );
      if (saved) {
        const parsed = JSON.parse(saved);
        setMarksData(parsed.marksData || {});
        setEntryStatus(parsed.status || parsed.hodStatus ? "submitted" : "draft");
      }
    }
  }, [filters.subjectId, filters.section, filters.academicYear, filters.semester]);

  const handleLoadStudents = () => {
    if (
      !filters.academicYear ||
      !filters.course ||
      !filters.branch ||
      !filters.semester ||
      !filters.subjectId ||
      !filters.section
    ) {
      showErrorMessage("Please fill all filter fields");
      return;
    }

    // Mock student data
    const studentNames = [
      "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh",
      "Anjali Mehta", "Rahul Gupta", "Kavya Nair", "Suresh Rao", "Divya Iyer",
      "Mohan Das", "Lakshmi Menon", "Karthik Pillai", "Swati Joshi", "Rohan Malhotra",
    ];

    const mockStudents = Array.from({ length: 15 }).map((_, idx) => ({
      id: `stu-${idx + 1}`,
      rollNumber: `STU${String(idx + 1).padStart(4, "0")}`,
      name: studentNames[idx] || `Student ${idx + 1}`,
    }));

    setStudents(mockStudents);

    // Initialize with dummy data
    const initialMarks = {};
    mockStudents.forEach((stu, idx) => {
      const savedData = marksData[stu.id];

      if (savedData && (savedData.test1 !== "" || savedData.test2 !== "")) {
        initialMarks[stu.id] = savedData;
      } else {
        if (idx >= mockStudents.length - 2) {
          initialMarks[stu.id] = {
            test1: "",
            test2: "",
            assignment: "",
            attendancePercentage: "",
            absent: true,
          };
        } else {
          // Generate realistic dummy data
          const performanceRatio = idx < 5 ? 0.85 : idx < 10 ? 0.75 : 0.65;
          const test1 = Math.round(MAX_TEST_1 * (performanceRatio + (Math.random() - 0.5) * 0.15) * 10) / 10;
          const test2 = Math.round(MAX_TEST_2 * (performanceRatio + (Math.random() - 0.5) * 0.15) * 10) / 10;
          const assignment = Math.round(MAX_ASSIGNMENT * (0.80 + Math.random() * 0.15) * 10) / 10;
          const attendancePercentage = Math.round((75 + Math.random() * 20) * 10) / 10; // 75-95%

          initialMarks[stu.id] = {
            test1: Math.max(0, Math.min(MAX_TEST_1, test1)).toString(),
            test2: Math.max(0, Math.min(MAX_TEST_2, test2)).toString(),
            assignment: Math.max(0, Math.min(MAX_ASSIGNMENT, assignment)).toString(),
            attendancePercentage: Math.max(0, Math.min(100, attendancePercentage)).toString(),
            absent: false,
          };
        }
      }
    });

    setMarksData(initialMarks);
    showSuccessMessage("Students loaded successfully");
  };

  const handleMarksChange = (studentId, field, value) => {
    if (entryStatus === "submitted" || entryStatus === "approved" || entryStatus === "locked") {
      return;
    }

    setMarksData((prev) => {
      const updated = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [field]: value,
        },
      };

      // Auto-calculate attendance marks when percentage changes
      if (field === "attendancePercentage") {
        const percentage = parseFloat(value || 0);
        updated[studentId].attendanceMarks = calculateAttendanceMarks(percentage).toString();
      }

      return updated;
    });
  };

  const handleAbsentToggle = (studentId) => {
    if (entryStatus === "submitted" || entryStatus === "approved" || entryStatus === "locked") {
      return;
    }

    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        absent: !prev[studentId]?.absent,
        test1: prev[studentId]?.absent ? prev[studentId].test1 : "",
        test2: prev[studentId]?.absent ? prev[studentId].test2 : "",
        assignment: prev[studentId]?.absent ? prev[studentId].assignment : "",
        attendancePercentage: prev[studentId]?.absent ? prev[studentId].attendancePercentage : "",
        attendanceMarks: prev[studentId]?.absent ? prev[studentId].attendanceMarks : "0",
      },
    }));
  };

  const validateMarks = () => {
    const errors = [];
    students.forEach((stu) => {
      const data = marksData[stu.id];
      if (!data || data.absent) return;

      if (data.test1 === "" || data.test2 === "" || data.assignment === "" || data.attendancePercentage === "") {
        errors.push(`${stu.rollNumber}: All fields are required`);
      }

      if (parseFloat(data.test1 || 0) > MAX_TEST_1) {
        errors.push(`${stu.rollNumber}: Test-1 exceeds maximum (${MAX_TEST_1})`);
      }
      if (parseFloat(data.test2 || 0) > MAX_TEST_2) {
        errors.push(`${stu.rollNumber}: Test-2 exceeds maximum (${MAX_TEST_2})`);
      }
      if (parseFloat(data.assignment || 0) > MAX_ASSIGNMENT) {
        errors.push(`${stu.rollNumber}: Assignment exceeds maximum (${MAX_ASSIGNMENT})`);
      }
      if (parseFloat(data.attendancePercentage || 0) > 100) {
        errors.push(`${stu.rollNumber}: Attendance percentage cannot exceed 100%`);
      }
      if (
        parseFloat(data.test1 || 0) < 0 ||
        parseFloat(data.test2 || 0) < 0 ||
        parseFloat(data.assignment || 0) < 0 ||
        parseFloat(data.attendancePercentage || 0) < 0
      ) {
        errors.push(`${stu.rollNumber}: Marks cannot be negative`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const handleSaveDraft = () => {
    const key = `theory_internals_${filters.subjectId}_${filters.section}_${filters.academicYear}_${filters.semester}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        marksData,
        status: "draft",
        updatedAt: new Date().toISOString(),
        type: "THEORY",
      })
    );
    setEntryStatus("draft");
    showSuccessMessage("Draft saved successfully");
  };

  const handleSubmit = () => {
    const validation = validateMarks();
    if (!validation.valid) {
      showErrorMessage("Validation failed: " + validation.errors.join(", "));
      return;
    }

    if (!window.confirm("Submit to HOD? Marks will be locked for editing.")) {
      return;
    }

    const key = `theory_internals_${filters.subjectId}_${filters.section}_${filters.academicYear}_${filters.semester}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        marksData,
        status: "submitted",
        hodStatus: "PENDING",
        submittedAt: new Date().toISOString(),
        type: "THEORY",
      })
    );

    setEntryStatus("submitted");
    showSuccessMessage("Theory internals submitted to HOD successfully");
  };

  return (
    <div className="mt-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Theory Internals Entry</h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter theory internal marks (Test-1, Test-2, Assignment, Attendance) - Total: 30 Marks
        </p>
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
          <strong>Calculation:</strong> Final = Best of (Test-1, Test-2) + Assignment + Attendance Marks
          <br />
          <strong>Max Marks:</strong> Test-1: 15, Test-2: 15, Assignment: 5, Attendance: 5 (based on %)
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year*</label>
            <select
              value={filters.academicYear}
              onChange={(e) => setFilters((f) => ({ ...f, academicYear: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select</option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.name}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course*</label>
            <select
              value={filters.course}
              onChange={(e) => setFilters((f) => ({ ...f, course: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch/Stream*</label>
            <select
              value={filters.branch}
              onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select</option>
              {branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester*</label>
            <select
              value={filters.semester}
              onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject*</label>
            <select
              value={filters.subjectId}
              onChange={(e) => setFilters((f) => ({ ...f, subjectId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select</option>
              {subjects.filter((s) => s.type === "THEORY").map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class / Section*</label>
            <select
              value={filters.section}
              onChange={(e) => setFilters((f) => ({ ...f, section: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleLoadStudents}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Load Students
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {students.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">SN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Roll No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Test-1 ({MAX_TEST_1})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Test-2 ({MAX_TEST_2})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Best Test
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Assignment ({MAX_ASSIGNMENT})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Attendance %
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Att. Marks ({MAX_ATTENDANCE_MARKS})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Final (30)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Absent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, idx) => {
                  const data = marksData[student.id] || {};
                  const isAbsent = data.absent || false;
                  const isDisabled =
                    isAbsent ||
                    entryStatus === "submitted" ||
                    entryStatus === "approved" ||
                    entryStatus === "locked";
                  const test1 = parseFloat(data.test1 || 0);
                  const test2 = parseFloat(data.test2 || 0);
                  const bestTest = Math.max(test1, test2);
                  const attendancePercentage = parseFloat(data.attendancePercentage || 0);
                  const attendanceMarks = calculateAttendanceMarks(attendancePercentage);
                  const final = calculateFinalInternal(student.id);

                  return (
                    <tr key={student.id} className={isAbsent ? "bg-red-50" : "hover:bg-gray-50"}>
                      <td className="px-4 py-3 text-sm">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{student.rollNumber}</td>
                      <td className="px-4 py-3 text-sm">{student.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.test1 || ""}
                          onChange={(e) => handleMarksChange(student.id, "test1", e.target.value)}
                          disabled={isDisabled}
                          min="0"
                          max={MAX_TEST_1}
                          step="0.1"
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${data.test1 && parseFloat(data.test1) > MAX_TEST_1 ? "border-red-500" : ""}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.test2 || ""}
                          onChange={(e) => handleMarksChange(student.id, "test2", e.target.value)}
                          disabled={isDisabled}
                          min="0"
                          max={MAX_TEST_2}
                          step="0.1"
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${data.test2 && parseFloat(data.test2) > MAX_TEST_2 ? "border-red-500" : ""}`}
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-blue-600">
                        {isAbsent ? "-" : bestTest.toFixed(1)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.assignment || ""}
                          onChange={(e) => handleMarksChange(student.id, "assignment", e.target.value)}
                          disabled={isDisabled}
                          min="0"
                          max={MAX_ASSIGNMENT}
                          step="0.1"
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${
                            data.assignment && parseFloat(data.assignment) > MAX_ASSIGNMENT
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.attendancePercentage || ""}
                          onChange={(e) =>
                            handleMarksChange(student.id, "attendancePercentage", e.target.value)
                          }
                          disabled={isDisabled}
                          min="0"
                          max="100"
                          step="0.1"
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${
                            data.attendancePercentage && parseFloat(data.attendancePercentage) > 100
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">
                        {isAbsent ? "0" : attendanceMarks}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-emerald-600">
                        {isAbsent ? "0" : final.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isAbsent}
                          onChange={() => handleAbsentToggle(student.id)}
                          disabled={isDisabled && !isAbsent}
                          className="w-4 h-4"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Status: <span className={`font-semibold ${
                entryStatus === "draft" ? "text-yellow-600" :
                entryStatus === "submitted" ? "text-blue-600" :
                entryStatus === "approved" ? "text-green-600" : "text-red-600"
              }`}>
                {entryStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={
                  entryStatus === "submitted" ||
                  entryStatus === "approved" ||
                  entryStatus === "locked"
                }
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  entryStatus === "submitted" ||
                  entryStatus === "approved" ||
                  entryStatus === "locked"
                }
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                Submit to HOD
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InternalTheoryForm;

