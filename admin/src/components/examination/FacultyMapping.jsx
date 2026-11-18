import React, { useState, useEffect, useMemo } from "react";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";

const FacultyMapping = () => {
  const [mappings, setMappings] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(false);

  const courses = [
    { id: "course-1", name: "B.Tech CSE" },
    { id: "course-2", name: "B.Com" },
    { id: "course-3", name: "B.Sc" },
  ];

  const semesters = [
    { id: "1", name: "Semester 1" },
    { id: "2", name: "Semester 2" },
    { id: "3", name: "Semester 3" },
    { id: "4", name: "Semester 4" },
  ];

  const subjects = useMemo(() => {
    if (!selectedCourse || !selectedSemester) return [];
    
    // Mock subjects based on course
    const allSubjects = [
      { id: "sub-1", code: "DSA", name: "Data Structures", courseId: "course-1", semester: "3" },
      { id: "sub-2", code: "DBMS", name: "Database Systems", courseId: "course-1", semester: "3" },
      { id: "sub-3", code: "CN", name: "Computer Networks", courseId: "course-1", semester: "4" },
      { id: "sub-4", code: "FA", name: "Financial Accounting", courseId: "course-2", semester: "1" },
      { id: "sub-5", code: "ECO", name: "Economics", courseId: "course-2", semester: "2" },
    ];
    
    return allSubjects.filter(
      (s) => s.courseId === selectedCourse && s.semester === selectedSemester
    );
  }, [selectedCourse, selectedSemester]);

  const faculty = [
    { id: "fac-1", name: "Dr. John Smith", email: "john@example.com" },
    { id: "fac-2", name: "Prof. Jane Doe", email: "jane@example.com" },
    { id: "fac-3", name: "Dr. Robert Brown", email: "robert@example.com" },
    { id: "fac-4", name: "Prof. Emily Wilson", email: "emily@example.com" },
  ];

  useEffect(() => {
    fetchMappings();
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedSemester) {
      loadSubjectMappings();
    }
  }, [selectedCourse, selectedSemester]);

  const fetchMappings = () => {
    const stored = localStorage.getItem("faculty_subject_mappings");
    if (stored) {
      setMappings(JSON.parse(stored));
    } else {
      setMappings([]);
    }
  };

  const saveMappings = (data) => {
    localStorage.setItem("faculty_subject_mappings", JSON.stringify(data));
    setMappings(data);
  };

  const loadSubjectMappings = () => {
    // Load existing mappings for selected course/semester
    const existing = mappings.filter(
      (m) => m.courseId === selectedCourse && m.semester === selectedSemester
    );
    
    // Initialize mappings for all subjects
    const subjectMappings = subjects.map((subj) => {
      const existingMap = existing.find((m) => m.subjectId === subj.id);
      return {
        courseId: selectedCourse,
        semester: selectedSemester,
        subjectId: subj.id,
        subjectName: subj.name,
        subjectCode: subj.code,
        facultyId: existingMap?.facultyId || "",
      };
    });
    
    // Update state with current mappings
    setCurrentMappings(subjectMappings);
  };

  const [currentMappings, setCurrentMappings] = useState([]);

  const handleFacultyChange = (subjectId, facultyId) => {
    setCurrentMappings((prev) =>
      prev.map((m) => (m.subjectId === subjectId ? { ...m, facultyId } : m))
    );
  };

  const handleSave = () => {
    if (!selectedCourse || !selectedSemester) {
      showErrorMessage("Please select course and semester");
      return;
    }

    // Remove old mappings for this course/semester
    const otherMappings = mappings.filter(
      (m) => !(m.courseId === selectedCourse && m.semester === selectedSemester)
    );

    // Add new mappings
    const newMappings = currentMappings
      .filter((m) => m.facultyId)
      .map((m) => ({
        ...m,
        id: `mapping_${Date.now()}_${Math.random()}`,
        updatedAt: new Date().toISOString(),
      }));

    saveMappings([...otherMappings, ...newMappings]);
    showSuccessMessage("Faculty mappings saved successfully");
  };

  return (
    <div className="mt-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Subject ↔ Faculty Mapping</h3>
        <p className="text-sm text-gray-500 mt-1">
          Map subjects to faculty members for marks entry and evaluation
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
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
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSave}
              disabled={!selectedCourse || !selectedSemester || currentMappings.length === 0}
              className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Mapping
            </button>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      {selectedCourse && selectedSemester && subjects.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">SN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Subject Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Subject Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Faculty</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentMappings.map((mapping, idx) => {
                const subject = subjects.find((s) => s.id === mapping.subjectId);
                return (
                  <tr key={mapping.subjectId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{subject?.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{subject?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={mapping.facultyId || ""}
                        onChange={(e) => handleFacultyChange(mapping.subjectId, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select Faculty</option>
                        {faculty.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
          {!selectedCourse || !selectedSemester
            ? "Please select a course and semester to view subjects"
            : "No subjects found for the selected course and semester"}
        </div>
      )}
    </div>
  );
};

export default FacultyMapping;

