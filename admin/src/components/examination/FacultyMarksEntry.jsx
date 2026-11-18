import React, { useState, useEffect, useMemo } from "react";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";

const FacultyMarksEntry = () => {
  const [filters, setFilters] = useState({
    academicYear: "",
    semester: "",
    subjectId: "",
    examType: "",
  });
  
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [config, setConfig] = useState(null);
  const [entryStatus, setEntryStatus] = useState("draft"); // draft, submitted, approved, locked

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
    { id: "sub-1", code: "DSA", name: "Data Structures" },
    { id: "sub-2", code: "DBMS", name: "Database Systems" },
    { id: "sub-3", code: "CN", name: "Computer Networks" },
  ];

  const examTypes = [
    { id: "mid-1", name: "Mid-1" },
    { id: "mid-2", name: "Mid-2" },
    { id: "assignment-1", name: "Assignment-1" },
  ];

  useEffect(() => {
    // Load saved draft if exists
    const saved = localStorage.getItem(`marks_entry_${filters.subjectId}_${filters.examType}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setMarksData(parsed.marksData || {});
      setEntryStatus(parsed.status || "draft");
    }
  }, [filters.subjectId, filters.examType]);

  const loadConfig = () => {
    // Load configuration from Internal Exam Setup
    let configs = JSON.parse(localStorage.getItem("internal_exam_setup") || "[]");
    let found = configs.find(
      (c) =>
        c.academicYear === filters.academicYear &&
        c.semester === filters.semester &&
        c.examType === filters.examType &&
        c.status === "Active"
    );
    
    // If no configuration found, create a default one
    if (!found && filters.academicYear && filters.semester && filters.examType) {
      const defaultConfig = {
        id: `config_${Date.now()}`,
        academicYear: filters.academicYear,
        semester: filters.semester,
        examType: filters.examType,
        totalInternalMarks: "100",
        objectiveMax: "20",
        descriptiveMax: "30",
        assignmentMax: "25",
        attendanceMax: "25",
        marksEntryStartDate: new Date().toISOString().split('T')[0],
        marksEntryEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        freezeDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault: true, // Mark as auto-generated
      };
      
      configs.push(defaultConfig);
      localStorage.setItem("internal_exam_setup", JSON.stringify(configs));
      found = defaultConfig;
      showSuccessMessage("Using default configuration. You can customize it in 'Internal Exam Setup'.");
    }
    
    setConfig(found || null);
    return found;
  };

  const handleLoadStudents = () => {
    if (!filters.academicYear || !filters.semester || !filters.subjectId || !filters.examType) {
      showErrorMessage("Please fill all filter fields");
      return;
    }

    const configData = loadConfig();
    if (!configData) {
      showErrorMessage("No configuration found for selected criteria");
      return;
    }

    // Mock student data with names
    const studentNames = [
      "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh",
      "Anjali Mehta", "Rahul Gupta", "Kavya Nair", "Suresh Rao", "Divya Iyer",
      "Mohan Das", "Lakshmi Menon", "Karthik Pillai", "Swati Joshi", "Rohan Malhotra",
      "Meera Shah", "Arjun Nair", "Shreya Desai", "Nikhil Agarwal", "Deepika Krishnan"
    ];

    const mockStudents = Array.from({ length: 15 }).map((_, idx) => ({
      id: `stu-${idx + 1}`,
      rollNumber: `STU${String(idx + 1).padStart(4, "0")}`,
      name: studentNames[idx] || `Student ${idx + 1}`,
    }));

    setStudents(mockStudents);
    
    // Initialize marks data with dummy values
    const objectiveMax = parseFloat(configData.objectiveMax || 20);
    const descriptiveMax = parseFloat(configData.descriptiveMax || 30);
    const assignmentMax = parseFloat(configData.assignmentMax || 25);
    const attendanceMax = parseFloat(configData.attendanceMax || 25);
    
    const initialMarks = {};
    mockStudents.forEach((stu, idx) => {
      // Check if saved data exists, otherwise use dummy data
      const savedData = marksData[stu.id];
      
      if (savedData && (savedData.objective !== "" || savedData.descriptive !== "")) {
        // Use saved data if exists
        initialMarks[stu.id] = {
          objective: savedData.objective || "",
          descriptive: savedData.descriptive || "",
          assignment: savedData.assignment || "",
          attendance: savedData.attendance || "",
          absent: savedData.absent || false,
        };
      } else {
        // Generate dummy marks data
        // Last 2 students will be absent, rest will have varying marks
        if (idx >= mockStudents.length - 2) {
          initialMarks[stu.id] = {
            objective: "",
            descriptive: "",
            assignment: "",
            attendance: "",
            absent: true,
          };
        } else {
          // Generate realistic marks with performance tiers
          // Better students (earlier in list) get higher marks
          const performanceTier = idx < 5 ? 0.85 : idx < 10 ? 0.75 : 0.65; // Top 5: 85%, Next 5: 75%, Others: 65%
          const variation = (Math.random() - 0.5) * 0.15; // ±7.5% variation
          const performanceRatio = Math.max(0.60, Math.min(0.98, performanceTier + variation));
          
          const objective = Math.round((objectiveMax * performanceRatio) * 10) / 10;
          const descriptive = Math.round((descriptiveMax * performanceRatio) * 10) / 10;
          const assignment = Math.round((assignmentMax * Math.min(0.98, performanceRatio + 0.05)) * 10) / 10;
          const attendance = Math.round((attendanceMax * (0.85 + Math.random() * 0.13)) * 10) / 10; // Attendance is usually higher
          
          initialMarks[stu.id] = {
            objective: objective.toString(),
            descriptive: descriptive.toString(),
            assignment: assignment.toString(),
            attendance: attendance.toString(),
            absent: false,
          };
        }
      }
    });
    
    setMarksData(initialMarks);
    showSuccessMessage("Students loaded successfully with sample marks");
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
        objective: prev[studentId]?.absent ? prev[studentId].objective : "",
        descriptive: prev[studentId]?.absent ? prev[studentId].descriptive : "",
        assignment: prev[studentId]?.absent ? prev[studentId].assignment : "",
        attendance: prev[studentId]?.absent ? prev[studentId].attendance : "",
      },
    }));
  };

  const calculateTotal = (studentId) => {
    const data = marksData[studentId];
    if (!data || data.absent) return 0;
    
    const obj = parseFloat(data.objective || 0);
    const desc = parseFloat(data.descriptive || 0);
    const assign = parseFloat(data.assignment || 0);
    const attend = parseFloat(data.attendance || 0);
    
    return obj + desc + assign + attend;
  };

  const validateMarks = () => {
    if (!config) return { valid: false, errors: ["Configuration not found"] };

    const errors = [];
    
    students.forEach((stu) => {
      const data = marksData[stu.id];
      if (!data || data.absent) return;

      if (data.objective === "" || data.descriptive === "" || data.assignment === "" || data.attendance === "") {
        errors.push(`${stu.rollNumber}: All fields are required`);
      }

      if (parseFloat(data.objective || 0) > parseFloat(config.objectiveMax || 0)) {
        errors.push(`${stu.rollNumber}: Objective marks exceed maximum (${config.objectiveMax})`);
      }
      if (parseFloat(data.descriptive || 0) > parseFloat(config.descriptiveMax || 0)) {
        errors.push(`${stu.rollNumber}: Descriptive marks exceed maximum (${config.descriptiveMax})`);
      }
      if (parseFloat(data.assignment || 0) > parseFloat(config.assignmentMax || 0)) {
        errors.push(`${stu.rollNumber}: Assignment marks exceed maximum (${config.assignmentMax})`);
      }
      if (parseFloat(data.attendance || 0) > parseFloat(config.attendanceMax || 0)) {
        errors.push(`${stu.rollNumber}: Attendance marks exceed maximum (${config.attendanceMax})`);
      }

      if (parseFloat(data.objective || 0) < 0 || parseFloat(data.descriptive || 0) < 0 || 
          parseFloat(data.assignment || 0) < 0 || parseFloat(data.attendance || 0) < 0) {
        errors.push(`${stu.rollNumber}: Marks cannot be negative`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const handleSaveDraft = () => {
    const key = `marks_entry_${filters.subjectId}_${filters.examType}`;
    localStorage.setItem(key, JSON.stringify({
      marksData,
      status: "draft",
      updatedAt: new Date().toISOString(),
    }));
    setEntryStatus("draft");
    showSuccessMessage("Draft saved successfully");
  };

  const handleSubmit = () => {
    const validation = validateMarks();
    if (!validation.valid) {
      showErrorMessage("Validation failed: " + validation.errors.join(", "));
      return;
    }

    if (!window.confirm("Are you sure you want to submit? Marks will be locked after submission.")) {
      return;
    }

    const key = `marks_entry_${filters.subjectId}_${filters.examType}`;
    localStorage.setItem(key, JSON.stringify({
      marksData,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    }));
    
    setEntryStatus("submitted");
    showSuccessMessage("Marks submitted successfully");
  };

  const isEntryOpen = () => {
    if (!config) return false;
    const now = new Date();
    const start = new Date(config.marksEntryStartDate);
    const end = new Date(config.marksEntryEndDate);
    return now >= start && now <= end;
  };

  return (
    <div className="mt-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Marks Entry</h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter internal marks for students by selecting filters and loading the student list
        </p>
      </div>

      {/* Filters Panel */}
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
                <option key={y.id} value={y.name}>{y.name}</option>
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
                <option key={s.id} value={s.name}>{s.name}</option>
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
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type*</label>
            <select
              value={filters.examType}
              onChange={(e) => setFilters((f) => ({ ...f, examType: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select</option>
              {examTypes.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
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

        {/* Config Info */}
        {config && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Objective Max:</span>
                <span className="font-semibold ml-2">{config.objectiveMax}</span>
              </div>
              <div>
                <span className="text-gray-600">Descriptive Max:</span>
                <span className="font-semibold ml-2">{config.descriptiveMax}</span>
              </div>
              <div>
                <span className="text-gray-600">Assignment Max:</span>
                <span className="font-semibold ml-2">{config.assignmentMax}</span>
              </div>
              <div>
                <span className="text-gray-600">Attendance Max:</span>
                <span className="font-semibold ml-2">{config.attendanceMax}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ml-2 ${
                  entryStatus === "draft" ? "text-yellow-600" :
                  entryStatus === "submitted" ? "text-blue-600" :
                  entryStatus === "approved" ? "text-green-600" : "text-red-600"
                }`}>
                  {entryStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Marks Table */}
      {students.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">SN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Roll No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Student Name</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Objective ({config?.objectiveMax || 0})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Descriptive ({config?.descriptiveMax || 0})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Assignment ({config?.assignmentMax || 0})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Attendance ({config?.attendanceMax || 0})
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Absent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, idx) => {
                  const data = marksData[student.id] || {};
                  const isAbsent = data.absent || false;
                  const isDisabled = isAbsent || entryStatus === "submitted" || entryStatus === "approved" || entryStatus === "locked";
                  const total = calculateTotal(student.id);
                  
                  return (
                    <tr key={student.id} className={isAbsent ? "bg-red-50" : "hover:bg-gray-50"}>
                      <td className="px-4 py-3 text-sm">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{student.rollNumber}</td>
                      <td className="px-4 py-3 text-sm">{student.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.objective || ""}
                          onChange={(e) => handleMarksChange(student.id, "objective", e.target.value)}
                          disabled={isDisabled}
                          min="0"
                          max={config?.objectiveMax || 100}
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${
                            data.objective && parseFloat(data.objective) > parseFloat(config?.objectiveMax || 0) ? "border-red-500" : ""
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.descriptive || ""}
                          onChange={(e) => handleMarksChange(student.id, "descriptive", e.target.value)}
                          disabled={isDisabled}
                          min="0"
                          max={config?.descriptiveMax || 100}
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${
                            data.descriptive && parseFloat(data.descriptive) > parseFloat(config?.descriptiveMax || 0) ? "border-red-500" : ""
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.assignment || ""}
                          onChange={(e) => handleMarksChange(student.id, "assignment", e.target.value)}
                          disabled={isDisabled}
                          min="0"
                          max={config?.assignmentMax || 100}
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${
                            data.assignment && parseFloat(data.assignment) > parseFloat(config?.assignmentMax || 0) ? "border-red-500" : ""
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.attendance || ""}
                          onChange={(e) => handleMarksChange(student.id, "attendance", e.target.value)}
                          disabled={isDisabled}
                          min="0"
                          max={config?.attendanceMax || 100}
                          className={`w-20 px-2 py-1 border rounded text-center ${
                            isDisabled ? "bg-gray-100" : ""
                          } ${
                            data.attendance && parseFloat(data.attendance) > parseFloat(config?.attendanceMax || 0) ? "border-red-500" : ""
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold">{total}</td>
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
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={entryStatus === "submitted" || entryStatus === "approved" || entryStatus === "locked"}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={entryStatus === "submitted" || entryStatus === "approved" || entryStatus === "locked" || !isEntryOpen()}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              Submit Marks
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FacultyMarksEntry;

