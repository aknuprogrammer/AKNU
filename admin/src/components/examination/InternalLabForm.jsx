import React, { useState, useEffect } from "react";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";

const InternalLabForm = ({ preSelectedSubject = null }) => {
  const [filters, setFilters] = useState({
    academicYear: preSelectedSubject?.academicYear || "",
    semester: preSelectedSubject?.semester || "",
    subjectId: preSelectedSubject?.id || "",
    section: "",
  });

  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [entryStatus, setEntryStatus] = useState("draft");

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

  const subjects = [
    { id: "lab-1", code: "DSA-LAB", name: "Data Structures Lab", type: "LAB" },
    { id: "lab-2", code: "DBMS-LAB", name: "Database Systems Lab", type: "LAB" },
    { id: "lab-3", code: "CN-LAB", name: "Computer Networks Lab", type: "LAB" },
  ];

  const sections = ["A", "B", "C"];

  // Constants for Lab Internals
  const MAX_RECORD = 10;
  const MAX_PERFORMANCE = 10;
  const MAX_INTERNAL_TEST = 15;
  const MAX_VIVA = 15;
  const TOTAL_LAB_INTERNALS = 50;

  // Calculate final lab internal: Sum of all components
  const calculateFinalLabInternal = (studentId) => {
    const data = marksData[studentId];
    if (!data || data.absent) return 0;

    const record = parseFloat(data.record || 0);
    const performance = parseFloat(data.performance || 0);
    const internalTest = parseFloat(data.internalTest || 0);
    const viva = parseFloat(data.viva || 0);

    return record + performance + internalTest + viva;
  };

  useEffect(() => {
    // Auto-fill filters from pre-selected subject
    if (preSelectedSubject) {
      setFilters({
        academicYear: preSelectedSubject.academicYear || "",
        semester: preSelectedSubject.semester || "",
        subjectId: preSelectedSubject.id || "",
        section: "",
      });
    }
  }, [preSelectedSubject]);

  useEffect(() => {
    // Load saved draft when section is selected
    if (filters.subjectId && filters.section && filters.academicYear && filters.semester) {
      const saved = localStorage.getItem(
        `lab_internals_${filters.subjectId}_${filters.section}_${filters.academicYear}_${filters.semester}`
      );
      if (saved) {
        const parsed = JSON.parse(saved);
        setMarksData(parsed.marksData || {});
        setEntryStatus(parsed.status || parsed.hodStatus ? "submitted" : "draft");
      }
    }
  }, [filters.subjectId, filters.section, filters.academicYear, filters.semester]);

  const handleLoadStudents = () => {
    if (!filters.academicYear || !filters.semester || !filters.subjectId || !filters.section) {
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

      if (savedData && (savedData.record !== "" || savedData.performance !== "")) {
        initialMarks[stu.id] = savedData;
      } else {
        if (idx >= mockStudents.length - 2) {
          initialMarks[stu.id] = {
            record: "",
            performance: "",
            internalTest: "",
            viva: "",
            absent: true,
          };
        } else {
          // Generate realistic dummy data
          const performanceRatio = idx < 5 ? 0.85 : idx < 10 ? 0.75 : 0.65;
          const record = Math.round(MAX_RECORD * (performanceRatio + (Math.random() - 0.5) * 0.15) * 10) / 10;
          const performance = Math.round(MAX_PERFORMANCE * (performanceRatio + (Math.random() - 0.5) * 0.15) * 10) / 10;
          const internalTest = Math.round(MAX_INTERNAL_TEST * (performanceRatio + (Math.random() - 0.5) * 0.15) * 10) / 10;
          const viva = Math.round(MAX_VIVA * (performanceRatio + (Math.random() - 0.5) * 0.15) * 10) / 10;

          initialMarks[stu.id] = {
            record: Math.max(0, Math.min(MAX_RECORD, record)).toString(),
            performance: Math.max(0, Math.min(MAX_PERFORMANCE, performance)).toString(),
            internalTest: Math.max(0, Math.min(MAX_INTERNAL_TEST, internalTest)).toString(),
            viva: Math.max(0, Math.min(MAX_VIVA, viva)).toString(),
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

    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
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
        record: prev[studentId]?.absent ? prev[studentId].record : "",
        performance: prev[studentId]?.absent ? prev[studentId].performance : "",
        internalTest: prev[studentId]?.absent ? prev[studentId].internalTest : "",
        viva: prev[studentId]?.absent ? prev[studentId].viva : "",
      },
    }));
  };

  const validateMarks = () => {
    const errors = [];
    students.forEach((stu) => {
      const data = marksData[stu.id];
      if (!data || data.absent) return;

      if (
        data.record === "" ||
        data.performance === "" ||
        data.internalTest === "" ||
        data.viva === ""
      ) {
        errors.push(`${stu.rollNumber}: All fields are required`);
      }

      if (parseFloat(data.record || 0) > MAX_RECORD) {
        errors.push(`${stu.rollNumber}: Record marks exceed maximum (${MAX_RECORD})`);
      }
      if (parseFloat(data.performance || 0) > MAX_PERFORMANCE) {
        errors.push(`${stu.rollNumber}: Performance marks exceed maximum (${MAX_PERFORMANCE})`);
      }
      if (parseFloat(data.internalTest || 0) > MAX_INTERNAL_TEST) {
        errors.push(`${stu.rollNumber}: Internal Test marks exceed maximum (${MAX_INTERNAL_TEST})`);
      }
      if (parseFloat(data.viva || 0) > MAX_VIVA) {
        errors.push(`${stu.rollNumber}: Viva marks exceed maximum (${MAX_VIVA})`);
      }
      if (
        parseFloat(data.record || 0) < 0 ||
        parseFloat(data.performance || 0) < 0 ||
        parseFloat(data.internalTest || 0) < 0 ||
        parseFloat(data.viva || 0) < 0
      ) {
        errors.push(`${stu.rollNumber}: Marks cannot be negative`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const handleSaveDraft = () => {
    const key = `lab_internals_${filters.subjectId}_${filters.section}_${filters.academicYear}_${filters.semester}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        marksData,
        status: "draft",
        updatedAt: new Date().toISOString(),
        type: "LAB",
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

    const key = `lab_internals_${filters.subjectId}_${filters.section}_${filters.academicYear}_${filters.semester}`;
    localStorage.setItem(
      key,
      JSON.stringify({
        marksData,
        status: "submitted",
        hodStatus: "PENDING",
        submittedAt: new Date().toISOString(),
        type: "LAB",
      })
    );

    setEntryStatus("submitted");
    showSuccessMessage("Lab internals submitted to HOD successfully");
  };

  return (
    <div className="mt-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Lab Internals Entry</h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter lab internal marks (Record, Performance, Internal Test, Viva) - Total: 50 Marks
        </p>
        <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200 text-sm">
          <strong>Calculation:</strong> Final = Record + Performance + Internal Test + Viva Marks
          <br />
          <strong>Max Marks:</strong> Record: 10, Performance: 10, Internal Test: 15, Viva: 15
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              {subjects.filter((s) => s.type === "LAB").map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section*</label>
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
                    Record ({MAX_RECORD})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Performance ({MAX_PERFORMANCE})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Internal Test ({MAX_INTERNAL_TEST})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Viva ({MAX_VIVA})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Final (50)
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
                  const final = calculateFinalLabInternal(student.id);

                  return (
                    <tr key={student.id} className={isAbsent ? "bg-red-50" : "hover:bg-gray-50"}>
                      <td className="px-4 py-3 text-sm">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{student.rollNumber}</td>
                      <td className="px-4 py-3 text-sm">{student.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.record || ""}
                          onChange={(e) => handleMarksChange(student.id, "record", e.target.value)}
                          disabled={isDisabled}
                          min="0"
                          max={MAX_RECORD}
                          step="0.1"
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${data.record && parseFloat(data.record) > MAX_RECORD ? "border-red-500" : ""}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.performance || ""}
                          onChange={(e) => handleMarksChange(student.id, "performance", e.target.value)}
                          disabled={isDisabled}
                          min="0"
                          max={MAX_PERFORMANCE}
                          step="0.1"
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${
                            data.performance && parseFloat(data.performance) > MAX_PERFORMANCE
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.internalTest || ""}
                          onChange={(e) => handleMarksChange(student.id, "internalTest", e.target.value)}
                          disabled={isDisabled}
                          min="0"
                          max={MAX_INTERNAL_TEST}
                          step="0.1"
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${
                            data.internalTest && parseFloat(data.internalTest) > MAX_INTERNAL_TEST
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.viva || ""}
                          onChange={(e) => handleMarksChange(student.id, "viva", e.target.value)}
                          disabled={isDisabled}
                          min="0"
                          max={MAX_VIVA}
                          step="0.1"
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${data.viva && parseFloat(data.viva) > MAX_VIVA ? "border-red-500" : ""}`}
                        />
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
              Status:{" "}
              <span
                className={`font-semibold ${
                  entryStatus === "draft"
                    ? "text-yellow-600"
                    : entryStatus === "submitted"
                    ? "text-blue-600"
                    : entryStatus === "approved"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
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

export default InternalLabForm;

