import React, { useState, useEffect, useCallback } from "react";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";
import {
  coursesApi,
  examCategoriesApi,
  courseStreamMappingsApi,
  streamsApi,
  subjectsApi,
  internalExamSetupsApi,
} from "../../services/apiService";

const StudentMarksEntry = () => {
  const [filters, setFilters] = useState({
    courseId: "",
    streamId: "",
    selectedSemesterNumbers: [], // Array of semester numbers (1, 2, 3, etc.)
    subjectId: "",
    examType: "",
  });

  const [courses, setCourses] = useState([]);
  const [streamsData, setStreamsData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [examCategories, setExamCategories] = useState([]);
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);
  const [availableStreams, setAvailableStreams] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data?.data && Array.isArray(response.data.data))
      return response.data.data;
    return [];
  };

  const deriveExamMode = (val) => {
    const lower = (val || "").toString().toLowerCase();
    if (lower.includes("lab") || lower.includes("practical")) return "Labs";
    if (lower.includes("mid")) return "Mids";
    return val || "";
  };

  const formatSemesterNumber = (num) => {
    if (!num) return "";
    const n = parseInt(num);
    if (isNaN(n)) return num.toString();
    
    // Handle special cases: 11th, 12th, 13th
    const v = n % 100;
    if (v >= 11 && v <= 13) {
      return `${n}th Sem`;
    }
    
    // Handle 1st, 2nd, 3rd, and others
    const lastDigit = n % 10;
    if (lastDigit === 1) return `${n}st Sem`;
    if (lastDigit === 2) return `${n}nd Sem`;
    if (lastDigit === 3) return `${n}rd Sem`;
    return `${n}th Sem`;
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [coursesRes, streamsRes, subjectsRes, examCategoriesRes, mappingsRes] =
        await Promise.all([
          coursesApi.getAll(),
          streamsApi.getAll(),
          subjectsApi.getAll(),
          examCategoriesApi.getAll(),
          courseStreamMappingsApi.getAll({ activeOnly: true }),
        ]);

      setCourses(extractData(coursesRes));
      setStreamsData(extractData(streamsRes));
      setSubjectsData(extractData(subjectsRes));
      setExamCategories(extractData(examCategoriesRes));
      setCourseStreamMappings(extractData(mappingsRes));
    } catch (err) {
      console.error("Failed to load initial data", err);
      showErrorMessage("Failed to load data");
    }
  };

  // Filter streams based on selected course
  useEffect(() => {
    if (!filters.courseId || courseStreamMappings.length === 0) {
      setAvailableStreams([]);
      return;
    }

    const courseMappings = courseStreamMappings.filter((mapping) => {
      const mappingCourseId =
        typeof mapping.courseId === "object" && mapping.courseId?._id
          ? mapping.courseId._id
          : mapping.courseId;
      return (
        mappingCourseId === filters.courseId &&
        (mapping.status === "Active" || mapping.status === undefined)
      );
    });

    const streamIds = new Set();
    courseMappings.forEach((mapping) => {
      const streamId =
        typeof mapping.streamId === "object" && mapping.streamId?._id
          ? mapping.streamId._id
          : mapping.streamId;
      if (streamId) streamIds.add(streamId);
    });

    const filteredStreams = streamsData.filter((stream) =>
      streamIds.has(stream._id)
    );
    setAvailableStreams(filteredStreams);
  }, [filters.courseId, courseStreamMappings, streamsData]);

  // Filter semesters based on selected course and stream
  useEffect(() => {
    if (!filters.courseId || !filters.streamId || courseStreamMappings.length === 0) {
      setAvailableSemesters([]);
      setAvailableSubjects([]);
      return;
    }

    const allMappings = courseStreamMappings.filter((mapping) => {
      const mappingCourseId =
        typeof mapping.courseId === "object" && mapping.courseId?._id
          ? mapping.courseId._id
          : mapping.courseId;
      const mappingStreamId =
        typeof mapping.streamId === "object" && mapping.streamId?._id
          ? mapping.streamId._id
          : mapping.streamId;
      return (
        mappingCourseId === filters.courseId &&
        mappingStreamId === filters.streamId &&
        (mapping.status === "Active" || mapping.status === undefined)
      );
    });

    // Group by semesterNumber (like course-stream mapping does)
    const groupedBySemesterNumber = {};
    allMappings.forEach((mapping) => {
      const semesterNumber = mapping.semesterNumber || 1;
      const semesterId =
        typeof mapping.semesterId === "object" && mapping.semesterId?._id
          ? mapping.semesterId._id
          : mapping.semesterId;
      
      if (!groupedBySemesterNumber[semesterNumber]) {
        groupedBySemesterNumber[semesterNumber] = {
          semesterNumber: semesterNumber,
          semesterIds: new Set(), // Store all semesterIds for this semesterNumber
          semesterObj: typeof mapping.semesterId === "object" 
            ? mapping.semesterId 
            : { _id: semesterId },
          mappings: [],
        };
      }
      
      if (semesterId) {
        groupedBySemesterNumber[semesterNumber].semesterIds.add(semesterId);
      }
      groupedBySemesterNumber[semesterNumber].mappings.push(mapping);
    });

    // Convert to array and sort by semesterNumber
    const semestersByNumber = Object.keys(groupedBySemesterNumber)
      .map((semNum) => ({
        semesterNumber: parseInt(semNum),
        semesterIds: Array.from(groupedBySemesterNumber[semNum].semesterIds),
        semesterObj: groupedBySemesterNumber[semNum].semesterObj,
        description: groupedBySemesterNumber[semNum].semesterObj?.description || 
                     groupedBySemesterNumber[semNum].semesterObj?.name ||
                     `Semester ${semNum}`,
      }))
      .sort((a, b) => a.semesterNumber - b.semesterNumber);
    
    setAvailableSemesters(semestersByNumber);
  }, [filters.courseId, filters.streamId, courseStreamMappings]);

  // Filter subjects based on selected course, stream, and selected semester numbers
  useEffect(() => {
    if (
      !filters.courseId ||
      !filters.streamId ||
      filters.selectedSemesterNumbers.length === 0 ||
      courseStreamMappings.length === 0
    ) {
      setAvailableSubjects([]);
      return;
    }

    const relevantMappings = courseStreamMappings.filter((mapping) => {
      const mappingCourseId =
        typeof mapping.courseId === "object" && mapping.courseId?._id
          ? mapping.courseId._id
          : mapping.courseId;
      const mappingStreamId =
        typeof mapping.streamId === "object" && mapping.streamId?._id
          ? mapping.streamId._id
          : mapping.streamId;
      const mappingSemesterNumber = mapping.semesterNumber || 1;
      return (
        mappingCourseId === filters.courseId &&
        mappingStreamId === filters.streamId &&
        filters.selectedSemesterNumbers.includes(mappingSemesterNumber) &&
        (mapping.status === "Active" || mapping.status === undefined)
      );
    });

    const subjectMap = new Map();
    relevantMappings.forEach((mapping) => {
      if (Array.isArray(mapping.subjects)) {
        mapping.subjects.forEach((subj) => {
          const subjectId =
            typeof subj.subjectId === "object" && subj.subjectId?._id
              ? subj.subjectId._id
              : subj.subjectId || subj;
          if (subjectId && !subjectMap.has(subjectId)) {
            const fullSubject = subjectsData.find((s) => s._id === subjectId);
            subjectMap.set(
              subjectId,
              fullSubject || {
                _id: subjectId,
                name: subj.name || "Unknown",
                code: subj.code || "",
              }
            );
          }
        });
      }
    });
    setAvailableSubjects(Array.from(subjectMap.values()));
  }, [filters.courseId, filters.streamId, filters.selectedSemesterNumbers, courseStreamMappings, subjectsData]);

  const loadStudents = useCallback(async () => {
    if (
      !filters.courseId ||
      !filters.streamId ||
      filters.selectedSemesterNumbers.length === 0 ||
      !filters.subjectId ||
      !filters.examType
    ) {
      showErrorMessage("Please select all filters including at least one semester");
      return;
    }

    try {
      setLoadingStudents(true);

      // Get all semesterIds that match the selected semesterNumbers
      const relevantMappings = courseStreamMappings.filter((mapping) => {
        const mappingCourseId =
          typeof mapping.courseId === "object" && mapping.courseId?._id
            ? mapping.courseId._id
            : mapping.courseId;
        const mappingStreamId =
          typeof mapping.streamId === "object" && mapping.streamId?._id
            ? mapping.streamId._id
            : mapping.streamId;
        const mappingSemesterNumber = mapping.semesterNumber || 1;
        return (
          mappingCourseId === filters.courseId &&
          mappingStreamId === filters.streamId &&
          filters.selectedSemesterNumbers.includes(mappingSemesterNumber) &&
          (mapping.status === "Active" || mapping.status === undefined)
        );
      });

      // Extract all unique semesterIds for the selected semesterNumbers
      const semesterIdsSet = new Set();
      relevantMappings.forEach((mapping) => {
        const semesterId =
          typeof mapping.semesterId === "object" && mapping.semesterId?._id
            ? mapping.semesterId._id
            : mapping.semesterId;
        if (semesterId) {
          semesterIdsSet.add(semesterId);
        }
      });
      const semesterIds = Array.from(semesterIdsSet);

      if (semesterIds.length === 0) {
        showErrorMessage("No semester mappings found for selected semester numbers");
        setSelectedConfig(null);
        setStudents([]);
        setMarksData({});
        return;
      }

      // Find configurations for all selected semesters
      const configsRes = await internalExamSetupsApi.getAll();
      const allConfigs = extractData(configsRes);

      // Find configs that match any of the semesterIds
      const matchingConfigs = allConfigs.filter((c) => {
        const cCourseId =
          typeof c.courseId === "object" && c.courseId?._id
            ? c.courseId._id
            : c.courseId;
        const cStreamId =
          typeof c.streamId === "object" && c.streamId?._id
            ? c.streamId._id
            : c.streamId;
        const cSemesterId =
          typeof c.semesterId === "object" && c.semesterId?._id
            ? c.semesterId._id
            : c.semesterId;
        const cSubjectId =
          typeof c.subjectId === "object" && c.subjectId?._id
            ? c.subjectId._id
            : c.subjectId;

        return (
          cCourseId === filters.courseId &&
          cStreamId === filters.streamId &&
          semesterIds.includes(cSemesterId) &&
          cSubjectId === filters.subjectId &&
          (c.examType === filters.examType ||
            deriveExamMode(c.examType) === deriveExamMode(filters.examType))
        );
      });

      if (matchingConfigs.length === 0) {
        showErrorMessage(
          "No configuration found for the selected filters. Please create a configuration in Internal Exam Setup first."
        );
        setSelectedConfig(null);
        setStudents([]);
        setMarksData({});
        return;
      }

      // Use the first matching config (they should all have same marks structure)
      setSelectedConfig(matchingConfigs[0]);

      // Fetch students for all semesterIds
      const allStudentsList = [];
      const semesterConfigMap = {}; // Map semesterId to config

      for (const semesterId of semesterIds) {
        const semesterConfig = matchingConfigs.find((c) => {
          const cSemesterId =
            typeof c.semesterId === "object" && c.semesterId?._id
              ? c.semesterId._id
              : c.semesterId;
          return cSemesterId === semesterId;
        });

        if (semesterConfig) {
          semesterConfigMap[semesterId] = semesterConfig;

          // Fetch students for this semester
          const studentsParams = {
            courseId: filters.courseId,
            streamId: filters.streamId,
            semesterId: semesterId,
            status: "Admitted",
          };

          const studentsRes = await internalExamSetupsApi.getStudents(studentsParams);
          const responseData = studentsRes?.data || studentsRes;
          const studentsList = responseData?.students || extractData(studentsRes) || [];

          // Add semesterId and semesterNumber to each student for reference
          const studentsWithSemester = studentsList.map((student) => {
            // Find the mapping to get semesterNumber
            const mapping = relevantMappings.find((m) => {
              const mSemesterId =
                typeof m.semesterId === "object" && m.semesterId?._id
                  ? m.semesterId._id
                  : m.semesterId;
              return mSemesterId === semesterId;
            });
            return {
              ...student,
              _semesterId: semesterId,
              _semesterNumber: mapping?.semesterNumber || student.semesterNumber,
            };
          });

          allStudentsList.push(...studentsWithSemester);
        }
      }

      setStudents(allStudentsList);

      // Load existing marks for all selected semesters
      const configId = matchingConfigs[0]._id || matchingConfigs[0].id;
      const combinedMarks = {};
      
      // Load marks for each semesterId
      for (const semesterId of semesterIds) {
        const storageKey = `internal_marks_${configId}_${filters.subjectId}_${semesterId}`;
        const oldStorageKey = `internal_marks_${configId}_${filters.subjectId}`;
        
        let savedMarks = localStorage.getItem(storageKey);
        if (!savedMarks) {
          // Try old format for backward compatibility
          savedMarks = localStorage.getItem(oldStorageKey);
        }
        
        if (savedMarks) {
          const parsedMarks = JSON.parse(savedMarks);
          Object.assign(combinedMarks, parsedMarks);
        }
      }
      
      // Ensure semesterNumber is included for each student's marks
      const marksWithSemester = {};
      allStudentsList.forEach((student) => {
        const studentId = student._id || student.id;
        const semesterNumber = student.semesterNumber || student.semester?.semesterNumber || null;
        const existingMarks = combinedMarks[studentId] || {};
        
        marksWithSemester[studentId] = {
          ...existingMarks,
          semesterNumber: existingMarks.semesterNumber || semesterNumber,
        };
      });
      
      setMarksData(marksWithSemester);
    } catch (err) {
      console.error("Failed to load students", err);
      showErrorMessage(err.message || "Failed to load students");
      setStudents([]);
      setSelectedConfig(null);
    } finally {
      setLoadingStudents(false);
    }
  }, [filters.courseId, filters.streamId, filters.selectedSemesterNumbers, filters.subjectId, filters.examType, courseStreamMappings]);

  // Auto-load students when all filters are selected
  useEffect(() => {
    if (
      filters.courseId &&
      filters.streamId &&
      filters.selectedSemesterNumbers.length > 0 &&
      filters.subjectId &&
      filters.examType
    ) {
      loadStudents();
    } else {
      // Clear students when filters are incomplete
      setStudents([]);
      setSelectedConfig(null);
      setMarksData({});
    }
  }, [filters.courseId, filters.streamId, filters.selectedSemesterNumbers, filters.subjectId, filters.examType, loadStudents]);

  const handleMarksChange = (studentId, field, value) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
        absent: field === "absent" ? value : prev[studentId]?.absent || false,
      },
    }));
  };

  const calculateTotal = (studentId) => {
    if (!selectedConfig) return 0;
    const data = marksData[studentId] || {};
    if (data.absent) return 0;

    const mode = deriveExamMode(selectedConfig.examType);
    if (mode === "Mids") {
      return (
        parseFloat(data.test1 || 0) +
        parseFloat(data.test2 || 0) +
        parseFloat(data.assignment || 0) +
        parseFloat(data.attendance || 0)
      );
    } else if (mode === "Labs") {
      return (
        parseFloat(data.record || 0) +
        parseFloat(data.performance || 0) +
        parseFloat(data.internalTest || 0) +
        parseFloat(data.viva || 0)
      );
    }
    return 0;
  };

  const saveMarks = () => {
    if (!selectedConfig) {
      showErrorMessage("Please load students first");
      return;
    }

    try {
      const configId = selectedConfig._id || selectedConfig.id;
      
      // Prepare marks data with semesterNumber for each student
      // This structure is ready for API integration - includes semesterNumber from course-stream mapping
      const marksWithSemester = {};
      const marksPayload = []; // For future API integration
      
      students.forEach((student) => {
        const studentId = student._id || student.id;
        const studentMarks = marksData[studentId] || {};
        const semesterNumber = student.semesterNumber || student.semester?.semesterNumber || null;
        
        const markEntry = {
          ...studentMarks,
          semesterNumber: semesterNumber, // Important: semesterNumber from course-stream mapping
          studentId: studentId,
          registrationNumber: student.registrationNumber || student.hallTicketNo,
          studentName: student.firstName && student.lastName
            ? `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim()
            : student.name || student.studentName,
          // Include filter context for API
          courseId: filters.courseId,
          streamId: filters.streamId,
          semesterId: filters.semesterId,
          subjectId: filters.subjectId,
          examType: filters.examType,
          configId: configId,
        };
        
        marksWithSemester[studentId] = markEntry;
        
        // Prepare payload for API (when ready)
        marksPayload.push({
          studentId: studentId,
          semesterNumber: semesterNumber, // Required for API
          courseId: filters.courseId,
          streamId: filters.streamId,
          subjectId: filters.subjectId,
          examType: filters.examType,
          configId: configId,
          // Marks based on exam type
          ...(deriveExamMode(filters.examType) === "Mids" ? {
            test1: parseFloat(markEntry.test1 || 0),
            test2: parseFloat(markEntry.test2 || 0),
            assignment: parseFloat(markEntry.assignment || 0),
            attendance: parseFloat(markEntry.attendance || 0),
          } : {
            record: parseFloat(markEntry.record || 0),
            performance: parseFloat(markEntry.performance || 0),
            internalTest: parseFloat(markEntry.internalTest || 0),
            viva: parseFloat(markEntry.viva || 0),
          }),
          total: calculateTotal(studentId),
          absent: markEntry.absent || false,
        });
      });

      // Save marks for each selected semester separately
      // Group students by their semesterId
      const studentsBySemester = {};
      students.forEach((student) => {
        const semesterId = student._semesterId || 
          (typeof student.semester === "object" && student.semester?._id ? student.semester._id : student.semester);
        
        if (semesterId) {
          if (!studentsBySemester[semesterId]) {
            studentsBySemester[semesterId] = [];
          }
          studentsBySemester[semesterId].push(student);
        }
      });

      // Save marks for each semesterId that has students
      for (const semesterId of Object.keys(studentsBySemester)) {
        const semesterStudents = studentsBySemester[semesterId] || [];
        const semesterMarks = {};
        
        semesterStudents.forEach((student) => {
          const studentId = student._id || student.id;
          semesterMarks[studentId] = marksWithSemester[studentId];
        });

        const storageKey = `internal_marks_${configId}_${filters.subjectId}_${semesterId}`;
        localStorage.setItem(storageKey, JSON.stringify(semesterMarks));
      }
      
      // TODO: When API is ready, use this payload:
      // await internalExamSetupsApi.saveMarks(marksPayload);
      
      // Also update the marksData state to include semesterNumber
      setMarksData(marksWithSemester);
      
      showSuccessMessage("Marks saved successfully");
    } catch (err) {
      showErrorMessage("Failed to save marks");
      console.error(err);
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Student Marks Entry
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Enter internal exam marks for students based on course, stream, and exam type
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
        <h4 className="text-lg font-semibold mb-4">Select Filters</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course*
            </label>
            <select
              value={filters.courseId}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  courseId: e.target.value,
                  streamId: "",
                  selectedSemesterNumbers: [],
                  subjectId: "",
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stream*
            </label>
            <select
              value={filters.streamId}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  streamId: e.target.value,
                  selectedSemesterNumbers: [],
                  subjectId: "",
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              disabled={!filters.courseId}
            >
              <option value="">
                {filters.courseId ? "Select Stream" : "Select Course First"}
              </option>
              {availableStreams.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semesters* (Select one or more)
            </label>
            <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto bg-white">
              {!filters.courseId || !filters.streamId ? (
                <p className="text-sm text-gray-500 text-center py-2">
                  Select Course & Stream First
                </p>
              ) : availableSemesters.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">
                  No semesters available
                </p>
              ) : (
                <div className="space-y-2">
                  {availableSemesters.map((s) => {
                    const semesterNumber = s.semesterNumber;
                    const isSelected = filters.selectedSemesterNumbers.includes(semesterNumber);
                    return (
                      <label
                        key={semesterNumber}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({
                                ...filters,
                                selectedSemesterNumbers: [...filters.selectedSemesterNumbers, semesterNumber],
                                subjectId: "", // Reset subject when semester changes
                              });
                            } else {
                              setFilters({
                                ...filters,
                                selectedSemesterNumbers: filters.selectedSemesterNumbers.filter(
                                  (num) => num !== semesterNumber
                                ),
                                subjectId: "", // Reset subject when semester changes
                              });
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">
                          {s.description || formatSemesterNumber(semesterNumber)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {filters.selectedSemesterNumbers.length > 0 && (
              <p className="text-xs text-emerald-600 mt-1">
                {filters.selectedSemesterNumbers.length} semester(s) selected
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject*
            </label>
            <select
              value={filters.subjectId}
              onChange={(e) =>
                setFilters({ ...filters, subjectId: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              disabled={
                !filters.courseId ||
                !filters.streamId ||
                filters.selectedSemesterNumbers.length === 0
              }
            >
              <option value="">
                {filters.courseId && filters.streamId && filters.selectedSemesterNumbers.length > 0
                  ? "Select Subject"
                  : "Select Course, Stream & Semesters First"}
              </option>
              {availableSubjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Category*
            </label>
            <select
              value={filters.examType}
              onChange={(e) =>
                setFilters({ ...filters, examType: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Exam Category</option>
              {examCategories.map((cat) => {
                const val = cat.name || cat.title || cat.code || cat._id;
                return (
                  <option key={cat._id || val} value={val}>
                    {cat.name || cat.title || cat.code || val}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadStudents}
              disabled={loadingStudents || !filters.courseId || !filters.streamId || filters.selectedSemesterNumbers.length === 0 || !filters.subjectId || !filters.examType}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              title="Refresh students list"
            >
              {loadingStudents ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Info */}
      {selectedConfig && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            Configuration Details
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Max Marks:</span>{" "}
              <span className="font-semibold">
                {selectedConfig.maxMarks || selectedConfig.totalInternalMarks}
              </span>
            </div>
            <div>
              <span className="text-blue-600">Pass Marks:</span>{" "}
              <span className="font-semibold">{selectedConfig.passMarks}</span>
            </div>
            <div>
              <span className="text-blue-600">Total Internal:</span>{" "}
              <span className="font-semibold">
                {selectedConfig.totalInternalMarks}
              </span>
            </div>
            <div>
              <span className="text-blue-600">Exam Type:</span>{" "}
              <span className="font-semibold">{selectedConfig.examType}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loadingStudents && (
        <div className="bg-white rounded-lg shadow-md border p-6 mb-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Loading students...</span>
          </div>
        </div>
      )}

      {/* No Students Message */}
      {!loadingStudents && filters.courseId && filters.streamId && filters.selectedSemesterNumbers.length > 0 && filters.subjectId && filters.examType && students.length === 0 && selectedConfig && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            No students found for the selected filters. Please check the course, stream, and semester selection.
          </p>
        </div>
      )}

      {/* Student Marks Table */}
      {!loadingStudents && students.length > 0 && selectedConfig && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    SN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Roll No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Student Name
                  </th>
                  {filters.selectedSemesterNumbers.length > 1 && (
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                      Semester
                    </th>
                  )}
                  {deriveExamMode(selectedConfig.examType) === "Mids" ? (
                    <>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Test-1 ({selectedConfig.test1Max || 0})
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Test-2 ({selectedConfig.test2Max || 0})
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Assignment ({selectedConfig.assignmentMax || 0})
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Attendance ({selectedConfig.attendanceMax || 0})
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Record ({selectedConfig.recordMax || 0})
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Performance ({selectedConfig.performanceMax || 0})
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Internal Test ({selectedConfig.internalTestMax || 0})
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Viva ({selectedConfig.vivaMax || 0})
                      </th>
                    </>
                  )}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Absent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, idx) => {
                  const data = marksData[student._id || student.id] || {};
                  const isAbsent = data.absent || false;
                  const total = calculateTotal(student._id || student.id);
                  const studentId = student._id || student.id;

                  return (
                    <tr
                      key={studentId}
                      className={isAbsent ? "bg-red-50" : "hover:bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-sm">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {student.registrationNumber || student.hallTicketNo || student.rollNumber || student.rollNo || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {student.firstName && student.lastName
                          ? `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim()
                          : student.name || student.studentName || "-"}
                      </td>
                      {filters.selectedSemesterNumbers.length > 1 && (
                        <td className="px-4 py-3 text-center text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {student.semesterYear || formatSemesterNumber(student._semesterNumber || student.semesterNumber) || "-"}
                          </span>
                        </td>
                      )}
                      {deriveExamMode(selectedConfig.examType) === "Mids" ? (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={data.test1 || ""}
                              onChange={(e) =>
                                handleMarksChange(
                                  studentId,
                                  "test1",
                                  e.target.value
                                )
                              }
                              disabled={isAbsent}
                              min="0"
                              max={selectedConfig.test1Max || 100}
                              className={`w-20 px-2 py-1 border rounded text-center ${
                                isAbsent ? "bg-gray-100" : ""
                              } ${
                                data.test1 &&
                                parseFloat(data.test1) >
                                  parseFloat(selectedConfig.test1Max || 0)
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={data.test2 || ""}
                              onChange={(e) =>
                                handleMarksChange(
                                  studentId,
                                  "test2",
                                  e.target.value
                                )
                              }
                              disabled={isAbsent}
                              min="0"
                              max={selectedConfig.test2Max || 100}
                              className={`w-20 px-2 py-1 border rounded text-center ${
                                isAbsent ? "bg-gray-100" : ""
                              } ${
                                data.test2 &&
                                parseFloat(data.test2) >
                                  parseFloat(selectedConfig.test2Max || 0)
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={data.assignment || ""}
                              onChange={(e) =>
                                handleMarksChange(
                                  studentId,
                                  "assignment",
                                  e.target.value
                                )
                              }
                              disabled={isAbsent}
                              min="0"
                              max={selectedConfig.assignmentMax || 100}
                              className={`w-20 px-2 py-1 border rounded text-center ${
                                isAbsent ? "bg-gray-100" : ""
                              } ${
                                data.assignment &&
                                parseFloat(data.assignment) >
                                  parseFloat(selectedConfig.assignmentMax || 0)
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={data.attendance || ""}
                              onChange={(e) =>
                                handleMarksChange(
                                  studentId,
                                  "attendance",
                                  e.target.value
                                )
                              }
                              disabled={isAbsent}
                              min="0"
                              max={selectedConfig.attendanceMax || 100}
                              className={`w-20 px-2 py-1 border rounded text-center ${
                                isAbsent ? "bg-gray-100" : ""
                              } ${
                                data.attendance &&
                                parseFloat(data.attendance) >
                                  parseFloat(selectedConfig.attendanceMax || 0)
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={data.record || ""}
                              onChange={(e) =>
                                handleMarksChange(
                                  studentId,
                                  "record",
                                  e.target.value
                                )
                              }
                              disabled={isAbsent}
                              min="0"
                              max={selectedConfig.recordMax || 100}
                              className={`w-20 px-2 py-1 border rounded text-center ${
                                isAbsent ? "bg-gray-100" : ""
                              } ${
                                data.record &&
                                parseFloat(data.record) >
                                  parseFloat(selectedConfig.recordMax || 0)
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={data.performance || ""}
                              onChange={(e) =>
                                handleMarksChange(
                                  studentId,
                                  "performance",
                                  e.target.value
                                )
                              }
                              disabled={isAbsent}
                              min="0"
                              max={selectedConfig.performanceMax || 100}
                              className={`w-20 px-2 py-1 border rounded text-center ${
                                isAbsent ? "bg-gray-100" : ""
                              } ${
                                data.performance &&
                                parseFloat(data.performance) >
                                  parseFloat(selectedConfig.performanceMax || 0)
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={data.internalTest || ""}
                              onChange={(e) =>
                                handleMarksChange(
                                  studentId,
                                  "internalTest",
                                  e.target.value
                                )
                              }
                              disabled={isAbsent}
                              min="0"
                              max={selectedConfig.internalTestMax || 100}
                              className={`w-20 px-2 py-1 border rounded text-center ${
                                isAbsent ? "bg-gray-100" : ""
                              } ${
                                data.internalTest &&
                                parseFloat(data.internalTest) >
                                  parseFloat(selectedConfig.internalTestMax || 0)
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={data.viva || ""}
                              onChange={(e) =>
                                handleMarksChange(
                                  studentId,
                                  "viva",
                                  e.target.value
                                )
                              }
                              disabled={isAbsent}
                              min="0"
                              max={selectedConfig.vivaMax || 100}
                              className={`w-20 px-2 py-1 border rounded text-center ${
                                isAbsent ? "bg-gray-100" : ""
                              } ${
                                data.viva &&
                                parseFloat(data.viva) >
                                  parseFloat(selectedConfig.vivaMax || 0)
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-center text-sm font-semibold">
                        {total}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isAbsent}
                          onChange={(e) =>
                            handleMarksChange(
                              studentId,
                              "absent",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveMarks}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Save Marks
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentMarksEntry;

