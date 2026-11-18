import React, { useState, useEffect, useCallback } from "react";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";
import {
  coursesApi,
  examCategoriesApi,
  courseStreamMappingsApi,
  streamsApi,
  subjectsApi,
  internalExamSetupsApi,
  studentsApi,
  internalMarksApi,
} from "../../services/apiService";

const InternalExamSetup = () => {
  const [activeTab, setActiveTab] = useState("configuration"); // "configuration", "marksEntry", or "internalMarks"
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState(null);

  // Student Marks Entry State
  const [selectedInternalExamSetupId, setSelectedInternalExamSetupId] =
    useState("");
  const [marksFilters, setMarksFilters] = useState({
    courseId: "",
    streamId: "",
    semesterId: "",
    subjectId: "",
    examType: "",
  });
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savedMarks, setSavedMarks] = useState([]);
  const [loadingSavedMarks, setLoadingSavedMarks] = useState(false);

  const [formData, setFormData] = useState({
    courseId: "",
    streamId: "",
    semesterId: "", // Will be auto-filled from CourseStreamMapping when semesterNumber is selected
    semesterNumber: "", // Semester number from CourseStreamMapping
    subjectId: "",
    examType: "", // "Mids" or "Labs"
    maxMarks: "", // Maximum marks that can be obtained
    passMarks: "", // Pass marks threshold
    totalInternalMarks: "",
    // Mids fields (30 marks)
    test1Max: "",
    test2Max: "",
    assignmentMax: "",
    attendanceMax: "",
    // Labs fields (50 marks)
    recordMax: "",
    performanceMax: "",
    internalTestMax: "",
    vivaMax: "",
    // Final Examination fields
    externalMarksMax: "",
    passMarksExternal: "", // Pass marks for external marks only
    totalMarksFinal: "", // Total marks (Internal + External) - auto-calculated
    passMarksFinal: "",
    examDate: "",
    duration: "3 hours",
    examinationType: "Regular",
    status: "Active",
  });

  const [courses, setCourses] = useState([]);
  const [examCategories, setExamCategories] = useState([]);
  const [streamsData, setStreamsData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);
  const [availableStreams, setAvailableStreams] = useState([]);
  const [availableSemesterNumbers, setAvailableSemesterNumbers] = useState([]); // Semester numbers from mappings
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [existingExamSetups, setExistingExamSetups] = useState([]); // All exam setups for selected course/stream/semester/subject
  const [loadingExistingSetups, setLoadingExistingSetups] = useState(false);
  const [selectedExamCategories, setSelectedExamCategories] = useState([]); // Selected exam category IDs
  const [expandedRows, setExpandedRows] = useState(new Set()); // Track expanded rows by key

  const deriveExamMode = (val) => {
    const lower = (val || "").toString().toLowerCase();
    if (lower.includes("lab") || lower.includes("practical")) return "Labs";
    if (lower.includes("mid")) return "Mids";
    if (
      lower.includes("final") ||
      lower.includes("end semester") ||
      lower.includes("endsem") ||
      lower.includes("external") ||
      lower.includes("university")
    )
      return "Final";
    return val || "";
  };

  useEffect(() => {
    fetchConfigs();
    fetchMeta();
    fetchStreamsAndSubjects();
    fetchCourseStreamMappings();
  }, []);

  // Fetch streams and subjects
  const fetchStreamsAndSubjects = async () => {
    try {
      const [streamsRes, subjectsRes] = await Promise.all([
        streamsApi.getAll?.() ?? streamsApi.getAll(),
        subjectsApi.getAll?.() ?? subjectsApi.getAll(),
      ]);
      setStreamsData(extractData(streamsRes));
      setSubjectsData(extractData(subjectsRes));
    } catch (err) {
      console.error("Failed to load streams/subjects", err);
    }
  };

  // Fetch course-stream mappings
  const fetchCourseStreamMappings = async () => {
    try {
      const response = await courseStreamMappingsApi.getAll({
        activeOnly: true,
      });
      setCourseStreamMappings(extractData(response));
    } catch (err) {
      console.error("Failed to load course-stream mappings", err);
    }
  };

  // Filter streams based on selected course
  useEffect(() => {
    if (!formData.courseId || courseStreamMappings.length === 0) {
      setAvailableStreams([]);
      return;
    }

    // Find all mappings for the selected course
    const courseMappings = courseStreamMappings.filter((mapping) => {
      const mappingCourseId =
        typeof mapping.courseId === "object" && mapping.courseId?._id
          ? mapping.courseId._id
          : mapping.courseId;
      return (
        mappingCourseId === formData.courseId &&
        (mapping.status === "Active" || mapping.status === undefined)
      );
    });

    // Get unique stream IDs from mappings
    const streamIds = new Set();
    courseMappings.forEach((mapping) => {
      const streamId =
        typeof mapping.streamId === "object" && mapping.streamId?._id
          ? mapping.streamId._id
          : mapping.streamId;
      if (streamId) streamIds.add(streamId);
    });

    // Filter streams that are in the mappings
    const filteredStreams = streamsData.filter((stream) =>
      streamIds.has(stream._id)
    );
    setAvailableStreams(filteredStreams);

    // Reset stream, semester, and subject if course changes
    if (formData.streamId) {
      const currentStream = filteredStreams.find(
        (s) => s._id === formData.streamId
      );
      if (!currentStream) {
        setFormData((prev) => ({
          ...prev,
          streamId: "",
          semesterId: "",
          subjectId: "",
        }));
      }
    }
  }, [formData.courseId, courseStreamMappings, streamsData]);

  // Filter semester numbers based on selected course and stream
  useEffect(() => {
    if (
      !formData.courseId ||
      !formData.streamId ||
      courseStreamMappings.length === 0
    ) {
      setAvailableSemesterNumbers([]);
      setAvailableSubjects([]);
      return;
    }

    // Find all mappings for the selected course and stream
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
        mappingCourseId === formData.courseId &&
        mappingStreamId === formData.streamId &&
        (mapping.status === "Active" || mapping.status === undefined)
      );
    });

    // Get unique semester numbers from mappings
    const semesterNumberSet = new Set();
    const semesterNumberArray = [];

    allMappings.forEach((mapping) => {
      const semesterNumber = mapping.semesterNumber;
      const semesterId =
        typeof mapping.semesterId === "object" && mapping.semesterId?._id
          ? mapping.semesterId._id
          : mapping.semesterId;

      // Store unique semester numbers with their semesterId
      if (semesterNumber && !semesterNumberSet.has(semesterNumber)) {
        semesterNumberSet.add(semesterNumber);
        semesterNumberArray.push({
          semesterNumber,
          semesterId,
        });
      }
    });

    // Sort by semester number
    semesterNumberArray.sort((a, b) => a.semesterNumber - b.semesterNumber);
    setAvailableSemesterNumbers(semesterNumberArray);

    // Reset semesterNumber and subject if course or stream changes
    if (formData.semesterNumber) {
      const currentSemesterNumber = semesterNumberArray.find(
        (item) => item.semesterNumber === Number(formData.semesterNumber)
      );
      if (!currentSemesterNumber) {
        setFormData((prev) => ({
          ...prev,
          semesterNumber: "",
          subjectId: "",
        }));
      }
    }
  }, [formData.courseId, formData.streamId, courseStreamMappings]);

  // Filter subjects based on selected course, stream, and semesterNumber
  useEffect(() => {
    if (
      !formData.courseId ||
      !formData.streamId ||
      !formData.semesterNumber ||
      courseStreamMappings.length === 0
    ) {
      setAvailableSubjects([]);
      return;
    }

    // Find mappings for the selected course, stream, and semesterNumber
    const relevantMappings = courseStreamMappings.filter((mapping) => {
      const mappingCourseId =
        typeof mapping.courseId === "object" && mapping.courseId?._id
          ? mapping.courseId._id
          : mapping.courseId;
      const mappingStreamId =
        typeof mapping.streamId === "object" && mapping.streamId?._id
          ? mapping.streamId._id
          : mapping.streamId;
      const mappingSemesterNumber = mapping.semesterNumber;

      return (
        mappingCourseId === formData.courseId &&
        mappingStreamId === formData.streamId &&
        mappingSemesterNumber === Number(formData.semesterNumber) &&
        (mapping.status === "Active" || mapping.status === undefined)
      );
    });

    // Extract unique subjects from mappings
    const subjectMap = new Map();
    relevantMappings.forEach((mapping) => {
      if (Array.isArray(mapping.subjects)) {
        mapping.subjects.forEach((subj) => {
          const subjectId =
            typeof subj.subjectId === "object" && subj.subjectId?._id
              ? subj.subjectId._id
              : subj.subjectId || subj;
          if (subjectId && !subjectMap.has(subjectId)) {
            // Find the full subject object
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
  }, [
    formData.courseId,
    formData.streamId,
    formData.semesterNumber,
    courseStreamMappings,
    subjectsData,
  ]);

  // Fetch existing exam setups when course, stream, semester, and subject are all selected
  const fetchExistingExamSetups = useCallback(async () => {
    if (
      !formData.courseId ||
      !formData.streamId ||
      !formData.semesterId ||
      !formData.subjectId
    ) {
      setExistingExamSetups([]);
      setSelectedExamCategories([]);
      return;
    }

    try {
      setLoadingExistingSetups(true);
      const response = await internalExamSetupsApi.getAll({
        courseId: formData.courseId,
        streamId: formData.streamId,
        semesterId: formData.semesterId,
        subjectId: formData.subjectId,
        status: "Active",
      });
      const setups = extractData(response);
      setExistingExamSetups(setups || []);
      
      // Auto-select exam categories that have existing setups
      const existingCategoryNames = setups.map((setup) => setup.examType).filter(Boolean);
      setSelectedExamCategories(existingCategoryNames);
      
      // Auto-populate form fields from existing setups
      if (setups.length > 0) {
        const midsSetup = setups.find((s) => deriveExamMode(s.examType) === "Mids");
        const labsSetup = setups.find((s) => deriveExamMode(s.examType) === "Labs");
        const finalSetup = setups.find((s) => deriveExamMode(s.examType) === "Final");
        
        setFormData((prev) => {
          const updated = { ...prev };
          
          // Populate Mids fields if exists
          if (midsSetup) {
            updated.test1Max = midsSetup.test1Max?.toString() || "";
            updated.test2Max = midsSetup.test2Max?.toString() || "";
            updated.assignmentMax = midsSetup.assignmentMax?.toString() || "";
            updated.attendanceMax = midsSetup.attendanceMax?.toString() || "";
            updated.totalInternalMarks = midsSetup.totalInternalMarks?.toString() || "";
            updated.maxMarks = midsSetup.maxMarks?.toString() || "";
            updated.passMarks = midsSetup.passMarks?.toString() || "";
          }
          
          // Populate Labs fields if exists
          if (labsSetup) {
            updated.recordMax = labsSetup.recordMax?.toString() || "";
            updated.performanceMax = labsSetup.performanceMax?.toString() || "";
            updated.internalTestMax = labsSetup.internalTestMax?.toString() || "";
            updated.vivaMax = labsSetup.vivaMax?.toString() || "";
            // Use labs totalInternalMarks if not already set from Mids
            if (!updated.totalInternalMarks) {
              updated.totalInternalMarks = labsSetup.totalInternalMarks?.toString() || "";
              updated.maxMarks = labsSetup.maxMarks?.toString() || "";
              updated.passMarks = labsSetup.passMarks?.toString() || "";
            }
          }
          
          // Populate Final fields if exists
          if (finalSetup) {
            updated.externalMarksMax = finalSetup.externalMarksMax?.toString() || "";
            updated.passMarksExternal = finalSetup.passMarksExternal?.toString() || "";
            // Calculate totalMarksFinal from internal max marks + external max marks if not present
            const extMarks = parseFloat(finalSetup.externalMarksMax || 0);
            const intMaxMarks = parseFloat(updated.maxMarks || 0);
            const calcTotal = extMarks + intMaxMarks;
            updated.totalMarksFinal = finalSetup.totalMarksFinal?.toString() || (calcTotal > 0 ? calcTotal.toString() : "");
            // Calculate passMarksFinal from internal pass marks + external pass marks
            const intPassMarks = parseFloat(updated.passMarks || 0);
            const extPassMarks = parseFloat(updated.passMarksExternal || 0);
            const calcPassTotal = intPassMarks + extPassMarks;
            updated.passMarksFinal = finalSetup.passMarksFinal?.toString() || (calcPassTotal > 0 ? calcPassTotal.toString() : "");
            updated.maxMarks = finalSetup.maxMarks?.toString() || "";
            updated.examDate = finalSetup.examDate ? new Date(finalSetup.examDate).toISOString().split('T')[0] : "";
            updated.duration = finalSetup.duration || "3 hours";
            updated.examinationType = finalSetup.examinationType || "Regular";
          }
          
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to load existing exam setups", err);
      setExistingExamSetups([]);
      setSelectedExamCategories([]);
    } finally {
      setLoadingExistingSetups(false);
    }
  }, [formData.courseId, formData.streamId, formData.semesterId, formData.subjectId]);

  useEffect(() => {
    fetchExistingExamSetups();
  }, [fetchExistingExamSetups]);

  // Marks Entry Filters - Filter streams based on selected course
  const [marksAvailableStreams, setMarksAvailableStreams] = useState([]);
  const [marksAvailableSemesters, setMarksAvailableSemesters] = useState([]);
  const [marksAvailableSubjects, setMarksAvailableSubjects] = useState([]);

  useEffect(() => {
    if (!marksFilters.courseId || courseStreamMappings.length === 0) {
      setMarksAvailableStreams([]);
      return;
    }

    const courseMappings = courseStreamMappings.filter((mapping) => {
      const mappingCourseId =
        typeof mapping.courseId === "object" && mapping.courseId?._id
          ? mapping.courseId._id
          : mapping.courseId;
      return (
        mappingCourseId === marksFilters.courseId &&
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
    setMarksAvailableStreams(filteredStreams);
  }, [marksFilters.courseId, courseStreamMappings, streamsData]);

  // Filter semesters based on selected course and stream for marks entry
  useEffect(() => {
    if (
      !marksFilters.courseId ||
      !marksFilters.streamId ||
      courseStreamMappings.length === 0
    ) {
      setMarksAvailableSemesters([]);
      setMarksAvailableSubjects([]);
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
        mappingCourseId === marksFilters.courseId &&
        mappingStreamId === marksFilters.streamId &&
        (mapping.status === "Active" || mapping.status === undefined)
      );
    });

    const semesterMap = new Map();
    allMappings.forEach((mapping) => {
      const semesterId =
        typeof mapping.semesterId === "object" && mapping.semesterId?._id
          ? mapping.semesterId._id
          : mapping.semesterId;
      if (semesterId && !semesterMap.has(semesterId)) {
        const semesterObj =
          typeof mapping.semesterId === "object"
            ? mapping.semesterId
            : { _id: semesterId };
        semesterMap.set(semesterId, semesterObj);
      }
    });
    setMarksAvailableSemesters(Array.from(semesterMap.values()));
  }, [marksFilters.courseId, marksFilters.streamId, courseStreamMappings]);

  // Filter subjects based on selected course, stream, and semester for marks entry
  useEffect(() => {
    if (
      !marksFilters.courseId ||
      !marksFilters.streamId ||
      !marksFilters.semesterId ||
      courseStreamMappings.length === 0
    ) {
      setMarksAvailableSubjects([]);
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
      const mappingSemesterId =
        typeof mapping.semesterId === "object" && mapping.semesterId?._id
          ? mapping.semesterId._id
          : mapping.semesterId;
      return (
        mappingCourseId === marksFilters.courseId &&
        mappingStreamId === marksFilters.streamId &&
        mappingSemesterId === marksFilters.semesterId &&
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
    setMarksAvailableSubjects(Array.from(subjectMap.values()));
  }, [
    marksFilters.courseId,
    marksFilters.streamId,
    marksFilters.semesterId,
    courseStreamMappings,
    subjectsData,
  ]);

  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response?.data && Array.isArray(response.data)) return response.data;
    if (response?.data?.data && Array.isArray(response.data.data))
      return response.data.data;
    return [];
  };

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await internalExamSetupsApi.getAll();
      const data = extractData(response);
      setConfigs(data || []);
    } catch (err) {
      console.error("Failed to load exam setups", err);
      setConfigs([]);
      showErrorMessage(err.message || "Failed to load exam setups");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    setMetaLoading(true);
    setMetaError(null);
    try {
      const [coursesRes, examCategoriesRes] = await Promise.all([
        coursesApi.getAll?.() ?? coursesApi.getAll(),
        examCategoriesApi.getAll?.() ?? examCategoriesApi.getAll(),
      ]);
      setCourses(coursesRes?.data || coursesRes || []);
      setExamCategories(examCategoriesRes?.data || examCategoriesRes || []);
    } catch (err) {
      setMetaError(err.message || "Failed to load courses / exam categories");
    } finally {
      setMetaLoading(false);
    }
  };

  const normalizeId = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val._id || val.id || "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Check which exam types are selected
      const hasMids = selectedExamCategories.some((cat) => deriveExamMode(cat) === "Mids");
      const hasLabs = selectedExamCategories.some((cat) => deriveExamMode(cat) === "Labs");
      const hasFinal = selectedExamCategories.some((cat) => deriveExamMode(cat) === "Final");

      // Reset dependent fields when course/stream/semesterNumber changes
      if (name === "courseId") {
        updated.streamId = "";
        updated.semesterId = "";
        updated.semesterNumber = "";
        updated.subjectId = "";
        updated.examType = "";
      } else if (name === "streamId") {
        updated.semesterId = "";
        updated.semesterNumber = "";
        updated.subjectId = "";
        updated.examType = "";
      } else if (name === "semesterNumber") {
        // semesterId will be auto-filled in the onChange handler
        updated.subjectId = "";
        updated.examType = "";
      } else if (name === "subjectId") {
        updated.examType = "";
      }

      // Reset marks fields when exam type changes
      if (name === "examType") {
        const mode = deriveExamMode(value);
        if (mode === "Mids") {
          // Reset lab fields, set default mids values
          updated.recordMax = "";
          updated.performanceMax = "";
          updated.internalTestMax = "";
          updated.vivaMax = "";
          updated.test1Max = "15";
          updated.test2Max = "15";
          updated.assignmentMax = "5";
          updated.attendanceMax = "5";
          // Configuration Total: 15 + 15 + 5 + 5 = 40
          updated.totalInternalMarks = "40";
          updated.maxMarks = "40";
          // Max Achievable: max(15,15) + 5 + 5 = 25, so pass marks = 40% of 25 = 10
          updated.passMarks = "10"; // Default 40% of max achievable (25)
        } else if (mode === "Labs") {
          // Reset mids fields, set default lab values
          updated.test1Max = "";
          updated.test2Max = "";
          updated.assignmentMax = "";
          updated.attendanceMax = "";
          updated.recordMax = "10";
          updated.performanceMax = "10";
          updated.internalTestMax = "15";
          updated.vivaMax = "15";
          updated.totalInternalMarks = "50";
          updated.maxMarks = "50";
          updated.passMarks = "20"; // Default 40% of 50
        } else if (mode === "Final") {
          // Reset mids and labs fields, set default final exam values
          updated.test1Max = "";
          updated.test2Max = "";
          updated.assignmentMax = "";
          updated.attendanceMax = "";
          updated.recordMax = "";
          updated.performanceMax = "";
          updated.internalTestMax = "";
          updated.vivaMax = "";
          updated.externalMarksMax = "70";
          updated.totalInternalMarks = "30"; // Internal marks (typically 30 for final exams)
          updated.maxMarks = "100"; // Total marks (Internal 30 + External 70)
          updated.passMarks = "40"; // Default 40% of 100
        }
      }

      // Auto-update maxMarks when totalInternalMarks changes
      if (name === "totalInternalMarks") {
        updated.maxMarks = value;
        // Auto-calculate pass marks as 40% if not set
        if (!updated.passMarks && value) {
          updated.passMarks = Math.round(parseFloat(value) * 0.4).toString();
        }
      }

      // Auto-calculate total for Mids - Updates dynamically when any field changes
      // Configuration Total = Test-1 Max + Test-2 Max + Assignment Max + Attendance Max
      // Example: 15 + 15 + 5 + 5 = 40
      if (
        hasMids &&
        (name === "test1Max" ||
          name === "test2Max" ||
          name === "assignmentMax" ||
          name === "attendanceMax")
      ) {
        // Get current values (use new value if this is the field being changed, otherwise use previous value)
        const test1 = parseFloat(
          name === "test1Max" ? value || 0 : prev.test1Max || 0
        );
        const test2 = parseFloat(
          name === "test2Max" ? value || 0 : prev.test2Max || 0
        );
        const assign = parseFloat(
          name === "assignmentMax" ? value || 0 : prev.assignmentMax || 0
        );
        const attend = parseFloat(
          name === "attendanceMax" ? value || 0 : prev.attendanceMax || 0
        );

        // Calculate configuration total (sum of all max marks)
        const configTotal = test1 + test2 + assign + attend;
        updated.totalInternalMarks = configTotal.toString();

        // Calculate max achievable (best of two tests + assignment + attendance)
        // This is different from totalInternalMarks because only the best test counts
          const bestTest = Math.max(test1, test2);
          const maxAchievable = bestTest + assign + attend;
        updated.maxMarks = maxAchievable.toString();

        // Auto-update pass marks (40% of max achievable)
          updated.passMarks = Math.round(maxAchievable * 0.4).toString();
        // Also update passMarksFinal (internal pass marks + external pass marks)
        const externalPassMarks = parseFloat(prev.passMarksExternal || 0);
        updated.passMarksFinal = (Math.round(maxAchievable * 0.4) + externalPassMarks).toString();
        // Also update totalMarksFinal (internal max marks + external max marks)
        const externalMarks = parseFloat(prev.externalMarksMax || 0);
        if (externalMarks > 0) {
          updated.totalMarksFinal = (maxAchievable + externalMarks).toString();
        }
      }

      // Auto-calculate total for Labs
      if (
        hasLabs &&
        (name === "recordMax" ||
          name === "performanceMax" ||
          name === "internalTestMax" ||
          name === "vivaMax")
      ) {
        const record = parseFloat(name === "recordMax" ? value || 0 : prev.recordMax || 0);
        const performance = parseFloat(name === "performanceMax" ? value || 0 : prev.performanceMax || 0);
        const internalTest = parseFloat(name === "internalTestMax" ? value || 0 : prev.internalTestMax || 0);
        const viva = parseFloat(name === "vivaMax" ? value || 0 : prev.vivaMax || 0);

        const total = record + performance + internalTest + viva;
        updated.totalInternalMarks = total.toString();
        // Auto-update maxMarks to match totalInternalMarks for Labs
        updated.maxMarks = total.toString();
        // Auto-update pass marks (40% of total)
        updated.passMarks = Math.round(total * 0.4).toString();
        // Also update passMarksFinal (internal pass marks + external pass marks)
        const externalPassMarks = parseFloat(prev.passMarksExternal || 0);
        updated.passMarksFinal = (Math.round(total * 0.4) + externalPassMarks).toString();
        // Also update totalMarksFinal (internal max marks + external max marks)
        const externalMarks = parseFloat(prev.externalMarksMax || 0);
        if (externalMarks > 0) {
          updated.totalMarksFinal = (total + externalMarks).toString();
        }
      }
      
      // Auto-calculate External Pass Marks when external marks change
      if (name === "externalMarksMax") {
        const externalMarks = parseFloat(value || 0);
        if (externalMarks > 0) {
          // Auto-update passMarksExternal (40% of external max)
          updated.passMarksExternal = Math.round(externalMarks * 0.4).toString();
          // Also recalculate passMarksFinal (internal pass marks + external pass marks)
          if (hasMids || hasLabs) {
            const internalPassMarks = parseFloat(prev.passMarks || 0);
            const externalPassMarks = Math.round(externalMarks * 0.4);
            updated.passMarksFinal = (internalPassMarks + externalPassMarks).toString();
            // Also recalculate totalMarksFinal (internal max marks + external max marks)
            const internalMaxMarks = parseFloat(prev.maxMarks || 0);
            if (internalMaxMarks > 0) {
              updated.totalMarksFinal = (internalMaxMarks + externalMarks).toString();
            }
          }
        }
      }
      
      // Auto-calculate Final exam Total Marks Final when external marks or internal max marks change
      if (
        (hasMids || hasLabs) &&
        (name === "externalMarksMax" || name === "maxMarks")
      ) {
        const externalMarks = parseFloat(name === "externalMarksMax" ? value || 0 : prev.externalMarksMax || 0);
        const internalMaxMarks = parseFloat(name === "maxMarks" ? value || 0 : prev.maxMarks || 0);
        const totalMarks = externalMarks + internalMaxMarks;
        
        if (totalMarks > 0) {
          // Auto-update totalMarksFinal (Internal Max Marks + External Max Marks)
          updated.totalMarksFinal = totalMarks.toString();
        }
      }

      // Auto-calculate Pass Marks Final as sum of internal pass marks + external pass marks
      if (
        (hasMids || hasLabs) &&
        (name === "passMarks" || name === "passMarksExternal")
      ) {
        const internalPassMarks = parseFloat(name === "passMarks" ? value || 0 : prev.passMarks || 0);
        const externalPassMarks = parseFloat(name === "passMarksExternal" ? value || 0 : prev.passMarksExternal || 0);
        const totalPassMarks = internalPassMarks + externalPassMarks;
        
        if (totalPassMarks > 0) {
          updated.passMarksFinal = totalPassMarks.toString();
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.courseId) {
      showErrorMessage("Please select a Course");
      return;
    }
    if (!formData.streamId) {
      showErrorMessage("Please select a Stream");
      return;
    }
    if (!formData.semesterNumber) {
      showErrorMessage("Please select a Semester Number");
      return;
    }
    if (!formData.semesterId) {
      showErrorMessage(
        "Semester ID is missing. Please select Semester Number again."
      );
      return;
    }
    if (!formData.subjectId) {
      showErrorMessage("Please select a Subject");
      return;
    }
    // Validation based on selected exam types
    // For now, validate based on the primary selected type
    if (selectedExamCategories.length === 0) {
      showErrorMessage("Please select at least one exam type");
      return;
    }

    // Validate each selected exam type
    const hasMids = selectedExamCategories.some((cat) => deriveExamMode(cat) === "Mids");
    const hasLabs = selectedExamCategories.some((cat) => deriveExamMode(cat) === "Labs");
    const hasFinal = selectedExamCategories.some((cat) => deriveExamMode(cat) === "Final");

    // Validate Mids if selected
    if (hasMids) {
      const midsTotal =
        parseFloat(formData.test1Max || 0) +
        parseFloat(formData.test2Max || 0) +
        parseFloat(formData.assignmentMax || 0) +
        parseFloat(formData.attendanceMax || 0);

      if (midsTotal <= 0) {
        showErrorMessage("Please enter valid marks for all Mids components");
        return;
      }

      // Auto-update totalInternalMarks for Mids if needed
      if (Math.abs(midsTotal - parseFloat(formData.totalInternalMarks || 0)) > 0.01) {
        formData.totalInternalMarks = midsTotal.toString();
      }
    }

    // Validate Labs if selected
    if (hasLabs) {
      const labsTotal =
        parseFloat(formData.recordMax || 0) +
        parseFloat(formData.performanceMax || 0) +
        parseFloat(formData.internalTestMax || 0) +
        parseFloat(formData.vivaMax || 0);

      if (labsTotal <= 0) {
        showErrorMessage("Please enter valid marks for all Labs components");
        return;
      }

      // Auto-update totalInternalMarks for Labs if needed
      if (Math.abs(labsTotal - parseFloat(formData.totalInternalMarks || 0)) > 0.01) {
        formData.totalInternalMarks = labsTotal.toString();
      }
    }

    // Validate Final if selected
    if (hasFinal) {
      if (
        !formData.externalMarksMax ||
        parseFloat(formData.externalMarksMax) <= 0
      ) {
        showErrorMessage(
          "Please enter External Marks Max for Final Examination"
        );
        return;
      }
      if (
        !formData.maxMarks ||
        parseFloat(formData.maxMarks) <= 0
      ) {
        showErrorMessage("Please enter Maximum Marks (Internal) for Final Examination");
        return;
      }

      // Auto-update totalMarksFinal if needed
      const internalMaxMarks = parseFloat(formData.maxMarks || 0);
      const externalMarks = parseFloat(formData.externalMarksMax || 0);
      const expectedTotal = internalMaxMarks + externalMarks;
      const actualTotalMarksFinal = parseFloat(formData.totalMarksFinal || 0);

      if (Math.abs(actualTotalMarksFinal - expectedTotal) > 0.01) {
        formData.totalMarksFinal = expectedTotal.toString();
      }
    }

    // Validate pass marks is less than max marks
    if (
      parseFloat(formData.passMarks || 0) > parseFloat(formData.maxMarks || 0)
    ) {
      showErrorMessage("Pass Marks cannot be greater than Maximum Marks");
      return;
    }

    if (!formData.maxMarks || parseFloat(formData.maxMarks) <= 0) {
      showErrorMessage("Please enter Maximum Marks");
      return;
    }

    if (!formData.passMarks || parseFloat(formData.passMarks) < 0) {
      showErrorMessage("Please enter Pass Marks");
      return;
    }

    // Check for duplicate combination
    // Normalize IDs for comparison
    const normalizeIdForComparison = (id) => {
      if (!id) return null;
      if (typeof id === "object" && id._id) return id._id.toString();
      return id.toString();
    };

    // Handle multiple exam categories - create/update a record for each selected exam type
    const newCourseId = normalizeIdForComparison(formData.courseId);
    const newStreamId = normalizeIdForComparison(formData.streamId);
    const newSemesterId = normalizeIdForComparison(formData.semesterId);
    const newSemesterNumber = Number(formData.semesterNumber);
    const newSubjectId = normalizeIdForComparison(formData.subjectId);
    
    const itemId = editingItem?._id || editingItem?.id;
    const currentItemId = itemId ? normalizeIdForComparison(itemId) : null;
    const isEditing = !!itemId;

    // If editing, only update the current exam type
    // If creating, create a record for each selected exam category
    const examCategoriesToProcess = isEditing 
      ? [editingItem.examType || selectedExamCategories[0] || formData.examType || ""]
      : selectedExamCategories;

    // Validate no duplicates before processing
    for (const examTypeValue of examCategoriesToProcess) {
      if (!examTypeValue) continue;
      
      const newExamType = examTypeValue?.trim();
      
      // Check if combination already exists (excluding the current item if updating)
      const duplicateExists = configs.some((config) => {
        const configId = normalizeIdForComparison(config._id || config.id);
        // Skip the current item if we're updating
        if (currentItemId && configId === currentItemId) {
          return false;
        }

        const existingCourseId = normalizeIdForComparison(config.courseId);
        const existingStreamId = normalizeIdForComparison(config.streamId);
        const existingSemesterId = normalizeIdForComparison(config.semesterId);
        const existingSemesterNumber = Number(config.semesterNumber);
        const existingSubjectId = normalizeIdForComparison(config.subjectId);
        const existingExamType = config.examType?.trim();

        return (
          existingCourseId === newCourseId &&
          existingStreamId === newStreamId &&
          existingSemesterId === newSemesterId &&
          existingSemesterNumber === newSemesterNumber &&
          existingSubjectId === newSubjectId &&
          existingExamType === newExamType
        );
      });

      if (duplicateExists) {
        showErrorMessage(
          `A configuration with this combination (Course, Stream, Semester, Subject, and Exam Type: ${newExamType}) already exists. Please select a different combination or edit the existing one.`
        );
        return;
      }
    }

    try {
      setLoading(true);
      const results = [];
      
      // Process each selected exam category
      for (const examTypeValue of examCategoriesToProcess) {
        if (!examTypeValue) continue;
        
        // Find existing setup for this exam type if editing
        let existingSetupForThisType = null;
        if (isEditing) {
          existingSetupForThisType = existingExamSetups.find(
            (s) => s.examType === examTypeValue
          );
        }
        
        const setupItemId = existingSetupForThisType?._id || existingSetupForThisType?.id || (isEditing && examTypeValue === editingItem.examType ? itemId : null);

        // Recalculate totalInternalMarks based on exam type to ensure consistency
        let calculatedTotalInternalMarks = Number(formData.totalInternalMarks || 0);
        const examMode = deriveExamMode(examTypeValue);
        
        if (examMode === "Mids") {
          // For Mids: totalInternalMarks = test1Max + test2Max + assignmentMax + attendanceMax
          calculatedTotalInternalMarks = 
            Number(formData.test1Max || 0) +
            Number(formData.test2Max || 0) +
            Number(formData.assignmentMax || 0) +
            Number(formData.attendanceMax || 0);
        } else if (examMode === "Labs") {
          // For Labs: totalInternalMarks = recordMax + performanceMax + internalTestMax + vivaMax
          calculatedTotalInternalMarks = 
            Number(formData.recordMax || 0) +
            Number(formData.performanceMax || 0) +
            Number(formData.internalTestMax || 0) +
            Number(formData.vivaMax || 0);
        }
        
        // Prepare payload for this exam type
        const payload = {
          ...formData,
          examType: examTypeValue, // Use the specific exam type for this record
          semesterNumber: Number(formData.semesterNumber),
          maxMarks: Number(formData.maxMarks),
          passMarks: Number(formData.passMarks),
          totalInternalMarks: calculatedTotalInternalMarks, // Use calculated value
          test1Max: Number(formData.test1Max || 0),
          test2Max: Number(formData.test2Max || 0),
          assignmentMax: Number(formData.assignmentMax || 0),
          attendanceMax: Number(formData.attendanceMax || 0),
          recordMax: Number(formData.recordMax || 0),
          performanceMax: Number(formData.performanceMax || 0),
          internalTestMax: Number(formData.internalTestMax || 0),
          vivaMax: Number(formData.vivaMax || 0),
          // Final Examination fields
          externalMarksMax: formData.externalMarksMax
            ? Number(formData.externalMarksMax)
            : undefined,
          passMarksExternal: formData.passMarksExternal
            ? Number(formData.passMarksExternal)
            : undefined,
          totalMarksFinal: formData.totalMarksFinal
            ? Number(formData.totalMarksFinal)
            : undefined,
          passMarksFinal: formData.passMarksFinal
            ? Number(formData.passMarksFinal)
            : undefined,
        };

        let response;
        if (setupItemId) {
          // Update existing setup for this exam type
          response = await internalExamSetupsApi.update(setupItemId, payload);
          results.push({ examType: examTypeValue, action: "updated" });
        } else {
          // Create new setup for this exam type
          response = await internalExamSetupsApi.create(payload);
          results.push({ examType: examTypeValue, action: "created" });
        }
      }

      // Show success message
      if (results.length === 1) {
        showSuccessMessage(
          `Configuration ${results[0].action === "updated" ? "updated" : "created"} successfully for ${results[0].examType}`
        );
      } else {
        const created = results.filter(r => r.action === "created").length;
        const updated = results.filter(r => r.action === "updated").length;
        let message = "Configurations processed: ";
        if (created > 0) message += `${created} created`;
        if (created > 0 && updated > 0) message += ", ";
        if (updated > 0) message += `${updated} updated`;
        showSuccessMessage(message);
      }

      // Refresh the list
      await fetchConfigs();
      handleResetForm();
      setShowForm(false);
    } catch (err) {
      // Check if it's a duplicate error from backend
      if (
        err.message &&
        (err.message.includes("Duplicate") ||
          err.message.includes("already exists") ||
          err.message.includes("E11000"))
      ) {
        showErrorMessage(
          "A configuration with this combination (Course, Stream, Semester, Subject, and Exam Type) already exists. Please select a different combination or edit the existing one."
        );
      } else {
        showErrorMessage(err.message || "Failed to save configuration");
      }
      console.error("Exam setup save failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);

    const courseId = normalizeId(item.courseId);
    const streamId = normalizeId(item.streamId);
    const semesterId = normalizeId(item.semesterId);

    // Get semesterNumber from item or CourseStreamMapping
    let semesterNumber = item.semesterNumber || "";

    // If semesterNumber not in item, try to find it from courseStreamMappings
    if (!semesterNumber && courseId && streamId && semesterId) {
      // Find mapping that matches course+stream+semesterId
      const mapping = courseStreamMappings.find((m) => {
        const mCourseId =
          typeof m.courseId === "object" && m.courseId?._id
            ? m.courseId._id
            : m.courseId;
        const mStreamId =
          typeof m.streamId === "object" && m.streamId?._id
            ? m.streamId._id
            : m.streamId;
        const mSemesterId =
          typeof m.semesterId === "object" && m.semesterId?._id
            ? m.semesterId._id
            : m.semesterId;
        return (
          mCourseId === courseId &&
          mStreamId === streamId &&
          mSemesterId === semesterId
        );
      });

      if (mapping && mapping.semesterNumber) {
        semesterNumber = mapping.semesterNumber.toString();
      }
    }

    // Map old field names to new structure if needed
    const mappedData = {
      ...item,
      courseId: courseId,
      streamId: streamId,
      semesterId: semesterId,
      semesterNumber: semesterNumber,
      subjectId: normalizeId(item.subjectId),
      // Handle legacy fields
      test1Max:
        item.test1Max ||
        item.objectiveMax ||
        (item.examType === "Mids" ? "15" : ""),
      test2Max:
        item.test2Max ||
        item.descriptiveMax ||
        (item.examType === "Mids" ? "15" : ""),
      assignmentMax: item.assignmentMax || "",
      attendanceMax: item.attendanceMax || "",
      recordMax: item.recordMax || "",
      performanceMax: item.performanceMax || "",
      internalTestMax: item.internalTestMax || "",
      vivaMax: item.vivaMax || "",
      // Final Examination fields
      externalMarksMax:
        item.externalMarksMax || item.finalExamination?.externalMarksMax || "",
      passMarksExternal: item.passMarksExternal || "",
      totalMarksFinal: item.totalMarksFinal || "",
      passMarksFinal: item.passMarksFinal || "",
      // Calculate numberOfTests, bestOfTests, testMarksMax from test1Max and test2Max for Mids
      numberOfTests: item.numberOfTests || (item.test1Max && item.test2Max ? "2" : ""),
      bestOfTests: item.bestOfTests || (item.test1Max && item.test2Max ? "1" : ""),
      testMarksMax: item.testMarksMax || item.test1Max || item.test2Max || "",
      // Other fields
      examDate: item.examDate || "",
      duration: item.duration || "3 hours",
      examinationType: item.examinationType || "Regular",
      status: item.status || "Active",
    };

    // Set selected exam categories based on examType
    const examTypeValue = item.examType || "";
    if (examTypeValue) {
      const matchingCategory = examCategories.find(
        (cat) => (cat.name || cat.title || cat.code || "") === examTypeValue
      );
      if (matchingCategory) {
        setSelectedExamCategories([examTypeValue]);
      }
    }

    setFormData(mappedData);
    setShowForm(true);
  };

  const handleView = async (item) => {
    setViewingItem(item);
    
    // Fetch all exam setups for the same course/stream/semester/subject
    try {
      const courseId = typeof item.courseId === "object" && item.courseId?._id ? item.courseId._id : item.courseId;
      const streamId = typeof item.streamId === "object" && item.streamId?._id ? item.streamId._id : item.streamId;
      const semesterId = typeof item.semesterId === "object" && item.semesterId?._id ? item.semesterId._id : item.semesterId;
      const subjectId = typeof item.subjectId === "object" && item.subjectId?._id ? item.subjectId._id : item.subjectId;
      
      if (courseId && streamId && semesterId && subjectId) {
        const response = await internalExamSetupsApi.getAll({
          courseId: courseId,
          streamId: streamId,
          semesterId: semesterId,
          subjectId: subjectId,
        });
        const allSetups = extractData(response);
        // Store all related setups in viewingItem for display
        setViewingItem({ ...item, allRelatedSetups: allSetups || [] });
      }
    } catch (err) {
      console.error("Failed to fetch related exam setups", err);
      // Still show the item even if fetch fails
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this configuration?")
    ) {
      return;
    }
    try {
      setLoading(true);
      // Use _id if available, otherwise use id
      const itemId = id._id || id.id || id;
      await internalExamSetupsApi.delete(itemId);
      showSuccessMessage("Configuration deleted successfully");
      // Refresh the list
      await fetchConfigs();
    } catch (err) {
      showErrorMessage(err.message || "Failed to delete configuration");
      console.error("Exam setup delete failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      courseId: "",
      streamId: "",
      semesterId: "",
      semesterNumber: "",
      subjectId: "",
      examType: "",
      maxMarks: "",
      passMarks: "",
      totalInternalMarks: "",
      test1Max: "",
      test2Max: "",
      assignmentMax: "",
      attendanceMax: "",
      recordMax: "",
      performanceMax: "",
      internalTestMax: "",
      vivaMax: "",
      // Final Examination fields
      externalMarksMax: "",
      passMarksExternal: "",
      totalMarksFinal: "",
      passMarksFinal: "",
      // Mids test configuration fields
      numberOfTests: "",
      bestOfTests: "",
      testMarksMax: "",
      examDate: "",
      duration: "3 hours",
      examinationType: "Regular",
      status: "Active",
    });
    setEditingItem(null);
    setSelectedExamCategories([]);
  };

  // Handle Exam Setup selection
  const handleInternalExamSetupChange = (setupId) => {
    setSelectedInternalExamSetupId(setupId);

    if (!setupId) {
      // Reset everything if no setup selected
      setMarksFilters({
        courseId: "",
        streamId: "",
        semesterId: "",
        subjectId: "",
        examType: "",
      });
      setSelectedConfig(null);
      setStudents([]);
      setMarksData({});
      return;
    }

    // Find the selected setup
    const setup = configs.find((c) => {
      const setupIdValue = c._id || c.id;
      return setupIdValue === setupId;
    });

    if (!setup) {
      showErrorMessage("Selected setup not found");
      return;
    }

    // Extract IDs from the setup
    const courseId =
      typeof setup.courseId === "object" && setup.courseId?._id
        ? setup.courseId._id
        : setup.courseId;
    const streamId =
      typeof setup.streamId === "object" && setup.streamId?._id
        ? setup.streamId._id
        : setup.streamId;
    const semesterId =
      typeof setup.semesterId === "object" && setup.semesterId?._id
        ? setup.semesterId._id
        : setup.semesterId;
    const subjectId =
      typeof setup.subjectId === "object" && setup.subjectId?._id
        ? setup.subjectId._id
        : setup.subjectId;
    const examType = setup.examType;

    // Auto-fill the filters
    setMarksFilters({
      courseId,
      streamId,
      semesterId,
      subjectId,
      examType,
    });

    // Set the selected config
    setSelectedConfig(setup);

    // Reset students and marks - they will be loaded when user clicks "Load Students"
    setStudents([]);
    setMarksData({});
  };

  // Student Marks Entry Functions
  const loadStudentsForMarks = async () => {
    if (!selectedConfig) {
      showErrorMessage("Please select an Exam Setup first");
      return;
    }

    if (
      !marksFilters.courseId ||
      !marksFilters.streamId ||
      !marksFilters.semesterId
    ) {
      showErrorMessage(
        "Invalid setup configuration. Please select a valid Exam Setup."
      );
      return;
    }

    try {
      setLoadingStudents(true);

      // Fetch students using the internal marks API - filtered by Course, Stream, and Semester
      const response = await internalExamSetupsApi.getStudents({
        courseId: marksFilters.courseId,
        streamId: marksFilters.streamId,
        semesterId: marksFilters.semesterId,
        status: "Admitted",
      });

      // Extract students from response
      const studentsData =
        response?.students || response?.data?.students || extractData(response);

      // Verify students match the selected criteria
      const filteredStudents = studentsData.filter((student) => {
        const studentCourseId =
          typeof student.course === "object" && student.course?._id
            ? student.course._id.toString()
            : student.course?.toString() || "";
        const studentStreamId =
          typeof student.stream === "object" && student.stream?._id
            ? student.stream._id.toString()
            : student.stream?.toString() || "";
        const studentSemesterId =
          typeof student.semester === "object" && student.semester?._id
            ? student.semester._id.toString()
            : student.semester?.toString() || "";

        return (
          studentCourseId === marksFilters.courseId.toString() &&
          studentStreamId === marksFilters.streamId.toString() &&
          studentSemesterId === marksFilters.semesterId.toString()
        );
      });

      setStudents(filteredStudents);

      if (filteredStudents.length === 0) {
        showErrorMessage(
          `No students found for Course, Stream, and Semester combination. Please check if students are admitted for this combination.`
        );
      } else {
        showSuccessMessage(
          `Loaded ${filteredStudents.length} student(s) matching the selected Course, Stream, and Semester.`
        );
      }

      // Load existing marks from backend API
      const configId = selectedConfig._id || selectedConfig.id;
      try {
        const marksResponse = await internalMarksApi.getAll({
          internalExamSetupId: configId,
          courseId: marksFilters.courseId,
          streamId: marksFilters.streamId,
          semesterId: marksFilters.semesterId,
          subjectId: marksFilters.subjectId,
        });
        
        // Handle different response formats
        let savedMarksList = [];
        if (marksResponse?.marks && Array.isArray(marksResponse.marks)) {
          savedMarksList = marksResponse.marks;
        } else if (marksResponse?.data?.marks && Array.isArray(marksResponse.data.marks)) {
          savedMarksList = marksResponse.data.marks;
        } else {
          savedMarksList = extractData(marksResponse);
        }
        
        console.log("Loaded marks from API:", savedMarksList);
        
        // Convert marks list to marksData object format
        const loadedMarks = {};
        if (savedMarksList && savedMarksList.length > 0) {
          savedMarksList.forEach((mark) => {
            const studentId = typeof mark.studentId === "object" && mark.studentId?._id 
              ? mark.studentId._id.toString()
              : (mark.studentId?.toString() || mark.studentId);
            
            if (studentId) {
              // Helper function to convert value to string, handling 0 correctly
              const toValue = (val) => {
                if (val === undefined || val === null) return "";
                return val.toString();
              };
              
              loadedMarks[studentId] = {
                absent: mark.isAbsent === true,
                test1: toValue(mark.test1),
                test2: toValue(mark.test2),
                assignment: toValue(mark.assignment),
                attendance: toValue(mark.attendance),
                record: toValue(mark.record),
                performance: toValue(mark.performance),
                internalTest: toValue(mark.internalTest),
                viva: toValue(mark.viva),
                remarks: mark.remarks || "",
              };
            }
          });
        }
        
        console.log("Processed loaded marks:", loadedMarks);
        
        // Initialize marks for all students, merging with loaded marks
        const initialMarks = {};
        filteredStudents.forEach((student) => {
          const studentId = (student._id || student.id).toString();
          const studentMarks = loadedMarks[studentId];
          
          initialMarks[studentId] = {
            absent: studentMarks?.absent === true,
            test1: studentMarks?.test1 || "",
            test2: studentMarks?.test2 || "",
            assignment: studentMarks?.assignment || "",
            attendance: studentMarks?.attendance || "",
            record: studentMarks?.record || "",
            performance: studentMarks?.performance || "",
            internalTest: studentMarks?.internalTest || "",
            viva: studentMarks?.viva || "",
            remarks: studentMarks?.remarks || "",
          };
        });
        
        console.log("Final marks data to set:", initialMarks);
        setMarksData(initialMarks);
      } catch (marksErr) {
        console.error("Failed to load existing marks from API", marksErr);
        // Fallback to localStorage if API fails
        const savedMarks = localStorage.getItem(`internal_marks_${configId}`);
        if (savedMarks) {
          setMarksData(JSON.parse(savedMarks));
        } else {
          // Initialize empty marks data for all students
          const initialMarks = {};
          filteredStudents.forEach((student) => {
            initialMarks[student._id || student.id] = {
              absent: false,
              test1: "",
              test2: "",
              assignment: "",
              attendance: "",
              record: "",
              performance: "",
              internalTest: "",
              viva: "",
            };
          });
          setMarksData(initialMarks);
        }
      }
    } catch (err) {
      console.error("Failed to load students", err);
      showErrorMessage(err.message || "Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

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

  const calculateStudentTotal = (studentId) => {
    if (!selectedConfig) return 0;
    const data = marksData[studentId] || {};
    if (data.absent) return 0;

    const mode = deriveExamMode(selectedConfig.examType);
    if (mode === "Mids") {
      // Mids Calculation: Best of Test-1 and Test-2 + Assignment + Attendance
      // Formula: max(Test-1, Test-2) + Assignment + Attendance
      // Example: If Test-1 = 12, Test-2 = 14, Assignment = 4, Attendance = 5
      //          Then Total = max(12, 14) + 4 + 5 = 14 + 4 + 5 = 23
      const test1 = parseFloat(data.test1 || 0);
      const test2 = parseFloat(data.test2 || 0);
      const bestTest = Math.max(test1, test2); // Take the higher score
      const assignment = parseFloat(data.assignment || 0);
      const attendance = parseFloat(data.attendance || 0);
      const total = bestTest + assignment + attendance;
      return total;
    } else if (mode === "Labs") {
      // Labs Calculation: Record + Performance + Internal Test + Viva
      return (
        parseFloat(data.record || 0) +
        parseFloat(data.performance || 0) +
        parseFloat(data.internalTest || 0) +
        parseFloat(data.viva || 0)
      );
    }
    return 0;
  };

  const saveMarks = async () => {
    if (!selectedConfig) {
      showErrorMessage("Please load students first");
      return;
    }

    if (students.length === 0) {
      showErrorMessage("No students to save marks for");
      return;
    }

    try {
      const configId = selectedConfig._id || selectedConfig.id;

      // Prepare marks array for API
      const marksToSave = students.map((student) => {
        const studentId = student._id || student.id;
        const studentMarks = marksData[studentId] || {};
        const courseStreamMappingId =
          student.courseStreamMappingId?._id || student.courseStreamMappingId;
        
        const isAbsent = studentMarks.absent || false;
        
        // Calculate bestTest and totalMarks based on exam type
        const mode = deriveExamMode(selectedConfig.examType);
        let bestTest = 0;
        let totalMarks = 0;
        
        if (!isAbsent) {
          if (mode === "Mids") {
            const test1 = parseFloat(studentMarks.test1 || 0);
            const test2 = parseFloat(studentMarks.test2 || 0);
            bestTest = Math.max(test1, test2);
            const assignment = parseFloat(studentMarks.assignment || 0);
            const attendance = parseFloat(studentMarks.attendance || 0);
            totalMarks = bestTest + assignment + attendance;
          } else if (mode === "Labs") {
            const record = parseFloat(studentMarks.record || 0);
            const performance = parseFloat(studentMarks.performance || 0);
            const internalTest = parseFloat(studentMarks.internalTest || 0);
            const viva = parseFloat(studentMarks.viva || 0);
            totalMarks = record + performance + internalTest + viva;
          }
        }

        return {
          studentId,
          courseStreamMappingId,
          test1: parseFloat(studentMarks.test1 || 0),
          test2: parseFloat(studentMarks.test2 || 0),
          assignment: parseFloat(studentMarks.assignment || 0),
          attendance: parseFloat(studentMarks.attendance || 0),
          record: parseFloat(studentMarks.record || 0),
          performance: parseFloat(studentMarks.performance || 0),
          internalTest: parseFloat(studentMarks.internalTest || 0),
          viva: parseFloat(studentMarks.viva || 0),
          isAbsent: isAbsent,
          remarks: studentMarks.remarks || "",
          bestTest: bestTest,
          totalMarks: totalMarks,
        };
      });

      // Save to API
      const response = await internalMarksApi.save({
        internalExamSetupId: configId,
        marks: marksToSave,
      });

      if (response && response.success) {
        showSuccessMessage(
          `Successfully saved marks for ${
            response.saved || marksToSave.length
          } student(s)`
        );
        // Also save to localStorage as backup
        localStorage.setItem(
          `internal_marks_${configId}`,
          JSON.stringify(marksData)
        );
      } else {
        showErrorMessage(response?.message || "Failed to save marks");
      }
    } catch (err) {
      console.error("Failed to save marks", err);
      showErrorMessage(err.message || "Failed to save marks");
    }
  };

  // Load saved marks for display
  const loadSavedMarks = async () => {
    try {
      setLoadingSavedMarks(true);
      const response = await internalMarksApi.getAll();
      const marks =
        response?.marks || response?.data?.marks || extractData(response);
      setSavedMarks(marks);
    } catch (err) {
      console.error("Failed to load saved marks", err);
      showErrorMessage(err.message || "Failed to load saved marks");
    } finally {
      setLoadingSavedMarks(false);
    }
  };

  // Load saved marks when tab is switched
  useEffect(() => {
    if (activeTab === "internalMarks") {
      loadSavedMarks();
    }
  }, [activeTab]);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Exam Setup
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure exam parameters, marks distribution, and entry
            dates
          </p>
        </div>
        {activeTab === "configuration" && (
          <button
            onClick={() => {
              handleResetForm();
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Configuration
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("configuration")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "configuration"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab("marksEntry")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "marksEntry"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Student Marks Entry
          </button>
          <button
            onClick={() => setActiveTab("internalMarks")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "internalMarks"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Internal Marks
          </button>
        </nav>
      </div>

      {/* Configuration Tab Content */}
      {activeTab === "configuration" && (
        <>
          {/* Configuration List */}
          <div className="overflow-x-auto shadow-md rounded-lg">
            {loading && (
              <div className="flex items-center justify-center py-6 text-sm text-gray-600">
                Loading configurations...
              </div>
            )}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">
                    SN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">
                    Stream
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">
                    Exam Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configs.length > 0 ? (
                  (() => {
                    // Group configs by course/stream/semester/subject
                    const groupedConfigs = new Map();
                    configs.forEach((config) => {
                      const courseId = typeof config.courseId === "object" && config.courseId?._id ? config.courseId._id : config.courseId;
                      const streamId = typeof config.streamId === "object" && config.streamId?._id ? config.streamId._id : config.streamId;
                      const semesterId = typeof config.semesterId === "object" && config.semesterId?._id ? config.semesterId._id : config.semesterId;
                      const subjectId = typeof config.subjectId === "object" && config.subjectId?._id ? config.subjectId._id : config.subjectId;
                      const key = `${courseId}_${streamId}_${semesterId}_${subjectId}`;
                      
                      if (!groupedConfigs.has(key)) {
                        groupedConfigs.set(key, {
                          key,
                          configs: [],
                          courseId,
                          streamId,
                          semesterId,
                          subjectId,
                        });
                      }
                      groupedConfigs.get(key).configs.push(config);
                    });
                    
                    return Array.from(groupedConfigs.values()).map((group, groupIdx) => {
                      const isExpanded = expandedRows.has(group.key);
                      const primaryConfig = group.configs[0];
                      
                      // Get course, stream, subject names
                      const courseId = group.courseId;
                      const course = typeof primaryConfig.courseId === "object" && primaryConfig.courseId?.name
                        ? primaryConfig.courseId
                        : courses.find((c) => (c._id || c.id) === courseId);
                      const courseName = course?.name || course?.courseName || courseId || "-";
                      
                      const streamId = group.streamId;
                      const stream = typeof primaryConfig.streamId === "object" && primaryConfig.streamId?.name
                        ? primaryConfig.streamId
                        : streamsData.find((s) => (s._id || s.id) === streamId);
                      const streamName = stream?.name || streamId || "-";
                      
                      const subjectId = group.subjectId;
                      const subject = typeof primaryConfig.subjectId === "object" && primaryConfig.subjectId?.name
                        ? primaryConfig.subjectId
                        : subjectsData.find((s) => (s._id || s.id) === subjectId);
                      const subjectName = subject?.name || subject?.code || subjectId || "-";
                      
                      return (
                        <React.Fragment key={group.key}>
                          <tr className="hover:bg-gray-50 bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedRows);
                                  if (isExpanded) {
                                    newExpanded.delete(group.key);
                                  } else {
                                    newExpanded.add(group.key);
                                  }
                                  setExpandedRows(newExpanded);
                                }}
                                className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200"
                              >
                                <svg
                                  className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {courseName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {streamName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {subjectName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex flex-wrap gap-1">
                                {group.configs.map((cfg, idx) => {
                                  const examMode = deriveExamMode(cfg.examType);
                                  return (
                                    <span
                                      key={idx}
                                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        examMode === "Mids"
                                          ? "bg-blue-100 text-blue-800"
                                          : examMode === "Labs"
                                          ? "bg-purple-100 text-purple-800"
                                          : examMode === "Final"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {typeof cfg.examType === "object"
                                        ? cfg.examType.name || cfg.examType.title
                                        : cfg.examType}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  primaryConfig.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {primaryConfig.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleView(primaryConfig)}
                                  className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                                  title="View"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleEdit(primaryConfig)}
                                  className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50"
                                  title="Edit"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete all exam configurations for ${courseName} - ${subjectName}?`)) {
                                      group.configs.forEach(cfg => {
                                        handleDelete(cfg._id || cfg.id);
                                      });
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                                  title="Delete"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                <div className="space-y-4">
                                  <div className="text-sm font-semibold text-gray-700 mb-3 text-center">
                                    Exam Configuration Details: <span className="text-emerald-600">{courseName}</span> - <span className="text-blue-600">{streamName}</span> - <span className="text-purple-600">{subjectName}</span>
                                  </div>
                                  <div className="flex justify-center">
                                    <div className="overflow-x-auto w-full max-w-5xl">
                                      <table className="w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Exam Type</th>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Max Marks</th>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Pass Marks</th>
                                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Total Internal</th>
                                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {group.configs.map((cfg, cfgIdx) => {
                                          const examMode = deriveExamMode(cfg.examType);
                                          const examTypeName = typeof cfg.examType === "object"
                                            ? cfg.examType.name || cfg.examType.title
                                            : cfg.examType;
                                          
                                          return (
                                            <tr key={cfgIdx} className="hover:bg-gray-50">
                                              <td className="px-4 py-3 whitespace-nowrap">
                                                <span
                                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    examMode === "Mids"
                                                      ? "bg-blue-100 text-blue-800"
                                                      : examMode === "Labs"
                                                      ? "bg-purple-100 text-purple-800"
                                                      : examMode === "Final"
                                                      ? "bg-green-100 text-green-800"
                                                      : "bg-gray-100 text-gray-800"
                                                  }`}
                                                >
                                                  {examTypeName}
                                                </span>
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                                                {cfg.maxMarks || cfg.totalInternalMarks || 0}
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                                                {cfg.passMarks || 0}
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {cfg.totalInternalMarks || 0}
                                              </td>
                                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                                <button
                                                  onClick={() => handleView(cfg)}
                                                  className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                                                  title="View Details"
                                                >
                                                  <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                  </svg>
                                                </button>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No configurations found. Click "Add Configuration" to
                      create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add/Edit Form Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
              <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
                <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                  <h3 className="text-lg font-semibold text-white">
                    {editingItem
                      ? "Edit Exam Configuration"
                      : "Add Exam Configuration"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      handleResetForm();
                    }}
                    className="text-white/80 hover:text-white"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex-1 overflow-y-auto p-6 space-y-4"
                >
                  {/* Course Selection */}
                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Course*
                    </label>
                    <select
                      name="courseId"
                      value={formData.courseId || ""}
                      onChange={(e) => {
                        // Reset stream and semester when course changes
                        setFormData((prev) => ({
                          ...prev,
                          courseId: e.target.value,
                          streamId: "",
                          semesterId: "",
                          subjectId: "",
                        }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                      required
                    >
                      <option value="">Choose a course</option>
                      {Array.isArray(courses) &&
                        courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.code} - {course.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Stream Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Stream*
                      </label>
                      <select
                        name="streamId"
                        value={formData.streamId || ""}
                        onChange={(e) => {
                          // Reset semester when stream changes
                          setFormData((prev) => ({
                            ...prev,
                            streamId: e.target.value,
                            semesterNumber: "",
                            subjectId: "",
                          }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                        required
                        disabled={!formData.courseId}
                      >
                        <option value="">
                          {formData.courseId
                            ? "Choose stream"
                            : "Select course first"}
                        </option>
                        {availableStreams.map((stream) => (
                          <option key={stream._id} value={stream._id}>
                            {stream.code} - {stream.name}
                          </option>
                        ))}
                      </select>
                      {formData.courseId && availableStreams.length === 0 && (
                        <p className="mt-1 text-xs text-amber-600">
                          No streams mapped for this course. Please map streams
                          in Course-Stream Mapping first.
                        </p>
                      )}
                    </div>

                    {/* Semester Number Selection */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Semester Number*
                      </label>
                      <select
                        name="semesterNumber"
                        value={formData.semesterNumber || ""}
                        onChange={(e) => {
                          const selectedSemesterNumber = e.target.value;
                          // Find the corresponding semesterId from availableSemesterNumbers
                          const selectedItem = availableSemesterNumbers.find(
                            (item) =>
                              item.semesterNumber ===
                              Number(selectedSemesterNumber)
                          );

                          setFormData((prev) => ({
                            ...prev,
                            semesterNumber: selectedSemesterNumber,
                            semesterId: selectedItem?.semesterId || "", // Auto-fill semesterId
                            subjectId: "",
                          }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                        required
                        disabled={!formData.courseId || !formData.streamId}
                      >
                        <option value="">
                          {!formData.courseId || !formData.streamId
                            ? "Select course and stream first"
                            : "Choose semester number"}
                        </option>
                        {availableSemesterNumbers.map((item) => (
                          <option
                            key={item.semesterNumber}
                            value={item.semesterNumber}
                          >
                            Semester {item.semesterNumber}
                          </option>
                        ))}
                      </select>
                      {formData.streamId &&
                        availableSemesterNumbers.length === 0 && (
                          <p className="mt-1 text-xs text-amber-600">
                            No semester numbers found for this course and
                            stream. Please create a Course-Stream Mapping first.
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Subject Selection */}
                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Subject*
                    </label>
                    <select
                      name="subjectId"
                      value={formData.subjectId || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                      required
                      disabled={
                        !formData.courseId ||
                        !formData.streamId ||
                        !formData.semesterNumber
                      }
                    >
                      <option value="">
                        {!formData.courseId ||
                        !formData.streamId ||
                        !formData.semesterNumber
                          ? "Select course, stream, and semester number first"
                          : "Choose subject"}
                      </option>
                      {availableSubjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.code} - {subject.name}
                        </option>
                      ))}
                    </select>
                    {formData.semesterNumber &&
                      availableSubjects.length === 0 && (
                        <p className="mt-1 text-xs text-amber-600">
                          No subjects found for this semester number. Please
                          check Course-Stream Mapping.
                        </p>
                      )}
                  </div>

                  {/* Exam Type Selection (Multiselect Checkboxes from API) */}
                  {formData.courseId &&
                    formData.streamId &&
                    formData.semesterId &&
                    formData.subjectId && (
                      <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block mb-3 text-sm font-medium text-gray-700">
                          Select Exam Types <span className="text-red-500">*</span>
                          {loadingExistingSetups && (
                            <span className="ml-2 text-xs text-gray-500">
                              (Loading existing setups...)
                            </span>
                          )}
                    </label>
                        <div className="flex flex-wrap gap-4">
                          {examCategories.map((category) => {
                            const categoryName = category.name || category.title || category.code || "";
                            const categoryValue = categoryName;
                            const examMode = deriveExamMode(categoryName);
                            const isChecked = selectedExamCategories.includes(categoryName);
                            const hasExistingSetup = existingExamSetups.some(
                              (s) => s.examType === categoryName
                            );
                            
                            return (
                              <label key={category._id || category.id || categoryName} className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                      onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSelectedExamCategories((prev) => {
                                      if (checked) {
                                        return [...prev, categoryName].filter((v, i, a) => a.indexOf(v) === i);
                                      } else {
                                        return prev.filter((t) => t !== categoryName);
                                      }
                                    });
                                    
                                    // Populate fields from existing setup if exists
                                    if (checked) {
                                      const existingSetup = existingExamSetups.find(
                                        (s) => s.examType === categoryName
                                      );
                                      if (existingSetup) {
                        setFormData((prev) => {
                          const updated = { ...prev };
                                          
                                          // Populate based on exam mode
                                          if (examMode === "Mids") {
                                            updated.test1Max = existingSetup.test1Max?.toString() || prev.test1Max || "";
                                            updated.test2Max = existingSetup.test2Max?.toString() || prev.test2Max || "";
                                            updated.assignmentMax = existingSetup.assignmentMax?.toString() || prev.assignmentMax || "";
                                            updated.attendanceMax = existingSetup.attendanceMax?.toString() || prev.attendanceMax || "";
                                            updated.totalInternalMarks = existingSetup.totalInternalMarks?.toString() || prev.totalInternalMarks || "";
                                            updated.maxMarks = existingSetup.maxMarks?.toString() || prev.maxMarks || "";
                                            updated.passMarks = existingSetup.passMarks?.toString() || prev.passMarks || "";
                                          } else if (examMode === "Labs") {
                                            updated.recordMax = existingSetup.recordMax?.toString() || prev.recordMax || "";
                                            updated.performanceMax = existingSetup.performanceMax?.toString() || prev.performanceMax || "";
                                            updated.internalTestMax = existingSetup.internalTestMax?.toString() || prev.internalTestMax || "";
                                            updated.vivaMax = existingSetup.vivaMax?.toString() || prev.vivaMax || "";
                                            updated.totalInternalMarks = existingSetup.totalInternalMarks?.toString() || prev.totalInternalMarks || "";
                                            updated.maxMarks = existingSetup.maxMarks?.toString() || prev.maxMarks || "";
                                            updated.passMarks = existingSetup.passMarks?.toString() || prev.passMarks || "";
                                          } else if (examMode === "Final") {
                                            updated.externalMarksMax = existingSetup.externalMarksMax?.toString() || prev.externalMarksMax || "";
                                            updated.passMarksExternal = existingSetup.passMarksExternal?.toString() || prev.passMarksExternal || "";
                                            // Calculate totalMarksFinal from internal max marks + external max marks if not present
                                            const extMarks = parseFloat(updated.externalMarksMax || 0);
                                            const intMaxMarks = parseFloat(updated.maxMarks || 0);
                                            const calcTotal = extMarks + intMaxMarks;
                                            updated.totalMarksFinal = existingSetup.totalMarksFinal?.toString() || (calcTotal > 0 ? calcTotal.toString() : prev.totalMarksFinal || "");
                                            // Calculate passMarksFinal from internal pass marks + external pass marks
                                            const intPassMarks = parseFloat(updated.passMarks || 0);
                                            const extPassMarks = parseFloat(updated.passMarksExternal || 0);
                                            const calcPassTotal = intPassMarks + extPassMarks;
                                            updated.passMarksFinal = existingSetup.passMarksFinal?.toString() || (calcPassTotal > 0 ? calcPassTotal.toString() : prev.passMarksFinal || "");
                                            updated.totalInternalMarks = existingSetup.totalInternalMarks?.toString() || prev.totalInternalMarks || "";
                                            updated.maxMarks = existingSetup.maxMarks?.toString() || prev.maxMarks || "";
                                            updated.examDate = existingSetup.examDate
                                              ? new Date(existingSetup.examDate).toISOString().split("T")[0]
                                              : prev.examDate || "";
                                            updated.duration = existingSetup.duration || prev.duration || "3 hours";
                                            updated.examinationType = existingSetup.examinationType || prev.examinationType || "Regular";
                          }
                                          
                          return updated;
                        });
                                      }
                                    }
                      }}
                                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  {categoryName} {hasExistingSetup && "(Existing)"}
                                </span>
                              </label>
                        );
                      })}
                  </div>
                        {selectedExamCategories.length === 0 && (
                          <p className="mt-2 text-xs text-amber-600">
                            Please select at least one exam type
                      </p>
                        )}
                    </div>
                    )}

                  {/* Marks Distribution - Mids */}
                  {selectedExamCategories.some((cat) => deriveExamMode(cat) === "Mids") && (
                    <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-800 mb-3">
                        Mids Marks Distribution (Configuration Total:{" "}
                        {formData.totalInternalMarks || "0"} Marks)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block mb-1 text-xs font-medium text-blue-700">
                            Test-1 Max*
                          </label>
                          <input
                            type="number"
                            name="test1Max"
                            value={formData.test1Max}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="15"
                            min="0"
                            max="15"
                            required
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            Max: 15 marks
                          </p>
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-blue-700">
                            Test-2 Max*
                          </label>
                          <input
                            type="number"
                            name="test2Max"
                            value={formData.test2Max}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="15"
                            min="0"
                            max="15"
                            required
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            Max: 15 marks
                          </p>
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-blue-700">
                            Assignment Max*
                          </label>
                          <input
                            type="number"
                            name="assignmentMax"
                            value={formData.assignmentMax}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="5"
                            min="0"
                            required
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            Assignment marks
                          </p>
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-blue-700">
                            Attendance Max*
                          </label>
                          <input
                            type="number"
                            name="attendanceMax"
                            value={formData.attendanceMax}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="5"
                            min="0"
                            required
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            Attendance marks
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block mb-1 text-xs font-medium text-blue-700">
                            Total Internal Marks
                          </label>
                          <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900 font-bold text-lg">
                            {formData.totalInternalMarks || "0"}
                          </div>
                          <p className="text-xs text-blue-600 mt-1">
                            Configuration Total (sum of all max marks)
                          </p>
                          </div>
                        </div>
                        
                        {/* Maximum Marks and Pass Marks inside Mids section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-xs font-medium text-blue-700">
                              Maximum Marks *
                            </label>
                            <input
                              type="number"
                              name="maxMarks"
                              value={formData.maxMarks}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter maximum marks"
                              min="0"
                              required
                            />
                            <p className="text-xs text-blue-600 mt-1">
                              Maximum internal marks that can be obtained (Auto-calculated: best of two tests + assignment + attendance)
                            </p>
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-medium text-blue-700">
                              Pass Marks (Internal Only) *
                            </label>
                            <input
                              type="number"
                              name="passMarks"
                              value={formData.passMarks}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter pass marks"
                              min="0"
                              required
                            />
                            <p className="text-xs text-blue-600 mt-1">
                              Minimum internal marks required to pass (typically 40% of max internal marks)
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Final Exam Marks - Shown with Mids because internal and external go together */}
                      <div className="mt-4 pt-4 border-t-2 border-blue-300">
                        <h5 className="text-xs font-semibold text-blue-800 mb-3">
                          Final Examination Marks (External)
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block mb-1 text-xs font-medium text-blue-700">
                              External Marks Max*
                            </label>
                            <input
                              type="number"
                              name="externalMarksMax"
                              value={formData.externalMarksMax || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="70"
                              min="0"
                              required
                            />
                            <p className="text-xs text-blue-600 mt-1">
                              Maximum external examination marks
                            </p>
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-medium text-blue-700">
                              External Pass Marks*
                            </label>
                            <input
                              type="number"
                              name="passMarksExternal"
                              value={formData.passMarksExternal || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="28"
                              min="0"
                              required
                            />
                            <p className="text-xs text-blue-600 mt-1">
                              Pass marks for external examination (typically 40% of external max)
                            </p>
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-medium text-blue-700">
                              Total Marks Final (Internal + External)*
                            </label>
                            <input
                              type="number"
                              name="totalMarksFinal"
                              value={formData.totalMarksFinal || ""}
                              readOnly
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-900 font-semibold cursor-not-allowed"
                              placeholder="Auto-calculated"
                            />
                            <p className="text-xs text-blue-600 mt-1">
                              Total marks (Internal Max Marks + External Max Marks) - Auto-calculated
                            </p>
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-medium text-blue-700">
                              Pass Marks Final (Internal + External)*
                            </label>
                            <input
                              type="number"
                              name="passMarksFinal"
                              value={formData.passMarksFinal || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="40"
                              min="0"
                              required
                            />
                            <p className="text-xs text-blue-600 mt-1">
                              Overall pass marks for final exam (Internal Pass Marks + External Pass Marks)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Marks Distribution - Labs */}
                  {selectedExamCategories.some((cat) => deriveExamMode(cat) === "Labs") && (
                    <div className="mb-5 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="text-sm font-semibold text-purple-800 mb-3">
                        Labs Marks Distribution (Total: 50 Marks)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block mb-1 text-xs font-medium text-purple-700">
                            Record Max*
                          </label>
                          <input
                            type="number"
                            name="recordMax"
                            value={formData.recordMax}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-purple-200 rounded-lg"
                            placeholder="10"
                            min="0"
                            max="10"
                            required
                          />
                          {/* <p className="text-xs text-purple-600 mt-1">Max: 10</p> */}
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-purple-700">
                            Performance Max*
                          </label>
                          <input
                            type="number"
                            name="performanceMax"
                            value={formData.performanceMax}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-purple-200 rounded-lg"
                            placeholder="10"
                            min="0"
                            max="10"
                            required
                          />
                          {/* <p className="text-xs text-purple-600 mt-1">Max: 10</p> */}
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-purple-700">
                            Internal Test Max*
                          </label>
                          <input
                            type="number"
                            name="internalTestMax"
                            value={formData.internalTestMax}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-purple-200 rounded-lg"
                            placeholder="15"
                            min="0"
                            max="15"
                            required
                          />
                          {/* <p className="text-xs text-purple-600 mt-1">Max: 15</p> */}
                        </div>
                        <div>
                          <label className="block mb-1 text-xs font-medium text-purple-700">
                            Viva Max*
                          </label>
                          <input
                            type="number"
                            name="vivaMax"
                            value={formData.vivaMax}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-purple-200 rounded-lg"
                            placeholder="15"
                            min="0"
                            max="15"
                            required
                          />
                          {/* <p className="text-xs text-purple-600 mt-1">Max: 15</p> */}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <div className="mb-4">
                            <label className="block mb-1 text-xs font-medium text-purple-700">
                              Total Internal Marks
                            </label>
                            <div className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-900 font-bold text-lg">
                            {formData.totalInternalMarks || "0"}
                            </div>
                          <p className="text-xs text-purple-600 mt-1">
                            Total Lab Internal Marks (Record + Performance + Internal Test + Viva)
                            </p>
                          </div>

                        {/* Maximum Marks and Pass Marks inside Labs section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-xs font-medium text-purple-700">
                              Maximum Marks *
                          </label>
                          <input
                            type="number"
                              name="maxMarks"
                              value={formData.maxMarks}
                            onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Enter maximum marks"
                            min="0"
                            required
                          />
                            <p className="text-xs text-purple-600 mt-1">
                              Maximum internal marks that can be obtained (Auto-calculated as sum of all lab components)
                          </p>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-medium text-purple-700">
                              Pass Marks (Internal Only) *
                            </label>
                            <input
                              type="number"
                              name="passMarks"
                              value={formData.passMarks}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Enter pass marks"
                              min="0"
                              required
                            />
                            <p className="text-xs text-purple-600 mt-1">
                              Minimum internal marks required to pass (typically 40% of max internal marks)
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Final Exam Marks - Shown with Labs because internal and external go together */}
                      <div className="mt-4 pt-4 border-t-2 border-purple-300">
                        <h5 className="text-xs font-semibold text-purple-800 mb-3">
                          Final Examination Marks (External)
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block mb-1 text-xs font-medium text-purple-700">
                            External Marks Max*
                          </label>
                          <input
                            type="number"
                            name="externalMarksMax"
                              value={formData.externalMarksMax || ""}
                            onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="70"
                            min="0"
                            required
                          />
                            <p className="text-xs text-purple-600 mt-1">
                              Maximum external examination marks
                          </p>
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-medium text-purple-700">
                              External Pass Marks*
                          </label>
                            <input
                              type="number"
                              name="passMarksExternal"
                              value={formData.passMarksExternal || ""}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="28"
                              min="0"
                              required
                            />
                            <p className="text-xs text-purple-600 mt-1">
                              Pass marks for external examination (typically 40% of external max)
                          </p>
                        </div>
                          <div>
                            <label className="block mb-1 text-xs font-medium text-purple-700">
                              Total Marks Final (Internal + External)*
                            </label>
                            <input
                              type="number"
                              name="totalMarksFinal"
                              value={formData.totalMarksFinal || ""}
                              readOnly
                              className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-purple-50 text-purple-900 font-semibold cursor-not-allowed"
                              placeholder="Auto-calculated"
                            />
                            <p className="text-xs text-purple-600 mt-1">
                              Total marks (Internal + External) - Auto-calculated
                      </p>
                    </div>
                    <div>
                            <label className="block mb-1 text-xs font-medium text-purple-700">
                              Pass Marks Final (Internal + External)*
                      </label>
                      <input
                              type="number"
                              name="passMarksFinal"
                              value={formData.passMarksFinal || ""}
                        onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="40"
                              min="0"
                        required
                      />
                            <p className="text-xs text-purple-600 mt-1">
                              Overall pass marks for final exam (based on Internal + External combined total)
                            </p>
                    </div>
                  </div>
                      </div>
                    </div>
                  )}

                  {/* Show message when no exam type is selected */}
                  {formData.courseId &&
                    formData.streamId &&
                    formData.semesterId &&
                    formData.subjectId &&
                    selectedExamCategories.length === 0 && (
                      <div className="mb-5 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-700 text-center">
                          Please select at least one exam type (Mids, Labs, or Final/External) to configure marks
                        </p>
                      </div>
                    )}

                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Status*
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        handleResetForm();
                      }}
                      className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      {editingItem ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Student Marks Entry Tab Content */}
      {activeTab === "marksEntry" && (
        <div className="space-y-6">
          {/* Exam Setup Selection */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Select Exam Setup
            </h4>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Exam Setup*
              </label>
              <select
                value={selectedInternalExamSetupId || ""}
                onChange={(e) => handleInternalExamSetupChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select Exam Setup</option>
                {configs
                  .filter((config) => config.status === "Active")
                  .map((config) => {
                    const course =
                      typeof config.courseId === "object" &&
                      config.courseId?.name
                        ? config.courseId
                        : courses.find(
                            (c) =>
                              (c._id || c.id) ===
                              (typeof config.courseId === "object" &&
                              config.courseId?._id
                                ? config.courseId._id
                                : config.courseId)
                          );
                    const stream =
                      typeof config.streamId === "object" &&
                      config.streamId?.name
                        ? config.streamId
                        : streamsData.find(
                            (s) =>
                              (s._id || s.id) ===
                              (typeof config.streamId === "object" &&
                              config.streamId?._id
                                ? config.streamId._id
                                : config.streamId)
                          );
                    const subject =
                      typeof config.subjectId === "object" &&
                      config.subjectId?.name
                        ? config.subjectId
                        : subjectsData.find(
                            (s) =>
                              (s._id || s.id) ===
                              (typeof config.subjectId === "object" &&
                              config.subjectId?._id
                                ? config.subjectId._id
                                : config.subjectId)
                          );

                    const courseName =
                      course?.name || course?.code || "Unknown";
                    const streamName =
                      stream?.name || stream?.code || "Unknown";
                    const subjectName = subject
                      ? `${subject.code || ""} - ${subject.name || ""}`
                      : "Unknown";
                    const examTypeDisplay =
                      typeof config.examType === "object"
                        ? config.examType.name ||
                          config.examType.title ||
                          JSON.stringify(config.examType)
                        : config.examType || "Unknown";

                    return (
                      <option
                        key={config._id || config.id}
                        value={config._id || config.id}
                      >
                        {courseName} | {streamName} | {subjectName} |{" "}
                        {examTypeDisplay}
                      </option>
                    );
                  })}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Select an Exam Setup to auto-fill Course, Stream,
                Semester, Subject, and Exam Type
              </p>
            </div>

            {/* Display Selected Setup Details */}
            {selectedConfig && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h5 className="text-sm font-semibold text-emerald-800 mb-3">
                  Selected Setup Details:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-emerald-700">
                      Course
                    </label>
                    <div className="px-3 py-2 bg-white border border-emerald-200 rounded text-sm text-gray-900">
                      {(() => {
                        const course =
                          typeof selectedConfig.courseId === "object" &&
                          selectedConfig.courseId?.name
                            ? selectedConfig.courseId
                            : courses.find(
                                (c) => (c._id || c.id) === marksFilters.courseId
                              );
                        return course?.name || course?.code || "-";
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-emerald-700">
                      Stream
                    </label>
                    <div className="px-3 py-2 bg-white border border-emerald-200 rounded text-sm text-gray-900">
                      {(() => {
                        const stream =
                          typeof selectedConfig.streamId === "object" &&
                          selectedConfig.streamId?.name
                            ? selectedConfig.streamId
                            : streamsData.find(
                                (s) => (s._id || s.id) === marksFilters.streamId
                              );
                        return stream?.name || stream?.code || "-";
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-emerald-700">
                      Semester
                    </label>
                    <div className="px-3 py-2 bg-white border border-emerald-200 rounded text-sm text-gray-900">
                      {(() => {
                        const semester =
                          typeof selectedConfig.semesterId === "object" &&
                          selectedConfig.semesterId?.description
                            ? selectedConfig.semesterId
                            : marksAvailableSemesters.find(
                                (s) =>
                                  (s._id || s.id) === marksFilters.semesterId
                              );
                        return semester?.description || semester?.name || "-";
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-emerald-700">
                      Subject
                    </label>
                    <div className="px-3 py-2 bg-white border border-emerald-200 rounded text-sm text-gray-900">
                      {(() => {
                        const subject =
                          typeof selectedConfig.subjectId === "object" &&
                          selectedConfig.subjectId?.name
                            ? selectedConfig.subjectId
                            : subjectsData.find(
                                (s) =>
                                  (s._id || s.id) === marksFilters.subjectId
                              );
                        return subject
                          ? `${subject.code || ""} - ${subject.name || ""}`
                          : "-";
                      })()}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-emerald-700">
                      Exam Type
                    </label>
                    <div className="px-3 py-2 bg-white border border-emerald-200 rounded text-sm text-gray-900">
                      {typeof selectedConfig.examType === "object"
                        ? selectedConfig.examType.name ||
                          selectedConfig.examType.title ||
                          JSON.stringify(selectedConfig.examType)
                        : selectedConfig.examType || "-"}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-emerald-200">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-emerald-700 font-medium">
                        Max Marks:{" "}
                      </span>
                      <span className="text-gray-900">
                        {selectedConfig.maxMarks ||
                          selectedConfig.totalInternalMarks}
                      </span>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-medium">
                        Pass Marks:{" "}
                      </span>
                      <span className="text-gray-900">
                        {selectedConfig.passMarks}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={loadStudentsForMarks}
                disabled={loadingStudents || !selectedConfig}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loadingStudents ? "Loading Students..." : "Load Students"}
              </button>
            </div>
          </div>

          {/* Students and Marks Entry Table */}
          {selectedConfig && students.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
                <h4 className="text-lg font-semibold">
                  {(() => {
                    const course = courses.find(
                      (c) => (c._id || c.id) === marksFilters.courseId
                    );
                    const stream = streamsData.find(
                      (s) => (s._id || s.id) === marksFilters.streamId
                    );
                    const subject = subjectsData.find(
                      (s) => (s._id || s.id) === marksFilters.subjectId
                    );
                    const semester = marksAvailableSemesters.find(
                      (s) => (s._id || s.id) === marksFilters.semesterId
                    );
                    return `${course?.name || ""} - ${stream?.name || ""} - ${
                      subject?.name || ""
                    } (${deriveExamMode(selectedConfig.examType)})`;
                  })()}
                </h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-emerald-50">
                    <span className="font-semibold">Filter Criteria:</span>{" "}
                    Course:{" "}
                    {(() => {
                      const course = courses.find(
                        (c) => (c._id || c.id) === marksFilters.courseId
                      );
                      return course?.name || course?.code || "N/A";
                    })()}{" "}
                    | Stream:{" "}
                    {(() => {
                      const stream = streamsData.find(
                        (s) => (s._id || s.id) === marksFilters.streamId
                      );
                      return stream?.name || stream?.code || "N/A";
                    })()}{" "}
                    | Semester:{" "}
                    {(() => {
                      const semester = marksAvailableSemesters.find(
                        (s) => (s._id || s.id) === marksFilters.semesterId
                      );
                      return semester?.description || semester?.name || "N/A";
                    })()}
                  </p>
                  <p className="text-sm text-emerald-50">
                    Max Marks:{" "}
                    {selectedConfig.maxMarks ||
                      selectedConfig.totalInternalMarks}{" "}
                    | Pass Marks: {selectedConfig.passMarks} | Students:{" "}
                    {students.length}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        SN
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Registration No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Student Name
                      </th>
                      {deriveExamMode(selectedConfig.examType) === "Mids" ? (
                        <>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Test-1
                            <br />
                            (Max: {selectedConfig.test1Max || 0})
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Test-2
                            <br />
                            (Max: {selectedConfig.test2Max || 0})
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Best Test
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Assignment
                            <br />
                            (Max: {selectedConfig.assignmentMax || 0})
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Attendance
                            <br />
                            (Max: {selectedConfig.attendanceMax || 0})
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Record
                            <br />
                            (Max: {selectedConfig.recordMax || 0})
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Performance
                            <br />
                            (Max: {selectedConfig.performanceMax || 0})
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Internal Test
                            <br />
                            (Max: {selectedConfig.internalTestMax || 0})
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Viva
                            <br />
                            (Max: {selectedConfig.vivaMax || 0})
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
                    {students.map((student, index) => {
                      const studentId = student._id || student.id;
                      const studentMarks = marksData[studentId] || {};
                      const isAbsent = studentMarks.absent || false;
                      const total = calculateStudentTotal(studentId);
                      const fullName = `${student.firstName || ""} ${
                        student.middleName || ""
                      } ${student.lastName || ""}`.trim();

                      return (
                        <tr
                          key={studentId}
                          className={
                            isAbsent ? "bg-gray-100" : "hover:bg-gray-50"
                          }
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.registrationNumber || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {fullName || "-"}
                          </td>
                          {deriveExamMode(selectedConfig.examType) ===
                          "Mids" ? (
                            <>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={selectedConfig.test1Max || 15}
                                  value={studentMarks.test1 || ""}
                                  onChange={(e) =>
                                    handleMarksChange(
                                      studentId,
                                      "test1",
                                      e.target.value
                                    )
                                  }
                                  disabled={isAbsent}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-200"
                                />
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={selectedConfig.test2Max || 15}
                                  value={studentMarks.test2 || ""}
                                  onChange={(e) =>
                                    handleMarksChange(
                                      studentId,
                                      "test2",
                                      e.target.value
                                    )
                                  }
                                  disabled={isAbsent}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-200"
                                />
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-center text-blue-600">
                                {isAbsent
                                  ? "-"
                                  : Math.max(
                                      parseFloat(studentMarks.test1 || 0),
                                      parseFloat(studentMarks.test2 || 0)
                                    ).toFixed(1)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={selectedConfig.assignmentMax || 5}
                                  value={studentMarks.assignment || ""}
                                  onChange={(e) =>
                                    handleMarksChange(
                                      studentId,
                                      "assignment",
                                      e.target.value
                                    )
                                  }
                                  disabled={isAbsent}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-200"
                                />
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={selectedConfig.attendanceMax || 5}
                                  value={studentMarks.attendance || ""}
                                  onChange={(e) =>
                                    handleMarksChange(
                                      studentId,
                                      "attendance",
                                      e.target.value
                                    )
                                  }
                                  disabled={isAbsent}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-200"
                                />
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={selectedConfig.recordMax || 10}
                                  value={studentMarks.record || ""}
                                  onChange={(e) =>
                                    handleMarksChange(
                                      studentId,
                                      "record",
                                      e.target.value
                                    )
                                  }
                                  disabled={isAbsent}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-200"
                                />
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={selectedConfig.performanceMax || 10}
                                  value={studentMarks.performance || ""}
                                  onChange={(e) =>
                                    handleMarksChange(
                                      studentId,
                                      "performance",
                                      e.target.value
                                    )
                                  }
                                  disabled={isAbsent}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-200"
                                />
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={selectedConfig.internalTestMax || 15}
                                  value={studentMarks.internalTest || ""}
                                  onChange={(e) =>
                                    handleMarksChange(
                                      studentId,
                                      "internalTest",
                                      e.target.value
                                    )
                                  }
                                  disabled={isAbsent}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-200"
                                />
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max={selectedConfig.vivaMax || 15}
                                  value={studentMarks.viva || ""}
                                  onChange={(e) =>
                                    handleMarksChange(
                                      studentId,
                                      "viva",
                                      e.target.value
                                    )
                                  }
                                  disabled={isAbsent}
                                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-200"
                                />
                              </td>
                            </>
                          )}
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-center">
                            <span
                              className={
                                total >= (selectedConfig.passMarks || 0)
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {isAbsent ? "AB" : total.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
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
                              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total Students:{" "}
                  <span className="font-semibold">{students.length}</span>
                </div>
                <button
                  onClick={saveMarks}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Save Marks
                </button>
              </div>
            </div>
          )}

          {selectedConfig && students.length === 0 && !loadingStudents && (
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
              <p className="text-gray-500">
                No students found for the selected Exam Setup.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Make sure students are admitted for the selected Course, Stream,
                and Semester.
              </p>
            </div>
          )}

          {!selectedConfig && (
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
              <p className="text-gray-500">
                Please select an Exam Setup from the dropdown above to
                begin marks entry.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Internal Marks Tab Content */}
      {activeTab === "internalMarks" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                Saved Internal Marks
              </h4>
              <button
                onClick={loadSavedMarks}
                disabled={loadingSavedMarks}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
              >
                {loadingSavedMarks ? "Loading..." : "Refresh"}
              </button>
            </div>

            {loadingSavedMarks ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : savedMarks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No saved internal marks found.</p>
                <p className="text-sm mt-2">
                  Enter marks in the "Student Marks Entry" tab and save them to
                  view here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        SN
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Student Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Registration No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Exam Type
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Total Marks
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Entered At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedMarks.map((mark, index) => {
                      const student = mark.studentId;
                      const subject = mark.subjectId;
                      const setup = mark.internalExamSetupId;
                      const studentName = student
                        ? `${student.firstName || ""} ${
                            student.middleName || ""
                          } ${student.lastName || ""}`.trim()
                        : "N/A";
                      const subjectName = subject
                        ? `${subject.code || ""} - ${subject.name || ""}`
                        : "N/A";

                      return (
                        <tr key={mark._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {studentName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {student?.registrationNumber || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {subjectName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-500">
                            {setup?.examType || mark.examType || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-semibold">
                            <span
                              className={
                                mark.isAbsent
                                  ? "text-red-600"
                                  : mark.totalMarks >= (setup?.passMarks || 0)
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {mark.isAbsent
                                ? "AB"
                                : mark.totalMarks?.toFixed(1) || "0.0"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                mark.status === "Finalized"
                                  ? "bg-green-100 text-green-800"
                                  : mark.status === "Submitted"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {mark.status || "Draft"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {mark.enteredAt
                              ? new Date(mark.enteredAt).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-blue-500">
              <h3 className="text-lg font-semibold text-white">
                View Exam Configuration
              </h3>
              <button
                onClick={() => setViewingItem(null)}
                className="text-white/80 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Helper function to get display values */}
              {(() => {
                const item = viewingItem;
                const courseId =
                  typeof item.courseId === "object" && item.courseId?._id
                    ? item.courseId._id
                    : item.courseId;
                const course =
                  typeof item.courseId === "object" && item.courseId?.name
                    ? item.courseId
                    : courses.find((c) => (c._id || c.id) === courseId);
                const courseName =
                  course?.name || course?.courseName || courseId || "-";

                const streamId =
                  typeof item.streamId === "object" && item.streamId?._id
                    ? item.streamId._id
                    : item.streamId;
                const stream =
                  typeof item.streamId === "object" && item.streamId?.name
                    ? item.streamId
                    : streamsData.find((s) => (s._id || s.id) === streamId);
                const streamName =
                  stream?.name ||
                  stream?.streamName ||
                  stream?.code ||
                  streamId ||
                  "-";

                const semesterId =
                  typeof item.semesterId === "object" && item.semesterId?._id
                    ? item.semesterId._id
                    : item.semesterId;
                const semester =
                  typeof item.semesterId === "object" &&
                  item.semesterId?.description
                    ? item.semesterId
                    : null;
                const semesterName =
                  semester?.description ||
                  semester?.name ||
                  semester?.code ||
                  `Semester ${semesterId}` ||
                  "-";

                const subjectId =
                  typeof item.subjectId === "object" && item.subjectId?._id
                    ? item.subjectId._id
                    : item.subjectId;
                const subject =
                  typeof item.subjectId === "object" && item.subjectId?.name
                    ? item.subjectId
                    : subjectsData.find((s) => (s._id || s.id) === subjectId);
                const subjectName = subject
                  ? `${subject.code || ""} - ${subject.name || ""}`
                  : subjectId || "-";

                const examTypeDisplay =
                  typeof item.examType === "object"
                    ? item.examType.name ||
                      item.examType.title ||
                      JSON.stringify(item.examType)
                    : item.examType || "-";

                const examMode = deriveExamMode(item.examType);
                const hasMids = examMode === "Mids" || (item.test1Max > 0 || item.test2Max > 0 || item.assignmentMax > 0 || item.attendanceMax > 0);
                const hasLabs = examMode === "Labs" || (item.recordMax > 0 || item.performanceMax > 0 || item.internalTestMax > 0 || item.vivaMax > 0);
                const hasFinal = (item.externalMarksMax > 0 || item.passMarksExternal > 0 || item.totalMarksFinal > 0 || item.passMarksFinal > 0);

                return (
                  <>
                    {/* Course Selection */}
                    <div className="mb-5">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Course
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                        {courseName}
                      </div>
                    </div>

                    {/* Stream and Semester Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Stream
                        </label>
                        <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                          {streamName}
                        </div>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Semester Number
                        </label>
                        <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                          Semester {item.semesterNumber || "-"}
                        </div>
                      </div>
                    </div>

                    {/* Subject Selection */}
                    <div className="mb-5">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                        {subjectName}
                      </div>
                    </div>

                    {/* Exam Types - Show all configured exam types for this subject */}
                    <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="block mb-3 text-sm font-medium text-gray-700">
                        Configured Exam Types
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {(() => {
                          // Get all related setups for the same course/stream/semester/subject
                          const allSetups = item.allRelatedSetups || [item];
                          const uniqueExamTypes = [...new Set(allSetups.map(s => s.examType).filter(Boolean))];
                          
                          return uniqueExamTypes.length > 0 ? (
                            uniqueExamTypes.map((examType, idx) => {
                              const isCurrent = examType === item.examType;
                              return (
                                <div
                                  key={idx}
                                  className={`px-4 py-2 rounded-lg border-2 ${
                                    isCurrent
                                      ? "bg-blue-100 border-blue-500 text-blue-800 font-semibold"
                                      : "bg-white border-gray-300 text-gray-700"
                                  }`}
                                >
                                  {examType} {isCurrent && "(Currently Viewing)"}
                                </div>
                              );
                            })
                          ) : (
                            <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900">
                              {examTypeDisplay}
                            </div>
                          );
                        })()}
                      </div>
                      {item.allRelatedSetups && item.allRelatedSetups.length > 1 && (
                        <p className="mt-2 text-xs text-gray-600">
                          This subject has {item.allRelatedSetups.length} exam type(s) configured. 
                          Currently viewing: <strong>{examTypeDisplay}</strong>
                        </p>
                      )}
                    </div>

                    {/* Show all exam types configurations */}
                    {(() => {
                      const allSetups = item.allRelatedSetups || [item];
                      const midsSetup = allSetups.find((s) => deriveExamMode(s.examType) === "Mids" || (s.test1Max > 0 || s.test2Max > 0 || s.assignmentMax > 0 || s.attendanceMax > 0));
                      const labsSetup = allSetups.find((s) => deriveExamMode(s.examType) === "Labs" || (s.recordMax > 0 || s.performanceMax > 0 || s.internalTestMax > 0 || s.vivaMax > 0));
                      const finalSetup = allSetups.find((s) => deriveExamMode(s.examType) === "Final" || (s.externalMarksMax > 0));
                      
                      // Use the setup that has the most complete data, or fall back to current item
                      const displayMids = midsSetup || (hasMids ? item : null);
                      const displayLabs = labsSetup || (hasLabs ? item : null);
                      const displayFinal = finalSetup || (hasFinal ? item : null);
                      
                      return (
                        <>
                          {/* Mids Marks Distribution */}
                          {displayMids && (
                      <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3">
                          Mids Marks Distribution (Configuration Total:{" "}
                          {displayMids.totalInternalMarks || "0"} Marks)
                          {displayMids.examType && displayMids.examType !== item.examType && (
                            <span className="ml-2 text-xs text-blue-600">
                              (from {displayMids.examType})
                            </span>
                          )}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block mb-1 text-xs font-medium text-blue-700">
                              Test-1 Max
                            </label>
                            <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900">
                              {displayMids.test1Max || "0"}
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                              Max: 15 marks
                            </p>
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-medium text-blue-700">
                              Test-2 Max
                            </label>
                            <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900">
                              {displayMids.test2Max || "0"}
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                              Max: 15 marks
                            </p>
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-medium text-blue-700">
                              Assignment Max
                            </label>
                            <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900">
                              {displayMids.assignmentMax || "0"}
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                              Assignment marks
                            </p>
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-medium text-blue-700">
                              Attendance Max
                            </label>
                            <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900">
                              {displayMids.attendanceMax || "0"}
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                              Attendance marks
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="mb-4">
                            <label className="block mb-1 text-xs font-medium text-blue-700">
                              Total Internal Marks
                            </label>
                            <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900 font-bold text-lg">
                              {displayMids.totalInternalMarks || "0"}
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                              Configuration Total (sum of all max marks)
                            </p>
                          </div>
                          
                          {/* Maximum Marks and Pass Marks inside Mids section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block mb-1 text-xs font-medium text-blue-700">
                                Maximum Marks
                              </label>
                              <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900">
                                {displayMids.maxMarks || "0"}
                              </div>
                              <p className="text-xs text-blue-600 mt-1">
                                Maximum internal marks that can be obtained (Auto-calculated: best of two tests + assignment + attendance)
                              </p>
                            </div>
                            <div>
                              <label className="block mb-1 text-xs font-medium text-blue-700">
                                Pass Marks (Internal Only)
                              </label>
                              <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900">
                                {displayMids.passMarks || "0"}
                              </div>
                              <p className="text-xs text-blue-600 mt-1">
                                Minimum internal marks required to pass (typically 40% of max internal marks)
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Final Exam Marks - Shown with Mids because internal and external go together */}
                        {(displayMids.externalMarksMax > 0 || displayMids.passMarksExternal > 0 || displayMids.totalMarksFinal > 0 || displayMids.passMarksFinal > 0) && (
                          <div className="mt-4 pt-4 border-t-2 border-blue-300">
                            <h5 className="text-xs font-semibold text-blue-800 mb-3">
                              Final Examination Marks (External)
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <label className="block mb-1 text-xs font-medium text-blue-700">
                                  External Marks Max
                                </label>
                                <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900">
                                  {displayMids.externalMarksMax || "0"}
                                </div>
                                <p className="text-xs text-blue-600 mt-1">
                                  Maximum external examination marks
                                </p>
                              </div>
                              <div>
                                <label className="block mb-1 text-xs font-medium text-blue-700">
                                  External Pass Marks
                                </label>
                                <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900">
                                  {displayMids.passMarksExternal || "0"}
                                </div>
                                <p className="text-xs text-blue-600 mt-1">
                                  Pass marks for external examination (typically 40% of external max)
                                </p>
                              </div>
                              <div>
                                <label className="block mb-1 text-xs font-medium text-blue-700">
                                  Total Marks Final (Internal + External)
                                </label>
                                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-semibold">
                                  {displayMids.totalMarksFinal || "0"}
                                </div>
                                <p className="text-xs text-blue-600 mt-1">
                                  Total marks (Internal Max Marks + External Max Marks) - Auto-calculated
                                </p>
                              </div>
                              <div>
                                <label className="block mb-1 text-xs font-medium text-blue-700">
                                  Pass Marks Final (Internal + External)
                                </label>
                                <div className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900">
                                  {displayMids.passMarksFinal || "0"}
                                </div>
                                <p className="text-xs text-blue-600 mt-1">
                                  Overall pass marks for final exam (Internal Pass Marks + External Pass Marks)
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                          )}

                          {/* Labs Marks Distribution */}
                          {displayLabs && (
                            <div className="mb-5 p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <h4 className="text-sm font-semibold text-purple-800 mb-3">
                                Labs Marks Distribution (Total: 50 Marks)
                                {displayLabs.examType && displayLabs.examType !== item.examType && (
                                  <span className="ml-2 text-xs text-purple-600">
                                    (from {displayLabs.examType})
                                  </span>
                                )}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block mb-1 text-xs font-medium text-purple-700">
                                    Record Max
                                  </label>
                                  <div className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-900">
                                    {displayLabs.recordMax || "0"}
                                  </div>
                                </div>
                                <div>
                                  <label className="block mb-1 text-xs font-medium text-purple-700">
                                    Performance Max
                                  </label>
                                  <div className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-900">
                                    {displayLabs.performanceMax || "0"}
                                  </div>
                                </div>
                                <div>
                                  <label className="block mb-1 text-xs font-medium text-purple-700">
                                    Internal Test Max
                                  </label>
                                  <div className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-900">
                                    {displayLabs.internalTestMax || "0"}
                                  </div>
                                </div>
                                <div>
                                  <label className="block mb-1 text-xs font-medium text-purple-700">
                                    Viva Max
                                  </label>
                                  <div className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-900">
                                    {displayLabs.vivaMax || "0"}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3 pt-3 border-t border-purple-200">
                                <div className="mb-4">
                                  <label className="block mb-1 text-xs font-medium text-purple-700">
                                    Total Internal Marks
                                  </label>
                                  <div className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-900 font-bold text-lg">
                                    {displayLabs.totalInternalMarks || "0"}
                                  </div>
                                  <p className="text-xs text-purple-600 mt-1">
                                    Total Lab Internal Marks (Record + Performance + Internal Test + Viva)
                                  </p>
                                </div>

                                {/* Maximum Marks and Pass Marks inside Labs section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block mb-1 text-xs font-medium text-purple-700">
                                      Maximum Marks
                                    </label>
                                    <div className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-900">
                                      {displayLabs.maxMarks || "0"}
                                    </div>
                                    <p className="text-xs text-purple-600 mt-1">
                                      Maximum internal marks that can be obtained (Auto-calculated as sum of all lab components)
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block mb-1 text-xs font-medium text-purple-700">
                                      Pass Marks (Internal Only)
                                    </label>
                                    <div className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-900">
                                      {displayLabs.passMarks || "0"}
                                    </div>
                                    <p className="text-xs text-purple-600 mt-1">
                                      Minimum internal marks required to pass (typically 40% of max internal marks)
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Final Exam Marks - Shown with Labs because internal and external go together */}
                              {(displayLabs.externalMarksMax > 0 || displayLabs.passMarksExternal > 0 || displayLabs.totalMarksFinal > 0 || displayLabs.passMarksFinal > 0) && (
                                <div className="mt-4 pt-4 border-t-2 border-purple-300">
                                  <h5 className="text-xs font-semibold text-purple-800 mb-3">
                                    Final Examination Marks (External)
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                      <label className="block mb-1 text-xs font-medium text-purple-700">
                                        External Marks Max
                                      </label>
                                      <div className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-900">
                                        {displayLabs.externalMarksMax || "0"}
                                      </div>
                                      <p className="text-xs text-purple-600 mt-1">
                                        Maximum external examination marks
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block mb-1 text-xs font-medium text-purple-700">
                                        External Pass Marks
                                      </label>
                                      <div className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-900">
                                        {displayLabs.passMarksExternal || "0"}
                                      </div>
                                      <p className="text-xs text-purple-600 mt-1">
                                        Pass marks for external examination (typically 40% of external max)
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block mb-1 text-xs font-medium text-purple-700">
                                        Total Marks Final (Internal + External)
                                      </label>
                                      <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 font-semibold">
                                        {displayLabs.totalMarksFinal || "0"}
                                      </div>
                                      <p className="text-xs text-purple-600 mt-1">
                                        Total marks (Internal + External) - Auto-calculated
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block mb-1 text-xs font-medium text-purple-700">
                                        Pass Marks Final (Internal + External)
                                      </label>
                                      <div className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-purple-900">
                                        {displayLabs.passMarksFinal || "0"}
                                      </div>
                                      <p className="text-xs text-purple-600 mt-1">
                                        Overall pass marks for final exam (based on Internal + External combined total)
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* Status */}
                    <div className="mb-5">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status || "Active"}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setViewingItem(null)}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalExamSetup;
