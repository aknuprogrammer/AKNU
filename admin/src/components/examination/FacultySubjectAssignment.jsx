import React, { useState, useEffect, useMemo } from "react";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";
import {
  academicYearsApi,
  coursesApi,
  subjectsApi,
  streamsApi,
  professorsApi,
  courseStreamMappingsApi,
} from "../../services/apiService";

const FacultySubjectAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    academicYearId: "",
    courseId: "",
    streamId: "",
    semester: "",
    subjectId: "",
    facultyId: "",
    sections: [],
    subjectType: "THEORY",
    subjectCategory: "Core",
  });

  // Dropdown data
  const [academicYears, setAcademicYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [metaError, setMetaError] = useState(null);
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);

  // Available sections
  const sectionOptions = ["A", "B", "C", "D", "E"];

  useEffect(() => {
    loadDropdownData();
    loadAssignments();
  }, []);

  const loadDropdownData = async () => {
    const extractData = (response) => {
      if (!response) return [];
      if (Array.isArray(response)) return response;
      if (response?.data && Array.isArray(response.data)) return response.data;
      if (response?.data?.data && Array.isArray(response.data.data))
        return response.data.data;
      return [];
    };

    try {
      setLoading(true);
      setMetaError(null);

      const [yearsRes, coursesRes, streamsRes, subjectsRes, professorsRes] =
        await Promise.all([
          academicYearsApi.getAll(),
          coursesApi.getAll(),
          streamsApi.getAll(),
          subjectsApi.getAll(),
          professorsApi.getAll(),
        ]);

      const filterActive = (arr) =>
        Array.isArray(arr)
          ? arr.filter((item) =>
              item.status !== undefined ? item.status === "Active" : true
            )
          : [];

      setAcademicYears(filterActive(extractData(yearsRes)));
      setCourses(filterActive(extractData(coursesRes)));
      setStreams(filterActive(extractData(streamsRes)));
      setSubjects(filterActive(extractData(subjectsRes)));
      setProfessors(filterActive(extractData(professorsRes)));
    } catch (err) {
      console.error("Error loading dropdown data:", err);
      setMetaError(err.message || "Failed to load dropdown data");
      showErrorMessage(err.message || "Failed to load dropdown data");
      setAcademicYears([]);
      setCourses([]);
      setStreams([]);
      setSubjects([]);
      setProfessors([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch course-stream mappings when course changes
  useEffect(() => {
    const fetchCourseMappings = async () => {
      if (!formData.courseId) {
        setCourseStreamMappings([]);
        // reset streams to all active when no course selected
        return;
      }
      try {
        const res = await courseStreamMappingsApi.getByCourse?.(formData.courseId, true) ??
          courseStreamMappingsApi.getByCourse(formData.courseId);
        const mappings = Array.isArray(res) ? res : res?.data || [];
        setCourseStreamMappings(mappings);

        // derive unique streams from mappings (fallback to existing streams list)
        const streamIds = new Set();
        const derivedStreams = [];
        mappings.forEach((m) => {
          const streamObj = typeof m.streamId === "object" && m.streamId?._id ? m.streamId : null;
          const streamId = streamObj?._id || m.streamId;
          if (streamId && !streamIds.has(streamId)) {
            streamIds.add(streamId);
            derivedStreams.push(
              streamObj || streams.find((s) => s._id === streamId) || { _id: streamId, name: streamId }
            );
          }
        });
        if (derivedStreams.length > 0) {
          setStreams(derivedStreams);
        }
        // reset semesters when course changes
        setAvailableSemesters([]);
      } catch (err) {
        console.error("Failed to load course stream mappings", err);
        showErrorMessage(err.message || "Failed to load course stream mappings");
        setCourseStreamMappings([]);
      }
    };
    fetchCourseMappings();
  }, [formData.courseId, streams]);

  // When stream changes, derive available semesters from mappings
  useEffect(() => {
    if (!formData.courseId || !formData.streamId || courseStreamMappings.length === 0) {
      setAvailableSemesters([]);
      return;
    }
    const semNumbers = new Set();
    courseStreamMappings.forEach((m) => {
      const mappingCourseId = typeof m.courseId === "object" && m.courseId?._id ? m.courseId._id : m.courseId;
      const mappingStreamId = typeof m.streamId === "object" && m.streamId?._id ? m.streamId._id : m.streamId;
      if (mappingCourseId !== formData.courseId) return;
      if (mappingStreamId !== formData.streamId) return;
      const semNum =
        m.semesterNumber ??
        (typeof m.semesterId === "object" && m.semesterId?.numberOfSemesters
          ? m.semesterId.numberOfSemesters
          : null);
      if (semNum) semNumbers.add(semNum);
    });
    const sorted = Array.from(semNumbers).sort((a, b) => a - b);
    setAvailableSemesters(sorted);
    // reset semester if current selection not in derived list
    if (formData.semester && !semNumbers.has(Number(formData.semester))) {
      setFormData((prev) => ({ ...prev, semester: "" }));
    }
  }, [formData.courseId, formData.streamId, courseStreamMappings, formData.semester]);

  const loadAssignments = () => {
    try {
      const stored = localStorage.getItem("faculty_subject_assignments");
      if (stored) {
        setAssignments(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error loading assignments:", err);
    }
  };

  const saveAssignments = (data) => {
    localStorage.setItem("faculty_subject_assignments", JSON.stringify(data));
    setAssignments(data);
  };

  // Get subject details
  const getSubjectDetails = (subjectId) => {
    return subjects.find((s) => s._id === subjectId) || {};
  };

  // Get professor details
  const getProfessorDetails = (facultyId) => {
    return professors.find((p) => p._id === facultyId || p.professorId === facultyId) || {};
  };

  // Get available subjects filtered by course/stream/semester mapping, then by professor's subjectIds
  const getAvailableSubjects = useMemo(() => {
    let baseSubjects = subjects;

    // Filter by course-stream mappings if available
    if (formData.courseId && courseStreamMappings.length > 0) {
      const semNumber = formData.semester ? Number(formData.semester) : null;
      const matchedMappings = courseStreamMappings.filter((m) => {
        const mappingCourseId =
          typeof m.courseId === "object" && m.courseId?._id ? m.courseId._id : m.courseId;
        const mappingStreamId =
          typeof m.streamId === "object" && m.streamId?._id ? m.streamId._id : m.streamId;
        const mappingSemNum =
          m.semesterNumber ??
          (typeof m.semesterId === "object" && m.semesterId?.numberOfSemesters ? m.semesterId.numberOfSemesters : null);

        if (mappingCourseId !== formData.courseId) return false;
        if (formData.streamId && mappingStreamId !== formData.streamId) return false;
        if (semNumber && mappingSemNum && mappingSemNum !== semNumber) return false;
        return true;
      });

      const mappedSubjectIds = new Set();
      matchedMappings.forEach((m) => {
        if (Array.isArray(m.subjects)) {
          m.subjects.forEach((subj) => {
            const subjId =
              typeof subj.subjectId === "object" && subj.subjectId?._id
                ? subj.subjectId._id
                : subj.subjectId || subj;
            if (subjId) mappedSubjectIds.add(subjId);
          });
        }
      });

      if (mappedSubjectIds.size > 0) {
        baseSubjects = subjects.filter((s) => mappedSubjectIds.has(s._id));
      }
    }

    // Further filter by professor's assigned subjects if faculty selected
    if (!formData.facultyId) {
      return baseSubjects;
    }

    const professor = getProfessorDetails(formData.facultyId);
    if (!professor || !professor.subjectIds || professor.subjectIds.length === 0) {
      return baseSubjects;
    }

    return baseSubjects.filter((subject) => {
      return professor.subjectIds.some((profSubjectId) => {
        if (typeof profSubjectId === "object" && profSubjectId._id) {
          return profSubjectId._id === subject._id;
        }
        return profSubjectId === subject._id;
      });
    });
  }, [formData.facultyId, formData.courseId, formData.streamId, formData.semester, subjects, professors, courseStreamMappings]);

  // Get course details
  const getCourseDetails = (courseId) => {
    return courses.find((c) => c._id === courseId) || {};
  };

  // Get stream details
  const getStreamDetails = (streamId) => {
    return streams.find((s) => s._id === streamId) || {};
  };

  // Get academic year details
  const getAcademicYearDetails = (academicYearId) => {
    return academicYears.find((y) => y._id === academicYearId) || {};
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset dependent fields
      ...(name === "academicYearId" && { courseId: "", streamId: "", semester: "", subjectId: "" }),
      ...(name === "courseId" && { streamId: "", semester: "", subjectId: "" }),
      ...(name === "streamId" && { semester: "", subjectId: "" }),
      ...(name === "semester" && { subjectId: "" }),
      ...(name === "facultyId" && { subjectId: "" }), // Reset subject when faculty changes
    }));
  };

  const handleSectionToggle = (section) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter((s) => s !== section)
        : [...prev.sections, section],
    }));
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    const subject = getSubjectDetails(subjectId);
    
    setFormData((prev) => ({
      ...prev,
      subjectId,
      subjectCode: subject.code || "",
      subjectName: subject.name || "",
      // Auto-detect subject type from code
      subjectType: subject.code?.toUpperCase().includes("LAB") ? "LAB" : "THEORY",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.academicYearId) {
      showErrorMessage("Please select Academic Year");
      return;
    }
    if (!formData.courseId) {
      showErrorMessage("Please select Course");
      return;
    }
    if (!formData.streamId) {
      showErrorMessage("Please select Branch/Stream");
      return;
    }
    if (!formData.semester) {
      showErrorMessage("Please select Semester");
      return;
    }
    if (!formData.subjectId) {
      showErrorMessage("Please select Subject");
      return;
    }
    if (!formData.facultyId) {
      showErrorMessage("Please select Faculty Member");
      return;
    }
    if (formData.sections.length === 0) {
      showErrorMessage("Please select at least one Class / Section");
      return;
    }
    const academicYear = getAcademicYearDetails(formData.academicYearId);
    const course = getCourseDetails(formData.courseId);
    const stream = getStreamDetails(formData.streamId);
    const subject = getSubjectDetails(formData.subjectId);

    const assignment = {
      _id: editingAssignment?._id || `assignment_${Date.now()}`,
      facultyId: formData.facultyId,
      professorId: formData.facultyId,
      subjectId: formData.subjectId,
      subjectCode: subject.code || formData.subjectCode || "",
      subjectName: subject.name || formData.subjectName || "",
      subjectType: formData.subjectType,
      academicYear: academicYear.code || academicYear.name || "",
      academicYearId: formData.academicYearId,
      semester: `Semester ${formData.semester}`,
      branch: stream.name || stream.code || "",
      streamId: formData.streamId,
      sections: formData.sections,
      subjectCategory: formData.subjectCategory,
      courseId: formData.courseId,
      courseName: course.name || "",
      assignedAt: editingAssignment?.assignedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Active",
    };

    if (editingAssignment) {
      // Update existing assignment
      const updated = assignments.map((a) =>
        a._id === editingAssignment._id ? assignment : a
      );
      saveAssignments(updated);
      showSuccessMessage("Assignment updated successfully");
    } else {
      // Check for duplicate
      const duplicate = assignments.find(
        (a) =>
          a.academicYearId === formData.academicYearId &&
          a.courseId === formData.courseId &&
          a.streamId === formData.streamId &&
          a.semester === `Semester ${formData.semester}` &&
          a.subjectId === formData.subjectId &&
          a.facultyId === formData.facultyId
      );

      if (duplicate) {
        showErrorMessage("This assignment already exists");
        return;
      }

      // Add new assignment
      saveAssignments([...assignments, assignment]);
      showSuccessMessage("Subject assigned to faculty successfully");
    }

    // Reset form
    setFormData({
      academicYearId: "",
      courseId: "",
      streamId: "",
      semester: "",
      subjectId: "",
      facultyId: "",
      sections: [],
      subjectType: "THEORY",
      subjectCategory: "Core",
    });
    setShowForm(false);
    setEditingAssignment(null);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      academicYearId: assignment.academicYearId || "",
      courseId: assignment.courseId || "",
      streamId: assignment.streamId || "",
      semester: assignment.semester?.replace("Semester ", "") || "",
      subjectId: assignment.subjectId || "",
      facultyId: assignment.facultyId || "",
      sections: assignment.sections || [],
      subjectType: assignment.subjectType || "THEORY",
      subjectCategory: assignment.subjectCategory || "Core",
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      const updated = assignments.filter((a) => a._id !== id);
      saveAssignments(updated);
      showSuccessMessage("Assignment deleted successfully");
    }
  };

  const handleCancel = () => {
    setFormData({
      academicYearId: "",
      courseId: "",
      streamId: "",
      semester: "",
      subjectId: "",
      facultyId: "",
      sections: [],
      subjectType: "THEORY",
      subjectCategory: "Core",
    });
    setShowForm(false);
    setEditingAssignment(null);
  };

  return (
    <div className="mt-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Faculty Subject Assignment</h3>
          <p className="text-sm text-gray-500 mt-1">
            Assign subjects to faculty members for internal marks entry
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Assign Subject
        </button>
      </div>

      {/* Assignment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">
                {editingAssignment ? "Edit Assignment" : "Assign Subject to Faculty"}
              </h3>
              <button onClick={handleCancel} className="text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Academic Year */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Academic Year*
                  </label>
                  <select
                    name="academicYearId"
                    value={formData.academicYearId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map((year) => (
                      <option key={year._id || year.id} value={year._id || year.id}>
                        {year.name || year.code || year.academicYear || ""}
                      </option>
                    ))}
                  </select>
                  {metaError && (
                    <p className="text-xs text-red-600 mt-1">{metaError}</p>
                  )}
                </div>

                {/* Course */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Course*
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                    disabled={!formData.academicYearId}
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} {course.code ? `(${course.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch/Stream */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Branch/Stream*
                  </label>
                  <select
                    name="streamId"
                    value={formData.streamId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                    disabled={!formData.courseId}
                  >
                    <option value="">Select Branch/Stream</option>
                    {streams.map((stream) => (
                      <option key={stream._id} value={stream._id}>
                        {stream.name} {stream.code ? `(${stream.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Semester*
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                    disabled={!formData.streamId}
                  >
                    <option value="">Select Semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Subject*
                    {formData.facultyId && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">
                        (Showing subjects assigned to this professor)
                      </span>
                    )}
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleSubjectChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                    disabled={!formData.semester}
                  >
                    <option value="">Select Subject</option>
                    {getAvailableSubjects.length > 0 ? (
                      getAvailableSubjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.code} - {subject.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No subjects assigned to this professor. Please assign subjects in Professors table first.
                      </option>
                    )}
                  </select>
                  {formData.facultyId && getAvailableSubjects.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      ⚠️ This professor has no subjects assigned. Go to Master Data → Professors to assign subjects first.
                    </p>
                  )}
                </div>

                {/* Faculty */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Faculty Member*
                  </label>
                  <select
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Faculty</option>
                    {professors.map((prof) => {
                      const profSubjects = prof.subjectIds || [];
                      const subjectCount = Array.isArray(profSubjects) ? profSubjects.length : 0;
                      return (
                        <option key={prof._id} value={prof._id}>
                          {prof.name}
                          {prof.professorId ? ` (${prof.professorId})` : ""}
                          {prof.designation ? ` - ${prof.designation}` : ""}
                          {subjectCount > 0 ? ` [${subjectCount} subject(s)]` : ""}
                        </option>
                      );
                    })}
                  </select>
                  {formData.facultyId && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs text-blue-800">
                        <strong>Professor's Subjects:</strong>
                        {(() => {
                          const professor = getProfessorDetails(formData.facultyId);
                          const profSubjects = professor.subjectIds || [];
                          if (!profSubjects.length) {
                            return <span className="text-amber-600 ml-1">No subjects assigned in Professors table</span>;
                          }
                          const subjectNames = profSubjects
                            .map((subjId) => {
                              const subj = typeof subjId === 'object' && subjId._id
                                ? subjects.find(s => s._id === subjId._id)
                                : subjects.find(s => s._id === subjId);
                              return subj ? `${subj.code} - ${subj.name}` : null;
                            })
                            .filter(Boolean);
                          return subjectNames.length > 0 ? (
                            <div className="mt-1 space-y-1">
                              {subjectNames.map((name, idx) => (
                                <div key={idx} className="text-xs">• {name}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-amber-600 ml-1">Subjects not found</span>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subject Type */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Subject Type*
                  </label>
                  <select
                    name="subjectType"
                    value={formData.subjectType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="THEORY">Theory</option>
                    <option value="LAB">Lab</option>
                  </select>
                </div>

                {/* Subject Category */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Subject Category*
                  </label>
                  <select
                    name="subjectCategory"
                    value={formData.subjectCategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="Core">Core</option>
                    <option value="Lab">Lab</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>
              </div>

          {/* Class / Section */}
          <div className="mt-5">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Class / Section* (Select one or more)
            </label>
            <div className="flex flex-wrap gap-3">
              {sectionOptions.map((section) => (
                <label
                  key={section}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.sections.includes(section)}
                    onChange={() => handleSectionToggle(section)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium">Section {section}</span>
                </label>
              ))}
            </div>
          </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6 pt-5 border-t">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  {editingAssignment ? "Update Assignment" : "Assign Subject"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">SN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Academic Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Branch</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Semester</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Faculty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Class / Sections</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.length > 0 ? (
              assignments.map((assignment, idx) => {
                const professor = getProfessorDetails(assignment.facultyId);
                return (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{assignment.academicYear}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{assignment.courseName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{assignment.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{assignment.semester}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium">{assignment.subjectCode}</div>
                      <div className="text-xs text-gray-500">{assignment.subjectName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          assignment.subjectType === "THEORY"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {assignment.subjectType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{professor.name || "N/A"}</div>
                      {professor.professorId && (
                        <div className="text-xs text-gray-500">{professor.professorId}</div>
                      )}
                    </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {Array.isArray(assignment.sections) && assignment.sections.length > 0
                    ? assignment.sections.map((s) => `Section ${s}`).join(", ")
                    : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(assignment._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500">
                  No assignments found. Click "Assign Subject" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultySubjectAssignment;

