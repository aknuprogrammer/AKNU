import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  coursesApi,
  collegesApi,
  collegeTypesApi,
  collegeCategoriesApi,
  collegeOtherCategoriesApi,
  examTypesApi,
  academicYearsApi,
  semestersApi,
  streamsApi,
  subjectsApi,
  professorsApi,
  questionPapersApi,
  examinationCentersApi,
  invigilatorsApi,
  courseStreamMappingsApi,
  streamSubjectMappingsApi,
} from "../../../services/apiService";
import jsPDF from "jspdf";
import { loadLogoAsBase64 } from "./utils/loadLogoAsBase64";
import QuestionPaperForm from "./QuestionPaperForm";

const AddFormModal = ({
  tabKey,
  initialData,
  onSubmit,
  onClose,
  invigilators = [],
}) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Dependent data for dropdowns
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [collegeTypes, setCollegeTypes] = useState([]);
  const [collegeCategories, setCollegeCategories] = useState([]);
  const [collegeOtherCategories, setCollegeOtherCategories] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [streamsData, setStreamsData] = useState([]);
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);
  const [streamSubjectMappings, setStreamSubjectMappings] = useState([]);
  const [examCentersData, setExamCentersData] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const subjectDropdownRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [selectedSubjectForSyllabus, setSelectedSubjectForSyllabus] =
    useState("");
  const [syllabusSaved, setSyllabusSaved] = useState(false);

  const semesterOptions = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const timePeriodOptions = [
    "Half Yearly",
    "Yearly",
    "Quarterly",
    "semester",
    "Module Based",
  ];

  const feeModeOptions = [
    "Regular",
    // "Self-Finance",
    "Supplementary",
    "Revaluation",
  ];

  // Memoize invigilators to prevent infinite loops
  const invigilatorsRef = useRef(invigilators);
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    invigilatorsRef.current = invigilators;
    initialDataRef.current = initialData;
  }, [invigilators, initialData]);

  // Initialize semesterSubjects when semesterId changes or when semesters are loaded
  useEffect(() => {
    if (
      tabKey === "courseStreamMapping" &&
      formData.semesterId &&
      semesters.length > 0
    ) {
      const selectedSem = semesters.find(
        (s) => (s._id || s.id) === formData.semesterId
      );
      if (selectedSem && selectedSem.numberOfSemesters) {
        const currentSubjects = formData.semesterSubjects || [];
        // Only initialize if not already initialized or if length doesn't match
        if (currentSubjects.length !== selectedSem.numberOfSemesters) {
          const initSemesterSubjects = [];
          for (let i = 1; i <= selectedSem.numberOfSemesters; i++) {
            const existing = currentSubjects.find((s) => s.semester === i);
            // Preserve existing subjects if they exist
            initSemesterSubjects.push(
              existing || {
                semester: i,
                subjects: [],
              }
            );
          }
          if (initSemesterSubjects.length === selectedSem.numberOfSemesters) {
            setFormData((prev) => {
              // If we're editing and have _allMappings or subjects in initialData, reload them
              if (prev._allMappings && prev._allMappings.length > 0) {
                // Re-load subjects from mappings
                prev._allMappings.forEach((mapping) => {
                  const mappingSemesterNumber = mapping.semesterNumber || 1;
                  const semesterIndex = mappingSemesterNumber - 1;
                  if (
                    semesterIndex >= 0 &&
                    semesterIndex < initSemesterSubjects.length
                  ) {
                    if (
                      Array.isArray(mapping.subjects) &&
                      mapping.subjects.length > 0
                    ) {
                      const subjectsForSemester = mapping.subjects.map(
                        (subj) => ({
                          subjectId:
                            typeof subj.subjectId === "object" &&
                              subj.subjectId?._id
                              ? subj.subjectId._id
                              : subj.subjectId || subj,
                          maxMarks:
                            subj.maxMarks !== undefined &&
                              subj.maxMarks !== null
                              ? subj.maxMarks
                              : 100,
                          passMarks:
                            subj.passMarks !== undefined &&
                              subj.passMarks !== null
                              ? subj.passMarks
                              : 40,
                        })
                      );
                      initSemesterSubjects[semesterIndex].subjects =
                        subjectsForSemester;
                    }
                  }
                });
              } else if (
                initialDataRef.current &&
                (initialDataRef.current._id || initialDataRef.current.id)
              ) {
                // Single mapping edit - load subjects for the semester number
                const mapping = initialDataRef.current;
                const mappingSemesterNumber = mapping.semesterNumber || 1;
                const semesterIndex = mappingSemesterNumber - 1;
                if (
                  semesterIndex >= 0 &&
                  semesterIndex < initSemesterSubjects.length
                ) {
                  if (
                    Array.isArray(mapping.subjects) &&
                    mapping.subjects.length > 0
                  ) {
                    const subjectsForSemester = mapping.subjects.map(
                      (subj) => ({
                        subjectId:
                          typeof subj.subjectId === "object" &&
                            subj.subjectId?._id
                            ? subj.subjectId._id
                            : subj.subjectId || subj,
                        maxMarks:
                          subj.maxMarks !== undefined && subj.maxMarks !== null
                            ? subj.maxMarks
                            : 100,
                        passMarks:
                          subj.passMarks !== undefined &&
                            subj.passMarks !== null
                            ? subj.passMarks
                            : 40,
                      })
                    );
                    initSemesterSubjects[semesterIndex].subjects =
                      subjectsForSemester;
                  }
                }
              }
              return {
                ...prev,
                semesterSubjects: initSemesterSubjects,
              };
            });
          }
        }
      }
    }
  }, [formData.semesterId, formData.semesterSubjects, tabKey, semesters]);

  // Re-initialize form data when subjects/academicYears are loaded (for questionPaper editing)
  useEffect(() => {
    if (
      tabKey === "questionPaper" &&
      initialData &&
      subjects.length > 0 &&
      academicYears.length > 0 &&
      !loading
    ) {
      const getObjectId = (field) => {
        if (!field) return "";
        if (typeof field === "string") return field;
        if (field._id) return field._id;
        if (field.id) return field.id;
        return "";
      };

      const expectedSubjectId = getObjectId(initialData.subjectId);
      const expectedAcademicYearId = getObjectId(initialData.academicYearId);

      // Only update if we have expected IDs and formData might not have them set correctly
      if (expectedSubjectId || expectedAcademicYearId) {
        setFormData((prev) => {
          const currentSubjectId =
            typeof prev.subjectId === "string"
              ? prev.subjectId
              : prev.subjectId?._id || prev.subjectId?.id || "";
          const currentAcademicYearId =
            typeof prev.academicYearId === "string"
              ? prev.academicYearId
              : prev.academicYearId?._id || prev.academicYearId?.id || "";

          // Only update if IDs don't match
          if (
            currentSubjectId !== expectedSubjectId ||
            currentAcademicYearId !== expectedAcademicYearId
          ) {
            console.log(
              "Re-initializing form data with loaded subjects/academicYears",
              {
                expectedSubjectId,
                expectedAcademicYearId,
                currentSubjectId,
                currentAcademicYearId,
              }
            );
            return {
              ...prev,
              subjectId: expectedSubjectId || prev.subjectId || "",
              academicYearId:
                expectedAcademicYearId || prev.academicYearId || "",
            };
          }
          return prev;
        });
      }
    }
  }, [subjects.length, academicYears.length, tabKey, initialData, loading]);

  useEffect(() => {
    fetchDependentData();
    const currentInitialData = initialDataRef.current;
    const currentInvigilators = invigilatorsRef.current;

    if (currentInitialData) {
      // Handle collegeCourseMapping initial data
      if (tabKey === "collegeCourseMapping") {
        setFormData({
          collegeId:
            currentInitialData.college?._id ||
            currentInitialData.collegeId ||
            "",
          courseIds:
            currentInitialData.courses?.map((c) => c._id || c) ||
            currentInitialData.courseIds ||
            [],
        });
      } else if (tabKey === "questionPaper" && currentInitialData) {
        try {
          // Extract IDs from populated objects (API might return populated subjectId/academicYearId)
          const getObjectId = (field) => {
            if (!field) return "";
            if (typeof field === "string") return field;
            if (field._id) return field._id;
            if (field.id) return field.id;
            return "";
          };

          // Ensure questions have IDs for questionPaper
          const questionsWithIds = Array.isArray(currentInitialData.questions)
            ? currentInitialData.questions.map((q, idx) => ({
              ...q,
              id:
                q.id ||
                q.questionId ||
                `q_${Date.now()}_${idx}_${Math.random()}`,
            }))
            : [];

          // Extract all necessary fields, ensuring IDs are strings
          const formDataToSet = {
            ...currentInitialData,
            questions: questionsWithIds,
            // Ensure subjectId and academicYearId are strings, not objects
            subjectId: getObjectId(currentInitialData.subjectId) || "",
            academicYearId:
              getObjectId(currentInitialData.academicYearId) || "",
            courseId: getObjectId(currentInitialData.courseId) || "",
            streamId: getObjectId(currentInitialData.streamId) || "",
            semesterId: getObjectId(currentInitialData.semesterId) || "",
            // Ensure other fields have default values
            paperType: currentInitialData.paperType || "Paper 1",
            questionPaperNumber: currentInitialData.questionPaperNumber || "",
            professorName: currentInitialData.professorName || "",
            professorEmployeeId: currentInitialData.professorEmployeeId || "",
            examinationType: currentInitialData.examinationType || "Regular",
            duration: currentInitialData.duration || "3 hours",
            totalMarks: currentInitialData.totalMarks || "",
            status: currentInitialData.status || "Draft",
            notes: currentInitialData.notes || "",
          };

          console.log("Initializing question paper form with data:", {
            subjectId: formDataToSet.subjectId,
            academicYearId: formDataToSet.academicYearId,
            subjectName: currentInitialData.subjectName,
            subjectCode: currentInitialData.subjectCode,
          });

          setFormData(formDataToSet);
        } catch (err) {
          console.error("Error initializing question paper form:", err);
          setError(`Failed to load question paper data: ${err.message}`);
        }
      } else if (tabKey === "timetable") {
        // For timetable editing, convert single entry to tempEntry format
        if (currentInitialData._id && !currentInitialData.entries) {
          setFormData({
            entries: [],
            tempEntry: {
              subjectId: currentInitialData.subjectId || "",
              subjectName: currentInitialData.subjectName || "",
              subjectCode: currentInitialData.subjectCode || "",
              paperType: currentInitialData.paperType || "",
              streamId: currentInitialData.streamId || "",
              streamName: currentInitialData.streamName || "",
              streamCode: currentInitialData.streamCode || "",
              examDate: currentInitialData.examDate || "",
              examTime:
                currentInitialData.examTime ||
                currentInitialData.startTime ||
                "",
              duration: currentInitialData.duration || "",
              notes: currentInitialData.notes || "",
            },
          });
        } else {
          setFormData(currentInitialData);
        }
      } else if (tabKey === "masterMapping" && currentInitialData.courseId) {
        // For masterMapping, merge initialData with default form data
        const defaultData = {
          courseId: currentInitialData.courseId || "",
          streamId: "",
          semesters: "",
          semesterSubjects: [],
          timePeriod: "",
          notes: "",
        };
        setFormData({ ...defaultData, ...currentInitialData });
      } else if (tabKey === "courseStreamMapping" && currentInitialData) {
        // Check if editing (has _id) or adding new (only has courseId)
        if (currentInitialData._id || currentInitialData.id) {
          // Editing: Load ALL mappings for this course-stream-semesterType combination

          const semesterId =
            typeof currentInitialData.semesterId === "object" &&
              currentInitialData.semesterId?._id
              ? currentInitialData.semesterId._id
              : currentInitialData.semesterId || "";

          // Try to get semester object from multiple sources
          let semesterObj =
            typeof currentInitialData.semesterId === "object" &&
              currentInitialData.semesterId?.numberOfSemesters
              ? currentInitialData.semesterId
              : null;

          // If not found, try to find from semesters array (might be loaded already)
          if (!semesterObj && semesterId && semesters.length > 0) {
            semesterObj = semesters.find((s) => (s._id || s.id) === semesterId);
          }

          const numberOfSemesters = semesterObj?.numberOfSemesters || 0;

          // Get all mappings if available (from _allMappings)
          const allMappings = currentInitialData._allMappings || [
            currentInitialData,
          ];

          // Initialize all semesters
          let semesterSubjects = [];
          if (numberOfSemesters > 0) {
            for (let i = 1; i <= numberOfSemesters; i++) {
              semesterSubjects.push({
                semester: i,
                subjects: [],
              });
            }

            // Load subjects from all mappings into their respective semesters
            allMappings.forEach((mapping) => {
              const mappingSemesterNumber = mapping.semesterNumber || 1;
              const semesterIndex = mappingSemesterNumber - 1; // semesterNumber is 1-based, array is 0-based

              if (
                semesterIndex >= 0 &&
                semesterIndex < semesterSubjects.length
              ) {
                // Extract subjects from this mapping

                if (
                  Array.isArray(mapping.subjects) &&
                  mapping.subjects.length > 0
                ) {
                  const subjectsForSemester = mapping.subjects.map((subj) => ({
                    subjectId:
                      typeof subj.subjectId === "object" && subj.subjectId?._id
                        ? subj.subjectId._id
                        : subj.subjectId || subj,
                    maxMarks:
                      subj.maxMarks !== undefined && subj.maxMarks !== null
                        ? subj.maxMarks
                        : 100,
                    passMarks:
                      subj.passMarks !== undefined && subj.passMarks !== null
                        ? subj.passMarks
                        : 40,
                  }));
                  semesterSubjects[semesterIndex].subjects =
                    subjectsForSemester;
                }
              }
            });
          } else if (numberOfSemesters === 0 && allMappings.length > 0) {
            // If numberOfSemesters is 0 but we have mappings, at least load the subjects for the current semester
            // This handles the case where semesters haven't loaded yet
            const firstMapping = allMappings[0];
            const mappingSemesterNumber = firstMapping.semesterNumber || 1;

            if (
              Array.isArray(firstMapping.subjects) &&
              firstMapping.subjects.length > 0
            ) {
              const subjectsForSemester = firstMapping.subjects.map((subj) => ({
                subjectId:
                  typeof subj.subjectId === "object" && subj.subjectId?._id
                    ? subj.subjectId._id
                    : subj.subjectId || subj,
                maxMarks:
                  subj.maxMarks !== undefined && subj.maxMarks !== null
                    ? subj.maxMarks
                    : 100,
                passMarks:
                  subj.passMarks !== undefined && subj.passMarks !== null
                    ? subj.passMarks
                    : 40,
              }));

              semesterSubjects.push({
                semester: mappingSemesterNumber,
                subjects: subjectsForSemester,
              });
            }
          }

          // Get common fields from the first mapping (they should be the same for all)
          const firstMapping = allMappings[0] || currentInitialData;

          const normalizedData = {
            courseId:
              typeof firstMapping.courseId === "object" &&
                firstMapping.courseId?._id
                ? firstMapping.courseId._id
                : firstMapping.courseId || currentInitialData.courseId || "",
            streamId:
              typeof firstMapping.streamId === "object" &&
                firstMapping.streamId?._id
                ? firstMapping.streamId._id
                : firstMapping.streamId || currentInitialData.streamId || "",
            semesterId: semesterId,
            semesterNumber: firstMapping.semesterNumber || 1, // Keep for reference, but we'll process all semesters
            subjects: [], // Not used when editing all semesters
            semesterSubjects: semesterSubjects,
            timePeriod:
              firstMapping.timePeriod || currentInitialData.timePeriod || "",
            status:
              firstMapping.status || currentInitialData.status || "Active",
            notes: firstMapping.notes || currentInitialData.notes || "",
            _allMappings: allMappings, // Store for reference during submit
          };
          setFormData(normalizedData);
        } else {
          // Adding new mapping - has courseId and possibly full course object
          // Extract courseId if it's an object
          const courseId =
            typeof currentInitialData.courseId === "object" &&
              currentInitialData.courseId?._id
              ? currentInitialData.courseId._id
              : currentInitialData.courseId || "";
          setFormData({
            courseId: courseId,
            streamId: "",
            semesterId: "",
            subjects: [],
            semesterSubjects: [],
            timePeriod: "",
            status: "Active",
            notes: "",
            // Store course object for display if provided
            _course: currentInitialData.course || null,
          });
        }
      } else if (tabKey === "streams") {
        // For streams, convert courseIds to courseId for backward compatibility
        const streamData = { ...currentInitialData };
        if (
          !streamData.courseId &&
          Array.isArray(streamData.courseIds) &&
          streamData.courseIds.length > 0
        ) {
          streamData.courseId = streamData.courseIds[0];
        }
        setFormData(streamData);
      } else if (tabKey === "examCenterMappings") {
        // For examCenterMappings, normalize IDs from populated objects
        const mappingData = { ...currentInitialData };

        // Normalize examCenterId - extract _id if it's a populated object
        if (mappingData.examCenterId) {
          mappingData.examCenterId =
            typeof mappingData.examCenterId === "object" &&
              mappingData.examCenterId?._id
              ? mappingData.examCenterId._id
              : mappingData.examCenterId;
        }

        // Normalize collegeId - extract _id if it's a populated object
        if (mappingData.collegeId) {
          mappingData.collegeId =
            typeof mappingData.collegeId === "object" &&
              mappingData.collegeId?._id
              ? mappingData.collegeId._id
              : mappingData.collegeId;
        }

        // Normalize invigilatorId - extract _id if it's a populated object
        if (mappingData.invigilatorId) {
          mappingData.invigilatorId =
            typeof mappingData.invigilatorId === "object" &&
              mappingData.invigilatorId?._id
              ? mappingData.invigilatorId._id
              : mappingData.invigilatorId;
        } else if (
          !mappingData.invigilatorId &&
          mappingData.invigilatorName &&
          currentInvigilators.length > 0
        ) {
          // If invigilatorId is not present but invigilatorName is, try to find matching invigilator

          const foundInvigilator = currentInvigilators.find(
            (inv) =>
              inv.name === mappingData.invigilatorName ||
              inv.name?.toLowerCase() ===
              mappingData.invigilatorName?.toLowerCase()
          );
          if (foundInvigilator) {
            mappingData.invigilatorId = foundInvigilator._id;
          }
        }

        // Trim and normalize roll numbers if they exist
        if (mappingData.fromRoll) {
          mappingData.fromRoll = String(mappingData.fromRoll).trim();
        }
        if (mappingData.toRoll) {
          mappingData.toRoll = String(mappingData.toRoll).trim();
        }

        setFormData(mappingData);

        // Validate roll numbers after setting form data
        setTimeout(() => {
          if (mappingData.fromRoll) {
            const fromRollError = validateField(
              "fromRoll",
              mappingData.fromRoll,
              mappingData
            );
            setFieldErrors((prev) => ({ ...prev, fromRoll: fromRollError }));
          }
          if (mappingData.toRoll) {
            const toRollError = validateField(
              "toRoll",
              mappingData.toRoll,
              mappingData
            );
            setFieldErrors((prev) => ({ ...prev, toRoll: toRollError }));
          }
        }, 0);
      } else if (tabKey === "examCenterQuestionPaperMapping") {
        // For examCenterQuestionPaperMapping, normalize IDs from populated objects
        const mappingData = { ...currentInitialData };

        // Normalize examCenterId - extract _id if it's a populated object
        if (mappingData.examCenterId) {
          mappingData.examCenterId =
            typeof mappingData.examCenterId === "object" &&
              mappingData.examCenterId?._id
              ? mappingData.examCenterId._id
              : mappingData.examCenterId;
        }

        // Normalize questionPaperId - extract _id if it's a populated object
        if (mappingData.questionPaperId) {
          mappingData.questionPaperId =
            typeof mappingData.questionPaperId === "object" &&
              mappingData.questionPaperId?._id
              ? mappingData.questionPaperId._id
              : mappingData.questionPaperId;
        }

        setFormData(mappingData);
      } else if (tabKey === "courseAcademicYearMapping") {
        const mappingData = { ...currentInitialData };
        if (mappingData.courseId) {
          mappingData.courseId =
            typeof mappingData.courseId === "object" && mappingData.courseId?._id
              ? mappingData.courseId._id
              : mappingData.courseId;
        }
        if (mappingData.academicYearId) {
          mappingData.academicYearId =
            typeof mappingData.academicYearId === "object" &&
              mappingData.academicYearId?._id
              ? mappingData.academicYearId._id
              : mappingData.academicYearId;
        }
        setFormData(mappingData);
      } else if (tabKey === "colleges") {
        // Normalize foreign key IDs for colleges
        const collegeData = { ...currentInitialData };
        // Extract _id from populated objects if they exist
        if (
          collegeData.collegeTypeId &&
          typeof collegeData.collegeTypeId === "object"
        ) {
          collegeData.collegeTypeId =
            collegeData.collegeTypeId._id || collegeData.collegeTypeId;
        }
        if (
          collegeData.collegeCategoryId &&
          typeof collegeData.collegeCategoryId === "object"
        ) {
          collegeData.collegeCategoryId =
            collegeData.collegeCategoryId._id || collegeData.collegeCategoryId;
        }
        if (
          collegeData.courseCategoryId &&
          typeof collegeData.courseCategoryId === "object"
        ) {
          collegeData.courseCategoryId =
            collegeData.courseCategoryId._id || collegeData.courseCategoryId;
        }
        // Handle backward compatibility - if old field names exist, convert to new ones
        if (collegeData.collegeType && !collegeData.collegeTypeId) {
          // Try to find matching college type by name
          const matchingType = collegeTypes.find(
            (t) => t.name === collegeData.collegeType
          );
          if (matchingType) {
            collegeData.collegeTypeId = matchingType._id;
          }
          delete collegeData.collegeType;
        }
        if (collegeData.collegeCategory && !collegeData.collegeCategoryId) {
          const matchingCategory = collegeCategories.find(
            (c) => c.name === collegeData.collegeCategory
          );
          if (matchingCategory) {
            collegeData.collegeCategoryId = matchingCategory._id;
          }
          delete collegeData.collegeCategory;
        }
        if (collegeData.courseCategory && !collegeData.courseCategoryId) {
          const matchingCategory = collegeOtherCategories.find(
            (c) => c.name === collegeData.courseCategory
          );
          if (matchingCategory) {
            collegeData.courseCategoryId = matchingCategory._id;
          }
          delete collegeData.courseCategory;
        }
        setFormData(collegeData);
      } else {
        setFormData(currentInitialData);
      }
    } else {
      initializeFormData();
    }
    setFieldErrors({}); // Clear field errors when tab changes or form initializes
    setLoading(false);
  }, [tabKey]); // Only depend on tabKey, use refs for invigilators and initialData

  useEffect(() => {
    if (!showSubjectDropdown) return;
    const handleClickOutside = (event) => {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target)
      ) {
        setShowSubjectDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSubjectDropdown]);

  const fetchDependentData = async () => {
    try {
      // Helper function to extract data from API response
      const extractData = (response) => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data))
          return response.data;
        if (response?.success && response?.data && Array.isArray(response.data))
          return response.data;
        if (
          response?.statusCode === 200 &&
          response?.data &&
          Array.isArray(response.data)
        )
          return response.data;
        return [];
      };

      // Fetch from existing APIs with better error handling
      const [
        coursesResponse,
        collegesResponse,
        collegeTypesResponse,
        collegeCategoriesResponse,
        collegeOtherCategoriesResponse,
        examTypesData,
        academicYearsData,
        semestersData,
        streamsData,
        subjectsData,
        professorsData,
        courseStreamMappingsResponse,
        streamSubjectMappingsResponse,
      ] = await Promise.all([
        coursesApi.getAll().catch((err) => {
          console.error("Error fetching courses:", err);
          return [];
        }),
        collegesApi.getAll().catch((err) => {
          console.error("Error fetching colleges:", err);
          return [];
        }),
        collegeTypesApi.getAll().catch((err) => {
          console.error("Error fetching college types:", err);
          return [];
        }),
        collegeCategoriesApi.getAll().catch((err) => {
          console.error("Error fetching college categories:", err);
          return [];
        }),
        collegeOtherCategoriesApi.getAll().catch((err) => {
          console.error("Error fetching college other categories:", err);
          return [];
        }),
        examTypesApi.getAll().catch((err) => {
          console.error("Error fetching exam types:", err);
          return [];
        }),
        academicYearsApi.getAll().catch((err) => {
          console.error("Error fetching academic years:", err);
          return [];
        }),
        semestersApi.getAll().catch((err) => {
          console.error("Error fetching semesters:", err);
          return [];
        }),
        streamsApi.getAll().catch((err) => {
          console.error("Error fetching streams:", err);
          return [];
        }),
        subjectsApi.getAll().catch((err) => {
          console.error("Error fetching subjects:", err);
          return [];
        }),
        professorsApi.getAll().catch((err) => {
          console.error("Error fetching professors:", err);
          return [];
        }),
        courseStreamMappingsApi.getAll({ activeOnly: true }).catch((err) => {
          console.error("Error fetching course stream mappings:", err);
          return [];
        }),
        streamSubjectMappingsApi.getAll({ activeOnly: true }).catch((err) => {
          console.error("Error fetching stream subject mappings:", err);
          return [];
        }),
      ]);

      // Extract data arrays from responses
      const coursesData = extractData(coursesResponse);
      const collegesData = extractData(collegesResponse);
      const collegeTypesData = extractData(collegeTypesResponse);
      const collegeCategoriesData = extractData(collegeCategoriesResponse);
      const collegeOtherCategoriesData = extractData(
        collegeOtherCategoriesResponse
      );

      // Debug logging
      if (tabKey === "colleges") {
        console.log("College Types Response:", collegeTypesResponse);
        console.log("College Types Data:", collegeTypesData);
        console.log("College Categories Response:", collegeCategoriesResponse);
        console.log("College Categories Data:", collegeCategoriesData);
        console.log(
          "College Other Categories Response:",
          collegeOtherCategoriesResponse
        );
        console.log(
          "College Other Categories Data:",
          collegeOtherCategoriesData
        );
      }

      // Filter out inactive records for dropdowns
      const filterActive = (data) => {
        if (!Array.isArray(data)) {
          console.warn("filterActive received non-array:", data);
          return [];
        }
        return data.filter((item) => {
          // If item has status field, only include Active ones
          if (item.status !== undefined) {
            return item.status === "Active";
          }
          // If no status field, include all (for backward compatibility)
          return true;
        });
      };

      const safeCourses = Array.isArray(coursesData)
        ? filterActive(coursesData)
        : [];
      setCourses(safeCourses);
      setColleges(filterActive(collegesData));
      setCollegeTypes(filterActive(collegeTypesData));
      setCollegeCategories(filterActive(collegeCategoriesData));
      setCollegeOtherCategories(filterActive(collegeOtherCategoriesData));
      setExamTypes(filterActive(extractData(examTypesData)));
      setAcademicYears(filterActive(extractData(academicYearsData)));
      const extractedSemesters = extractData(semestersData);
      // For semesters, if status filtering removes all items, include all items
      const filteredSemesters = filterActive(extractedSemesters);
      // If filtering removed all semesters, use all extracted semesters (they might not have status field)
      const finalSemesters =
        filteredSemesters.length > 0 ? filteredSemesters : extractedSemesters;
      setSemesters(finalSemesters);
      setStreamsData(filterActive(extractData(streamsData)));
      // Extract and set stream-subject mappings
      const streamSubjectMappingsData = extractData(
        streamSubjectMappingsResponse
      );
      setStreamSubjectMappings(streamSubjectMappingsData);
      // Sort subjects by code (API should already sort, but we'll sort as backup)
      const sortedSubjects = filterActive(extractData(subjectsData)).sort(
        (a, b) => {
          const codeA = (a.code || "").toUpperCase();
          const codeB = (b.code || "").toUpperCase();
          return codeA.localeCompare(codeB);
        }
      );
      setSubjects(sortedSubjects);
      setProfessors(filterActive(extractData(professorsData)));

      // Extract and store course stream mappings
      const mappingsData = extractData(courseStreamMappingsResponse);
      setCourseStreamMappings(mappingsData);

      // Fetch examination centers from API
      const examCentersResponse = await examinationCentersApi.getAll();
      const examCentersData = Array.isArray(examCentersResponse)
        ? examCentersResponse
        : examCentersResponse?.data || [];
      // Filter active exam centers for dropdown
      setExamCentersData(filterActive(examCentersData));

      // Load timetable entries for subject-professor mapping
      const storedTimetable = localStorage.getItem("exam_timetable_entries");
      if (storedTimetable) {
        setTimetableEntries(JSON.parse(storedTimetable));
      }

      // Load question papers for exam center-question paper mapping from API
      try {
        const questionPapersResponse = await questionPapersApi.getAll({
          status: "Submitted",
        });
        let questionPapersData = [];
        if (
          questionPapersResponse &&
          typeof questionPapersResponse === "object"
        ) {
          if (Array.isArray(questionPapersResponse)) {
            questionPapersData = questionPapersResponse;
          } else if (
            questionPapersResponse.data &&
            Array.isArray(questionPapersResponse.data)
          ) {
            questionPapersData = questionPapersResponse.data;
          } else if (
            questionPapersResponse.success &&
            questionPapersResponse.data &&
            Array.isArray(questionPapersResponse.data)
          ) {
            questionPapersData = questionPapersResponse.data;
          }
        }

        // If editing examCenterQuestionPaperMapping, ensure current question paper is included
        if (
          tabKey === "examCenterQuestionPaperMapping" &&
          initialDataRef.current?.questionPaperId
        ) {
          const currentQpId =
            typeof initialDataRef.current.questionPaperId === "object" &&
              initialDataRef.current.questionPaperId?._id
              ? initialDataRef.current.questionPaperId._id
              : initialDataRef.current.questionPaperId;

          // Check if current QP is already in the list
          const currentQpInList = questionPapersData.find((qp) => {
            const qpId = qp._id || qp.id;
            return qpId === currentQpId || String(qpId) === String(currentQpId);
          });

          // If current QP is a populated object in initialData, use it
          if (
            !currentQpInList &&
            typeof initialDataRef.current.questionPaperId === "object" &&
            initialDataRef.current.questionPaperId?._id
          ) {
            questionPapersData.push(initialDataRef.current.questionPaperId);
          }
          // If not found and we have an ID, try to fetch it separately
          else if (!currentQpInList && currentQpId) {
            try {
              const currentQpResponse = await questionPapersApi.getById(
                currentQpId
              );
              // Handle API response structure
              let currentQp = currentQpResponse;
              if (currentQpResponse && typeof currentQpResponse === "object") {
                if (
                  currentQpResponse.data &&
                  (currentQpResponse.data._id || currentQpResponse.data.id)
                ) {
                  currentQp = currentQpResponse.data;
                } else if (
                  currentQpResponse.success &&
                  currentQpResponse.data &&
                  (currentQpResponse.data._id || currentQpResponse.data.id)
                ) {
                  currentQp = currentQpResponse.data;
                }
              }
              if (currentQp && (currentQp._id || currentQp.id)) {
                questionPapersData.push(currentQp);
              }
            } catch (err) {
              console.warn("Could not fetch current question paper:", err);
            }
          }
        }

        // Filter Submitted/Approved papers for dropdown, but include current one if editing
        let filtered = questionPapersData.filter(
          (qp) => qp.status === "Submitted" || qp.status === "Approved"
        );

        // If editing, ensure current question paper is included regardless of status
        if (
          tabKey === "examCenterQuestionPaperMapping" &&
          initialDataRef.current?.questionPaperId
        ) {
          const currentQpId =
            typeof initialDataRef.current.questionPaperId === "object" &&
              initialDataRef.current.questionPaperId?._id
              ? initialDataRef.current.questionPaperId._id
              : initialDataRef.current.questionPaperId;

          const currentQp = questionPapersData.find((qp) => {
            const qpId = qp._id || qp.id;
            return qpId === currentQpId || String(qpId) === String(currentQpId);
          });

          if (currentQp) {
            const existsInFiltered = filtered.find((qp) => {
              const qpId = qp._id || qp.id;
              return (
                qpId === currentQpId || String(qpId) === String(currentQpId)
              );
            });
            if (!existsInFiltered) {
              filtered.push(currentQp);
            }
          }
        }

        setQuestionPapers(filtered);
      } catch (err) {
        console.error("Error fetching question papers:", err);
        setQuestionPapers([]);
      }
    } catch (err) {
      console.error("Error fetching dependent data:", err);
    }
  };

  const initializeFormData = () => {
    const defaultData = {
      colleges: {
        code: "",
        name: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        collegeTypeId: "",
        collegeCategoryId: "",
        courseCategoryId: "",
        comments: "",
        status: "Active",
      },
      courses: {
        code: "",
        name: "",
        duration: "",
        comments: "",
        status: "Active",
      },
      collegeCourseMapping: {
        collegeId: "",
        courseIds: [],
      },
      academicYears: { status: "Active" },
      semesters: {
        status: "Active",
        courseId: "",
        academicYearId: "",
        numberOfSemesters: "",
      },
      examinationTypes: { duration: 3, maxMarks: 100, passingMarks: 40 },
      subjects: {
        status: "Active",
        syllabus: "",
      },
      streams: { status: "Active" },
      students: {
        studentId: "",
        name: "",
        email: "",
        collegeId: "",
        courseId: "",
        streamId: "",
        status: "Active",
        notes: "",
      },
      courseStreamMapping: { status: "Active" },
      streamSubjectMapping: { status: "Active" },
      examCenterCollegeMapping: {
        examCenterId: "",
        collegeId: "",
        status: "Active",
        notes: "",
      },
      examCenterStudentMapping: {
        examCenterId: "",
        collegeId: "",
        fromRoll: "",
        toRoll: "",
        status: "Active",
        notes: "",
      },
      roomStudentMapping: {
        roomName: "",
        roomCode: "",
        examCenterId: "",
        collegeId: "",
        fromRoll: "",
        toRoll: "",
        status: "Active",
        notes: "",
      },
      examCenterMappings: {
        examCenterId: "",
        collegeId: "",
        fromRoll: "",
        toRoll: "",
        roomName: "",
        roomCode: "",
        invigilatorId: "",
        invigilatorName: "",
        status: "Active",
        notes: "",
      },
      courseAcademicYearMapping: { status: "Active" },
      academicYearSemesterMapping: { status: "Active" },
      examinationFees: {
        campusId: "",
        courseId: "",
        streamId: "",
        academicYearId: "",
        semesterId: "",
        subjectId: "",
        selectedSubjectIds: [],
        mode: "",
        years: [
          {
            year: 1,
            fees: [{ feeType: "", feeAmount: 0, remarks: "" }],
          },
        ],
      },
      professors: {
        name: "",
        professorId: "",
        designation: "",
        department: "",
        contactNumber: "",
        email: "",
        alternateContactNumber: "",
        experienceYears: "",
        subjectIds: [],
        availability: [],
        verifiedSetter: false,
        maxPapersPerDay: 1,
        status: "Active",
        customSubjects: "",
        notes: "",
      },
      timetable: {
        entries: [], // Array of timetable entries
        // Temporary entry fields for adding new entries
        tempEntry: {
          subjectId: "",
          subjectName: "",
          subjectCode: "",
          paperType: "",
          streamId: "",
          streamName: "",
          streamCode: "",
          examDate: "",
          examTime: "",
          duration: "",
          notes: "",
        },
      },
      questionPaper: {
        subjectId: "",
        subjectName: "",
        subjectCode: "",
        academicYearId: "",
        academicYearCode: "",
        academicYearName: "",
        paperType: "",
        questionPaperNumber: "",
        professorName: "",
        professorEmployeeId: "",
        examinationType: "",
        duration: "3 hours",
        totalMarks: "",
        sections: [], // Array of sections with instructions
        questions: [],
        status: "Draft", // Draft or Submitted
        pdfBase64: "",
        pdfFileName: "",
      },
      subjectProfessorMapping: {
        subjectId: "",
        subjectName: "",
        subjectCode: "",
        paperType: "",
        professorId: "",
        status: "Active",
        notes: "",
      },
      invigilators: {
        name: "",
        invigilatorCode: "",
        collegeId: "",
        role: "",
        year: "",
        status: "Active",
        notes: "",
      },
      masterMapping: {
        courseId: "",
        streamId: "",
        semesters: "",
        semesterSubjects: [], // Array of {semester: number, subjects: [{subjectId, maxMarks, passMarks, syllabus}]}
        timePeriod: "",
        notes: "",
      },
      subjectCourseMapping: { isCore: true, streamId: "" },
      examinationCenters: { capacity: 0, status: "Active", email: "" },
    };
    setFormData(defaultData[tabKey] || {});
    setFieldErrors({}); // Clear field errors when initializing
  };

  // Helper function to render validation success icon
  const renderValidationIcon = (
    fieldName,
    fieldValue,
    customValidation = null,
    label = null,
    isSelect = false
  ) => {
    const hasError = fieldErrors[fieldName];
    const hasValue =
      fieldValue !== undefined && fieldValue !== null && fieldValue !== "";
    const isValid =
      !hasError &&
      hasValue &&
      (customValidation ? customValidation(fieldValue) : true);

    if (!isValid) return null;

    // Get friendly label
    const fieldLabels = {
      state: "State",
      city: "City",
      contactPerson: "Contact Person Name",
      contactNumber: "Phone Number",
      email: "Email",
      pincode: "Pincode",
      duration: "Duration",
      maxMarks: "Maximum Marks",
      passingMarks: "Passing Marks",
      rooms: "Rooms",
      capacity: "Capacity",
      name: "Name",
      code: "Code",
      address: "Address",
      subjectId: "Subject",
      academicYearId: "Academic Year",
      examinationType: "Examination Type",
      collegeTypeId: "College Type",
      collegeCategoryId: "College Category",
      courseCategoryId: "Course Category",
      collegeId: "College/Campus",
      examCenterId: "Examination Center",
      invigilatorId: "Invigilator",
      status: "Status",
      professorId: "Professor",
      fromRoll: "From Roll Number",
      toRoll: "To Roll Number",
    };

    const displayLabel =
      label ||
      fieldLabels[fieldName] ||
      fieldName
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());

    // For select fields, position icon to the left of dropdown arrow (right-10), for inputs use right-3
    const rightPosition = isSelect ? "right-10" : "right-3";

    return (
      <div
        className={`absolute ${rightPosition} top-1/2 transform -translate-y-1/2 group z-10`}
      >
        <svg
          className="w-5 h-5 text-green-600 cursor-help"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="absolute right-0 top-full mt-2 w-40 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
          Valid {displayLabel}
        </div>
      </div>
    );
  };

  // Validation functions
  const validateField = (name, value, formDataContext = formData) => {
    let error = "";

    switch (name) {
      case "pincode":
        if (value && !/^\d{6}$/.test(value)) {
          error = "Pincode must be exactly 6 digits";
        }
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "contactNumber":
      case "phone":
        const phoneDigits = value ? value.replace(/\D/g, "") : "";
        if (value && phoneDigits.length !== 10) {
          error = "Phone number must be exactly 10 digits";
        }
        break;
      case "contactPerson":
        if (value) {
          const stringValue = String(value).trim();
          if (stringValue && !/^[a-zA-Z\s]+$/.test(stringValue)) {
            error =
              "Contact person name should contain only letters and spaces";
          } else if (stringValue && stringValue.length < 2) {
            error = "Contact person name must be at least 2 characters";
          }
        }
        break;
      case "notes":
      case "description":
      case "comments":
        if (value && value.length > 250) {
          error = `Maximum 250 characters allowed (${value.length}/250)`;
        }
        break;
      case "capacity":
        if (value && (isNaN(value) || parseInt(value) < 1)) {
          error = "Capacity must be a positive number";
        }
        break;
      case "rooms":
        if (value && (isNaN(value) || parseInt(value) < 0)) {
          error = "Number of rooms must be 0 or greater";
        }
        break;
      case "duration":
        // Allow text values like "3 hours", "3 mins", etc.
        if (value) {
          const stringValue = String(value).trim();
          if (stringValue !== "") {
            // Check if it's a pure number (old format)
            if (!isNaN(stringValue) && parseInt(stringValue) < 1) {
              error = "Duration must be at least 1";
            }
            // If it's text, just validate it's not empty (allow formats like "3 hours", "3 mins", etc.)
            // No additional validation needed for text format
          }
        }
        break;
      case "maxMarks":
        if (value && (isNaN(value) || parseInt(value) < 1)) {
          error = "Maximum marks must be at least 1";
        }
        break;
      case "passingMarks":
        if (value) {
          const passing = parseInt(value);
          const maxMarks = parseInt(formDataContext.maxMarks || 0);
          if (isNaN(passing) || passing < 0) {
            error = "Passing marks must be 0 or greater";
          } else if (maxMarks > 0 && passing > maxMarks) {
            error = `Passing marks cannot exceed maximum marks (${maxMarks})`;
          }
        }
        break;
      case "fromRoll":
        if (value) {
          const trimmedValue = String(value).trim();
          if (!trimmedValue) {
            error = "From Roll Number is required";
          } else {
            // Allow alphanumeric values (letters and numbers)
            const alphanumericPattern = /^[A-Za-z0-9]+$/;
            if (!alphanumericPattern.test(trimmedValue)) {
              error = "From Roll Number must contain only letters and numbers";
            } else if (formDataContext.toRoll) {
              const toRollTrimmed = String(formDataContext.toRoll).trim();
              // Use string comparison for alphanumeric values
              if (
                toRollTrimmed &&
                trimmedValue.localeCompare(toRollTrimmed) >= 0
              ) {
                error = "From Roll Number must be less than To Roll Number";
              }
            }
          }
        }
        break;
      case "toRoll":
        if (value) {
          const trimmedValue = String(value).trim();
          if (!trimmedValue) {
            error = "To Roll Number is required";
          } else {
            // Allow alphanumeric values (letters and numbers)
            const alphanumericPattern = /^[A-Za-z0-9]+$/;
            if (!alphanumericPattern.test(trimmedValue)) {
              error = "To Roll Number must contain only letters and numbers";
            } else if (formDataContext.fromRoll) {
              const fromRollTrimmed = String(formDataContext.fromRoll).trim();
              // Use string comparison for alphanumeric values
              if (
                fromRollTrimmed &&
                trimmedValue.localeCompare(fromRollTrimmed) <= 0
              ) {
                error = "To Roll Number must be greater than From Roll Number";
              }
            }
          }
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    const isTextarea = e.target.tagName === "TEXTAREA";

    // For textarea fields (notes, description, comments), limit to 250 characters
    if (
      isTextarea &&
      (name === "notes" || name === "description" || name === "comments")
    ) {
      if (value && value.length > 250) {
        return; // Don't update if exceeds limit
      }
    }

    // For pincode, only allow digits and limit to 6
    if (name === "pincode") {
      const digitsOnly = (value || "").replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        [name]: digitsOnly,
      }));
      // Validate after update
      setTimeout(() => {
        const fieldError = validateField(name, digitsOnly);
        setFieldErrors((prev) => ({
          ...prev,
          [name]: fieldError,
        }));
      }, 0);
      return;
    }

    // For contactPerson, only allow letters and spaces (no digits or special characters)
    if (name === "contactPerson") {
      const lettersOnly = (value || "").replace(/[^a-zA-Z\s]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: lettersOnly,
      }));
      // Validate after update
      setTimeout(() => {
        const fieldError = validateField(name, lettersOnly);
        setFieldErrors((prev) => ({
          ...prev,
          [name]: fieldError,
        }));
      }, 0);
      return;
    }

    // For phone/contactNumber, only allow digits and limit to 10
    if (name === "contactNumber" || name === "phone") {
      const digitsOnly = (value || "").replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: digitsOnly,
      }));
      // Validate after update
      setTimeout(() => {
        const fieldError = validateField(name, digitsOnly);
        setFieldErrors((prev) => ({
          ...prev,
          [name]: fieldError,
        }));
      }, 0);
      return;
    }

    // Update form data first
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: fieldValue,
      };

      // Validate after update (async to not block the update)
      setTimeout(() => {
        const fieldError = validateField(name, fieldValue, updated);
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          [name]: fieldError,
        }));

        // Also validate related fields for cross-field validation
        if (name === "maxMarks" && updated.passingMarks) {
          const passingError = validateField(
            "passingMarks",
            updated.passingMarks,
            updated
          );
          setFieldErrors((prevErrors) => ({
            ...prevErrors,
            passingMarks: passingError,
          }));
        }
        if (name === "fromRoll" && updated.toRoll) {
          const toRollError = validateField("toRoll", updated.toRoll, updated);
          setFieldErrors((prevErrors) => ({
            ...prevErrors,
            toRoll: toRollError,
          }));
        }
        if (name === "toRoll" && updated.fromRoll) {
          const fromRollError = validateField(
            "fromRoll",
            updated.fromRoll,
            updated
          );
          setFieldErrors((prevErrors) => ({
            ...prevErrors,
            fromRoll: fromRollError,
          }));
        }
      }, 0);

      return updated;
    });
  };

  const toggleArrayValue = (field, itemValue) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      const exists = current.includes(itemValue);
      const updated = exists
        ? current.filter((val) => val !== itemValue)
        : [...current, itemValue];
      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  const validateAllFields = () => {
    const errors = {};

    // Validate all fields in formData
    // Skip validation for fields that are objects or arrays (like questions, subjects, etc.)
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      // Skip validation for complex objects/arrays and ID fields that might be objects
      if (
        value !== null &&
        value !== undefined &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        key !== "subjectId" &&
        key !== "courseId" &&
        key !== "streamId" &&
        key !== "semesterId" &&
        key !== "academicYearId"
      ) {
        // Skip complex objects (like populated references)
        return;
      }
      const error = validateField(key, value, formData);
      if (error) {
        errors[key] = error;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate all fields before submission
    if (!validateAllFields()) {
      setIsSubmitting(false);
      const errorFields = Object.keys(fieldErrors).filter(
        (key) => fieldErrors[key]
      );
      if (errorFields.length > 0) {
        const fieldLabels = {
          pincode: "Pincode",
          email: "Email",
          contactNumber: "Contact Number",
          phone: "Phone",
          notes: "Notes",
          description: "Description",
          comments: "Comments",
          capacity: "Capacity",
          rooms: "Number of Rooms",
          duration: "Duration",
          maxMarks: "Maximum Marks",
          passingMarks: "Passing Marks",
          fromRoll: "From Roll Number",
          toRoll: "To Roll Number",
        };
        const labels = errorFields
          .map((field) => fieldLabels[field] || field)
          .join(", ");
        setError(
          `Please fix validation errors in: ${labels}. Check the fields below for details.`
        );
      } else {
        setError("Please fix the validation errors before submitting.");
      }
      return;
    }

    try {
      let payload = { ...formData };

      if (tabKey === "colleges") {
        // Normalize IDs - ensure we send ObjectId strings, not populated objects
        const normalizeId = (id) => {
          if (!id) return "";
          return typeof id === "object" && id?._id ? id._id : id;
        };

        payload = {
          ...formData,
          collegeTypeId: normalizeId(formData.collegeTypeId),
          collegeCategoryId: normalizeId(formData.collegeCategoryId),
          courseCategoryId: normalizeId(formData.courseCategoryId),
          comments: formData.comments?.trim() || "",
        };
      } else if (tabKey === "semesters") {
        const selectedCourse = courses.find(
          (course) => course._id === formData.courseId
        );
        const selectedYear = academicYears.find(
          (year) => year._id === formData.academicYearId
        );

        payload = {
          ...formData,
          courseId: formData.courseId || "",
          courseCode: selectedCourse?.code || "",
          courseName: selectedCourse?.name || "",
          academicYearId: formData.academicYearId || "",
          academicYearCode: selectedYear?.code || "",
          academicYearName: selectedYear?.name || "",
          numberOfSemesters: formData.numberOfSemesters || "",
        };
      } else if (tabKey === "timetable") {
        // Check if editing (initialData has _id) or adding new entries
        if (initialData && initialData._id) {
          // Editing single entry - use tempEntry
          const tempEntry = formData.tempEntry || {};
          if (!tempEntry.subjectId) {
            setError("Please select a subject");
            setIsSubmitting(false);
            return;
          }
          if (!tempEntry.paperType || !tempEntry.paperType.trim()) {
            setError("Please enter paper type");
            setIsSubmitting(false);
            return;
          }
          if (!tempEntry.streamId) {
            setError("Please select a department/stream");
            setIsSubmitting(false);
            return;
          }
          if (!tempEntry.examDate) {
            setError("Please select exam date");
            setIsSubmitting(false);
            return;
          }
          if (!tempEntry.examTime) {
            setError("Please enter exam time");
            setIsSubmitting(false);
            return;
          }
          if (!tempEntry.duration || !tempEntry.duration.trim()) {
            setError("Please enter duration");
            setIsSubmitting(false);
            return;
          }

          const subject = subjects.find((s) => s._id === tempEntry.subjectId);
          const stream = streamsData.find((s) => s._id === tempEntry.streamId);

          payload = {
            ...tempEntry,
            subjectName: subject?.name || "",
            subjectCode: subject?.code || "",
            streamName: stream?.name || "",
            streamCode: stream?.code || "",
            startTime: tempEntry.examTime || "",
            endTime: "",
          };
        } else {
          // Adding new entries
          const entries = formData.entries || [];

          if (!Array.isArray(entries) || entries.length === 0) {
            setError(
              "Please add at least one timetable entry before submitting."
            );
            setIsSubmitting(false);
            return;
          }

          // For timetable, we'll submit the entries array
          // The parent component (TimetableTable) will handle saving each entry
          payload = {
            entries: entries.map((entry) => ({
              ...entry,
              // Remove the temporary id and add proper fields
              startTime: entry.examTime || "",
              endTime: "", // Duration is stored separately
            })),
          };
        }
      } else if (tabKey === "questionPaper") {
        const selectedSubject = subjects.find(
          (subject) => subject._id === formData.subjectId
        );

        if (!formData.subjectId || !selectedSubject) {
          setError("Please select a subject for the question paper.");
          setIsSubmitting(false);
          return;
        }

        if (
          !Array.isArray(formData.questions) ||
          formData.questions.length === 0
        ) {
          setError("Please add at least one question to the paper.");
          setIsSubmitting(false);
          return;
        }

        // Helper function to normalize section names
        const normalizeSection = (section) => {
          if (!section || section.trim() === "") return "No Section";
          return section
            .trim()
            .replace(/^SECTION\s*/i, "")
            .trim()
            .toUpperCase();
        };

        // Group questions by section to check section marks
        const questionsBySectionForValidation = {};
        formData.questions.forEach((q) => {
          const normalizedSection = normalizeSection(q.section);
          if (!questionsBySectionForValidation[normalizedSection]) {
            questionsBySectionForValidation[normalizedSection] = [];
          }
          questionsBySectionForValidation[normalizedSection].push(q);
        });

        const validQuestions = formData.questions.filter((q) => {
          // Must have question text
          if (!q.questionText || !q.questionText.trim()) return false;

          const normalizedSection = normalizeSection(q.section);

          // If question is in a section, check if section has marks set
          if (normalizedSection !== "No Section") {
            const sectionQuestions =
              questionsBySectionForValidation[normalizedSection] || [];
            // Check if any question in this section has section marks (they should all have the same value)
            const firstQuestionWithMarks = sectionQuestions.find((sq) => {
              if (!sq.sectionMarks) return false;
              // Handle both string and number types
              if (typeof sq.sectionMarks === "string") {
                return (
                  sq.sectionMarks.trim() !== "" && parseInt(sq.sectionMarks) > 0
                );
              } else if (typeof sq.sectionMarks === "number") {
                return sq.sectionMarks > 0;
              }
              return false;
            });
            return !!firstQuestionWithMarks;
          }

          // If question is not in a section, check for individual marks
          return q.marks && parseInt(q.marks) > 0;
        });

        if (validQuestions.length === 0) {
          setError(
            "Please ensure all questions have text and valid marks (or section marks for questions in sections)."
          );
          setIsSubmitting(false);
          return;
        }

        const selectedYear = academicYears.find(
          (year) => year._id === formData.academicYearId
        );

        payload = {
          ...formData,
          subjectId: formData.subjectId,
          subjectName: selectedSubject.name || "",
          subjectCode: selectedSubject.code || "",
          academicYearId: formData.academicYearId || "",
          academicYearCode: selectedYear?.code || "",
          academicYearName: selectedYear?.name || "",
          paperType: formData.paperType || "Paper 1",
          questionPaperNumber: formData.questionPaperNumber || "",
          professorName: formData.professorName || "",
          professorEmployeeId: formData.professorEmployeeId || "",
          examinationType: formData.examinationType || "Regular",
          questions: validQuestions,
        };

        // Generate PDF before submitting - ALWAYS regenerate with latest form data
        try {
          // Ensure we're using the latest formData for PDF generation
          console.log("Generating PDF with questions:", validQuestions.length);
          const pdf = new jsPDF();
          const pageWidth = pdf.internal.pageSize.getWidth();
          const margin = 20;
          let yPos = margin;

          // Add Logo at the top
          try {
            const logoBase64 = await loadLogoAsBase64();
            const logoWidth = 20; // mm
            const logoHeight = 20; // mm
            const logoX = (pageWidth - logoWidth) / 2; // Center horizontally
            pdf.addImage(logoBase64, "PNG", logoX, yPos, logoWidth, logoHeight);
            yPos += logoHeight + 5; // Add space after logo
          } catch (err) {
            console.error("Error adding logo to PDF:", err);
            // Continue without logo if there's an error
          }

          // Header - University Name
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.text("ADIKAVI NANNAYA UNIVERSITY", pageWidth / 2, yPos, {
            align: "center",
          });
          yPos += 7;

          // Location
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.text("RAJAHMUNDRY", pageWidth / 2, yPos, { align: "center" });
          yPos += 10;

          // Paper Type
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "normal");
          pdf.text("Model Question Paper", pageWidth / 2, yPos, {
            align: "center",
          });
          yPos += 5;

          // Subject with code
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          const subjectDisplay = payload.subjectCode
            ? `${payload.paperType} ${payload.subjectName} (${payload.subjectCode})`
            : `${payload.paperType} ${payload.subjectName}`;
          pdf.text(subjectDisplay, pageWidth / 2, yPos, { align: "center" });
          yPos += 5;

          // Academic Year
          if (payload.academicYearCode || payload.academicYearName) {
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(
              `Academic Year: ${payload.academicYearCode || payload.academicYearName
              }`,
              pageWidth / 2,
              yPos,
              { align: "center" }
            );
            yPos += 5;
          }

          // Question Paper Number
          // if (payload.questionPaperNumber) {
          //   pdf.setFontSize(10);
          //   pdf.setFont("helvetica", "bold");
          //   pdf.text(
          //     `Question Paper No: ${payload.questionPaperNumber}`,
          //     pageWidth / 2,
          //     yPos,
          //     { align: "center" }
          //   );
          //   yPos += 5;
          // }

          // Professor Details
          // if (payload.professorName || payload.professorEmployeeId) {
          //   pdf.setFontSize(10);
          //   pdf.setFont("helvetica", "normal");
          //   const professorDisplay = payload.professorName
          //     ? `Professor: ${payload.professorName}${
          //         payload.professorEmployeeId
          //           ? ` (ID: ${payload.professorEmployeeId})`
          //           : ""
          //       }`
          //     : payload.professorEmployeeId
          //     ? `Professor ID: ${payload.professorEmployeeId}`
          //     : "";
          //   if (professorDisplay) {
          //     pdf.text(professorDisplay, pageWidth / 2, yPos, {
          //       align: "center",
          //     });
          //     yPos += 5;
          //   }
          // }

          yPos += 3;

          // Time and Max Marks on same line
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          let duration = payload.duration || "3 hours";
          // If duration already contains time unit (hours, mins, minutes, etc.), use as is
          // Otherwise, append "Hours" for backward compatibility
          const hasTimeUnit = /(hours?|mins?|minutes?|hrs?|h|m)\s*$/i.test(
            duration.trim()
          );
          if (!hasTimeUnit && !isNaN(duration)) {
            // If it's just a number, append "Hours"
            duration = `${duration} Hours`;
          }
          const headerTotalMarks =
            payload.totalMarks ||
            validQuestions.reduce(
              (sum, q) => sum + (parseInt(q.marks) || 0),
              0
            );
          pdf.text(`Time: ${duration}`, margin, yPos);
          pdf.text(
            `Max. Marks: ${headerTotalMarks}`,
            pageWidth - margin,
            yPos,
            { align: "right" }
          );
          yPos += 10;

          // Questions
          pdf.setFontSize(11);

          // Group questions by section
          const questionsBySection = {};
          validQuestions.forEach((q) => {
            const section = q.section || "No Section";
            if (!questionsBySection[section]) {
              questionsBySection[section] = [];
            }
            questionsBySection[section].push(q);
          });

          // Calculate section marks and get section instructions
          const sectionMarks = {};
          const sectionInstructions = {};
          Object.keys(questionsBySection).forEach((section) => {
            const firstQuestion = questionsBySection[section][0];
            // Use sectionMarks from first question if available, otherwise calculate from question marks
            const sectionMarksValue = firstQuestion?.sectionMarks;
            // Handle both string and number types for sectionMarks
            if (
              sectionMarksValue !== undefined &&
              sectionMarksValue !== null &&
              sectionMarksValue !== ""
            ) {
              // If it's a string, check if it's not empty after trimming
              if (typeof sectionMarksValue === "string") {
                if (sectionMarksValue.trim() !== "") {
                  sectionMarks[section] = parseInt(sectionMarksValue) || 0;
                } else {
                  // Empty string, fall back to calculating from question marks
                  sectionMarks[section] = questionsBySection[section].reduce(
                    (sum, q) => sum + (parseInt(q.marks) || 0),
                    0
                  );
                }
              } else if (typeof sectionMarksValue === "number") {
                // It's already a number
                sectionMarks[section] =
                  sectionMarksValue > 0 ? sectionMarksValue : 0;
                // If 0 or negative, fall back to calculating from question marks
                if (sectionMarks[section] === 0) {
                  sectionMarks[section] = questionsBySection[section].reduce(
                    (sum, q) => sum + (parseInt(q.marks) || 0),
                    0
                  );
                }
              } else {
                // Other type, fall back to calculating from question marks
                sectionMarks[section] = questionsBySection[section].reduce(
                  (sum, q) => sum + (parseInt(q.marks) || 0),
                  0
                );
              }
            } else {
              // Fall back to calculating from individual question marks
              sectionMarks[section] = questionsBySection[section].reduce(
                (sum, q) => sum + (parseInt(q.marks) || 0),
                0
              );
            }
            // Get instruction from first question in section, or default
            sectionInstructions[section] =
              firstQuestion?.sectionInstruction || "Answer All Questions.";
          });

          // Sort sections: extract numbers and sort numerically, "No Section" goes last
          const sortedSections = Object.keys(questionsBySection).sort(
            (a, b) => {
              if (a === "No Section") return 1; // "No Section" goes to end
              if (b === "No Section") return -1;

              // Helper function to convert Roman numerals to numbers
              const romanToNumber = (roman) => {
                const romanMap = {
                  I: 1,
                  II: 2,
                  III: 3,
                  IV: 4,
                  V: 5,
                  VI: 6,
                  VII: 7,
                  VIII: 8,
                  IX: 9,
                  X: 10,
                };
                return romanMap[roman.toUpperCase()] || null;
              };

              // Extract numbers from section names (e.g., "1", "2", "Section 1" -> 1, "Section 2" -> 2, "I" -> 1, "II" -> 2)
              const getSectionNumber = (sectionName) => {
                // First try to extract Arabic number
                const arabicMatch = sectionName.match(/\d+/);
                if (arabicMatch) return parseInt(arabicMatch[0]);

                // Then try Roman numerals (I, II, III, etc.)
                const romanMatch = sectionName.match(/\b([IVX]+)\b/i);
                if (romanMatch) {
                  const romanNum = romanToNumber(romanMatch[1]);
                  if (romanNum) return romanNum;
                }

                // Extract single letter (A=1, B=2, etc.)
                const letterMatch = sectionName.match(/\b([A-Z])\b/);
                if (letterMatch) {
                  return letterMatch[1].charCodeAt(0) - 64; // A=1, B=2, etc.
                }

                return 999; // If no number found, put at end
              };

              const numA = getSectionNumber(a);
              const numB = getSectionNumber(b);

              if (numA !== numB) return numA - numB;
              // If same number, sort alphabetically
              return a.localeCompare(b);
            }
          );

          // Process questions section by section with continuous numbering
          let globalQuestionNumber = 0;
          sortedSections.forEach((section) => {
            const sectionQuestions = questionsBySection[section];

            // Section header
            if (section !== "No Section") {
              yPos += 5;

              // Section heading - centered, bold, prominent (format: "SECTION -A")
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(13);
              let sectionText = section.toUpperCase().trim();
              if (!sectionText.includes("SECTION")) {
                // Extract letter if it's like "A", "Section A", etc.
                const sectionLetter =
                  sectionText.replace(/SECTION\s*/i, "").trim() || "A";
                sectionText = `SECTION -${sectionLetter}`;
              } else {
                // If it already has SECTION, format it properly with space and dash
                sectionText = sectionText
                  .replace(/SECTION\s*/i, "SECTION -")
                  .replace(/\s+/g, " ")
                  .trim();
                // Ensure format is "SECTION -A" (space before dash)
                if (!sectionText.includes(" -")) {
                  sectionText = sectionText
                    .replace("SECTION", "SECTION -")
                    .replace(/\s+/g, " ");
                }
              }
              pdf.text(sectionText, pageWidth / 2, yPos, { align: "center" });
              yPos += 6;

              // Count questions in this section
              const questionCount = sectionQuestions.length;
              const sectionTotalMarks = sectionMarks[section] || 0;
              const marksPerQuestion =
                questionCount > 0
                  ? Math.round(sectionTotalMarks / questionCount)
                  : 0;

              // Instruction and marks on same line below section heading (dynamic instruction)
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(10);
              const instruction =
                sectionInstructions[section] || "Answer All Questions.";
              pdf.text(instruction, margin, yPos);
              pdf.setFont("helvetica", "normal");
              pdf.text(
                `${questionCount}X${marksPerQuestion}=${sectionTotalMarks}`,
                pageWidth - margin,
                yPos,
                { align: "right" }
              );

              yPos += 8;
              pdf.setFontSize(11);
              pdf.setFont("helvetica", "normal");
            }

            // Questions in this section
            sectionQuestions.forEach((q, sectionIndex) => {
              globalQuestionNumber++;
              if (yPos > 270) {
                pdf.addPage();
                yPos = margin;
              }

              // Question number (continuous across all sections) - always show
              const questionWidth = pageWidth - 2 * margin;

              // Show question number and question text
              const hasAlternative = q.showOr === true && q.alternativeQuestion;
              const hasSubQuestions =
                q.subQuestions && q.subQuestions.length > 0;

              // Show question text if: has sub-questions OR (no sub-questions AND no alternative)
              if (hasSubQuestions || (!hasSubQuestions && !hasAlternative)) {
                const questionText = `${globalQuestionNumber}) ${q.questionText || ""
                  }`;
                const lines = pdf.splitTextToSize(questionText, questionWidth);
                pdf.text(lines, margin, yPos);
                yPos += lines.length * 6;
                pdf.setFontSize(11);
                yPos += 3;
              } else {
                // Just show question number if question text will be shown as sub-question "a"
                pdf.text(`${globalQuestionNumber})`, margin, yPos);
                yPos += 6;
                pdf.setFontSize(11);
                yPos += 3;
              }

              // Helper function to convert number to roman numeral
              const toRoman = (num) => {
                const roman = [
                  "i",
                  "ii",
                  "iii",
                  "iv",
                  "v",
                  "vi",
                  "vii",
                  "viii",
                  "ix",
                  "x",
                ];
                return num <= roman.length ? roman[num - 1] : num.toString();
              };

              const mainItems = [];
              const alternativeItem =
                q.showOr === true && q.alternativeQuestion
                  ? q.alternativeQuestion
                  : null;

              // If main question has sub-questions, add them
              if (q.subQuestions && q.subQuestions.length > 0) {
                // Add main question sub-questions
                q.subQuestions.forEach((subQ) => {
                  mainItems.push(subQ);
                });
              } else if (q.questionText && alternativeItem) {
                // If no sub-questions but has question text AND alternative exists, treat question text as "a"
                mainItems.push({
                  text: q.questionText,
                  showOr: false,
                  isMainQuestionText: true,
                });
              }

              // Add all main question items
              // Only show letters (a, b, c) if alternative question exists
              if (mainItems.length > 0) {
                let subIndex = 0;
                mainItems.forEach((item, idx) => {
                  if (yPos > 270) {
                    pdf.addPage();
                    yPos = margin;
                  }

                  // Add (Or) before this sub-question if previous one had showOr enabled
                  if (idx > 0 && mainItems[idx - 1].showOr === true) {
                    yPos += 2;
                    pdf.setFontSize(10);
                    pdf.setFont("helvetica", "normal");
                    pdf.text("(Or)", pageWidth / 2, yPos, { align: "center" });
                    yPos += 5;
                  }

                  // Only use letters (a, b, c) if alternative question exists
                  const subLabel = alternativeItem
                    ? subIndex === 0
                      ? "a)"
                      : subIndex === 1
                        ? "b)"
                        : String.fromCharCode(97 + subIndex) + ")"
                    : "";
                  const subText = subLabel
                    ? `${subLabel} ${item.text || ""}`
                    : item.text || "";
                  const subLines = pdf.splitTextToSize(
                    subText,
                    questionWidth - 10
                  );
                  pdf.setFontSize(10);
                  pdf.text(subLines, margin + 10, yPos);
                  yPos += subLines.length * 5;
                  subIndex++;
                });
                yPos += 3;
              }

              // Add alternative question
              if (alternativeItem) {
                // Add (Or) before alternative if there are main items
                if (mainItems.length > 0) {
                  if (yPos > 270) {
                    pdf.addPage();
                    yPos = margin;
                  }
                  yPos += 2;
                  pdf.setFontSize(10);
                  pdf.setFont("helvetica", "normal");
                  pdf.text("(Or)", pageWidth / 2, yPos, { align: "center" });
                  yPos += 5;
                }

                // Alternative question text as "b)"
                if (alternativeItem.questionText) {
                  if (yPos > 270) {
                    pdf.addPage();
                    yPos = margin;
                  }
                  const altText = `b) ${alternativeItem.questionText}`;
                  const altLines = pdf.splitTextToSize(
                    altText,
                    questionWidth - 10
                  );
                  pdf.setFontSize(10);
                  pdf.text(altLines, margin + 10, yPos);
                  yPos += altLines.length * 5;
                }

                // Alternative question sub-questions as roman numerals nested under "b)"
                if (
                  alternativeItem.subQuestions &&
                  alternativeItem.subQuestions.length > 0
                ) {
                  alternativeItem.subQuestions.forEach((subQ, altIdx) => {
                    if (yPos > 270) {
                      pdf.addPage();
                      yPos = margin;
                    }

                    // Add (Or) before this sub-question if previous one had showOr enabled
                    if (
                      altIdx > 0 &&
                      alternativeItem.subQuestions[altIdx - 1].showOr === true
                    ) {
                      yPos += 2;
                      pdf.setFontSize(10);
                      pdf.setFont("helvetica", "normal");
                      pdf.text("(Or)", pageWidth / 2, yPos, {
                        align: "center",
                      });
                      yPos += 5;
                    }

                    const romanLabel = toRoman(altIdx + 1);
                    const subText = `${romanLabel}) ${subQ.text || ""}`;
                    const subLines = pdf.splitTextToSize(
                      subText,
                      questionWidth - 10
                    );
                    pdf.setFontSize(10);
                    pdf.text(subLines, margin + 20, yPos); // Extra indentation for nested sub-questions
                    yPos += subLines.length * 5;
                  });
                  yPos += 3;
                }
              }

              // Add options for MCQ
              if (
                q.questionType === "MCQ" &&
                q.options &&
                q.options.length > 0
              ) {
                q.options.forEach((option, optIndex) => {
                  if (yPos > 270) {
                    pdf.addPage();
                    yPos = margin;
                  }
                  const optionText = `   ${String.fromCharCode(
                    65 + optIndex
                  )}. ${option}`;
                  const optionLines = pdf.splitTextToSize(
                    optionText,
                    questionWidth - 10
                  );
                  pdf.setFontSize(10);
                  pdf.text(optionLines, margin + 10, yPos);
                  yPos += optionLines.length * 5;
                });
                yPos += 3;
              }

              // Note: Alternative question sub-questions are already merged above with main sub-questions
              // If alternative question has MCQ or Match the Following, add them here
              if (q.showOr === true && q.alternativeQuestion) {
                // Add options for MCQ in alternative (if no sub-questions, show MCQ options)
                if (
                  q.alternativeQuestion.questionType === "MCQ" &&
                  q.alternativeQuestion.options &&
                  q.alternativeQuestion.options.length > 0 &&
                  (!q.alternativeQuestion.subQuestions ||
                    q.alternativeQuestion.subQuestions.length === 0)
                ) {
                  q.alternativeQuestion.options.forEach((option, optIndex) => {
                    if (yPos > 270) {
                      pdf.addPage();
                      yPos = margin;
                    }
                    const optionText = `   ${String.fromCharCode(
                      65 + optIndex
                    )}. ${option}`;
                    const optionLines = pdf.splitTextToSize(
                      optionText,
                      questionWidth - 10
                    );
                    pdf.setFontSize(10);
                    pdf.text(optionLines, margin + 10, yPos);
                    yPos += optionLines.length * 5;
                  });
                  yPos += 3;
                }

                // Add matching pairs for alternative (if no sub-questions, show matching pairs)
                if (
                  q.alternativeQuestion.questionType ===
                  "Match the Following" &&
                  q.alternativeQuestion.matchingPairs &&
                  q.alternativeQuestion.matchingPairs.length > 0 &&
                  (!q.alternativeQuestion.subQuestions ||
                    q.alternativeQuestion.subQuestions.length === 0)
                ) {
                  q.alternativeQuestion.matchingPairs.forEach(
                    (pair, pairIndex) => {
                      if (yPos > 270) {
                        pdf.addPage();
                        yPos = margin;
                      }
                      const pairText = `   ${pair.left || "___"} → ${pair.right || "___"
                        }`;
                      const pairLines = pdf.splitTextToSize(
                        pairText,
                        questionWidth - 10
                      );
                      pdf.setFontSize(10);
                      pdf.text(pairLines, margin + 10, yPos);
                      yPos += pairLines.length * 5;
                    }
                  );
                  yPos += 3;
                }
              }

              // Add options for True/False
              if (q.questionType === "True/False") {
                if (yPos > 270) {
                  pdf.addPage();
                  yPos = margin;
                }
                pdf.setFontSize(10);
                pdf.text(`   ( ) True`, margin + 10, yPos);
                yPos += 5;
                pdf.text(`   ( ) False`, margin + 10, yPos);
                yPos += 5;
              }

              // Add matching pairs for Match the Following
              if (
                q.questionType === "Match the Following" &&
                q.matchingPairs &&
                q.matchingPairs.length > 0
              ) {
                q.matchingPairs.forEach((pair) => {
                  if (yPos > 270) {
                    pdf.addPage();
                    yPos = margin;
                  }
                  pdf.setFontSize(10);
                  const pairText = `   ${pair.left || "___"} → ${pair.right || "___"
                    }`;
                  const pairLines = pdf.splitTextToSize(
                    pairText,
                    questionWidth - 10
                  );
                  pdf.text(pairLines, margin + 10, yPos);
                  yPos += pairLines.length * 5;
                });
                yPos += 3;
              }

              // Add options for Fill in the Blanks
              if (
                q.questionType === "Fill in the Blanks" &&
                q.options &&
                q.options.length > 0
              ) {
                if (yPos > 270) {
                  pdf.addPage();
                  yPos = margin;
                }
                pdf.setFontSize(10);
                const answersText = `   Possible answers: ${Array.isArray(q.options) ? q.options.join(", ") : q.options
                  }`;
                const answersLines = pdf.splitTextToSize(
                  answersText,
                  questionWidth - 10
                );
                pdf.text(answersLines, margin + 10, yPos);
                yPos += answersLines.length * 5;
              }

              pdf.setFontSize(11);
              yPos += 8;
            });
          });

          // Footer
          const calculatedTotalMarks = validQuestions.reduce((sum, q) => {
            return sum + (parseInt(q.marks) || 0);
          }, 0);
          const totalMarks = payload.totalMarks || calculatedTotalMarks;
          pdf.setFontSize(10);
          pdf.text(`Total Marks: ${totalMarks}`, margin, 280);

          // Generate PDF as base64 string for storage (NOT downloaded for confidentiality)
          // Convert PDF to base64 directly
          const pdfOutput = pdf.output("datauristring");
          const base64Pdf = pdfOutput.split(",")[1]; // Remove data:application/pdf;base64, prefix

          // ALWAYS set the PDF in payload - this ensures updated PDF is saved
          payload.pdfBase64 = base64Pdf;
          payload.pdfFileName = `${payload.subjectCode
            }_${payload.paperType.replace(" ", "_")}_${Date.now()}.pdf`;
          payload.status = "Submitted"; // Mark as submitted
          payload.submittedAt = new Date().toISOString();

          console.log(
            "PDF generated successfully, size:",
            base64Pdf.length,
            "characters"
          );
        } catch (pdfErr) {
          console.error("Error generating PDF:", pdfErr);
          // If PDF generation fails, show error and stop submission
          // This ensures we don't save with old PDF when updating
          setError(
            `Failed to generate PDF: ${pdfErr.message || "Unknown error"
            }. Please check your questions and try again.`
          );
          setIsSubmitting(false);
          return;
        }

        // Verify PDF was generated - if not, don't submit
        if (!payload.pdfBase64 || payload.pdfBase64.length === 0) {
          console.error("PDF generation completed but pdfBase64 is empty");
          setError("Failed to generate PDF. Please try again.");
          setIsSubmitting(false);
          return;
        }

        // Ensure status is set
        if (!payload.status) {
          payload.status = "Submitted";
          payload.submittedAt = new Date().toISOString();
        }
      } else if (tabKey === "subjectProfessorMapping") {
        // Find the timetable entry to get subject details
        const timetableEntry = timetableEntries.find(
          (entry) =>
            entry.subjectId === formData.subjectId &&
            entry.paperType === formData.paperType
        );

        const selectedProfessor = professors.find(
          (prof) => prof._id === formData.professorId
        );

        if (!formData.subjectId || !formData.paperType) {
          setError(
            "Please select a subject and paper type from the timetable."
          );
          setIsSubmitting(false);
          return;
        }

        if (!formData.professorId || !selectedProfessor) {
          setError("Please select a professor.");
          setIsSubmitting(false);
          return;
        }

        payload = {
          ...formData,
          subjectId: formData.subjectId,
          subjectName:
            timetableEntry?.subjectName || formData.subjectName || "",
          subjectCode:
            timetableEntry?.subjectCode || formData.subjectCode || "",
          paperType: formData.paperType,
          professorId: formData.professorId,
          professorName: selectedProfessor.name || "",
          professorCode: selectedProfessor.professorId || "",
          status: formData.status || "Active",
          notes: formData.notes?.trim() || "",
        };
      } else if (tabKey === "examinationFees") {
        // Collect all selected subjects from all semesters
        const allSelectedSubjects = [];
        Object.keys(formData).forEach((key) => {
          if (
            key.startsWith("selectedSubjects_") &&
            Array.isArray(formData[key])
          ) {
            allSelectedSubjects.push(...formData[key]);
          }
        });

        // Validate that at least one subject is selected
        if (allSelectedSubjects.length === 0) {
          setError("Please select at least one subject from any semester.");
          setIsSubmitting(false);
          return;
        }

        // Validate other required fields
        if (!formData.courseId || !formData.streamId) {
          setError("Please select course and stream.");
          setIsSubmitting(false);
          return;
        }

        // Build semester-subjects mapping
        const semesterSubjectsMap = {};
        Object.keys(formData).forEach((key) => {
          if (key.startsWith("selectedSubjects_")) {
            const semesterNum = key.replace("selectedSubjects_", "");
            semesterSubjectsMap[semesterNum] = formData[key] || [];
          }
        });

        payload = {
          ...formData,
          campusId: formData.campusId || "",
          courseId: formData.courseId || "",
          streamId: formData.streamId || "",
          academicYearId: formData.academicYearId || "",
          selectedSubjectIds: allSelectedSubjects,
          semesterSubjectsMap: semesterSubjectsMap,
          mode: formData.mode || "",
          years: formData.years || [],
        };
      } else if (tabKey === "students") {
        const selectedCourse = courses.find(
          (course) => course._id === formData.courseId
        );
        const selectedStream = streamsData.find(
          (stream) => stream._id === formData.streamId
        );
        const selectedCollege = colleges.find(
          (college) => college._id === formData.collegeId
        );

        payload = {
          ...formData,
          studentId: formData.studentId || "",
          collegeId: formData.collegeId || "",
          collegeCode: selectedCollege?.code || "",
          collegeName: selectedCollege?.name || "",
          courseId: formData.courseId || "",
          courseCode: selectedCourse?.code || "",
          courseName: selectedCourse?.name || "",
          streamId: formData.streamId || "",
          streamCode: selectedStream?.code || "",
          streamName: selectedStream?.name || "",
          notes: formData.notes?.trim() || "",
        };
      } else if (tabKey === "examCenterCollegeMapping") {
        const selectedCenter = examCentersData.find(
          (center) => center._id === formData.examCenterId
        );
        const selectedCollege = colleges.find(
          (college) => college._id === formData.collegeId
        );

        payload = {
          ...formData,
          examCenterId: formData.examCenterId || "",
          examCenterName: selectedCenter?.name || "",
          examCenterCode: selectedCenter?.code || "",
          collegeId: formData.collegeId || "",
          collegeName: selectedCollege?.name || "",
          collegeCode: selectedCollege?.code || "",
          notes: formData.notes?.trim() || "",
        };
      } else if (tabKey === "examCenterStudentMapping") {
        const selectedCenter = examCentersData.find(
          (center) => center._id === formData.examCenterId
        );
        const selectedCollege = colleges.find(
          (college) => college._id === formData.collegeId
        );

        const fromRoll = (formData.fromRoll || "").trim();
        const toRoll = (formData.toRoll || "").trim();

        if (!formData.collegeId) {
          setError("Please select a college or campus.");
          setIsSubmitting(false);
          return;
        }

        if (!fromRoll || !toRoll) {
          setError("Please enter both start and end roll numbers.");
          setIsSubmitting(false);
          return;
        }

        payload = {
          ...formData,
          examCenterId: formData.examCenterId || "",
          examCenterName: selectedCenter?.name || "",
          examCenterCode: selectedCenter?.code || "",
          collegeId: formData.collegeId || "",
          collegeName: selectedCollege?.name || "",
          collegeCode: selectedCollege?.code || "",
          fromRoll,
          toRoll,
          notes: formData.notes?.trim() || "",
        };
      } else if (tabKey === "roomStudentMapping") {
        const selectedCenter = examCentersData.find(
          (center) => center._id === formData.examCenterId
        );
        const selectedCollege = colleges.find(
          (college) => college._id === formData.collegeId
        );

        const fromRoll = (formData.fromRoll || "").trim();
        const toRoll = (formData.toRoll || "").trim();

        if (!formData.roomName) {
          setError("Please enter a room name.");
          setIsSubmitting(false);
          return;
        }

        if (!formData.examCenterId) {
          setError("Please select an examination center.");
          setIsSubmitting(false);
          return;
        }

        if (!formData.collegeId) {
          setError("Please select a college or campus.");
          setIsSubmitting(false);
          return;
        }

        if (!fromRoll || !toRoll) {
          setError("Please enter both start and end roll numbers.");
          setIsSubmitting(false);
          return;
        }

        payload = {
          ...formData,
          roomName: formData.roomName.trim(),
          roomCode: formData.roomCode?.trim() || "",
          examCenterId: formData.examCenterId || "",
          examCenterName: selectedCenter?.name || "",
          examCenterCode: selectedCenter?.code || "",
          collegeId: formData.collegeId || "",
          collegeName: selectedCollege?.name || "",
          collegeCode: selectedCollege?.code || "",
          fromRoll,
          toRoll,
          invigilatorName: formData.invigilatorName?.trim() || "",
          notes: formData.notes?.trim() || "",
        };
      } else if (tabKey === "examCenterQuestionPaperMapping") {
        const selectedCenter = examCentersData.find(
          (center) => center._id === formData.examCenterId
        );
        const selectedQuestionPaper = questionPapers.find(
          (qp) => qp._id === formData.questionPaperId
        );

        if (!formData.examCenterId || !selectedCenter) {
          setError("Please select an examination center.");
          setIsSubmitting(false);
          return;
        }

        if (!formData.questionPaperId || !selectedQuestionPaper) {
          setError("Please select a question paper.");
          setIsSubmitting(false);
          return;
        }

        payload = {
          ...formData,
          examCenterId: formData.examCenterId || "",
          examCenterName: selectedCenter?.name || "",
          examCenterCode: selectedCenter?.code || "",
          questionPaperId: formData.questionPaperId || "",
          questionPaperNumber: selectedQuestionPaper?.questionPaperNumber || "",
          subjectName: selectedQuestionPaper?.subjectName || "",
          subjectCode: selectedQuestionPaper?.subjectCode || "",
          paperType: selectedQuestionPaper?.paperType || "",
          status: formData.status || "Active",
          notes: formData.notes?.trim() || "",
        };
      }

      // Log payload before submitting to verify PDF is included
      if (tabKey === "questionPaper") {
        console.log(
          "Submitting question paper with PDF:",
          payload.pdfBase64 ? "Yes" : "No"
        );
        if (payload.pdfBase64) {
          console.log("PDF size:", payload.pdfBase64.length, "characters");
        }
      }

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    // Check if we're editing (has _id or id) vs adding new (only has courseId or other initial fields)
    const isEditing = initialData && (initialData._id || initialData.id);
    const action = isEditing ? "Edit" : "Add New";
    const titles = {
      academicYears: "Academic Year",
      semesters: "Semester",
      examinationTypes: "Examination Type",
      subjects: "Subject",
      students: "Student",
      subjectCourseMapping: "Subject-Course Mapping",
      examinationCenters: "Examination Center",
      streams: "Stream",
      courseStreamMapping: "Course-Stream Mapping",
      streamSubjectMapping: "Stream-Subject Mapping",
      examCenterCollegeMapping: "Exam Center-College Mapping",
      examCenterStudentMapping: "Exam Center-Student Mapping",
      roomStudentMapping: "Room-Student Mapping",
      examCenterQuestionPaperMapping: "Exam Center-Question Paper Mapping",
      courseAcademicYearMapping: "Course-Academic Year Mapping",
      academicYearSemesterMapping: "Academic Year-Semester Mapping",
      examinationFees: "Examination Fee Structure",
      professors: "Professor",
      timetable: "Timetable Entry",
      questionPaper: "Question Paper",
      subjectProfessorMapping: "Subject-Professor Assignment",
      invigilators: "Invigilator",
      masterMapping: "Master Mapping",
      colleges: "College",
      courses: "Course",
      collegeCourseMapping: "College-Course Mapping",
      collegeType: "College Type",
      collegeCategory: "College Category",
      courseCategory: "College Other Category",
      examType: "Examination Type",
      examCategory: "Exam Category",
    };
    return `${action} ${titles[tabKey] || "Item"}`;
  };

  // Helper functions for college-course mapping
  useEffect(() => {
    if (
      tabKey === "collegeCourseMapping" &&
      Array.isArray(courses) &&
      courses.length > 0
    ) {
      const filtered = courses.filter(
        (course) =>
          course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(Array.isArray(courses) ? courses : []);
    }
  }, [searchTerm, courses, tabKey]);

  const handleCourseToggle = (courseId) => {
    setFormData((prev) => {
      const currentIds = prev.courseIds || [];
      const newIds = currentIds.includes(courseId)
        ? currentIds.filter((id) => id !== courseId)
        : [...currentIds, courseId];
      return { ...prev, courseIds: newIds };
    });
  };

  const selectAllCourses = () => {
    setFormData((prev) => ({
      ...prev,
      courseIds: Array.isArray(filteredCourses)
        ? filteredCourses.map((course) => course._id)
        : [],
    }));
  };

  const deselectAllCourses = () => {
    setFormData((prev) => ({
      ...prev,
      courseIds: [],
    }));
  };

  const renderFormFields = () => {
    switch (tabKey) {
      case "colleges":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  College Code*
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="Enter college code"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  College Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="Enter college name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Address Line 1*
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1 || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="Enter address line 1"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2 || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter address line 2 (optional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  City/College Location*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    placeholder="Enter city/college location"
                  />
                  {renderValidationIcon("city", formData.city)}
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  District*
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="Enter district"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  State*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    placeholder="Enter state"
                  />
                  {renderValidationIcon("state", formData.state)}
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Pincode*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.pincode ? "border-red-300" : "border-gray-200"
                      }`}
                    required
                    placeholder="Enter 6-digit pincode"
                    maxLength="6"
                    pattern="[0-9]{6}"
                  />
                  {!fieldErrors.pincode &&
                    formData.pincode &&
                    formData.pincode.length === 6 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
                        <svg
                          className="w-5 h-5 text-green-600 cursor-help"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div className="absolute right-0 top-full mt-2 w-32 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          Valid pincode
                        </div>
                      </div>
                    )}
                </div>
                {fieldErrors.pincode && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.pincode}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  College Type*
                </label>

                <div className="relative">
                  <select
                    name="collegeTypeId"
                    value={
                      formData.collegeTypeId ||
                      (typeof formData.collegeTypeId === "object" &&
                        formData.collegeTypeId?._id
                        ? formData.collegeTypeId._id
                        : "") ||
                      ""
                    }
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                    required
                  >
                    <option value="">Select College Type</option>
                    {collegeTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {renderValidationIcon(
                    "collegeTypeId",
                    formData.collegeTypeId,
                    null,
                    "College Type",
                    true
                  )}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  College Category*
                </label>

                <div className="relative">
                  <select
                    name="collegeCategoryId"
                    value={
                      formData.collegeCategoryId ||
                      (typeof formData.collegeCategoryId === "object" &&
                        formData.collegeCategoryId?._id
                        ? formData.collegeCategoryId._id
                        : "") ||
                      ""
                    }
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                    required
                  >
                    <option value="">Select College Category</option>
                    {collegeCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {renderValidationIcon(
                    "collegeCategoryId",
                    formData.collegeCategoryId,
                    null,
                    "College Category",
                    true
                  )}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College Other Category*
              </label>

              <div className="relative">
                <select
                  name="courseCategoryId"
                  value={
                    formData.courseCategoryId ||
                    (typeof formData.courseCategoryId === "object" &&
                      formData.courseCategoryId?._id
                      ? formData.courseCategoryId._id
                      : "") ||
                    ""
                  }
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                  required
                >
                  <option value="">Select College other Category</option>
                  {collegeOtherCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {renderValidationIcon(
                  "courseCategoryId",
                  formData.courseCategoryId,
                  null,
                  "College Other Category",
                  true
                )}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments || ""}
                onChange={handleInputChange}
                maxLength={250}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.comments ? "border-red-300" : "border-gray-200"
                  }`}
                rows="3"
                placeholder="Enter any remarks or additional details (max 250 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-red-600">
                  {fieldErrors.comments || ""}
                </span>
                <span className="text-xs text-gray-500">
                  {(formData.comments || "").length}/250
                </span>
              </div>
            </div>
          </>
        );

      case "courses":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter course code"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter course name"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Duration*
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., 3 years, 4 years"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments || ""}
                onChange={handleInputChange}
                maxLength={250}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.comments ? "border-red-300" : "border-gray-200"
                  }`}
                rows="3"
                placeholder="Enter any remarks or additional details (max 250 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-red-600">
                  {fieldErrors.comments || ""}
                </span>
                <span className="text-xs text-gray-500">
                  {(formData.comments || "").length}/250
                </span>
              </div>
            </div>
          </>
        );

      case "collegeCourseMapping":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select College*
              </label>
              <select
                name="collegeId"
                value={
                  formData.collegeId ||
                  (initialData && initialData?.college?._id) ||
                  ""
                }
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                required
              >
                <option value="">Choose a college</option>
                {colleges.map((college) => (
                  <option key={college._id} value={college._id}>
                    {college.name} ({college.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Courses*
                </label>
                <div className="text-xs text-emerald-600">
                  {(formData.courseIds || []).length} selected
                </div>
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={selectAllCourses}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAllCourses}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Deselect All
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <label
                        key={course._id}
                        className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(formData.courseIds || []).includes(
                            course._id
                          )}
                          onChange={() => handleCourseToggle(course._id)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {course.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Code: {course.code}
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {searchTerm
                        ? "No courses match your search"
                        : "No courses available"}
                    </div>
                  )}
                </div>
              </div>
              {((formData.courseIds && formData.courseIds.length > 0) ||
                (initialData?.courses && initialData.courses.length > 0)) && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h4 className="text-sm font-medium text-emerald-800 mb-2">
                      Selected Courses (
                      {formData.courseIds?.length ||
                        initialData?.courses?.length ||
                        0}
                      )
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(courses) && courses.length > 0
                        ? courses.filter((course) =>
                          (formData.courseIds && formData.courseIds.length > 0
                            ? formData.courseIds
                            : initialData?.courses?.map((c) => c._id) || []
                          ).includes(course._id)
                        )
                        : Array.isArray(initialData?.courses)
                          ? initialData.courses
                          : []
                      ).map((course) => (
                        <span
                          key={course._id}
                          className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full"
                        >
                          {course.code}
                          <button
                            type="button"
                            onClick={() => handleCourseToggle(course._id)}
                            className="ml-1 text-emerald-600 hover:text-emerald-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </>
        );

      case "academicYears":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Batch Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., 2024-25"
              />
            </div>
            {/* <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Academic Year*
              </label>
              <select
                name="academicYearId"
                value={formData.academicYearId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year._id} value={year._id}>
                    {year.name} ({year.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Year Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., Academic Year 2024-25"
              />
            </div> */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Start Date*
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                End Date*
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                maxLength={250}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.description ? "border-red-300" : "border-gray-200"
                  }`}
                placeholder="Enter description (max 250 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-red-600">
                  {fieldErrors.description || ""}
                </span>
                <span className="text-xs text-gray-500">
                  {(formData.description || "").length}/250
                </span>
              </div>
            </div>
            {/* <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Syllabus*
              </label>
              <textarea
                name="syllabus"
                value={formData.syllabus || ""}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="List key topics or chapters, e.g., OOP, Data Types, Algorithms"
                required
              />
            </div> */}
          </>
        );

      case "semesters":
        return (
          <>
            {/* <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course*
              </label>
              <select
                name="courseId"
                value={formData.courseId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Year*
              </label>
              <select
                name="academicYearId"
                value={formData.academicYearId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Year</option>
                {academicYears.map((year) => (
                  <option key={year._id} value={year._id}>
                    {year.name} ({year.code})
                  </option>
                ))}
              </select>
            </div> */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Number of Semesters*
              </label>
              <input
                type="number"
                name="numberOfSemesters"
                value={formData.numberOfSemesters || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                min="1"
                max="20"
                placeholder="Enter number of semesters (e.g., 1, 2, 3, 4, 5, 6, 7, 8)"
              />
              {/* <p className="mt-1 text-xs text-gray-500">
                Enter the number of semesters (e.g., 1, 2, 3, 4, 5, 6, 7, 8)
              </p> */}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                maxLength={250}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.description ? "border-red-300" : "border-gray-200"
                  }`}
                placeholder="Enter description (max 250 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-red-600">
                  {fieldErrors.description || ""}
                </span>
                <span className="text-xs text-gray-500">
                  {(formData.description || "").length}/250
                </span>
              </div>
            </div>
          </>
        );

      case "examinationTypes":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Type Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., MID, FINAL, INTERNAL"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Type Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., Mid-Term Examination"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Duration (Hours)*
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="duration"
                  value={formData.duration || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.duration ? "border-red-300" : "border-gray-200"
                    }`}
                  required
                  min="1"
                  placeholder="e.g., 3"
                />
                {renderValidationIcon("duration", formData.duration, (val) => {
                  const num = parseInt(val);
                  return !isNaN(num) && num >= 1;
                })}
              </div>
              {fieldErrors.duration && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.duration}
                </p>
              )}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Maximum Marks*
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="maxMarks"
                  value={formData.maxMarks || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.maxMarks ? "border-red-300" : "border-gray-200"
                    }`}
                  required
                  min="1"
                  placeholder="e.g., 100"
                />
                {renderValidationIcon("maxMarks", formData.maxMarks, (val) => {
                  const num = parseInt(val);
                  return !isNaN(num) && num >= 1;
                })}
              </div>
              {fieldErrors.maxMarks && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.maxMarks}
                </p>
              )}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Passing Marks*
              </label>

              <div className="relative">
                <input
                  type="number"
                  name="passingMarks"
                  value={formData.passingMarks || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.passingMarks
                      ? "border-red-300"
                      : "border-gray-200"
                    }`}
                  required
                  min="0"
                  placeholder="e.g., 40"
                />
                {renderValidationIcon(
                  "passingMarks",
                  formData.passingMarks,
                  (val) => {
                    const num = parseInt(val);
                    const maxMarks = parseInt(formData.maxMarks || 0);
                    return (
                      !isNaN(num) &&
                      num >= 0 &&
                      (maxMarks === 0 || num <= maxMarks)
                    );
                  }
                )}
              </div>

              {fieldErrors.passingMarks && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.passingMarks}
                </p>
              )}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                maxLength={250}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.description ? "border-red-300" : "border-gray-200"
                  }`}
                placeholder="Enter description (max 250 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-red-600">
                  {fieldErrors.description || ""}
                </span>
                <span className="text-xs text-gray-500">
                  {(formData.description || "").length}/250
                </span>
              </div>
            </div>
          </>
        );

      case "subjects":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Subject Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., CS101"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Subject Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., Computer Science"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                maxLength={250}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.description ? "border-red-300" : "border-gray-200"
                  }`}
                placeholder="Enter description (max 250 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-red-600">
                  {fieldErrors.description || ""}
                </span>
                <span className="text-xs text-gray-500">
                  {(formData.description || "").length}/250
                </span>
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Syllabus*
              </label>
              <textarea
                name="syllabus"
                value={formData.syllabus || ""}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="List key topics or chapters, e.g., OOP, Data Types, Algorithms"
                required
              />
            </div>
          </>
        );

      case "students":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Student ID/Reg No*
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="e.g., STU2025-001"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Student Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="Full name"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="student@example.com"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  College/Campus*
                </label>
                <select
                  name="collegeId"
                  value={formData.collegeId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college._id} value={college._id}>
                      {college.name} ({college.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Course
                </label>
                <select
                  name="courseId"
                  value={formData.courseId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select Course</option>
                  {Array.isArray(courses) &&
                    courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Stream
                </label>
                <select
                  name="streamId"
                  value={formData.streamId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select Stream</option>
                  {streamsData.map((stream) => (
                    <option key={stream._id} value={stream._id}>
                      {stream.name} ({stream.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                maxLength={250}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.notes ? "border-red-300" : "border-gray-200"
                  }`}
                placeholder="Optional remarks (max 250 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-red-600">
                  {fieldErrors.notes || ""}
                </span>
                <span className="text-xs text-gray-500">
                  {(formData.notes || "").length}/250
                </span>
              </div>
            </div>
          </>
        );

      case "examCenterCollegeMapping":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Examination Center*
              </label>
              <select
                name="examCenterId"
                value={formData.examCenterId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Examination Center</option>
                {examCentersData.map((center) => (
                  <option key={center._id} value={center._id}>
                    {center.name} ({center.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College/Campus*
              </label>
              <select
                name="collegeId"
                value={formData.collegeId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select College</option>
                {colleges.map((college) => (
                  <option key={college._id} value={college._id}>
                    {college.name} ({college.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional notes or remarks"
              />
            </div>
          </>
        );

      case "examCenterStudentMapping":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Examination Center*
              </label>
              <select
                name="examCenterId"
                value={formData.examCenterId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Examination Center</option>
                {examCentersData.map((center) => (
                  <option key={center._id} value={center._id}>
                    {center.name} ({center.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College/Campus*
              </label>
              <select
                name="collegeId"
                value={formData.collegeId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select College</option>
                {colleges.map((college) => (
                  <option key={college._id} value={college._id}>
                    {college.name} ({college.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  From Roll No.*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fromRoll"
                    value={formData.fromRoll || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.fromRoll
                        ? "border-red-300"
                        : "border-gray-200"
                      }`}
                    placeholder="Starting roll number"
                    required
                  />
                  {renderValidationIcon(
                    "fromRoll",
                    formData.fromRoll,
                    (value) => {
                      if (!value) return false;
                      const trimmed = String(value).trim();
                      if (!trimmed) return false;
                      // Allow alphanumeric values
                      const alphanumericPattern = /^[A-Za-z0-9]+$/;
                      if (!alphanumericPattern.test(trimmed)) return false;
                      if (formData.toRoll) {
                        const toTrimmed = String(formData.toRoll).trim();
                        return (
                          toTrimmed && trimmed.localeCompare(toTrimmed) < 0
                        );
                      }
                      return true;
                    }
                  )}
                </div>
                {fieldErrors.fromRoll && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.fromRoll}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  To Roll No.*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="toRoll"
                    value={formData.toRoll || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.toRoll ? "border-red-300" : "border-gray-200"
                      }`}
                    placeholder="Ending roll number"
                    required
                  />
                  {renderValidationIcon("toRoll", formData.toRoll, (value) => {
                    if (!value) return false;
                    const trimmed = String(value).trim();
                    if (!trimmed) return false;
                    // Allow alphanumeric values
                    const alphanumericPattern = /^[A-Za-z0-9]+$/;
                    if (!alphanumericPattern.test(trimmed)) return false;
                    if (formData.fromRoll) {
                      const fromTrimmed = String(formData.fromRoll).trim();
                      return (
                        fromTrimmed && trimmed.localeCompare(fromTrimmed) > 0
                      );
                    }
                    return true;
                  })}
                </div>
                {fieldErrors.toRoll && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.toRoll}
                  </p>
                )}
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional notes or remarks"
              />
            </div>
          </>
        );

      case "examCenterMappings":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Examination Center*
              </label>
              <div className="relative">
                <select
                  name="examCenterId"
                  value={formData.examCenterId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                  required
                >
                  <option value="">Select Examination Center</option>
                  {examCentersData.map((center) => (
                    <option key={center._id} value={center._id}>
                      {center.name} ({center.code})
                    </option>
                  ))}
                </select>
                {renderValidationIcon(
                  "examCenterId",
                  formData.examCenterId,
                  null,
                  "Examination Center",
                  true
                )}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College/Campus*
              </label>
              <div className="relative">
                <select
                  name="collegeId"
                  value={formData.collegeId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college._id} value={college._id}>
                      {college.name} ({college.code})
                    </option>
                  ))}
                </select>
                {renderValidationIcon(
                  "collegeId",
                  formData.collegeId,
                  null,
                  "College/Campus",
                  true
                )}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  From Roll No.*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fromRoll"
                    value={formData.fromRoll || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.fromRoll
                        ? "border-red-300"
                        : "border-gray-200"
                      }`}
                    required
                    placeholder="Starting roll number"
                  />
                  {renderValidationIcon(
                    "fromRoll",
                    formData.fromRoll,
                    (value) => {
                      if (!value) return false;
                      const trimmed = String(value).trim();
                      if (!trimmed) return false;
                      // Allow alphanumeric values
                      const alphanumericPattern = /^[A-Za-z0-9]+$/;
                      if (!alphanumericPattern.test(trimmed)) return false;
                      if (formData.toRoll) {
                        const toTrimmed = String(formData.toRoll).trim();
                        return (
                          toTrimmed && trimmed.localeCompare(toTrimmed) < 0
                        );
                      }
                      return true;
                    }
                  )}
                </div>
                {fieldErrors.fromRoll && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.fromRoll}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  To Roll No.*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="toRoll"
                    value={formData.toRoll || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.toRoll ? "border-red-300" : "border-gray-200"
                      }`}
                    required
                    placeholder="Ending roll number"
                  />
                  {renderValidationIcon("toRoll", formData.toRoll, (value) => {
                    if (!value) return false;
                    const trimmed = String(value).trim();
                    if (!trimmed) return false;
                    // Allow alphanumeric values
                    const alphanumericPattern = /^[A-Za-z0-9]+$/;
                    if (!alphanumericPattern.test(trimmed)) return false;
                    if (formData.fromRoll) {
                      const fromTrimmed = String(formData.fromRoll).trim();
                      return (
                        fromTrimmed && trimmed.localeCompare(fromTrimmed) > 0
                      );
                    }
                    return true;
                  })}
                </div>
                {fieldErrors.toRoll && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.toRoll}
                  </p>
                )}
              </div>
            </div>
            {/* Room fields hidden per request */}
            {/*
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Room Name
                </label>
                <input
                  type="text"
                  name="roomName"
                  value={formData.roomName || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Room 101 (optional)"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Room Code
                </label>
                <input
                  type="text"
                  name="roomCode"
                  value={formData.roomCode || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Optional code, e.g., R-01"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Invigilator
              </label>

              <div className="relative">
                <select
                  name="invigilatorId"
                  value={formData.invigilatorId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                >
                  <option value="">Select Invigilator</option>
                  {invigilators.map((invigilator) => (
                    <option key={invigilator._id} value={invigilator._id}>
                      {invigilator.name}{" "}
                      {invigilator.invigilatorCode
                        ? `(${invigilator.invigilatorCode})`
                        : ""}
                    </option>
                  ))}
                </select>
                {renderValidationIcon(
                  "invigilatorId",
                  formData.invigilatorId,
                  null,
                  "Invigilator",
                  true
                )}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            */}
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status || "Active"}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {renderValidationIcon(
                  "status",
                  formData.status,
                  null,
                  "Status",
                  true
                )}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter any additional notes"
              />
            </div>
          </>
        );

      case "roomStudentMapping":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Room Name*
                </label>
                <input
                  type="text"
                  name="roomName"
                  value={formData.roomName || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="e.g., Room 101"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Room Code
                </label>
                <input
                  type="text"
                  name="roomCode"
                  value={formData.roomCode || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus-border-emerald-500"
                  placeholder="Optional code, e.g., R-01"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Examination Center*
              </label>
              <select
                name="examCenterId"
                value={formData.examCenterId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Examination Center</option>
                {examCentersData.map((center) => (
                  <option key={center._id} value={center._id}>
                    {center.name} ({center.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College/Campus*
              </label>
              <select
                name="collegeId"
                value={formData.collegeId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select College</option>
                {colleges.map((college) => (
                  <option key={college._id} value={college._id}>
                    {college.name} ({college.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  From Roll No.*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fromRoll"
                    value={formData.fromRoll || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.fromRoll
                        ? "border-red-300"
                        : "border-gray-200"
                      }`}
                    required
                    placeholder="Starting roll number"
                  />
                  {renderValidationIcon(
                    "fromRoll",
                    formData.fromRoll,
                    (value) => {
                      if (!value) return false;
                      const trimmed = String(value).trim();
                      if (!trimmed) return false;
                      // Allow alphanumeric values
                      const alphanumericPattern = /^[A-Za-z0-9]+$/;
                      if (!alphanumericPattern.test(trimmed)) return false;
                      if (formData.toRoll) {
                        const toTrimmed = String(formData.toRoll).trim();
                        return (
                          toTrimmed && trimmed.localeCompare(toTrimmed) < 0
                        );
                      }
                      return true;
                    }
                  )}
                </div>
                {fieldErrors.fromRoll && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.fromRoll}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  To Roll No.*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="toRoll"
                    value={formData.toRoll || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.toRoll ? "border-red-300" : "border-gray-200"
                      }`}
                    required
                    placeholder="Ending roll number"
                  />
                  {renderValidationIcon("toRoll", formData.toRoll, (value) => {
                    if (!value) return false;
                    const trimmed = String(value).trim();
                    if (!trimmed) return false;
                    // Allow alphanumeric values
                    const alphanumericPattern = /^[A-Za-z0-9]+$/;
                    if (!alphanumericPattern.test(trimmed)) return false;
                    if (formData.fromRoll) {
                      const fromTrimmed = String(formData.fromRoll).trim();
                      return (
                        fromTrimmed && trimmed.localeCompare(fromTrimmed) > 0
                      );
                    }
                    return true;
                  })}
                </div>
                {fieldErrors.toRoll && (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.toRoll}
                  </p>
                )}
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Invigilator Name
              </label>
              <input
                type="text"
                name="invigilatorName"
                value={formData.invigilatorName || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional invigilator name"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus-border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional notes or remarks"
              />
            </div>
          </>
        );

      case "examCenterQuestionPaperMapping":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Examination Center*
              </label>
              <div className="relative">
                <select
                  name="examCenterId"
                  value={
                    formData.examCenterId ? String(formData.examCenterId) : ""
                  }
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white ${fieldErrors.examCenterId
                      ? "border-red-300"
                      : "border-gray-200"
                    }`}
                  required
                >
                  <option value="">Select Examination Center</option>
                  {examCentersData.map((center) => (
                    <option key={center._id} value={String(center._id)}>
                      {center.code} - {center.name}
                    </option>
                  ))}
                </select>
                {renderValidationIcon(
                  "examCenterId",
                  formData.examCenterId,
                  null,
                  "Examination Center",
                  true
                )}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {fieldErrors.examCenterId && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.examCenterId}
                </p>
              )}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Question Paper*
              </label>
              <div className="relative">
                <select
                  name="questionPaperId"
                  value={
                    formData.questionPaperId
                      ? String(formData.questionPaperId)
                      : ""
                  }
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white ${fieldErrors.questionPaperId
                      ? "border-red-300"
                      : "border-gray-200"
                    }`}
                  required
                >
                  <option value="">Select Question Paper</option>

                  {(() => {
                    const currentQpId = formData.questionPaperId;
                    const filteredQps = questionPapers.filter(
                      (qp) =>
                        qp.status === "Submitted" || qp.status === "Approved"
                    );

                    // Check if current QP is in the questionPapers array
                    let currentQp = currentQpId
                      ? questionPapers.find((qp) => {
                        const qpId = qp._id || qp.id;
                        return (
                          qpId === currentQpId ||
                          String(qpId) === String(currentQpId)
                        );
                      })
                      : null;

                    // If not found, check if it's in initialData as a populated object
                    if (
                      !currentQp &&
                      currentQpId &&
                      initialDataRef.current?.questionPaperId
                    ) {
                      const initialQp =
                        typeof initialDataRef.current.questionPaperId ===
                          "object"
                          ? initialDataRef.current.questionPaperId
                          : null;
                      if (initialQp) {
                        const initialQpId = initialQp._id || initialQp.id;
                        if (
                          initialQpId === currentQpId ||
                          String(initialQpId) === String(currentQpId)
                        ) {
                          currentQp = initialQp;
                        }
                      }
                    }

                    const qpsToShow = [...filteredQps];

                    // If editing and current QP is not in filtered list, add it
                    if (currentQp && currentQpId) {
                      const qpExists = qpsToShow.find((qp) => {
                        const qpId = qp._id || qp.id;
                        return (
                          qpId === currentQpId ||
                          String(qpId) === String(currentQpId)
                        );
                      });
                      if (!qpExists) {
                        qpsToShow.push(currentQp);
                      }
                    }

                    // Remove duplicates
                    const uniqueQps = qpsToShow.filter((qp, index, self) => {
                      const qpId = qp._id || qp.id;
                      return (
                        index ===
                        self.findIndex((q) => {
                          const qId = q._id || q.id;
                          return qId === qpId || String(qId) === String(qpId);
                        })
                      );
                    });

                    return uniqueQps.map((qp) => {
                      const qpId = qp._id || qp.id;
                      return (
                        <option key={qpId} value={String(qpId)}>
                          {qp.questionPaperNumber || qpId} -{" "}
                          {qp.subjectName || "-"} ({qp.subjectCode || "-"})
                        </option>
                      );
                    });
                  })()}
                </select>
                {renderValidationIcon(
                  "questionPaperId",
                  formData.questionPaperId,
                  null,
                  "Question Paper",
                  true
                )}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              {fieldErrors.questionPaperId && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.questionPaperId}
                </p>
              )}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional notes or remarks"
              />
            </div>
          </>
        );

      case "streams":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course*
              </label>
              <select
                name="courseId"
                value={formData.courseId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Stream Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., STREAM01"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Stream Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., Computer Science Stream"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                maxLength={250}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.description ? "border-red-300" : "border-gray-200"
                  }`}
                placeholder="Enter description (max 250 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-red-600">
                  {fieldErrors.description || ""}
                </span>
                <span className="text-xs text-gray-500">
                  {(formData.description || "").length}/250
                </span>
              </div>
            </div>
          </>
        );
      case "courseStreamMapping": {
        const isEditingMapping =
          initialData && (initialData._id || initialData.id);
        // Try to find course from courses array, or use the populated object from initialData
        let selectedCourse = null;
        const courseIdToFind =
          formData.courseId ||
          (typeof initialData?.courseId === "object" &&
            initialData.courseId?._id
            ? initialData.courseId._id
            : initialData?.courseId);

        if (courseIdToFind) {
          // First try stored course object (for add mode)
          if (
            formData._course &&
            (formData._course._id || formData._course.id) === courseIdToFind
          ) {
            selectedCourse = formData._course;
          }
          // Then try to find in courses array
          else if (courses.length > 0) {
            selectedCourse = courses.find(
              (c) => (c._id || c.id) === courseIdToFind
            );
          }
          // If not found and initialData has populated course object, use that
          if (
            !selectedCourse &&
            typeof initialData?.courseId === "object" &&
            initialData.courseId?.name
          ) {
            selectedCourse = initialData.courseId;
          }
          // Also check if initialData has a course object (for add mode)
          if (
            !selectedCourse &&
            initialData?.course &&
            (initialData.course._id || initialData.course.id) === courseIdToFind
          ) {
            selectedCourse = initialData.course;
          }
        }

        // Course should be fixed (read-only) in both add and edit mode since mapping is for a specific course
        const hasCourse = courseIdToFind;
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course*
              </label>
              {hasCourse ? (
                <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-700">
                  {selectedCourse
                    ? `${selectedCourse.name} (${selectedCourse.code})`
                    : courses.length > 0
                      ? (() => {
                        const foundCourse = courses.find(
                          (c) => (c._id || c.id) === courseIdToFind
                        );
                        return foundCourse
                          ? `${foundCourse.name} (${foundCourse.code})`
                          : "Loading course...";
                      })()
                      : "Loading course..."}
                </div>
              ) : (
                <select
                  name="courseId"
                  value={formData.courseId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              )}
              {/* {hasCourse && (
                <p className="text-xs text-gray-500 mt-1">Course is fixed for this mapping</p>
              )} */}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Stream*
              </label>
              <select
                name="streamId"
                value={formData.streamId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Stream</option>
                {streamsData.map((stream) => (
                  <option key={stream._id} value={stream._id}>
                    {stream.name} ({stream.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Semester Type*
              </label>
              <select
                name="semesterId"
                value={formData.semesterId || ""}
                onChange={(e) => {
                  handleInputChange(e);
                  // Initialize semesterSubjects when semester is selected
                  const selectedSem = semesters.find(
                    (s) => (s._id || s.id) === e.target.value
                  );
                  if (selectedSem && selectedSem.numberOfSemesters) {
                    const initSemesterSubjects = [];
                    for (let i = 1; i <= selectedSem.numberOfSemesters; i++) {
                      initSemesterSubjects.push({
                        semester: i,
                        subjects: [],
                      });
                    }
                    // Preserve existing data if editing
                    const existingSemesterSubjects =
                      formData.semesterSubjects || [];
                    const mergedSubjects = initSemesterSubjects.map(
                      (initSem) => {
                        const existing = existingSemesterSubjects.find(
                          (es) => es.semester === initSem.semester
                        );
                        return existing || initSem;
                      }
                    );

                    handleInputChange({
                      target: {
                        name: "semesterSubjects",
                        value: mergedSubjects,
                      },
                    });
                  }
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Semester Type</option>
                {semesters
                  .filter((sem) => {
                    // Filter by courseId if course is selected and semester has courseId
                    if (formData.courseId && sem.courseId) {
                      // Handle both populated objects and plain IDs
                      const semCourseId =
                        typeof sem.courseId === "object" && sem.courseId?._id
                          ? sem.courseId._id
                          : sem.courseId;
                      return semCourseId === formData.courseId;
                    }
                    // If no courseId on semester, show all semesters
                    return true;
                  })
                  .map((semester) => (
                    <option key={semester._id} value={semester._id}>
                      {semester.description ||
                        semester.name ||
                        semester.code ||
                        `Semester ${semester.numberOfSemesters || ""}`}
                    </option>
                  ))}
              </select>

              {formData.semesterId &&
                (() => {
                  const selectedSemesterObj =
                    semesters.find(
                      (s) => (s._id || s.id) === formData.semesterId
                    ) ||
                    (typeof initialData?.semesterId === "object" &&
                      initialData.semesterId?._id === formData.semesterId
                      ? initialData.semesterId
                      : null);
                  const numberOfSemesters =
                    selectedSemesterObj?.numberOfSemesters || 0;

                  if (!numberOfSemesters || numberOfSemesters === 0) {
                    return null;
                  }

                  // Ensure semesterSubjects is initialized
                  const currentSemesterSubjects =
                    formData.semesterSubjects || [];
                  const initializedSubjects = [];
                  for (let i = 1; i <= numberOfSemesters; i++) {
                    const existing = currentSemesterSubjects.find(
                      (s) => s.semester === i
                    );
                    initializedSubjects.push(
                      existing || {
                        semester: i,
                        subjects: [],
                      }
                    );
                  }

                  // Use initializedSubjects directly - it's already computed correctly
                  const displaySubjects =
                    initializedSubjects.length === numberOfSemesters
                      ? initializedSubjects
                      : formData.semesterSubjects || [];

                  return (
                    <div className="mb-5">
                      <label className="block mb-3 text-sm font-medium text-gray-700">
                        Subjects by Semester*
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Number of Semesters: {numberOfSemesters}
                      </p>
                      <div className="space-y-4">
                        {displaySubjects.map((semData) => {
                          const semesterNum = semData.semester;
                          const currentSemesterSubjects = Array.isArray(
                            semData.subjects
                          )
                            ? semData.subjects
                            : [];
                          const selectedSubjectIds = currentSemesterSubjects
                            .map((s) => s.subjectId)
                            .filter(Boolean);

                          return (
                            <div
                              key={semesterNum}
                              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-800">
                                  Semester {semesterNum}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {currentSemesterSubjects.length} subject
                                  {currentSemesterSubjects.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                  selected
                                </span>
                              </div>

                              {/* Subject Checkboxes */}
                              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white mb-3">
                                {subjects.length > 0 ? (
                                  subjects.map((subject) => {
                                    const isSelected =
                                      selectedSubjectIds.includes(subject._id);
                                    return (
                                      <label
                                        key={subject._id}
                                        className="flex items-center mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => {
                                            const currentSubjects =
                                              formData.semesterSubjects ||
                                              displaySubjects;
                                            const updatedSemesterSubjects = [
                                              ...currentSubjects,
                                            ];
                                            const existingIndex =
                                              updatedSemesterSubjects.findIndex(
                                                (s) =>
                                                  s.semester === semesterNum
                                              );

                                            let updatedSubjects;
                                            if (e.target.checked) {
                                              updatedSubjects = [
                                                ...currentSemesterSubjects,
                                                {
                                                  subjectId: subject._id,
                                                  maxMarks: 100,
                                                  passMarks: 40,
                                                },
                                              ];
                                            } else {
                                              updatedSubjects =
                                                currentSemesterSubjects.filter(
                                                  (s) =>
                                                    s.subjectId !== subject._id
                                                );
                                            }

                                            if (existingIndex >= 0) {
                                              updatedSemesterSubjects[
                                                existingIndex
                                              ] = {
                                                semester: semesterNum,
                                                subjects: updatedSubjects,
                                              };
                                            } else {
                                              updatedSemesterSubjects.push({
                                                semester: semesterNum,
                                                subjects: updatedSubjects,
                                              });
                                            }

                                            handleInputChange({
                                              target: {
                                                name: "semesterSubjects",
                                                value: updatedSemesterSubjects,
                                              },
                                            });
                                          }}
                                          className="mr-2 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                          {subject.name} ({subject.code})
                                        </span>
                                      </label>
                                    );
                                  })
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    No subjects available
                                  </p>
                                )}
                              </div>

                              {/* Selected Subjects with Marks */}
                              {currentSemesterSubjects.length > 0 && (
                                <div className="space-y-2 mt-3">
                                  {currentSemesterSubjects.map(
                                    (subjectItem, idx) => {
                                      const subjectId =
                                        typeof subjectItem === "object"
                                          ? subjectItem.subjectId
                                          : subjectItem;
                                      const subject = subjects.find(
                                        (s) => s._id === subjectId
                                      );
                                      if (!subject) return null;
                                      return (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200"
                                        >
                                          <span className="text-sm font-medium text-gray-700 flex-1">
                                            {subject.name} ({subject.code})
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-600">
                                              Max:
                                            </label>
                                            <input
                                              type="number"
                                              min="0"
                                              value={
                                                typeof subjectItem === "object"
                                                  ? subjectItem.maxMarks || 100
                                                  : 100
                                              }
                                              onChange={(e) => {
                                                const updatedSemesterSubjects =
                                                  [
                                                    ...(formData.semesterSubjects ||
                                                      []),
                                                  ];
                                                const existingIndex =
                                                  updatedSemesterSubjects.findIndex(
                                                    (s) =>
                                                      s.semester === semesterNum
                                                  );
                                                const updatedSubjects =
                                                  currentSemesterSubjects.map(
                                                    (s, i) =>
                                                      i === idx
                                                        ? {
                                                          ...(typeof s ===
                                                            "object"
                                                            ? s
                                                            : {
                                                              subjectId: s,
                                                            }),
                                                          maxMarks:
                                                            parseInt(
                                                              e.target.value
                                                            ) || 0,
                                                        }
                                                        : s
                                                  );
                                                if (existingIndex >= 0) {
                                                  updatedSemesterSubjects[
                                                    existingIndex
                                                  ] = {
                                                    semester: semesterNum,
                                                    subjects: updatedSubjects,
                                                  };
                                                }
                                                handleInputChange({
                                                  target: {
                                                    name: "semesterSubjects",
                                                    value:
                                                      updatedSemesterSubjects,
                                                  },
                                                });
                                              }}
                                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                            />
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-600">
                                              Pass:
                                            </label>
                                            <input
                                              type="number"
                                              min="0"
                                              value={
                                                typeof subjectItem === "object"
                                                  ? subjectItem.passMarks || 40
                                                  : 40
                                              }
                                              onChange={(e) => {
                                                const currentSubjects =
                                                  formData.semesterSubjects ||
                                                  displaySubjects;
                                                const updatedSemesterSubjects =
                                                  [...currentSubjects];
                                                const existingIndex =
                                                  updatedSemesterSubjects.findIndex(
                                                    (s) =>
                                                      s.semester === semesterNum
                                                  );
                                                const updatedSubjects =
                                                  currentSemesterSubjects.map(
                                                    (s, i) =>
                                                      i === idx
                                                        ? {
                                                          ...(typeof s ===
                                                            "object"
                                                            ? s
                                                            : {
                                                              subjectId: s,
                                                            }),
                                                          passMarks:
                                                            parseInt(
                                                              e.target.value
                                                            ) || 0,
                                                        }
                                                        : s
                                                  );
                                                if (existingIndex >= 0) {
                                                  updatedSemesterSubjects[
                                                    existingIndex
                                                  ] = {
                                                    semester: semesterNum,
                                                    subjects: updatedSubjects,
                                                  };
                                                }
                                                handleInputChange({
                                                  target: {
                                                    name: "semesterSubjects",
                                                    value:
                                                      updatedSemesterSubjects,
                                                  },
                                                });
                                              }}
                                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                                            />
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Exam Pattern
              </label>
              <input
                type="text"
                name="timePeriod"
                value={formData.timePeriod || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Yearly / Half-Yearly.."
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional notes"
              />
            </div>
          </>
        );
      }
      case "courseAcademicYearMapping":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course*
              </label>
              <select
                name="courseId"
                value={formData.courseId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Academic Year*
              </label>
              <select
                name="academicYearId"
                value={formData.academicYearId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year._id} value={year._id}>
                    {year.name} ({year.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional notes"
              />
            </div>
          </>
        );
      case "examinationFees":
        // Filter streams based on selected course using courseStreamMappings
        let availableStreams = streamsData;
        if (formData.courseId) {
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
          availableStreams = streamsData.filter((stream) =>
            streamIds.has(stream._id)
          );
        }

        // Get all semester mappings for the selected course and stream, grouped by semesterNumber
        let semesterMappingsByNumber = [];
        if (formData.courseId && formData.streamId) {
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

          // Group by semesterNumber and sort
          const grouped = {};
          allMappings.forEach((mapping) => {
            const semNumber = mapping.semesterNumber || 1;
            if (!grouped[semNumber]) {
              grouped[semNumber] = [];
            }
            grouped[semNumber].push(mapping);
          });

          // Convert to array and sort by semesterNumber
          semesterMappingsByNumber = Object.keys(grouped)
            .map((semNum) => ({
              semesterNumber: parseInt(semNum),
              mappings: grouped[semNum],
            }))
            .sort((a, b) => a.semesterNumber - b.semesterNumber);
        }

        // Helper function to get subjects from a mapping
        const getSubjectsFromMapping = (mapping) => {
          if (!mapping || !Array.isArray(mapping.subjects)) return [];
          return mapping.subjects
            .map((subj) => {
              const subjectId =
                typeof subj.subjectId === "object" && subj.subjectId?._id
                  ? subj.subjectId._id
                  : subj.subjectId || subj;
              // Find the full subject object
              const fullSubject = subjects.find((s) => s._id === subjectId);
              return (
                fullSubject || {
                  _id: subjectId,
                  name: subj.name || "Unknown",
                  code: subj.code || "",
                }
              );
            })
            .filter(Boolean);
        };

        return (
          <>
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Examination Fee Structure
              </h2>
              <p className="text-gray-600 mb-6">
                Configure the year-wise examination fee details for this course
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Select Campus*
                  </label>
                  <select
                    name="campusId"
                    value={formData.campusId || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                    required
                  >
                    <option value="">Select Campus</option>
                    {colleges.map((college) => (
                      <option key={college._id} value={college._id}>
                        {college.code || "CODE"} - {college.name || "Unnamed"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Select Course*
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          semesterId: "",
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
                        No streams mapped for this course. Please map streams in
                        Course-Stream Mapping first.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Academic Year*
                    </label>
                    <select
                      name="academicYearId"
                      value={formData.academicYearId || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                      required
                    >
                      <option value="">Choose academic year</option>
                      {academicYears.map((year) => {
                        const displayCode = year.code || "";
                        const displayName = year.name || "";
                        const displayText =
                          displayCode && displayName
                            ? `${displayCode} - ${displayName}`
                            : displayName ||
                            displayCode ||
                            `Academic Year ${year._id}`;
                        return (
                          <option key={year._id} value={year._id}>
                            {displayText}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Mode*
                  </label>
                  <select
                    name="mode"
                    value={formData.mode || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                    required
                  >
                    <option value="">Choose mode</option>
                    {feeModeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester Selection and Subjects - Show dropdown if multiple semesters */}
                {formData.courseId &&
                  formData.streamId &&
                  semesterMappingsByNumber.length > 0 && (
                    <div>
                      {semesterMappingsByNumber.length > 1 ? (
                        // Multiple semesters - show dropdown to select
                        <>
                          <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Select Semester* (
                              {semesterMappingsByNumber.length} semesters
                              available)
                            </label>
                            <select
                              name="selectedSemesterNumber"
                              value={formData.selectedSemesterNumber || ""}
                              onChange={(e) => {
                                // Reset selected subjects when semester changes
                                setFormData((prev) => ({
                                  ...prev,
                                  selectedSemesterNumber: e.target.value,
                                  [`selectedSubjects_${e.target.value}`]: [],
                                }));
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                              required
                            >
                              <option value="">Choose a semester</option>
                              {semesterMappingsByNumber.map(
                                ({ semesterNumber }) => (
                                  <option
                                    key={semesterNumber}
                                    value={semesterNumber}
                                  >
                                    Semester {semesterNumber}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* Show subjects for selected semester */}
                          {formData.selectedSemesterNumber &&
                            (() => {
                              const selectedSem = semesterMappingsByNumber.find(
                                (s) =>
                                  s.semesterNumber ===
                                  parseInt(formData.selectedSemesterNumber)
                              );
                              if (!selectedSem) return null;

                              const firstMapping = selectedSem.mappings[0];
                              const semesterSubjects =
                                getSubjectsFromMapping(firstMapping);
                              const selectedSubjectsForSem =
                                formData[
                                `selectedSubjects_${formData.selectedSemesterNumber}`
                                ] || [];

                              return (
                                <div>
                                  <label className="block mb-3 text-sm font-medium text-gray-700">
                                    Select Subjects for Semester{" "}
                                    {formData.selectedSemesterNumber}*
                                  </label>
                                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
                                    {semesterSubjects.length > 0 ? (
                                      <div className="space-y-2">
                                        {semesterSubjects.map((subject) => {
                                          const isSelected =
                                            selectedSubjectsForSem.includes(
                                              subject._id
                                            );
                                          return (
                                            <label
                                              key={subject._id}
                                              className="flex items-center p-2 bg-white rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-colors"
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                  const currentIds =
                                                    formData[
                                                    `selectedSubjects_${formData.selectedSemesterNumber}`
                                                    ] || [];
                                                  let updatedIds;
                                                  if (e.target.checked) {
                                                    updatedIds = [
                                                      ...currentIds,
                                                      subject._id,
                                                    ];
                                                  } else {
                                                    updatedIds =
                                                      currentIds.filter(
                                                        (id) =>
                                                          id !== subject._id
                                                      );
                                                  }
                                                  setFormData((prev) => ({
                                                    ...prev,
                                                    [`selectedSubjects_${formData.selectedSemesterNumber}`]:
                                                      updatedIds,
                                                  }));
                                                }}
                                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                              />
                                              <span className="ml-3 text-sm text-gray-700">
                                                <span className="font-medium">
                                                  {subject.code || "N/A"}
                                                </span>{" "}
                                                -{" "}
                                                {subject.name ||
                                                  "Unknown Subject"}
                                              </span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-amber-600 text-center py-4">
                                        No subjects found for Semester{" "}
                                        {formData.selectedSemesterNumber}
                                      </p>
                                    )}
                                  </div>
                                  {selectedSubjectsForSem.length > 0 && (
                                    <p className="mt-2 text-xs text-gray-600">
                                      {selectedSubjectsForSem.length} subject
                                      {selectedSubjectsForSem.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                      selected
                                    </p>
                                  )}
                                </div>
                              );
                            })()}
                        </>
                      ) : (
                        // Single semester - show directly
                        (() => {
                          const { semesterNumber, mappings } =
                            semesterMappingsByNumber[0];
                          const firstMapping = mappings[0];
                          const semesterSubjects =
                            getSubjectsFromMapping(firstMapping);
                          const selectedSubjectsForSem =
                            formData[`selectedSubjects_${semesterNumber}`] ||
                            [];

                          return (
                            <div>
                              <label className="block mb-3 text-sm font-medium text-gray-700">
                                Select Subjects for Semester {semesterNumber}*
                              </label>
                              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
                                {semesterSubjects.length > 0 ? (
                                  <div className="space-y-2">
                                    {semesterSubjects.map((subject) => {
                                      const isSelected =
                                        selectedSubjectsForSem.includes(
                                          subject._id
                                        );
                                      return (
                                        <label
                                          key={subject._id}
                                          className="flex items-center p-2 bg-white rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-colors"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                              const currentIds =
                                                formData[
                                                `selectedSubjects_${semesterNumber}`
                                                ] || [];
                                              let updatedIds;
                                              if (e.target.checked) {
                                                updatedIds = [
                                                  ...currentIds,
                                                  subject._id,
                                                ];
                                              } else {
                                                updatedIds = currentIds.filter(
                                                  (id) => id !== subject._id
                                                );
                                              }
                                              setFormData((prev) => ({
                                                ...prev,
                                                [`selectedSubjects_${semesterNumber}`]:
                                                  updatedIds,
                                              }));
                                            }}
                                            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                          />
                                          <span className="ml-3 text-sm text-gray-700">
                                            <span className="font-medium">
                                              {subject.code || "N/A"}
                                            </span>{" "}
                                            -{" "}
                                            {subject.name || "Unknown Subject"}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-sm text-amber-600 text-center py-4">
                                    No subjects found for Semester{" "}
                                    {semesterNumber}
                                  </p>
                                )}
                              </div>
                              {selectedSubjectsForSem.length > 0 && (
                                <p className="mt-2 text-xs text-gray-600">
                                  {selectedSubjectsForSem.length} subject
                                  {selectedSubjectsForSem.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                  selected
                                </p>
                              )}
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}

                {formData.courseId &&
                  formData.streamId &&
                  semesterMappingsByNumber.length === 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-600">
                        No semesters mapped for this course-stream combination.
                        Please add mappings in Course-Stream Mapping first.
                      </p>
                    </div>
                  )}

                <div className="pt-4">
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    Exam-wise Fees
                  </label>

                  <div className="space-y-5">
                    {(formData.years || []).map((year, yIdx) => (
                      <div
                        key={yIdx}
                        className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                          <span className="font-semibold text-gray-700">
                            Exam {year.year || yIdx + 1}
                          </span>
                          {(formData.years || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  years: prev.years.filter(
                                    (_, i) => i !== yIdx
                                  ),
                                }))
                              }
                              className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                            >
                              Remove Year
                            </button>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  S.No
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Fee Type
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Fee Amount (₹)
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Remarks
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {(year.fees || []).map((fee, fIdx) => (
                                <tr key={fIdx}>
                                  <td className="px-4 py-2">{fIdx + 1}</td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      value={fee.feeType || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => {
                                          const years = [...(prev.years || [])];
                                          years[yIdx].fees[fIdx].feeType = val;
                                          return { ...prev, years };
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="number"
                                      value={fee.feeAmount ?? 0}
                                      min="0"
                                      onChange={(e) => {
                                        const val =
                                          parseFloat(e.target.value) || 0;
                                        setFormData((prev) => {
                                          const years = [...(prev.years || [])];
                                          years[yIdx].fees[fIdx].feeAmount =
                                            val;
                                          return { ...prev, years };
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <input
                                      type="text"
                                      value={fee.remarks || ""}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData((prev) => {
                                          const years = [...(prev.years || [])];
                                          years[yIdx].fees[fIdx].remarks = val;
                                          return { ...prev, years };
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded"
                                    />
                                  </td>
                                  <td className="px-4 py-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFormData((prev) => {
                                          const years = [...(prev.years || [])];
                                          years[yIdx].fees = years[
                                            yIdx
                                          ].fees.filter((_, i) => i !== fIdx);
                                          return { ...prev, years };
                                        })
                                      }
                                      className="text-red-500 hover:text-red-700 font-medium"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-gray-50 font-semibold">
                                <td
                                  colSpan={2}
                                  className="px-4 py-2 text-right"
                                >
                                  Total
                                </td>
                                <td className="px-4 py-2">
                                  ₹
                                  {(year.fees || [])
                                    .reduce(
                                      (sum, f) =>
                                        sum + (Number(f.feeAmount) || 0),
                                      0
                                    )
                                    .toLocaleString("en-IN")}
                                </td>
                                <td colSpan={2}></td>
                              </tr>
                            </tfoot>
                          </table>

                          <div className="flex justify-end mt-3">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => {
                                  const years = [...(prev.years || [])];
                                  years[yIdx].fees = [
                                    ...(years[yIdx].fees || []),
                                    { feeType: "", feeAmount: 0, remarks: "" },
                                  ];
                                  return { ...prev, years };
                                })
                              }
                              className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Add Fee
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          years: [
                            ...(prev.years || []),
                            {
                              year: (prev.years?.length || 0) + 1,
                              fees: [
                                { feeType: "", feeAmount: 0, remarks: "" },
                              ],
                            },
                          ],
                        }))
                      }
                      className="flex items-center justify-center w-full py-3 bg-emerald-50 text-emerald-700 rounded-lg border border-dashed border-emerald-300 hover:bg-emerald-100 transition-colors duration-200 font-medium"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Another Year
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case "academicYearSemesterMapping":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Academic Year*
              </label>
              <select
                name="academicYearId"
                value={formData.academicYearId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year._id} value={year._id}>
                    {year.name} ({year.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Semester*
              </label>
              <select
                name="semesterId"
                value={formData.semesterId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Semester</option>
                {semesters.map((semester) => (
                  <option key={semester._id} value={semester._id}>
                    {semester.name} ({semester.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional notes"
              />
            </div>
          </>
        );
      case "streamSubjectMapping":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Stream*
              </label>
              <select
                name="streamId"
                value={formData.streamId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Stream</option>
                {streamsData.map((stream) => (
                  <option key={stream._id} value={stream._id}>
                    {stream.name} ({stream.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Subject*
              </label>
              <select
                name="subjectId"
                value={formData.subjectId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional notes"
              />
            </div>
          </>
        );

      case "subjectCourseMapping":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Subject*
              </label>
              <select
                name="subjectId"
                value={formData.subjectId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Course*
              </label>
              <select
                name="courseId"
                value={formData.courseId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Stream
              </label>
              <select
                name="streamId"
                value={formData.streamId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select Stream</option>
                {streamsData.map((stream) => (
                  <option key={stream._id} value={stream._id}>
                    {stream.name} ({stream.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Semester*
              </label>
              <select
                name="semesterId"
                value={formData.semesterId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Semester</option>
                {semesters.map((semester) => (
                  <option key={semester._id} value={semester._id}>
                    {semester.name} ({semester.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Academic Year*
              </label>
              <select
                name="academicYearId"
                value={formData.academicYearId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Academic Year</option>
                {academicYears.map((year) => (
                  <option key={year._id} value={year._id}>
                    {year.name} ({year.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isCore"
                  checked={formData.isCore || false}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Is Core Subject?
                </span>
              </label>
            </div>
          </>
        );

      case "invigilators":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="Enter invigilator name"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Invigilator Code*
                </label>
                <input
                  type="text"
                  name="invigilatorCode"
                  value={formData.invigilatorCode || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                  placeholder="e.g., INV-001"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  College*
                </label>
                <select
                  name="collegeId"
                  value={formData.collegeId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college._id} value={college._id}>
                      {college.name} ({college.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Role*
                </label>
                <select
                  name="role"
                  value={formData.role || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Invigilator">Invigilator</option>
                  <option value="Squad">Squad</option>
                </select>
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Year*
              </label>
              <input
                type="text"
                name="year"
                value={formData.year || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., 2024-25"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter any additional notes"
              />
            </div>
          </>
        );

      case "masterMapping": {
        const masterSemesterOptions = [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
        ];
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Course*
                </label>
                <select
                  name="courseId"
                  value={formData.courseId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                  required
                  disabled={!!initialData?.courseId}
                >
                  <option value="">Select Course</option>
                  {Array.isArray(courses) &&
                    courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                </select>
                {/* {initialData?.courseId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Course is pre-selected from the course table
                  </p>
                )} */}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Stream*
                </label>
                <select
                  name="streamId"
                  value={formData.streamId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Stream</option>
                  {streamsData.map((stream) => (
                    <option key={stream._id} value={stream._id}>
                      {stream.name} ({stream.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Number of Semesters*
                </label>
                <select
                  name="semesters"
                  value={formData.semesters || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange(e);
                    // Parse semester number and initialize subject arrays
                    if (value) {
                      const semNum = parseInt(value.replace(/[^0-9]/g, ""));
                      const newSemesterSubjects = [];
                      for (let i = 1; i <= semNum; i++) {
                        const existingData = formData.semesterSubjects?.find(
                          (s) => s.semester === i
                        );
                        newSemesterSubjects.push({
                          semester: i,
                          subjects: existingData?.subjects || [],
                        });
                      }
                      setFormData((prev) => ({
                        ...prev,
                        semesters: value,
                        semesterSubjects: newSemesterSubjects,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        semesters: "",
                        semesterSubjects: [],
                      }));
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Semester</option>
                  {masterSemesterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Course Exam Pattern*
                </label>
                <select
                  name="timePeriod"
                  value={formData.timePeriod || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Course Exam Pattern</option>
                  {timePeriodOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Semester Selection and Subject Table */}
            {formData.semesters &&
              (() => {
                const semNum = parseInt(
                  formData.semesters.replace(/[^0-9]/g, "")
                );
                if (!semNum || semNum === 0) return null;

                // Reset selected semester if it's greater than available semesters
                if (selectedSemester > semNum) {
                  setSelectedSemester(1);
                  setSelectedSubjectForSyllabus("");
                }

                // Get current semester data - use useMemo or ensure it updates when selectedSemester changes
                const currentSemesterData = (
                  formData.semesterSubjects || []
                ).find((s) => s.semester === selectedSemester) || {
                  semester: selectedSemester,
                  subjects: [],
                };
                const currentSemesterSubjects = Array.isArray(
                  currentSemesterData.subjects
                )
                  ? currentSemesterData.subjects
                  : [];
                const selectedSubjectIds = currentSemesterSubjects
                  .map((s) => s.subjectId)
                  .filter(Boolean);

                const handleSubjectToggle = (subjectId) => {
                  const isSelected = selectedSubjectIds.includes(subjectId);
                  let updatedSubjects;

                  if (isSelected) {
                    // Remove subject
                    updatedSubjects = currentSemesterSubjects.filter(
                      (s) => s.subjectId !== subjectId
                    );
                  } else {
                    // Add subject with default marks and empty syllabus
                    updatedSubjects = [
                      ...currentSemesterSubjects,
                      { subjectId, maxMarks: "", passMarks: "", syllabus: "" },
                    ];
                  }

                  const updatedSemesterSubjects =
                    formData.semesterSubjects || [];
                  const existingIndex = updatedSemesterSubjects.findIndex(
                    (s) => s.semester === selectedSemester
                  );

                  if (existingIndex >= 0) {
                    updatedSemesterSubjects[existingIndex] = {
                      semester: selectedSemester,
                      subjects: updatedSubjects,
                    };
                  } else {
                    updatedSemesterSubjects.push({
                      semester: selectedSemester,
                      subjects: updatedSubjects,
                    });
                  }

                  setFormData((prev) => ({
                    ...prev,
                    semesterSubjects: updatedSemesterSubjects,
                  }));
                };

                const handleMarksChange = (subjectId, field, value) => {
                  setFormData((prev) => {
                    const updatedSemesterSubjects = [
                      ...(prev.semesterSubjects || []),
                    ];
                    const existingIndex = updatedSemesterSubjects.findIndex(
                      (s) => s.semester === selectedSemester
                    );

                    if (existingIndex >= 0) {
                      const updatedSubjects = updatedSemesterSubjects[
                        existingIndex
                      ].subjects.map((s) =>
                        s.subjectId === subjectId ? { ...s, [field]: value } : s
                      );
                      updatedSemesterSubjects[existingIndex] = {
                        semester: selectedSemester,
                        subjects: updatedSubjects,
                      };
                    } else {
                      // If semester entry doesn't exist, get current data and create it
                      const currentSemData = (prev.semesterSubjects || []).find(
                        (s) => s.semester === selectedSemester
                      );
                      const currentSubs = currentSemData?.subjects || [];
                      const subjectExists = currentSubs.find(
                        (s) => s.subjectId === subjectId
                      );

                      let updatedSubjects;
                      if (subjectExists) {
                        updatedSubjects = currentSubs.map((s) =>
                          s.subjectId === subjectId
                            ? { ...s, [field]: value }
                            : s
                        );
                      } else {
                        updatedSubjects = [
                          ...currentSubs,
                          {
                            subjectId,
                            maxMarks: field === "maxMarks" ? value : "",
                            passMarks: field === "passMarks" ? value : "",
                            syllabus: "",
                          },
                        ];
                      }

                      updatedSemesterSubjects.push({
                        semester: selectedSemester,
                        subjects: updatedSubjects,
                      });
                    }

                    return {
                      ...prev,
                      semesterSubjects: updatedSemesterSubjects,
                    };
                  });
                };

                const handleSyllabusChange = (subjectId, value) => {
                  setFormData((prev) => {
                    const updatedSemesterSubjects = [
                      ...(prev.semesterSubjects || []),
                    ];
                    const existingIndex = updatedSemesterSubjects.findIndex(
                      (s) => s.semester === selectedSemester
                    );

                    if (existingIndex >= 0) {
                      const updatedSubjects = updatedSemesterSubjects[
                        existingIndex
                      ].subjects.map((s) =>
                        s.subjectId === subjectId
                          ? { ...s, syllabus: value }
                          : s
                      );
                      updatedSemesterSubjects[existingIndex] = {
                        semester: selectedSemester,
                        subjects: updatedSubjects,
                      };
                    }

                    return {
                      ...prev,
                      semesterSubjects: updatedSemesterSubjects,
                    };
                  });
                  // Reset saved status when syllabus changes
                  setSyllabusSaved(false);
                };

                const handleSaveSyllabus = (subjectId) => {
                  // The syllabus is already saved in formData via handleSyllabusChange
                  // This function just provides visual feedback
                  setSyllabusSaved(true);
                  setTimeout(() => {
                    setSyllabusSaved(false);
                  }, 2000);
                };

                return (
                  <div className="mb-5">
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Select Semester*
                      </label>
                      <select
                        value={selectedSemester}
                        onChange={(e) => {
                          setSelectedSemester(parseInt(e.target.value));
                          setSelectedSubjectForSyllabus(""); // Reset syllabus selection when semester changes
                          setSyllabusSaved(false); // Reset saved status
                        }}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {Array.from({ length: semNum }, (_, index) => {
                          const sem = index + 1;
                          return (
                            <option key={sem} value={sem}>
                              Semester {sem}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table
                          key={`semester-${selectedSemester}`}
                          className="min-w-full divide-y divide-gray-200"
                        >
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                  type="checkbox"
                                  checked={
                                    subjects.length > 0 &&
                                    selectedSubjectIds.length ===
                                    subjects.length
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      // Select all
                                      subjects.forEach((subject) => {
                                        if (
                                          !selectedSubjectIds.includes(
                                            subject._id
                                          )
                                        ) {
                                          handleSubjectToggle(subject._id);
                                        }
                                      });
                                    } else {
                                      // Deselect all
                                      selectedSubjectIds.forEach(
                                        (subjectId) => {
                                          handleSubjectToggle(subjectId);
                                        }
                                      );
                                    }
                                  }}
                                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subject Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Max Marks
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pass Marks
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {subjects.length > 0 ? (
                              subjects.map((subject) => {
                                const isSelected = selectedSubjectIds.includes(
                                  subject._id
                                );
                                const subjectData =
                                  currentSemesterSubjects.find(
                                    (s) => s.subjectId === subject._id
                                  );
                                const maxMarks = subjectData?.maxMarks || "";
                                const passMarks = subjectData?.passMarks || "";

                                return (
                                  <tr
                                    key={subject._id}
                                    className={
                                      isSelected
                                        ? "bg-emerald-50"
                                        : "hover:bg-gray-50"
                                    }
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                          handleSubjectToggle(subject._id)
                                        }
                                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                      />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                      {subject.name} ({subject.code})
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      {isSelected ? (
                                        <input
                                          type="number"
                                          value={maxMarks}
                                          onChange={(e) =>
                                            handleMarksChange(
                                              subject._id,
                                              "maxMarks",
                                              e.target.value
                                            )
                                          }
                                          className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                          placeholder="e.g., 100"
                                          min="0"
                                          required
                                        />
                                      ) : (
                                        <span className="text-sm text-gray-400">
                                          -
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      {isSelected ? (
                                        <input
                                          type="number"
                                          value={passMarks}
                                          onChange={(e) =>
                                            handleMarksChange(
                                              subject._id,
                                              "passMarks",
                                              e.target.value
                                            )
                                          }
                                          className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                          placeholder="e.g., 40"
                                          min="0"
                                          required
                                        />
                                      ) : (
                                        <span className="text-sm text-gray-400">
                                          -
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="px-4 py-8 text-center text-sm text-gray-500"
                                >
                                  No subjects available. Please add subjects
                                  first.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Syllabus Section for Selected Subjects */}
                    {currentSemesterSubjects.length > 0 && (
                      <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h3 className="text-sm font-medium text-gray-700">
                            Syllabus for Selected Subjects - Semester{" "}
                            {selectedSemester}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Select a subject to enter or edit its syllabus
                          </p>
                        </div>
                        <div className="p-4">
                          <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Select Subject*
                            </label>
                            <select
                              value={selectedSubjectForSyllabus}
                              onChange={(e) =>
                                setSelectedSubjectForSyllabus(e.target.value)
                              }
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                              <option value="">
                                Choose a subject to enter syllabus
                              </option>
                              {currentSemesterSubjects.map((semSub) => {
                                const subject = subjects.find(
                                  (s) => s._id === semSub.subjectId
                                );
                                if (!subject) return null;
                                return (
                                  <option
                                    key={semSub.subjectId}
                                    value={semSub.subjectId}
                                  >
                                    {subject.name} ({subject.code})
                                  </option>
                                );
                              })}
                            </select>
                          </div>

                          {selectedSubjectForSyllabus &&
                            (() => {
                              const selectedSemSub =
                                currentSemesterSubjects.find(
                                  (s) =>
                                    s.subjectId === selectedSubjectForSyllabus
                                );
                              const selectedSubject = subjects.find(
                                (s) => s._id === selectedSubjectForSyllabus
                              );
                              const syllabus = selectedSemSub?.syllabus || "";

                              if (!selectedSubject) return null;

                              return (
                                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Syllabus for {selectedSubject.name} (
                                      {selectedSubject.code})
                                    </label>
                                    {syllabusSaved && (
                                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
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
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                        Saved
                                      </span>
                                    )}
                                  </div>
                                  <textarea
                                    rows={6}
                                    value={syllabus}
                                    onChange={(e) =>
                                      handleSyllabusChange(
                                        selectedSubjectForSyllabus,
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-y"
                                    placeholder="Enter syllabus for this subject (e.g., Introduction to Programming, Data Types, Variables, Control Structures, Functions, Object-Oriented Programming concepts...)"
                                  />
                                  <div className="mt-3 flex items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                      Enter detailed syllabus content for this
                                      subject
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSaveSyllabus(
                                          selectedSubjectForSyllabus
                                        )
                                      }
                                      className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
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
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                      Save Syllabus
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter any additional notes"
              />
            </div>
          </>
        );
      }

      case "professors":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Professor Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter professor name"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Employee/Professor ID
                </label>
                <input
                  type="text"
                  name="professorId"
                  value={formData.professorId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter employee/professor ID"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., Associate Professor"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., professor@aknu.edu"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Alternate Contact Number
              </label>
              <input
                type="tel"
                name="alternateContactNumber"
                value={formData.alternateContactNumber || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter alternate phone number (optional)"
                maxLength="10"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Subject*
              </label>
              <div className="relative" ref={subjectDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowSubjectDropdown((prev) => !prev)}
                  className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <span className="text-sm text-gray-700">
                    {(formData.subjectIds || []).length
                      ? `${(formData.subjectIds || []).length
                      } subject(s) selected`
                      : "Select subjects"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${showSubjectDropdown ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showSubjectDropdown && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100 text-xs text-gray-500">
                      <span>Select subject</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            subjectIds: [],
                          }))
                        }
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="max-h-56 overflow-y-auto p-3 space-y-2">
                      {subjects.length ? (
                        subjects.map((subject) => {
                          const isChecked = (
                            formData.subjectIds || []
                          ).includes(subject._id);
                          return (
                            <label
                              key={subject._id}
                              className="flex items-center space-x-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md px-2 py-1"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  toggleArrayValue("subjectIds", subject._id)
                                }
                                className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                              />
                              <span>
                                {subject.name} ({subject.code})
                              </span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-500">
                          No subjects available. Please add subjects first.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Add any additional remarks"
              />
            </div>
          </>
        );

      case "timetable": {
        const tempEntry = formData.tempEntry || {};
        const entries = formData.entries || [];

        const addTimetableEntry = () => {
          if (!tempEntry.subjectId) {
            setError("Please select a subject");
            return;
          }
          if (!tempEntry.paperType || !tempEntry.paperType.trim()) {
            setError("Please enter paper type");
            return;
          }
          if (!tempEntry.streamId) {
            setError("Please select a department/stream");
            return;
          }
          if (!tempEntry.examDate) {
            setError("Please select exam date");
            return;
          }
          if (!tempEntry.examTime) {
            setError("Please enter exam time");
            return;
          }
          if (!tempEntry.duration || !tempEntry.duration.trim()) {
            setError("Please enter duration");
            return;
          }

          const subject = subjects.find((s) => s._id === tempEntry.subjectId);
          const stream = streamsData.find((s) => s._id === tempEntry.streamId);

          // Check for duplicate in current form entries
          const duplicateInForm = entries.some(
            (entry) =>
              entry.subjectId === tempEntry.subjectId &&
              entry.paperType === tempEntry.paperType.trim() &&
              entry.streamId === tempEntry.streamId &&
              entry.examDate === tempEntry.examDate &&
              entry.examTime === tempEntry.examTime
          );

          if (duplicateInForm) {
            setError(
              "This timetable entry is already added in the current form. Please check the list below."
            );
            return;
          }

          // Check for duplicate in existing localStorage entries
          try {
            const storedEntries = localStorage.getItem(
              "exam_timetable_entries"
            );
            if (storedEntries) {
              const existingEntries = JSON.parse(storedEntries);
              const duplicateInStorage = existingEntries.some((item) => {
                return (
                  item.subjectId === tempEntry.subjectId &&
                  item.paperType === tempEntry.paperType.trim() &&
                  item.streamId === tempEntry.streamId &&
                  item.examDate === tempEntry.examDate &&
                  (item.examTime === tempEntry.examTime ||
                    item.startTime === tempEntry.examTime)
                );
              });

              if (duplicateInStorage) {
                setError(
                  "This timetable entry already exists in the database. Please check the timetable table."
                );
                return;
              }
            }
          } catch (err) {
            // If localStorage read fails, continue
            console.warn("Could not check existing entries:", err);
          }

          const newEntry = {
            id: `entry_${Date.now()}_${Math.random()}`,
            subjectId: tempEntry.subjectId,
            subjectName: subject?.name || "",
            subjectCode: subject?.code || "",
            paperType: tempEntry.paperType.trim(),
            streamId: tempEntry.streamId,
            streamName: stream?.name || "",
            streamCode: stream?.code || "",
            examDate: tempEntry.examDate,
            examTime: tempEntry.examTime,
            duration: tempEntry.duration.trim(),
            notes: tempEntry.notes || "",
          };

          setFormData((prev) => ({
            ...prev,
            entries: [...(prev.entries || []), newEntry],
            tempEntry: {
              subjectId: "",
              subjectName: "",
              subjectCode: "",
              paperType: "",
              streamId: "",
              streamName: "",
              streamCode: "",
              examDate: "",
              examTime: "",
              duration: "",
              notes: "",
            },
          }));
          setError("");
        };

        const removeTimetableEntry = (entryId) => {
          setFormData((prev) => ({
            ...prev,
            entries: (prev.entries || []).filter((e) => e.id !== entryId),
          }));
        };

        const handleTempEntryChange = (field, value) => {
          setFormData((prev) => ({
            ...prev,
            tempEntry: {
              ...(prev.tempEntry || {}),
              [field]: value,
            },
          }));
          setError("");

          // Auto-populate subject name and code when subject is selected
          if (field === "subjectId" && value) {
            const subject = subjects.find((s) => s._id === value);
            if (subject) {
              setFormData((prev) => ({
                ...prev,
                tempEntry: {
                  ...(prev.tempEntry || {}),
                  subjectId: value,
                  subjectName: subject.name || "",
                  subjectCode: subject.code || "",
                },
              }));
            }
          }

          // Auto-populate stream name and code when stream is selected
          if (field === "streamId" && value) {
            const stream = streamsData.find((s) => s._id === value);
            if (stream) {
              setFormData((prev) => ({
                ...prev,
                tempEntry: {
                  ...(prev.tempEntry || {}),
                  streamId: value,
                  streamName: stream.name || "",
                  streamCode: stream.code || "",
                },
              }));
            }
          }
        };

        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Subject*
              </label>
              <select
                value={tempEntry.subjectId || ""}
                onChange={(e) =>
                  handleTempEntryChange("subjectId", e.target.value)
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Paper*
                </label>
                <input
                  type="text"
                  value={tempEntry.paperType || ""}
                  onChange={(e) =>
                    handleTempEntryChange("paperType", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Paper 1, Paper 2, Paper 3"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Department (Stream)*
                </label>
                <select
                  value={tempEntry.streamId || ""}
                  onChange={(e) =>
                    handleTempEntryChange("streamId", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Department/Stream</option>
                  {streamsData.map((stream) => (
                    <option key={stream._id} value={stream._id}>
                      {stream.name} {stream.code ? `(${stream.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Start Date*
                </label>
                <input
                  type="date"
                  value={tempEntry.examDate || ""}
                  onChange={(e) =>
                    handleTempEntryChange("examDate", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Time*
                </label>
                <input
                  type="time"
                  value={tempEntry.examTime || ""}
                  onChange={(e) =>
                    handleTempEntryChange("examTime", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Duration*
              </label>
              <input
                type="text"
                value={tempEntry.duration || ""}
                onChange={(e) =>
                  handleTempEntryChange("duration", e.target.value)
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., 3 hours, 2.5 hours"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={tempEntry.notes || ""}
                onChange={(e) => handleTempEntryChange("notes", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Optional remarks (venue, instructions, etc.)"
              />
            </div>

            <div className="mb-5">
              <button
                type="button"
                onClick={addTimetableEntry}
                className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Entry
              </button>
            </div>

            {/* Display added entries */}
            {entries.length > 0 && (
              <div className="mb-5 border-t border-gray-200 pt-5">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Added Entries ({entries.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}. {entry.subjectName} ({entry.subjectCode})
                          - {entry.paperType}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {entry.streamName}{" "}
                          {entry.streamCode ? `(${entry.streamCode})` : ""} •{" "}
                          {entry.examDate
                            ? new Date(entry.examDate).toLocaleDateString()
                            : ""}{" "}
                          • {entry.examTime} • {entry.duration}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTimetableEntry(entry.id)}
                        className="ml-3 p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
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
                  ))}
                </div>
              </div>
            )}
          </>
        );
      }

      case "questionPaper":
        return (
          <QuestionPaperForm
            formData={formData}
            setFormData={setFormData}
            subjects={subjects}
            academicYears={academicYears}
            examTypes={examTypes}
            courses={courses}
            streams={streamsData}
            courseStreamMappings={courseStreamMappings}
            streamSubjectMappings={streamSubjectMappings}
            error={error}
            setError={setError}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onClose={onClose}
            initialData={initialData}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            renderValidationIcon={renderValidationIcon}
            fieldErrors={fieldErrors}
          />
        );

      case "subjectProfessorMapping": {
        // Get unique subject+paper combinations from timetable
        const getTimetableOptions = () => {
          const seen = new Set();
          return timetableEntries
            .filter((entry) => entry.subjectId && entry.paperType)
            .map((entry) => {
              const key = `${entry.subjectId}_${entry.paperType}`;
              if (!seen.has(key)) {
                seen.add(key);
                return entry;
              }
              return null;
            })
            .filter(Boolean);
        };
        const timetableOptions = getTimetableOptions();

        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select Subject & Paper from Timetable*
              </label>
              <select
                name="timetableEntry"
                value={
                  formData.subjectId && formData.paperType
                    ? `${formData.subjectId}_${formData.paperType}`
                    : ""
                }
                onChange={(e) => {
                  const [subjectId, paperType] = e.target.value.split("_");
                  const entry = timetableEntries.find(
                    (e) =>
                      e.subjectId === subjectId && e.paperType === paperType
                  );
                  setFormData((prev) => ({
                    ...prev,
                    subjectId: subjectId || "",
                    paperType: paperType || "",
                    subjectName: entry?.subjectName || "",
                    subjectCode: entry?.subjectCode || "",
                  }));
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select from Timetable</option>
                {timetableOptions.map((entry) => (
                  <option
                    key={`${entry.subjectId}_${entry.paperType}`}
                    value={`${entry.subjectId}_${entry.paperType}`}
                  >
                    {entry.subjectName || entry.subjectCode} - {entry.paperType}
                    {entry.examDate
                      ? ` (${new Date(entry.examDate).toLocaleDateString()})`
                      : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only subjects scheduled in the timetable are available
              </p>
            </div>

            {formData.subjectId && (
              <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Selected:</span>{" "}
                  {formData.subjectName || formData.subjectCode} -{" "}
                  {formData.paperType}
                </p>
              </div>
            )}

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Assign Professor*
              </label>

              <div className="relative">
                <select
                  name="professorId"
                  value={formData.professorId || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                  required
                >
                  <option value="">Select Professor</option>
                  {professors
                    .filter((prof) => prof.status === "Active")
                    .map((professor) => (
                      <option key={professor._id} value={professor._id}>
                        {professor.name}
                        {professor.professorId
                          ? ` (${professor.professorId})`
                          : ""}
                        {professor.designation
                          ? ` - ${professor.designation}`
                          : ""}
                      </option>
                    ))}
                </select>
                {renderValidationIcon(
                  "professorId",
                  formData.professorId,
                  null,
                  "Professor",
                  true
                )}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status || "Active"}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {renderValidationIcon(
                  "status",
                  formData.status,
                  null,
                  "Status",
                  true
                )}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Add any additional remarks or instructions"
              />
            </div>
          </>
        );
      }

      case "examinationCenters":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Center Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., EC001"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Center Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="e.g., Main Examination Center"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College/Campus*
              </label>
              <select
                name="collegeId"
                value={formData.collegeId || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select College/Campus</option>
                {colleges.map((college) => (
                  <option key={college._id} value={college._id}>
                    {college.name} ({college.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Address*
              </label>
              <textarea
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter full address"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Capacity (Total Seats)*
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.capacity ? "border-red-300" : "border-gray-200"
                    }`}
                  required
                  min="1"
                  placeholder="e.g., 500"
                />
                {renderValidationIcon("capacity", formData.capacity, (val) => {
                  const num = parseInt(val);
                  return !isNaN(num) && num >= 1;
                })}
              </div>
              {fieldErrors.capacity && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.capacity}
                </p>
              )}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Number of Rooms
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="rooms"
                  value={formData.rooms || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.rooms ? "border-red-300" : "border-gray-200"
                    }`}
                  min="0"
                  placeholder="e.g., 20"
                />
                {renderValidationIcon("rooms", formData.rooms, (val) => {
                  if (!val) return false;
                  const num = parseInt(val);
                  return !isNaN(num) && num >= 0;
                })}
              </div>
              {fieldErrors.rooms && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.rooms}</p>
              )}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Contact Person Name*
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.contactPerson
                      ? "border-red-300"
                      : "border-gray-200"
                    }`}
                  required
                  placeholder="e.g., Dr. John Doe"
                />
                {renderValidationIcon(
                  "contactPerson",
                  formData.contactPerson,
                  (val) => {
                    if (!val || val.trim().length < 2) return false;
                    return /^[a-zA-Z\s]+$/.test(val.trim());
                  },
                  "Contact Person Name"
                )}
              </div>
              {fieldErrors.contactPerson && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.contactPerson}
                </p>
              )}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Contact Number*
              </label>

              <div className="relative">
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.contactNumber
                      ? "border-red-300"
                      : "border-gray-200"
                    }`}
                  required
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
                {!fieldErrors.contactNumber &&
                  formData.contactNumber &&
                  formData.contactNumber.length === 10 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
                      <svg
                        className="w-5 h-5 text-green-600 cursor-help"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="absolute right-0 top-full mt-2 w-32 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Valid phone number
                      </div>
                    </div>
                  )}
              </div>
              {fieldErrors.contactNumber && (
                <p className="text-xs text-red-600 mt-1">
                  {fieldErrors.contactNumber}
                </p>
              )}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${fieldErrors.email ? "border-red-300" : "border-gray-200"
                    }`}
                  placeholder="e.g., contact@example.com"
                />
                {!fieldErrors.email &&
                  formData.email &&
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 group">
                      <svg
                        className="w-5 h-5 text-green-600 cursor-help"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="absolute right-0 top-full mt-2 w-28 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Valid email
                      </div>
                    </div>
                  )}
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        );

      case "collegeType":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College Type Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter college type (e.g., Autonomous, Non-Autonomous)"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College Type Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter college type code (e.g., AUTO, NON-AUTO)"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter any remarks or additional details"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        );

      case "collegeCategory":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College Category Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter college category (e.g., Government, Private)"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College Category Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter college category code (e.g., GOV, PRIV)"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter any remarks or additional details"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        );

      case "courseCategory":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College Other Category Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter college other category (e.g., UG, PG, Law, University)"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                College Other Category Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter college other category code (e.g., UG, PG, LAW, UNIV)"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter any remarks or additional details"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        );

      case "examType":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Examination Type Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter examination type (e.g., Regular, Supplementary, Revaluation)"
              />
              {/* <p className="mt-1 text-xs text-gray-500">
                Examples: Regular, Supplementary, Revaluation
              </p> */}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Examination Type Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter examination type code (e.g., REG, SUP, REV)"
              />
              {/* <p className="mt-1 text-xs text-gray-500">
                Examples: REG (Regular), SUP (Supplementary), REV (Revaluation)
              </p> */}
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter any remarks or additional details"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        );

      case "examCategory":
        return (
          <>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Exam Category Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter exam category (e.g., Mid-Term, Final, Pre-Exam)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Examples: Mid-Term Examination, Final Examination,
                Pre-Examination
              </p>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Exam Category Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                placeholder="Enter exam category code (e.g., MID, FINAL, PRE)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Examples: MID (Mid-Term), FINAL (Final Exam), PRE (Pre-Exam)
              </p>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter any remarks or additional details"
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status*
              </label>
              <select
                name="status"
                value={formData.status || "Active"}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </>
        );

      default:
        return <div>Form fields not configured for {tabKey}</div>;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
      <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
          <h3 className="text-lg font-semibold text-white">
            {getModalTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors focus:outline-none"
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

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {renderFormFields()}

          {/* Footer Buttons */}
          <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-100">
            {tabKey === "questionPaper" && (
              <button
                type="button"
                onClick={() => {
                  if (!formData.subjectId) {
                    setError("Please select a subject first.");
                    return;
                  }
                  if (!formData.questions || formData.questions.length === 0) {
                    setError(
                      "Please add at least one question before previewing."
                    );
                    return;
                  }
                  setShowPreview(!showPreview);
                }}
                className="px-5 py-2.5 transition-all border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                {showPreview ? "Back to Edit" : "Preview"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 transition-all text-white rounded-lg shadow-md shadow-emerald-100 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : tabKey === "masterMapping" && initialData && !initialData._id
                  ? "Submit"
                  : initialData
                    ? "Update"
                    : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFormModal;
