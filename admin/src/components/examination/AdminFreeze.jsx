import React, { useState, useEffect } from "react";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";
import { initializeDummyInternalsData } from "./utils/initializeDummyInternalsData";

const AdminFreeze = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

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

  useEffect(() => {
    if (selectedCourse && selectedSemester) {
      loadSubjectStatus();
    }
  }, [selectedCourse, selectedSemester]);

  const loadSubjectStatus = () => {
    const entries = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach((key) => {
      if (key.startsWith("theory_internals_") || key.startsWith("lab_internals_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const isTheory = key.startsWith("theory_internals_");
          const keyWithoutPrefix = key.replace(isTheory ? "theory_internals_" : "lab_internals_", "");
          const parts = keyWithoutPrefix.split("_");
          const subjectId = parts[0];
          const section = parts[1];
          const academicYear = parts[2];
          const semester = parts.slice(3).join(" ");

          // Only include entries matching selected course and semester
          const selectedSemesterObj = semesters.find((s) => s.id === selectedSemester);
          const semesterMatch = selectedSemester === "" || 
                               (selectedSemesterObj && semester.includes(selectedSemesterObj.name));

          if (semesterMatch) {
            entries.push({
              subjectId: subjectId,
              section: section,
              type: isTheory ? "THEORY" : "LAB",
              status: data.hodStatus === "APPROVED" ? "approved" : 
                     data.hodStatus === "SENT_BACK" ? "draft" :
                     data.status === "locked" ? "locked" :
                     data.status || "draft",
              hodStatus: data.hodStatus,
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
            status: data.status || "draft",
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
          status: "approved",
          allApproved: true,
          sections: [],
        };
      }
      subjectMap[key].sections.push(entry);
      
      if (entry.status !== "approved" && entry.status !== "locked") {
        subjectMap[key].allApproved = false;
      }
      if (entry.status === "locked") {
        subjectMap[key].status = "locked";
      }
      if (entry.status === "draft" || entry.hodStatus === "PENDING") {
        subjectMap[key].allApproved = false;
        if (subjectMap[key].status === "approved") {
          subjectMap[key].status = "pending";
        }
      }
    });

    const subjectList = Object.values(subjectMap).map((subj) => {
      const subjectName = getSubjectName(subj.subjectId);
      const subjectCode = getSubjectCode(subj.subjectId);
      return {
        ...subj,
        subjectName: `${subjectName}${subjectCode ? ` (${subjectCode})` : ""} - ${subj.type}`,
      };
    });

    setSubjects(subjectList);
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

  const handleFreezeAll = () => {
    if (!window.confirm("Are you sure you want to freeze all internal marks? This action cannot be undone.")) {
      return;
    }

    const keys = Object.keys(localStorage);
    let frozenCount = 0;

    keys.forEach((key) => {
      if (key.startsWith("theory_internals_") || key.startsWith("lab_internals_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.hodStatus === "APPROVED" && data.status !== "locked") {
            data.status = "locked";
            data.hodStatus = "APPROVED"; // Keep approved status
            data.frozenAt = new Date().toISOString();
            localStorage.setItem(key, JSON.stringify(data));
            frozenCount++;
          }
        } catch (err) {
          console.error("Error freezing:", key, err);
        }
      } else if (key.startsWith("marks_entry_")) {
        // Legacy format
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.status === "approved") {
            data.status = "locked";
            data.frozenAt = new Date().toISOString();
            localStorage.setItem(key, JSON.stringify(data));
            frozenCount++;
          }
        } catch (err) {
          console.error("Error freezing legacy:", key, err);
        }
      }
    });

    if (frozenCount > 0) {
      showSuccessMessage(`${frozenCount} subject(s) frozen successfully`);
      loadSubjectStatus();
    } else {
      showErrorMessage("No approved subjects found to freeze");
    }
  };

  const handleFreezeSubject = (subjectId, type = "THEORY") => {
    if (!window.confirm(`Freeze marks for ${getSubjectName(subjectId)} (${type})?`)) return;

    const keys = Object.keys(localStorage);
    let frozen = false;

    keys.forEach((key) => {
      const isTheory = key.startsWith("theory_internals_");
      const isLab = key.startsWith("lab_internals_");
      
      if ((isTheory || isLab) && key.includes(`${subjectId}_`)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const entryType = isTheory ? "THEORY" : "LAB";
          
          if (entryType === type && data.hodStatus === "APPROVED" && data.status !== "locked") {
            data.status = "locked";
            data.frozenAt = new Date().toISOString();
            localStorage.setItem(key, JSON.stringify(data));
            frozen = true;
          }
        } catch (err) {
          console.error("Error freezing:", key, err);
        }
      } else if (key.startsWith(`marks_entry_${subjectId}_`)) {
        // Legacy format
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.status === "approved") {
            data.status = "locked";
            data.frozenAt = new Date().toISOString();
            localStorage.setItem(key, JSON.stringify(data));
            frozen = true;
          }
        } catch (err) {
          console.error("Error freezing legacy:", key, err);
        }
      }
    });

    if (frozen) {
      showSuccessMessage("Subject frozen successfully");
      loadSubjectStatus();
    } else {
      showErrorMessage("Subject is not approved yet");
    }
  };

  const allApproved = subjects.every((s) => s.status === "approved" || s.allApproved);
  const anyFrozen = subjects.some((s) => s.status === "locked");

  return (
    <div className="mt-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Freeze Internal Marks</h3>
        <p className="text-sm text-gray-500 mt-1">
          Lock all approved internal marks. Once frozen, marks cannot be modified.
        </p>
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

      {/* Freeze All Button */}
      {selectedCourse && selectedSemester && allApproved && !anyFrozen && (
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-semibold text-amber-800">All subjects are approved</h4>
              <p className="text-xs text-amber-600 mt-1">You can now freeze all internal marks</p>
            </div>
            <button
              onClick={handleFreezeAll}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Freeze All Internals
            </button>
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.map((subject) => (
                <tr key={subject.subjectId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{subject.subjectName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      subject.status === "locked" ? "bg-red-100 text-red-800" :
                      subject.status === "approved" || subject.allApproved ? "bg-green-100 text-green-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {subject.status === "locked" ? "FROZEN" :
                       subject.status === "approved" || subject.allApproved ? "APPROVED" : "PENDING"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {subject.status !== "locked" && (subject.status === "approved" || subject.allApproved) && (
                      <button
                        onClick={() => handleFreezeSubject(subject.subjectId, subject.type)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Freeze
                      </button>
                    )}
                    {subject.status === "locked" && (
                      <span className="text-sm text-gray-500">Already Frozen</span>
                    )}
                    {subject.status === "pending" && (
                      <span className="text-sm text-yellow-600">Pending Approval</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
          {!selectedCourse || !selectedSemester
            ? "Please select a course and semester"
            : "No subjects found"}
        </div>
      )}
    </div>
  );
};

export default AdminFreeze;

