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
  internalExamSetupsApi,
} from "../../../services/apiService";
import jsPDF from "jspdf";
import { loadLogoAsBase64 } from "./utils/loadLogoAsBase64";

// Question Paper Form Component
const QuestionPaperForm = ({
  formData,
  setFormData,
  subjects,
  examTypes = [],
  academicYears,
  courses = [],
  streams = [],
  courseStreamMappings = [],
  streamSubjectMappings = [],
  error,
  setError,
  isSubmitting,
  onSubmit,
  onClose,
  initialData,
  showPreview,
  setShowPreview,
  renderValidationIcon,
  fieldErrors = {},
}) => {
  // State to track collapsed sections
  const [collapsedSections, setCollapsedSections] = useState({});

  // State to track collapsed questions
  const [collapsedQuestions, setCollapsedQuestions] = useState({});

  // State to track preview question
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Create a wrapper function that uses the fieldErrors prop
  const renderValidationIconWrapper = renderValidationIcon
    ? (
        fieldName,
        fieldValue,
        customValidation = null,
        label = null,
        isSelect = false
      ) => {
        // Create a temporary function that uses fieldErrors prop
        const hasError = fieldErrors[fieldName];
        const hasValue =
          fieldValue !== undefined && fieldValue !== null && fieldValue !== "";
        const isValid =
          !hasError &&
          hasValue &&
          (customValidation ? customValidation(fieldValue) : true);

        if (!isValid) return null;

        const fieldLabels = {
          courseId: "Course",
          streamId: "Stream",
          semesterNumber: "Semester",
          subjectId: "Subject",
          academicYearId: "Academic Year",
          examinationType: "Examination Type",
        };

        const displayLabel =
          label ||
          fieldLabels[fieldName] ||
          fieldName
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
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
      }
    : null;

  const toggleSection = (sectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const toggleQuestion = (questionId) => {
    setCollapsedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const questionTypes = [
    "MCQ",
    "Descriptive",
    // "Short Answer",
    // "Long Answer",
    "True/False",
    "Fill in the Blanks",
    "Match the Following",
  ];

  // Filter streams based on selected course
  const availableStreams = React.useMemo(() => {
    if (!formData.courseId || courseStreamMappings.length === 0) {
      return [];
    }

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

    const streamIds = new Set();
    courseMappings.forEach((mapping) => {
      const streamId =
        typeof mapping.streamId === "object" && mapping.streamId?._id
          ? mapping.streamId._id
          : mapping.streamId;
      if (streamId) streamIds.add(streamId);
    });

    return streams.filter((stream) => streamIds.has(stream._id));
  }, [formData.courseId, courseStreamMappings, streams]);

  // Filter semesters based on selected course and stream using CourseStreamMapping
  const availableSemesters = React.useMemo(() => {
    if (!formData.courseId || !formData.streamId || courseStreamMappings.length === 0) {
      return [];
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
      return (
        mappingCourseId === formData.courseId &&
        mappingStreamId === formData.streamId &&
        (mapping.status === "Active" || mapping.status === undefined)
      );
    });

    // Extract unique semester numbers and their IDs
    const semesterMap = new Map();
    relevantMappings.forEach((mapping) => {
      const semesterNumber = mapping.semesterNumber;
      const semesterId =
        typeof mapping.semesterId === "object" && mapping.semesterId?._id
          ? mapping.semesterId._id
          : mapping.semesterId;

      if (semesterNumber && !semesterMap.has(semesterNumber)) {
        semesterMap.set(semesterNumber, {
          semesterNumber,
          semesterId,
        });
      }
    });

    // Convert to array and sort by semester number
    return Array.from(semesterMap.values()).sort(
      (a, b) => a.semesterNumber - b.semesterNumber
    );
  }, [formData.courseId, formData.streamId, courseStreamMappings]);

  // Filter subjects based on selected course, stream, and semester using CourseStreamMapping
  const availableSubjects = React.useMemo(() => {
    if (!formData.courseId || !formData.streamId || !formData.semesterNumber) {
      return []; // Return empty if course, stream, or semester not selected
    }

    // Filter course-stream mappings for the selected course, stream, and semester
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

    // Extract subject IDs from the mappings' subjects array
    const subjectIds = new Set();
    relevantMappings.forEach((mapping) => {
      if (Array.isArray(mapping.subjects)) {
        mapping.subjects.forEach((subjectItem) => {
          const subjectId =
            typeof subjectItem.subjectId === "object" && subjectItem.subjectId?._id
              ? subjectItem.subjectId._id
              : subjectItem.subjectId || subjectItem;
          if (subjectId) subjectIds.add(subjectId);
        });
      }
    });

    return subjects.filter((subject) => subjectIds.has(subject._id));
  }, [formData.courseId, formData.streamId, formData.semesterNumber, courseStreamMappings, subjects]);

  // Fetch internal exam setup and auto-populate total marks when course, stream, semester, and subject are selected
  useEffect(() => {
    const fetchInternalExamSetup = async () => {
      if (
        !formData.courseId ||
        !formData.streamId ||
        !formData.semesterId ||
        !formData.subjectId
      ) {
        return;
      }

      try {
        const response = await internalExamSetupsApi.getAll({
          courseId: formData.courseId,
          streamId: formData.streamId,
          semesterId: formData.semesterId,
          subjectId: formData.subjectId,
          status: "Active",
        });

        const setups = Array.isArray(response)
          ? response
          : response?.data || response || [];

        // Get the first active setup and use its externalMarksMax
        if (setups.length > 0) {
          const setup = setups[0];
          const externalMarksMax = setup.externalMarksMax || null;

          if (externalMarksMax && !formData.totalMarks) {
            // Only auto-populate if totalMarks is not already set
            setFormData((prev) => ({
              ...prev,
              totalMarks: externalMarksMax,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching internal exam setup:", error);
        // Don't show error to user, just log it
      }
    };

    fetchInternalExamSetup();
  }, [formData.courseId, formData.streamId, formData.semesterId, formData.subjectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If course changes, clear stream, semester, subject, and totalMarks
    if (name === "courseId") {
      setFormData((prev) => ({
        ...prev,
        courseId: value,
        streamId: "",
        semesterNumber: "",
        semesterId: "",
        subjectId: "",
        totalMarks: "", // Clear totalMarks to allow repopulation
      }));
    }
    // If stream changes, clear semester, subject, and totalMarks
    else if (name === "streamId") {
      setFormData((prev) => ({
        ...prev,
        streamId: value,
        semesterNumber: "",
        semesterId: "",
        subjectId: "",
        totalMarks: "", // Clear totalMarks to allow repopulation
      }));
    }
    // If semester changes, find the corresponding semesterId and clear subject and totalMarks
    else if (name === "semesterNumber") {
      const selectedSemester = availableSemesters.find(
        (sem) => sem.semesterNumber === Number(value)
      );
      setFormData((prev) => ({
        ...prev,
        semesterNumber: value,
        semesterId: selectedSemester?.semesterId || "",
        subjectId: "",
        totalMarks: "", // Clear totalMarks to allow repopulation
      }));
    }
    // If subject changes, clear totalMarks to allow repopulation
    else if (name === "subjectId") {
      setFormData((prev) => ({
        ...prev,
        subjectId: value,
        totalMarks: "", // Clear totalMarks to allow repopulation
      }));
    }
    // Otherwise, just update the field
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...(prev.questions || []),
        {
          id: `q_${Date.now()}_${Math.random()}`,
          questionType: "Descriptive",
          questionText: "",
          marks: "",
          section: "", // Section A, B, etc.
          sectionInstruction: "", // Instruction for this section (e.g., "Answer All Questions", "Answer any 5 questions")
          sectionMarks: "", // Total marks for this section
          showOr: false, // Show "(Or)" after this main question
          alternativeQuestion: null, // Alternative question when OR is enabled
          subQuestions: [], // For questions with (or) options
          options: [], // For MCQ, True/False, etc.
          correctAnswer: "", // For MCQ, True/False
          matchingPairs: [], // For Match the Following
        },
      ],
    }));
  };

  const removeQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).filter((q) => q.id !== questionId),
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((q) => {
        if (q.id === questionId) {
          const updated = { ...q, [field]: value };
          // Reset options when question type changes
          if (field === "questionType") {
            if (value === "MCQ") {
              updated.options =
                q.options && q.options.length > 0
                  ? q.options
                  : ["", "", "", ""];
              updated.correctAnswer = q.correctAnswer || "";
            } else if (value === "True/False") {
              updated.options = ["True", "False"];
              updated.correctAnswer = q.correctAnswer || "";
            } else if (value === "Match the Following") {
              updated.matchingPairs =
                q.matchingPairs && q.matchingPairs.length > 0
                  ? q.matchingPairs
                  : [{ left: "", right: "" }];
            } else {
              updated.options = [];
              updated.correctAnswer = "";
              updated.matchingPairs = [];
            }
          }
          return updated;
        }
        return q;
      }),
    }));
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((q) => {
        if (q.id === questionId) {
          const options = [...(q.options || [])];
          options[optionIndex] = value;
          return { ...q, options };
        }
        return q;
      }),
    }));
  };

  const addMatchingPair = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            matchingPairs: [
              ...(q.matchingPairs || []),
              { left: "", right: "" },
            ],
          };
        }
        return q;
      }),
    }));
  };

  const updateMatchingPair = (questionId, pairIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((q) => {
        if (q.id === questionId) {
          const pairs = [...(q.matchingPairs || [])];
          pairs[pairIndex] = { ...pairs[pairIndex], [field]: value };
          return { ...q, matchingPairs: pairs };
        }
        return q;
      }),
    }));
  };

  const removeMatchingPair = (questionId, pairIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((q) => {
        if (q.id === questionId) {
          const pairs = [...(q.matchingPairs || [])];
          pairs.splice(pairIndex, 1);
          return { ...q, matchingPairs: pairs };
        }
        return q;
      }),
    }));
  };

  const addSubQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            subQuestions: [
              ...(q.subQuestions || []),
              { text: "", showOr: false },
            ],
          };
        }
        return q;
      }),
    }));
  };

  const updateSubQuestion = (questionId, subIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((q) => {
        if (q.id === questionId) {
          const subQuestions = [...(q.subQuestions || [])];
          subQuestions[subIndex] = {
            ...subQuestions[subIndex],
            [field]: value,
          };
          return { ...q, subQuestions };
        }
        return q;
      }),
    }));
  };

  const removeSubQuestion = (questionId, subIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: (prev.questions || []).map((q) => {
        if (q.id === questionId) {
          const subQuestions = [...(q.subQuestions || [])];
          subQuestions.splice(subIndex, 1);
          return { ...q, subQuestions };
        }
        return q;
      }),
    }));
  };

  // const generatePDF = async () => {
  //   const selectedSubject = subjects.find((s) => s._id === formData.subjectId);
  //   const subjectName =
  //     selectedSubject?.name || formData.subjectName || "Subject";
  //   const subjectCode = selectedSubject?.code || formData.subjectCode || "";
  //   const paperType = formData.paperType || "Paper 1";

  //   const pdf = new jsPDF();
  //   const pageWidth = pdf.internal.pageSize.getWidth();
  //   const margin = 20;
  //   let yPos = margin;

  //   // Add Logo at the top
  //   try {
  //     const logoBase64 = await loadLogoAsBase64();
  //     const logoWidth = 20; // mm
  //     const logoHeight = 20; // mm
  //     const logoX = (pageWidth - logoWidth) / 2; // Center horizontally
  //     pdf.addImage(logoBase64, "PNG", logoX, yPos, logoWidth, logoHeight);
  //     yPos += logoHeight + 5; // Add space after logo
  //   } catch (err) {
  //     console.error("Error adding logo to PDF:", err);
  //     // Continue without logo if there's an error
  //   }

  //   // Header - University Name
  //   pdf.setFontSize(16);
  //   pdf.setFont("helvetica", "bold");
  //   pdf.text("ADIKAVI NANNAYA UNIVERSITY", pageWidth / 2, yPos, {
  //     align: "center",
  //   });
  //   yPos += 7;

  //   // Location
  //   pdf.setFontSize(16);
  //   pdf.setFont("helvetica", "bold");
  //   pdf.text("RAJAHMUNDRY", pageWidth / 2, yPos, { align: "center" });
  //   yPos += 10;

  //   // Paper Type
  //   pdf.setFontSize(12);
  //   pdf.setFont("helvetica", "normal");
  //   pdf.text("Model Question Paper", pageWidth / 2, yPos, { align: "center" });
  //   yPos += 5;

  //   // Subject with code
  //   pdf.setFontSize(11);
  //   pdf.setFont("helvetica", "normal");
  //   const subjectDisplay = subjectCode
  //     ? `${paperType} ${subjectName} (${subjectCode})`
  //     : `${paperType} ${subjectName}`;
  //   pdf.text(subjectDisplay, pageWidth / 2, yPos, { align: "center" });
  //   yPos += 8;

  //   // Question Paper Number (always show if available)
  //   // if (formData.questionPaperNumber) {
  //   //   pdf.setFontSize(10);
  //   //   pdf.setFont("helvetica", "bold");
  //     // pdf.text(
  //     //   `Question Paper No: ${formData.questionPaperNumber}`,
  //     //   pageWidth / 2,
  //     //   yPos,
  //     //   { align: "center" }
  //     // );
  //     // yPos += 5;
  //   // }

  //   // Professor Details (always show if available)
  //   // if (formData.professorName || formData.professorEmployeeId) {
  //   //   pdf.setFontSize(10);
  //   //   pdf.setFont("helvetica", "normal");
  //   //   const professorName = formData.professorName || "";
  //   //   const professorId = formData.professorEmployeeId || "";
  //   //   const professorDisplay =
  //   //     professorName && professorId
  //   //       ? `Professor: ${professorName} (ID: ${professorId})`
  //   //       : professorName
  //   //       ? `Professor: ${professorName}`
  //   //       : professorId
  //   //       ? `Professor ID: ${professorId}`
  //   //       : "";
  //   //   if (professorDisplay) {
  //   //     pdf.text(professorDisplay, pageWidth / 2, yPos, { align: "center" });
  //   //     yPos += 5;
  //   //   }
  //   // }

  //   // Time and Max Marks on same line
  //   pdf.setFontSize(10);
  //   pdf.setFont("helvetica", "normal");
  //   const duration = formData.duration || "3 hours";
  //   const headerTotalMarks =
  //     formData.totalMarks ||
  //     questions.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0);
  //   pdf.text(`Time: ${duration}`, margin, yPos);
  //   pdf.text(`Max. Marks: ${headerTotalMarks}`, pageWidth - margin, yPos, {
  //     align: "right",
  //   });
  //   yPos += 10;

  //   // Questions
  //   pdf.setFontSize(11);
  //   const questions = formData.questions || [];

  //   // Group questions by section
  //   const questionsBySection = {};
  //   questions.forEach((q) => {
  //     const section = q.section || "No Section";
  //     if (!questionsBySection[section]) {
  //       questionsBySection[section] = [];
  //     }
  //     questionsBySection[section].push(q);
  //   });

  //   // Calculate section marks and get section instructions
  //   const sectionMarks = {};
  //   const sectionInstructions = {};
  //   Object.keys(questionsBySection).forEach((section) => {
  //     const firstQuestion = questionsBySection[section][0];
  //     // Use sectionMarks from first question if available, otherwise calculate from question marks
  //     const sectionMarksValue = firstQuestion?.sectionMarks;
  //     if (
  //       sectionMarksValue !== undefined &&
  //       sectionMarksValue !== null &&
  //       sectionMarksValue !== ""
  //     ) {
  //       // Handle both string and number types
  //       const marksValue =
  //         typeof sectionMarksValue === "string"
  //           ? sectionMarksValue.trim() !== ""
  //             ? parseInt(sectionMarksValue)
  //             : 0
  //           : typeof sectionMarksValue === "number"
  //           ? sectionMarksValue
  //           : 0;
  //       sectionMarks[section] = marksValue || 0;
  //     } else {
  //       // Fall back to calculating from individual question marks
  //       sectionMarks[section] = questionsBySection[section].reduce(
  //         (sum, q) => sum + (parseInt(q.marks) || 0),
  //         0
  //       );
  //     }
  //     // Get instruction from first question in section, or default
  //     sectionInstructions[section] =
  //       firstQuestion?.sectionInstruction || "Answer All Questions.";
  //   });

  //   // Sort sections: extract numbers and sort numerically, "No Section" goes last
  //   const sortedSections = Object.keys(questionsBySection).sort((a, b) => {
  //     if (a === "No Section") return 1; // "No Section" goes to end
  //     if (b === "No Section") return -1;

  //     // Helper function to convert Roman numerals to numbers
  //     const romanToNumber = (roman) => {
  //       const romanMap = {
  //         I: 1,
  //         II: 2,
  //         III: 3,
  //         IV: 4,
  //         V: 5,
  //         VI: 6,
  //         VII: 7,
  //         VIII: 8,
  //         IX: 9,
  //         X: 10,
  //       };
  //       return romanMap[roman.toUpperCase()] || null;
  //     };

  //     // Extract numbers from section names (e.g., "1", "2", "Section 1" -> 1, "Section 2" -> 2, "I" -> 1, "II" -> 2)
  //     const getSectionNumber = (sectionName) => {
  //       // First try to extract Arabic number
  //       const arabicMatch = sectionName.match(/\d+/);
  //       if (arabicMatch) return parseInt(arabicMatch[0]);

  //       // Then try Roman numerals (I, II, III, etc.)
  //       const romanMatch = sectionName.match(/\b([IVX]+)\b/i);
  //       if (romanMatch) {
  //         const romanNum = romanToNumber(romanMatch[1]);
  //         if (romanNum) return romanNum;
  //       }

  //       // Extract single letter (A=1, B=2, etc.)
  //       const letterMatch = sectionName.match(/\b([A-Z])\b/);
  //       if (letterMatch) {
  //         return letterMatch[1].charCodeAt(0) - 64; // A=1, B=2, etc.
  //       }

  //       return 999; // If no number found, put at end
  //     };

  //     const numA = getSectionNumber(a);
  //     const numB = getSectionNumber(b);

  //     if (numA !== numB) return numA - numB;
  //     // If same number, sort alphabetically
  //     return a.localeCompare(b);
  //   });

  //   // Process questions section by section with continuous numbering
  //   let globalQuestionNumber = 0;
  //   sortedSections.forEach((section) => {
  //     const sectionQuestions = questionsBySection[section];

  //     // Section header
  //     if (section !== "No Section") {
  //       yPos += 5;

  //       // Section heading - centered, bold, prominent (format: "SECTION -A")
  //       pdf.setFont("helvetica", "bold");
  //       pdf.setFontSize(13);
  //       let sectionText = section.toUpperCase().trim();
  //       if (!sectionText.includes("SECTION")) {
  //         // Extract letter if it's like "A", "Section A", etc.
  //         const sectionLetter =
  //           sectionText.replace(/SECTION\s*/i, "").trim() || "A";
  //         sectionText = `SECTION -${sectionLetter}`;
  //       } else {
  //         // If it already has SECTION, format it properly with space and dash
  //         sectionText = sectionText
  //           .replace(/SECTION\s*/i, "SECTION -")
  //           .replace(/\s+/g, " ")
  //           .trim();
  //         // Ensure format is "SECTION -A" (space before dash)
  //         if (!sectionText.includes(" -")) {
  //           sectionText = sectionText
  //             .replace("SECTION", "SECTION -")
  //             .replace(/\s+/g, " ");
  //         }
  //       }
  //       pdf.text(sectionText, pageWidth / 2, yPos, { align: "center" });
  //       yPos += 6;

  //       // Count questions in this section
  //       const questionCount = sectionQuestions.length;
  //       const sectionTotalMarks = sectionMarks[section] || 0;
  //       const marksPerQuestion =
  //         questionCount > 0 ? Math.round(sectionTotalMarks / questionCount) : 0;

  //       // Instruction and marks on same line below section heading (dynamic instruction)
  //       pdf.setFont("helvetica", "bold");
  //       pdf.setFontSize(10);
  //       const instruction =
  //         sectionInstructions[section] || "Answer All Questions.";
  //       pdf.text(instruction, margin, yPos);
  //       pdf.setFont("helvetica", "normal");
  //       pdf.text(
  //         `${questionCount}X${marksPerQuestion}=${sectionTotalMarks}`,
  //         pageWidth - margin,
  //         yPos,
  //         { align: "right" }
  //       );

  //       yPos += 8;
  //       pdf.setFontSize(11);
  //       pdf.setFont("helvetica", "normal");
  //     }

  //     // Questions in this section
  //     sectionQuestions.forEach((q, sectionIndex) => {
  //       if (yPos > 270) {
  //         pdf.addPage();
  //         yPos = margin;
  //       }

  //       // Question number (continuous across all sections) - always show
  //       globalQuestionNumber++;
  //       const questionWidth = pageWidth - 2 * margin;

  //       // Show question number and question text
  //       const hasAlternative = q.showOr === true && q.alternativeQuestion;
  //       const hasSubQuestions = q.subQuestions && q.subQuestions.length > 0;

  //       // Show question text if: has sub-questions OR (no sub-questions AND no alternative)
  //       if (hasSubQuestions || (!hasSubQuestions && !hasAlternative)) {
  //         const questionText = `${globalQuestionNumber}) ${
  //           q.questionText || ""
  //         }`;
  //         const lines = pdf.splitTextToSize(questionText, questionWidth);
  //         pdf.text(lines, margin, yPos);
  //         yPos += lines.length * 6;
  //         pdf.setFontSize(11);
  //         yPos += 3;
  //       } else {
  //         // Just show question number if question text will be shown as sub-question "a"
  //         pdf.text(`${globalQuestionNumber})`, margin, yPos);
  //         yPos += 6;
  //         pdf.setFontSize(11);
  //         yPos += 3;
  //       }

  //       // Helper function to convert number to roman numeral
  //       const toRoman = (num) => {
  //         const roman = [
  //           "i",
  //           "ii",
  //           "iii",
  //           "iv",
  //           "v",
  //           "vi",
  //           "vii",
  //           "viii",
  //           "ix",
  //           "x",
  //         ];
  //         return num <= roman.length ? roman[num - 1] : num.toString();
  //       };

  //       const mainItems = [];
  //       const alternativeItem =
  //         q.showOr === true && q.alternativeQuestion
  //           ? q.alternativeQuestion
  //           : null;

  //       // If main question has sub-questions, add them
  //       if (q.subQuestions && q.subQuestions.length > 0) {
  //         // Add main question sub-questions
  //         q.subQuestions.forEach((subQ) => {
  //           mainItems.push(subQ);
  //         });
  //       } else if (q.questionText && alternativeItem) {
  //         // If no sub-questions but has question text AND alternative exists, treat question text as "a"
  //         mainItems.push({
  //           text: q.questionText,
  //           showOr: false,
  //           isMainQuestionText: true,
  //         });
  //       }

  //       // Add all main question items
  //       // Only show letters (a, b, c) if alternative question exists
  //       if (mainItems.length > 0) {
  //         let subIndex = 0;
  //         mainItems.forEach((item, idx) => {
  //           if (yPos > 270) {
  //             pdf.addPage();
  //             yPos = margin;
  //           }

  //           // Add (Or) before this sub-question if previous one had showOr enabled
  //           if (idx > 0 && mainItems[idx - 1].showOr === true) {
  //             yPos += 2;
  //             pdf.setFontSize(10);
  //             pdf.setFont("helvetica", "normal");
  //             pdf.text("(Or)", pageWidth / 2, yPos, { align: "center" });
  //             yPos += 5;
  //           }

  //           // Only use letters (a, b, c) if alternative question exists
  //           const subLabel = alternativeItem
  //             ? subIndex === 0
  //               ? "a)"
  //               : subIndex === 1
  //               ? "b)"
  //               : String.fromCharCode(97 + subIndex) + ")"
  //             : "";
  //           const subText = subLabel
  //             ? `${subLabel} ${item.text || ""}`
  //             : item.text || "";
  //           const subLines = pdf.splitTextToSize(subText, questionWidth - 10);
  //           pdf.setFontSize(10);
  //           pdf.text(subLines, margin + 10, yPos);
  //           yPos += subLines.length * 5;
  //           subIndex++;
  //         });
  //         yPos += 3;
  //       }

  //       // Add alternative question
  //       if (alternativeItem) {
  //         // Add (Or) before alternative if there are main items
  //         if (mainItems.length > 0) {
  //           if (yPos > 270) {
  //             pdf.addPage();
  //             yPos = margin;
  //           }
  //           yPos += 2;
  //           pdf.setFontSize(10);
  //           pdf.setFont("helvetica", "normal");
  //           pdf.text("(Or)", pageWidth / 2, yPos, { align: "center" });
  //           yPos += 5;
  //         }

  //         // Alternative question text as "b)"
  //         if (alternativeItem.questionText) {
  //           if (yPos > 270) {
  //             pdf.addPage();
  //             yPos = margin;
  //           }
  //           const altText = `b) ${alternativeItem.questionText}`;
  //           const altLines = pdf.splitTextToSize(altText, questionWidth - 10);
  //           pdf.setFontSize(10);
  //           pdf.text(altLines, margin + 10, yPos);
  //           yPos += altLines.length * 5;
  //         }

  //         // Alternative question sub-questions as roman numerals nested under "b)"
  //         if (
  //           alternativeItem.subQuestions &&
  //           alternativeItem.subQuestions.length > 0
  //         ) {
  //           alternativeItem.subQuestions.forEach((subQ, altIdx) => {
  //             if (yPos > 270) {
  //               pdf.addPage();
  //               yPos = margin;
  //             }

  //             // Add (Or) before this sub-question if previous one had showOr enabled
  //             if (
  //               altIdx > 0 &&
  //               alternativeItem.subQuestions[altIdx - 1].showOr === true
  //             ) {
  //               yPos += 2;
  //               pdf.setFontSize(10);
  //               pdf.setFont("helvetica", "normal");
  //               pdf.text("(Or)", pageWidth / 2, yPos, { align: "center" });
  //               yPos += 5;
  //             }

  //             const romanLabel = toRoman(altIdx + 1);
  //             const subText = `${romanLabel}) ${subQ.text || ""}`;
  //             const subLines = pdf.splitTextToSize(subText, questionWidth - 10);
  //             pdf.setFontSize(10);
  //             pdf.text(subLines, margin + 20, yPos); // Extra indentation for nested sub-questions
  //             yPos += subLines.length * 5;
  //           });
  //           yPos += 3;
  //         }
  //       }

  //       // Add options for MCQ
  //       if (q.questionType === "MCQ" && q.options && q.options.length > 0) {
  //         q.options.forEach((option, optIndex) => {
  //           if (yPos > 270) {
  //             pdf.addPage();
  //             yPos = margin;
  //           }
  //           const optionText = `   ${String.fromCharCode(
  //             65 + optIndex
  //           )}. ${option}`;
  //           const optionLines = pdf.splitTextToSize(
  //             optionText,
  //             questionWidth - 10
  //           );
  //           pdf.setFontSize(10);
  //           pdf.text(optionLines, margin + 10, yPos);
  //           yPos += optionLines.length * 5;
  //         });
  //         yPos += 3;
  //       }

  //       // Note: Alternative question sub-questions are already merged above with main sub-questions
  //       // If alternative question has MCQ or Match the Following, add them here
  //       if (q.showOr === true && q.alternativeQuestion) {
  //         // Add options for MCQ in alternative (if no sub-questions, show MCQ options)
  //         if (
  //           q.alternativeQuestion.questionType === "MCQ" &&
  //           q.alternativeQuestion.options &&
  //           q.alternativeQuestion.options.length > 0 &&
  //           (!q.alternativeQuestion.subQuestions ||
  //             q.alternativeQuestion.subQuestions.length === 0)
  //         ) {
  //           q.alternativeQuestion.options.forEach((option, optIndex) => {
  //             if (yPos > 270) {
  //               pdf.addPage();
  //               yPos = margin;
  //             }
  //             const optionText = `   ${String.fromCharCode(
  //               65 + optIndex
  //             )}. ${option}`;
  //             const optionLines = pdf.splitTextToSize(
  //               optionText,
  //               questionWidth - 10
  //             );
  //             pdf.setFontSize(10);
  //             pdf.text(optionLines, margin + 10, yPos);
  //             yPos += optionLines.length * 5;
  //           });
  //           yPos += 3;
  //         }

  //         // Add matching pairs for alternative (if no sub-questions, show matching pairs)
  //         if (
  //           q.alternativeQuestion.questionType === "Match the Following" &&
  //           q.alternativeQuestion.matchingPairs &&
  //           q.alternativeQuestion.matchingPairs.length > 0 &&
  //           (!q.alternativeQuestion.subQuestions ||
  //             q.alternativeQuestion.subQuestions.length === 0)
  //         ) {
  //           q.alternativeQuestion.matchingPairs.forEach((pair, pairIndex) => {
  //             if (yPos > 270) {
  //               pdf.addPage();
  //               yPos = margin;
  //             }
  //             const pairText = `   ${pair.left || "___"} → ${
  //               pair.right || "___"
  //             }`;
  //             const pairLines = pdf.splitTextToSize(
  //               pairText,
  //               questionWidth - 10
  //             );
  //             pdf.setFontSize(10);
  //             pdf.text(pairLines, margin + 10, yPos);
  //             yPos += pairLines.length * 5;
  //           });
  //           yPos += 3;
  //         }
  //       }

  //       // Add options for True/False
  //       if (q.questionType === "True/False") {
  //         if (yPos > 270) {
  //           pdf.addPage();
  //           yPos = margin;
  //         }
  //         pdf.setFontSize(10);
  //         pdf.text(`   ( ) True`, margin + 10, yPos);
  //         yPos += 5;
  //         pdf.text(`   ( ) False`, margin + 10, yPos);
  //         yPos += 5;
  //       }

  //       // Add matching pairs for Match the Following
  //       if (
  //         q.questionType === "Match the Following" &&
  //         q.matchingPairs &&
  //         q.matchingPairs.length > 0
  //       ) {
  //         q.matchingPairs.forEach((pair) => {
  //           if (yPos > 270) {
  //             pdf.addPage();
  //             yPos = margin;
  //           }
  //           pdf.setFontSize(10);
  //           const pairText = `   ${pair.left || "___"} → ${
  //             pair.right || "___"
  //           }`;
  //           const pairLines = pdf.splitTextToSize(pairText, questionWidth - 10);
  //           pdf.text(pairLines, margin + 10, yPos);
  //           yPos += pairLines.length * 5;
  //         });
  //         yPos += 3;
  //       }

  //       // Add options for Fill in the Blanks
  //       if (
  //         q.questionType === "Fill in the Blanks" &&
  //         q.options &&
  //         q.options.length > 0
  //       ) {
  //         if (yPos > 270) {
  //           pdf.addPage();
  //           yPos = margin;
  //         }
  //         pdf.setFontSize(10);
  //         const answersText = `   Possible answers: ${
  //           Array.isArray(q.options) ? q.options.join(", ") : q.options
  //         }`;
  //         const answersLines = pdf.splitTextToSize(
  //           answersText,
  //           questionWidth - 10
  //         );
  //         pdf.text(answersLines, margin + 10, yPos);
  //         yPos += answersLines.length * 5;
  //       }

  //       pdf.setFontSize(11);
  //       yPos += 8;
  //     });
  //   });

  //   // Footer
  //   const calculatedTotalMarks = questions.reduce((sum, q) => {
  //     return sum + (parseInt(q.marks) || 0);
  //   }, 0);
  //   const totalMarks = formData.totalMarks || calculatedTotalMarks;
  //   pdf.setFontSize(10);
  //   pdf.text(`Total Marks: ${totalMarks}`, margin, 280);

  //   // Save PDF
  //   const fileName = `${subjectCode}_${paperType.replace(
  //     " ",
  //     "_"
  //   )}_${Date.now()}.pdf`;
  //   pdf.save(fileName);
  // };

  // Note: PDF generation is handled in parent's handleSubmit

  const selectedSubject = subjects.find((s) => s._id === formData.subjectId);

  if (showPreview) {
    const totalMarks = (formData.questions || []).reduce((sum, q) => {
      return sum + (parseInt(q.marks) || 0);
    }, 0);

    // Group questions by section
    const questionsBySection = {};
    (formData.questions || []).forEach((q) => {
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
      if (
        sectionMarksValue !== undefined &&
        sectionMarksValue !== null &&
        sectionMarksValue !== ""
      ) {
        // Handle both string and number types
        const marksValue =
          typeof sectionMarksValue === "string"
            ? sectionMarksValue.trim() !== ""
              ? parseInt(sectionMarksValue)
              : 0
            : typeof sectionMarksValue === "number"
            ? sectionMarksValue
            : 0;
        sectionMarks[section] = marksValue || 0;
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
    const sortedSections = Object.keys(questionsBySection).sort((a, b) => {
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
    });

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Question Paper Preview
          </h3>
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="text-gray-600 hover:text-gray-800"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          {/* Header - Matching PDF format */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              ADIKAVI NANNAYA UNIVERSITY
            </h2>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              RAJAHMUNDRY
            </h2>
            <p className="text-base text-gray-700 mb-1">Model Question Paper</p>
            <p className="text-sm text-gray-600 mb-1">
              {formData.paperType || "Paper 1"}{" "}
              {selectedSubject?.name || formData.subjectName || "Subject"}
              {selectedSubject?.code || formData.subjectCode
                ? ` (${selectedSubject?.code || formData.subjectCode})`
                : ""}
            </p>
            {(() => {
              const selectedYear = academicYears.find(
                (year) => year._id === formData.academicYearId
              );
              return (
                selectedYear && (
                  <p className="text-sm text-gray-600 mb-1">
                    Academic Year:{" "}
                    {selectedYear.code ||
                      selectedYear.name ||
                      formData.academicYearCode ||
                      formData.academicYearName}
                  </p>
                )
              );
            })()}
            {/* {formData.questionPaperNumber && (
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Question Paper No: {formData.questionPaperNumber}
              </p>
            )}
            {(formData.professorName || formData.professorEmployeeId) && (
              <p className="text-sm text-gray-600 mb-3">
                Professor: {formData.professorName || ""} {formData.professorEmployeeId ? `(ID: ${formData.professorEmployeeId})` : ""}
              </p>
            )} */}
            <div className="flex justify-between items-center text-sm text-gray-600 border-t border-b border-gray-200 py-2">
              <span>Time: {formData.duration || "3 hours"}</span>
              <span>Max. Marks: {formData.totalMarks || totalMarks}</span>
            </div>
          </div>

          {/* Questions grouped by section */}
          <div className="space-y-6">
            {(() => {
              let globalQuestionNumber = 0;
              return sortedSections.map((section) => {
                const sectionQuestions = questionsBySection[section];

                return (
                  <div key={section}>
                    {/* Section Header */}
                    {section !== "No Section" && (
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                          {section.toUpperCase().includes("SECTION")
                            ? section
                                .toUpperCase()
                                .replace(/SECTION\s*/i, "SECTION -")
                                .replace(/\s+/g, " ")
                                .trim()
                            : `SECTION -${
                                section
                                  .toUpperCase()
                                  .replace(/SECTION\s*/i, "")
                                  .trim() || "A"
                              }`}
                        </h3>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                          <span className="font-bold">
                            {sectionInstructions[section] ||
                              "Answer All Questions."}
                          </span>
                          <span>
                            {(() => {
                              const questionCount = sectionQuestions.length;
                              const sectionTotalMarks =
                                sectionMarks[section] || 0;
                              const marksPerQuestion =
                                questionCount > 0
                                  ? Math.round(
                                      sectionTotalMarks / questionCount
                                    )
                                  : 0;
                              return `${questionCount}X${marksPerQuestion}=${sectionTotalMarks}`;
                            })()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Questions in this section */}
                    {sectionQuestions.map((q, sectionIndex) => {
                      globalQuestionNumber++;
                      return (
                        <div key={q.id || sectionIndex}>
                          <div className="pb-4 mb-4">
                            {/* Always show question number */}
                            <div className="mb-3">
                              <span className="font-semibold text-gray-800">
                                {globalQuestionNumber}){" "}
                              </span>
                              {/* Show main question text if there are sub-questions OR if there's no alternative question */}
                              {(() => {
                                const hasAlternative =
                                  q.showOr === true && q.alternativeQuestion;
                                const hasSubQuestions =
                                  q.subQuestions && q.subQuestions.length > 0;
                                // Show question text if: has sub-questions OR (no sub-questions AND no alternative)
                                if (
                                  hasSubQuestions ||
                                  (!hasSubQuestions && !hasAlternative)
                                ) {
                                  return (
                                    <span className="text-gray-700 whitespace-pre-wrap">
                                      {q.questionText || ""}
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>

                            {/* Show sub-questions - combine main and alternative */}
                            {(() => {
                              const mainItems = [];
                              const alternativeItem =
                                q.showOr === true && q.alternativeQuestion
                                  ? q.alternativeQuestion
                                  : null;

                              // If main question has sub-questions, add them
                              if (q.subQuestions && q.subQuestions.length > 0) {
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

                              // If no alternative question, show sub-questions without letters (a, b, c)
                              if (!alternativeItem) {
                                // If no alternative and no sub-questions, nothing to show (question text already shown above)
                                if (mainItems.length === 0) return null;

                                // Show sub-questions without letter labels
                                return (
                                  <div className="mt-3 ml-4 space-y-2">
                                    {mainItems.map((item, idx) => (
                                      <div key={`main-${idx}`}>
                                        {/* Add (Or) before this sub-question if previous one had showOr enabled */}
                                        {idx > 0 &&
                                          mainItems[idx - 1].showOr ===
                                            true && (
                                            <div className="text-center text-xs text-gray-400 my-1">
                                              (Or)
                                            </div>
                                          )}
                                        <div className="text-sm text-gray-700">
                                          <span>{item.text || ""}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }

                              // If alternative exists, show with letters (a, b) for main and alternative
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
                                return num <= roman.length
                                  ? roman[num - 1]
                                  : num.toString();
                              };

                              let subIndex = 0;
                              return (
                                <div className="mt-3 ml-4 space-y-2">
                                  {/* Main question items - use letters (a, b) only when alternative exists */}
                                  {mainItems.map((item, idx) => {
                                    const result = (
                                      <div key={`main-${idx}`}>
                                        {/* Add (Or) before this sub-question if previous one had showOr enabled */}
                                        {idx > 0 &&
                                          mainItems[idx - 1].showOr ===
                                            true && (
                                            <div className="text-center text-xs text-gray-400 my-1">
                                              (Or)
                                            </div>
                                          )}
                                        <div className="text-sm text-gray-700">
                                          <span className="font-medium">
                                            {subIndex === 0
                                              ? "a)"
                                              : subIndex === 1
                                              ? "b)"
                                              : String.fromCharCode(
                                                  97 + subIndex
                                                ) + ")"}{" "}
                                          </span>
                                          <span>{item.text || ""}</span>
                                        </div>
                                      </div>
                                    );
                                    subIndex++;
                                    return result;
                                  })}

                                  {/* Alternative question */}
                                  {alternativeItem && (
                                    <>
                                      {/* Add (Or) before alternative if there are main items */}
                                      {mainItems.length > 0 && (
                                        <div className="text-center text-xs text-gray-400 my-1">
                                          (Or)
                                        </div>
                                      )}
                                      {/* Alternative question text as "b)" */}
                                      {alternativeItem.questionText && (
                                        <div className="text-sm text-gray-700">
                                          <span className="font-medium">
                                            b){" "}
                                          </span>
                                          <span>
                                            {alternativeItem.questionText}
                                          </span>
                                        </div>
                                      )}
                                      {/* Alternative question sub-questions as roman numerals nested under "b)" */}
                                      {alternativeItem.subQuestions &&
                                        alternativeItem.subQuestions.length >
                                          0 && (
                                          <div className="ml-6 mt-2 space-y-1">
                                            {alternativeItem.subQuestions.map(
                                              (subQ, altIdx) => (
                                                <div
                                                  key={`alt-sub-${altIdx}`}
                                                  className="text-sm text-gray-700"
                                                >
                                                  {/* Add (Or) before this sub-question if previous one had showOr enabled */}
                                                  {altIdx > 0 &&
                                                    alternativeItem
                                                      .subQuestions[altIdx - 1]
                                                      .showOr === true && (
                                                      <div className="text-center text-xs text-gray-400 my-1">
                                                        (Or)
                                                      </div>
                                                    )}
                                                  <span className="font-medium">
                                                    {toRoman(altIdx + 1)}){" "}
                                                  </span>
                                                  <span>{subQ.text || ""}</span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}
                                    </>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Show options for MCQ */}
                            {q.questionType === "MCQ" &&
                              q.options &&
                              q.options.length > 0 && (
                                <div className="mt-3 ml-4 space-y-2">
                                  {q.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className="flex items-center gap-2"
                                    >
                                      <span className="text-sm font-medium text-gray-600 w-6">
                                        {String.fromCharCode(65 + optIndex)}.
                                      </span>
                                      <span
                                        className={`text-sm ${
                                          q.correctAnswer ===
                                          String.fromCharCode(65 + optIndex)
                                            ? "text-emerald-600 font-semibold"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {option}
                                        {q.correctAnswer ===
                                          String.fromCharCode(65 + optIndex) &&
                                          " ✓"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Show options for True/False */}
                            {q.questionType === "True/False" && (
                              <div className="mt-3 ml-4 space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`preview_tf_${q.id || sectionIndex}`}
                                    disabled
                                    className="w-4 h-4 text-emerald-600"
                                  />
                                  <span className="text-sm text-gray-700">
                                    True
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`preview_tf_${q.id || sectionIndex}`}
                                    disabled
                                    className="w-4 h-4 text-emerald-600"
                                  />
                                  <span className="text-sm text-gray-700">
                                    False
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Show matching pairs for Match the Following */}
                            {q.questionType === "Match the Following" &&
                              q.matchingPairs &&
                              q.matchingPairs.length > 0 && (
                                <div className="mt-3 ml-4 space-y-2">
                                  {q.matchingPairs.map((pair, pairIndex) => (
                                    <div
                                      key={pairIndex}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <span className="text-gray-700">
                                        {pair.left || "___"}
                                      </span>
                                      <span className="text-gray-500">→</span>
                                      <span className="text-gray-700">
                                        {pair.right || "___"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Show options for Fill in the Blanks */}
                            {q.questionType === "Fill in the Blanks" &&
                              q.options &&
                              q.options.length > 0 && (
                                <div className="mt-3 ml-4">
                                  <span className="text-sm text-gray-600">
                                    Possible answers:{" "}
                                  </span>
                                  <span className="text-sm text-gray-700">
                                    {Array.isArray(q.options)
                                      ? q.options.join(", ")
                                      : q.options}
                                  </span>
                                </div>
                              )}

                            {/* Show MCQ/Match options for alternative if no sub-questions */}
                            {q.showOr === true &&
                              q.alternativeQuestion &&
                              (!q.alternativeQuestion.subQuestions ||
                                q.alternativeQuestion.subQuestions.length ===
                                  0) && (
                                <>
                                  {/* Show options for MCQ in alternative */}
                                  {q.alternativeQuestion.questionType ===
                                    "MCQ" &&
                                    q.alternativeQuestion.options &&
                                    q.alternativeQuestion.options.length >
                                      0 && (
                                      <div className="mt-3 ml-4 space-y-2">
                                        {q.alternativeQuestion.options.map(
                                          (option, optIndex) => (
                                            <div
                                              key={optIndex}
                                              className="flex items-center gap-2"
                                            >
                                              <span className="text-sm font-medium text-gray-600 w-6">
                                                {String.fromCharCode(
                                                  65 + optIndex
                                                )}
                                                .
                                              </span>
                                              <span
                                                className={`text-sm ${
                                                  q.alternativeQuestion
                                                    .correctAnswer ===
                                                  String.fromCharCode(
                                                    65 + optIndex
                                                  )
                                                    ? "text-emerald-600 font-semibold"
                                                    : "text-gray-700"
                                                }`}
                                              >
                                                {option}
                                                {q.alternativeQuestion
                                                  .correctAnswer ===
                                                  String.fromCharCode(
                                                    65 + optIndex
                                                  ) && " ✓"}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}

                                  {/* Show matching pairs for alternative */}
                                  {q.alternativeQuestion.questionType ===
                                    "Match the Following" &&
                                    q.alternativeQuestion.matchingPairs &&
                                    q.alternativeQuestion.matchingPairs.length >
                                      0 && (
                                      <div className="mt-3 ml-4 space-y-2">
                                        {q.alternativeQuestion.matchingPairs.map(
                                          (pair, pairIndex) => (
                                            <div
                                              key={pairIndex}
                                              className="flex items-center gap-2 text-sm"
                                            >
                                              <span className="text-gray-700">
                                                {pair.left || "___"}
                                              </span>
                                              <span className="text-gray-500">
                                                →
                                              </span>
                                              <span className="text-gray-700">
                                                {pair.right || "___"}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                </>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-right font-semibold text-gray-800">
              Total Marks: {formData.totalMarks || totalMarks}
            </p>
          </div>
        </div>

        {/* <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back to Edit
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Note: PDF will be generated and sent to admin upon submission. Download is not available for confidentiality.
          </p>
        </div> */}
      </div>
    );
  }

  return (
    <>
      {/* Course, Stream, and Semester Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Course <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="courseId"
              value={formData.courseId || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
              required
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
            {renderValidationIconWrapper &&
              renderValidationIconWrapper(
                "courseId",
                formData.courseId,
                null,
                "Course",
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
            Stream <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="streamId"
              value={formData.streamId || ""}
              onChange={handleInputChange}
              disabled={!formData.courseId}
              className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white disabled:bg-gray-100"
              required
            >
              <option value="">
                {!formData.courseId ? "Select course first" : "Select Stream"}
              </option>
              {availableStreams.map((stream) => (
                <option key={stream._id} value={stream._id}>
                  {stream.name} ({stream.code})
                </option>
              ))}
            </select>
            {renderValidationIconWrapper &&
              renderValidationIconWrapper(
                "streamId",
                formData.streamId,
                null,
                "Stream",
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

      {/* Semester Dropdown */}
      <div className="mb-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Semester <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            name="semesterNumber"
            value={formData.semesterNumber || ""}
            onChange={handleInputChange}
            disabled={!formData.courseId || !formData.streamId}
            className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white disabled:bg-gray-100"
            required
          >
            <option value="">
              {!formData.courseId || !formData.streamId
                ? "Select course and stream first"
                : "Select Semester"}
            </option>
            {availableSemesters.map((sem) => (
              <option key={sem.semesterNumber} value={sem.semesterNumber}>
                Semester {sem.semesterNumber}
              </option>
            ))}
          </select>
          {renderValidationIconWrapper &&
            renderValidationIconWrapper(
              "semesterNumber",
              formData.semesterNumber,
              null,
              "Semester",
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
          Subject*
        </label>
        <div className="relative">
          <select
            name="subjectId"
            value={formData.subjectId || ""}
            onChange={handleInputChange}
            disabled={!formData.courseId || !formData.streamId || !formData.semesterNumber}
            className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white disabled:bg-gray-100"
            required
          >
            <option value="">
              {!formData.courseId || !formData.streamId || !formData.semesterNumber
                ? "Select course, stream, and semester first"
                : "Select Subject"}
            </option>
            {availableSubjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
          {renderValidationIconWrapper &&
            renderValidationIconWrapper(
              "subjectId",
              formData.subjectId,
              null,
              "Subject",
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
          Question Paper Number*
        </label>
        <input
          type="text"
          name="questionPaperNumber"
          value={formData.questionPaperNumber || ""}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          required
          placeholder="e.g., 202425MATH-101P1Q1"
        />
        {/* <p className="mt-1 text-xs text-gray-500">
          Format: Year + Subject Code + Paper Number + Question Paper Number (e.g., 202425MATH-101P1Q1)
        </p> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Professor Name*
          </label>
          <input
            type="text"
            name="professorName"
            value={formData.professorName || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
            placeholder="Enter professor name"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Employee ID*
          </label>
          <input
            type="text"
            name="professorEmployeeId"
            value={formData.professorEmployeeId || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
            placeholder="Enter employee ID"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Academic Year*
          </label>
          <div className="relative">
            <select
              name="academicYearId"
              value={formData.academicYearId || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
              required
            >
              <option value="">Select Academic Year</option>
              {academicYears.map((year) => (
                <option key={year._id} value={year._id}>
                  {year.code || year.name || year._id}
                </option>
              ))}
            </select>
            {renderValidationIconWrapper &&
              renderValidationIconWrapper(
                "academicYearId",
                formData.academicYearId,
                null,
                "Academic Year",
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
            Paper Type*
          </label>
          <input
            type="text"
            name="paperType"
            value={formData.paperType || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
            placeholder="e.g., Paper 1, Paper 2, Paper 3"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Examination Type*
          </label>
          <div className="relative">
            <select
              name="examinationType"
              value={formData.examinationType || ""}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
              required
            >
              <option value="">Select Examination Type</option>
              {examTypes.map((type) => (
                <option key={type._id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
            {renderValidationIconWrapper &&
              renderValidationIconWrapper(
                "examinationType",
                formData.examinationType,
                null,
                "Examination Type",
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
            Duration*
          </label>
          <input
            type="text"
            name="duration"
            value={formData.duration || "3 hours"}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g., 3 hours, 3 mins, 2.5 hours"
            required
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Total Marks
        </label>
        <input
          type="number"
          name="totalMarks"
          value={formData.totalMarks || ""}
          onChange={handleInputChange}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="e.g., 75"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to auto-calculate from question marks
        </p>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Sections & Questions*
          </label>
          <button
            type="button"
            onClick={addQuestion}
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            + Add Section
          </button>
        </div>

        {/* Group questions by section */}
        {(() => {
          // Normalize section names for grouping
          const normalizeSection = (section) => {
            if (!section || section.trim() === "") return "No Section";
            // Remove "SECTION" prefix, trim, and convert to uppercase for consistent grouping
            const normalized = section
              .trim()
              .replace(/^SECTION\s*/i, "")
              .trim()
              .toUpperCase();
            return normalized || "No Section";
          };

          const questionsBySection = {};
          (formData.questions || []).forEach((q) => {
            const normalizedSection = normalizeSection(q.section);
            if (!questionsBySection[normalizedSection]) {
              questionsBySection[normalizedSection] = [];
            }
            questionsBySection[normalizedSection].push(q);
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

          return (
            <div className="space-y-6">
              {sortedSections.map((normalizedSection) => {
                const sectionQuestions = questionsBySection[normalizedSection];
                const firstQuestion = sectionQuestions[0];
                const sectionInstruction =
                  firstQuestion?.sectionInstruction || "";
                // Get the display section name from the first question's actual section value
                const displaySection =
                  firstQuestion?.section || normalizedSection;

                const isCollapsed =
                  collapsedSections[normalizedSection] || false;

                return (
                  <div
                    key={normalizedSection}
                    className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
                  >
                    {/* Section Header */}
                    {normalizedSection !== "No Section" && (
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleSection(normalizedSection)}
                              className="text-gray-600 hover:text-gray-800 focus:outline-none"
                              title={
                                isCollapsed
                                  ? "Expand section"
                                  : "Collapse section"
                              }
                            >
                              <svg
                                className={`w-5 h-5 transition-transform ${
                                  isCollapsed ? "" : "rotate-90"
                                }`}
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
                            <h3 className="text-base font-bold text-gray-800">
                              {normalizedSection.includes("SECTION")
                                ? normalizedSection
                                    .replace(/SECTION\s*/i, "SECTION -")
                                    .replace(/\s+/g, " ")
                                    .trim()
                                : `SECTION -${
                                    normalizedSection
                                      .replace(/SECTION\s*/i, "")
                                      .trim() || "A"
                                  }`}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              // Remove all questions in this normalized section
                              setFormData((prev) => ({
                                ...prev,
                                questions: (prev.questions || []).filter(
                                  (q) => {
                                    const qNormalized = normalizeSection(
                                      q.section
                                    );
                                    return qNormalized !== normalizedSection;
                                  }
                                ),
                              }));
                            }}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 hover:bg-red-50 rounded"
                          >
                            Remove Section
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={sectionInstruction}
                            onChange={(e) => {
                              const instruction = e.target.value;
                              // Update instruction for all questions in this normalized section
                              setFormData((prev) => ({
                                ...prev,
                                questions: (prev.questions || []).map((q) => {
                                  const qNormalized = normalizeSection(
                                    q.section
                                  );
                                  return qNormalized === normalizedSection
                                    ? { ...q, sectionInstruction: instruction }
                                    : q;
                                }),
                              }));
                            }}
                            className="flex-1 px-3 py-1.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="e.g., Answer All Questions, Answer any 5 questions"
                          />
                          <input
                            type="number"
                            value={firstQuestion?.sectionMarks || ""}
                            onChange={(e) => {
                              const marks = e.target.value;
                              // Update section marks for all questions in this normalized section
                              setFormData((prev) => ({
                                ...prev,
                                questions: (prev.questions || []).map((q) => {
                                  const qNormalized = normalizeSection(
                                    q.section
                                  );
                                  return qNormalized === normalizedSection
                                    ? { ...q, sectionMarks: marks }
                                    : q;
                                }),
                              }));
                            }}
                            className="w-24 px-3 py-1.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Marks"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              // Add a new question to this section using the display section name
                              const newQuestion = {
                                id: `q_${Date.now()}_${Math.random()}`,
                                questionType: "Descriptive",
                                questionText: "",
                                marks: "",
                                section: displaySection, // Use the actual section name from first question
                                sectionInstruction: sectionInstruction,
                                sectionMarks: firstQuestion?.sectionMarks || "",
                                subQuestions: [],
                                options: [],
                                correctAnswer: "",
                                matchingPairs: [],
                              };
                              setFormData((prev) => ({
                                ...prev,
                                questions: [
                                  ...(prev.questions || []),
                                  newQuestion,
                                ],
                              }));
                            }}
                            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            + Add Question to Section
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Questions in this section */}
                    {!isCollapsed && (
                      <div className="space-y-4">
                        {sectionQuestions.map((question, sectionIndex) => {
                          const isQuestionCollapsed =
                            collapsedQuestions[question.id] || false;
                          return (
                            <React.Fragment key={question.id || sectionIndex}>
                              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleQuestion(question.id)
                                      }
                                      className="text-gray-600 hover:text-gray-800 focus:outline-none"
                                      title={
                                        isQuestionCollapsed
                                          ? "Expand question"
                                          : "Collapse question"
                                      }
                                    >
                                      <svg
                                        className={`w-4 h-4 transition-transform ${
                                          isQuestionCollapsed ? "" : "rotate-90"
                                        }`}
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
                                    <span className="text-sm font-medium text-gray-700">
                                      {normalizedSection !== "No Section"
                                        ? `Question ${sectionIndex + 1}`
                                        : `Question ${
                                            (formData.questions || []).indexOf(
                                              question
                                            ) + 1
                                          }`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewQuestion(question)
                                      }
                                      className="text-emerald-600 hover:text-emerald-800 text-sm px-2 py-1 hover:bg-emerald-50 rounded font-medium flex items-center gap-1"
                                      title="Preview this question"
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
                                      Preview
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeQuestion(question.id)
                                      }
                                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 hover:bg-red-50 rounded font-medium"
                                      title="Remove this question"
                                    >
                                      × Remove
                                    </button>
                                  </div>
                                </div>

                                {!isQuestionCollapsed && (
                                  <>
                                    <div
                                      className={`grid gap-4 mb-3 ${
                                        normalizedSection !== "No Section"
                                          ? "grid-cols-1 md:grid-cols-2"
                                          : "grid-cols-1 md:grid-cols-3"
                                      }`}
                                    >
                                      {/* Only show section field if question is not in a section */}
                                      {normalizedSection === "No Section" && (
                                        <div>
                                          <label className="block mb-1 text-xs font-medium text-gray-600">
                                            Section
                                          </label>
                                          <input
                                            type="text"
                                            value={question.section || ""}
                                            onChange={(e) => {
                                              const newSection =
                                                e.target.value.trim();
                                              updateQuestion(
                                                question.id,
                                                "section",
                                                newSection
                                              );
                                              // If section instruction exists for this section, copy it to this question
                                              if (newSection) {
                                                const normalizeSection = (
                                                  s
                                                ) => {
                                                  if (!s || s.trim() === "")
                                                    return "No Section";
                                                  return s
                                                    .trim()
                                                    .replace(/^SECTION\s*/i, "")
                                                    .trim()
                                                    .toUpperCase();
                                                };
                                                const newNormalized =
                                                  normalizeSection(newSection);
                                                const existingQuestion =
                                                  formData.questions.find(
                                                    (q) => {
                                                      const qNormalized =
                                                        normalizeSection(
                                                          q.section
                                                        );
                                                      return (
                                                        qNormalized ===
                                                          newNormalized &&
                                                        (q.sectionInstruction ||
                                                          q.sectionMarks)
                                                      );
                                                    }
                                                  );
                                                if (
                                                  existingQuestion?.sectionInstruction
                                                ) {
                                                  updateQuestion(
                                                    question.id,
                                                    "sectionInstruction",
                                                    existingQuestion.sectionInstruction
                                                  );
                                                }
                                                if (
                                                  existingQuestion?.sectionMarks
                                                ) {
                                                  updateQuestion(
                                                    question.id,
                                                    "sectionMarks",
                                                    existingQuestion.sectionMarks
                                                  );
                                                }
                                              }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                            placeholder="e.g., Section A or A"
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-600">
                                          Question Type*
                                        </label>
                                        <select
                                          value={
                                            question.questionType ||
                                            "Descriptive"
                                          }
                                          onChange={(e) =>
                                            updateQuestion(
                                              question.id,
                                              "questionType",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                          required
                                        >
                                          {questionTypes.map((type) => (
                                            <option key={type} value={type}>
                                              {type}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      {normalizedSection === "No Section" ? (
                                        <div>
                                          <label className="block mb-1 text-xs font-medium text-gray-600">
                                            Marks*
                                          </label>
                                          <input
                                            type="number"
                                            value={question.marks || ""}
                                            onChange={(e) =>
                                              updateQuestion(
                                                question.id,
                                                "marks",
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                            placeholder="e.g., 10"
                                            min="1"
                                            required
                                          />
                                        </div>
                                      ) : (
                                        <div>
                                          <label className="block mb-1 text-xs font-medium text-gray-600">
                                            Marks (Auto-calculated)
                                          </label>
                                          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600">
                                            {(() => {
                                              const sectionMarksValue =
                                                firstQuestion?.sectionMarks;
                                              // Handle both string and number types
                                              const sectionTotalMarks =
                                                sectionMarksValue !==
                                                  undefined &&
                                                sectionMarksValue !== null &&
                                                sectionMarksValue !== ""
                                                  ? typeof sectionMarksValue ===
                                                    "string"
                                                    ? sectionMarksValue.trim() !==
                                                      ""
                                                      ? parseInt(
                                                          sectionMarksValue
                                                        )
                                                      : 0
                                                    : typeof sectionMarksValue ===
                                                      "number"
                                                    ? sectionMarksValue
                                                    : 0
                                                  : 0;
                                              const questionCount =
                                                questionsBySection[
                                                  normalizedSection
                                                ]?.length || 1;
                                              const marksPerQuestion =
                                                questionCount > 0
                                                  ? Math.round(
                                                      sectionTotalMarks /
                                                        questionCount
                                                    )
                                                  : 0;
                                              return marksPerQuestion > 0
                                                ? marksPerQuestion
                                                : "-";
                                            })()}
                                          </div>
                                          <p className="text-xs text-gray-500 mt-1">
                                            Section marks divided equally among{" "}
                                            {questionsBySection[
                                              normalizedSection
                                            ]?.length || 0}{" "}
                                            questions
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <label className="block mb-1 text-xs font-medium text-gray-600">
                                        Question Text*
                                      </label>
                                      <textarea
                                        value={question.questionText || ""}
                                        onChange={(e) =>
                                          updateQuestion(
                                            question.id,
                                            "questionText",
                                            e.target.value
                                          )
                                        }
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                        placeholder="Enter the question text..."
                                        required
                                      />
                                    </div>

                                    {/* Sub-questions with (or) option */}
                                    <div className="mt-3">
                                      <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-medium text-gray-600">
                                          Sub-questions (with "or" option)
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            addSubQuestion(question.id)
                                          }
                                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                          + Add Sub-question
                                        </button>
                                      </div>
                                      {(question.subQuestions || []).map(
                                        (subQ, subIndex) => (
                                          <div
                                            key={subIndex}
                                            className="mb-2 p-2 bg-white border border-gray-200 rounded"
                                          >
                                            <div className="flex items-start gap-2">
                                              <span className="text-xs text-gray-500 mt-2">
                                                {subIndex === 0
                                                  ? "a)"
                                                  : subIndex === 1
                                                  ? "b)"
                                                  : String.fromCharCode(
                                                      97 + subIndex
                                                    ) + ")"}
                                              </span>
                                              <div className="flex-1">
                                                <textarea
                                                  value={subQ.text || ""}
                                                  onChange={(e) =>
                                                    updateSubQuestion(
                                                      question.id,
                                                      subIndex,
                                                      "text",
                                                      e.target.value
                                                    )
                                                  }
                                                  rows={2}
                                                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                                                  placeholder="Sub-question text..."
                                                />
                                              </div>
                                              {(question.subQuestions || [])
                                                .length >= 1 && (
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    removeSubQuestion(
                                                      question.id,
                                                      subIndex
                                                    )
                                                  }
                                                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                                                  title="Remove sub-question"
                                                >
                                                  ×
                                                </button>
                                              )}
                                            </div>
                                            {/* Show (OR) option checkbox - only show if not the last sub-question */}
                                            {subIndex <
                                              (question.subQuestions || [])
                                                .length -
                                                1 && (
                                              <div className="mt-2 flex items-center gap-2">
                                                <input
                                                  type="checkbox"
                                                  id={`showOr_${question.id}_${subIndex}`}
                                                  checked={
                                                    subQ.showOr !== false
                                                  }
                                                  onChange={(e) =>
                                                    updateSubQuestion(
                                                      question.id,
                                                      subIndex,
                                                      "showOr",
                                                      e.target.checked
                                                    )
                                                  }
                                                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                />
                                                <label
                                                  htmlFor={`showOr_${question.id}_${subIndex}`}
                                                  className="text-xs text-gray-600 cursor-pointer"
                                                >
                                                  Show "(Or)" after this
                                                  sub-question
                                                </label>
                                              </div>
                                            )}
                                            {/* Display (or) if enabled */}
                                            {subIndex <
                                              (question.subQuestions || [])
                                                .length -
                                                1 &&
                                              subQ.showOr !== false && (
                                                <div className="text-center text-xs text-gray-400 mt-1">
                                                  (or)
                                                </div>
                                              )}
                                          </div>
                                        )
                                      )}
                                    </div>

                                    {/* Options for MCQ */}
                                    {question.questionType === "MCQ" && (
                                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <label className="block mb-2 text-xs font-medium text-gray-700">
                                          Options*
                                        </label>
                                        <div className="space-y-2">
                                          {[0, 1, 2, 3].map((index) => (
                                            <div
                                              key={index}
                                              className="flex items-center gap-2"
                                            >
                                              <input
                                                type="radio"
                                                name={`correct_${question.id}`}
                                                checked={
                                                  question.correctAnswer ===
                                                  String.fromCharCode(
                                                    65 + index
                                                  )
                                                }
                                                onChange={() =>
                                                  updateQuestion(
                                                    question.id,
                                                    "correctAnswer",
                                                    String.fromCharCode(
                                                      65 + index
                                                    )
                                                  )
                                                }
                                                className="w-4 h-4 text-emerald-600"
                                              />
                                              <span className="w-6 text-sm font-medium text-gray-700">
                                                {String.fromCharCode(
                                                  65 + index
                                                )}
                                                .
                                              </span>
                                              <input
                                                type="text"
                                                value={
                                                  question.options?.[index] ||
                                                  ""
                                                }
                                                onChange={(e) =>
                                                  updateQuestionOption(
                                                    question.id,
                                                    index,
                                                    e.target.value
                                                  )
                                                }
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                                placeholder={`Option ${String.fromCharCode(
                                                  65 + index
                                                )}`}
                                                required
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Matching pairs for Match the Following */}
                                    {question.questionType ===
                                      "Match the Following" && (
                                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                          <label className="block text-xs font-medium text-gray-700">
                                            Matching Pairs*
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              addMatchingPair(question.id)
                                            }
                                            className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                          >
                                            + Add Pair
                                          </button>
                                        </div>
                                        <div className="space-y-2">
                                          {(question.matchingPairs || []).map(
                                            (pair, pairIndex) => (
                                              <div
                                                key={pairIndex}
                                                className="flex items-center gap-2"
                                              >
                                                <input
                                                  type="text"
                                                  value={pair.left || ""}
                                                  onChange={(e) =>
                                                    updateMatchingPair(
                                                      question.id,
                                                      pairIndex,
                                                      "left",
                                                      e.target.value
                                                    )
                                                  }
                                                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                                  placeholder="Left item"
                                                  required
                                                />
                                                <span className="text-gray-500">
                                                  →
                                                </span>
                                                <input
                                                  type="text"
                                                  value={pair.right || ""}
                                                  onChange={(e) =>
                                                    updateMatchingPair(
                                                      question.id,
                                                      pairIndex,
                                                      "right",
                                                      e.target.value
                                                    )
                                                  }
                                                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                                  placeholder="Right item"
                                                  required
                                                />
                                                {(question.matchingPairs || [])
                                                  .length > 1 && (
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      removeMatchingPair(
                                                        question.id,
                                                        pairIndex
                                                      )
                                                    }
                                                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                                    title="Remove pair"
                                                  >
                                                    ×
                                                  </button>
                                                )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Show (OR) option checkbox for main question */}
                                    <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                      <input
                                        type="checkbox"
                                        id={`showOr_main_${question.id}`}
                                        checked={question.showOr === true}
                                        onChange={(e) => {
                                          const showOr = e.target.checked;
                                          updateQuestion(
                                            question.id,
                                            "showOr",
                                            showOr
                                          );
                                          // If unchecking OR, remove alternative question
                                          if (
                                            !showOr &&
                                            question.alternativeQuestion
                                          ) {
                                            updateQuestion(
                                              question.id,
                                              "alternativeQuestion",
                                              null
                                            );
                                          }
                                        }}
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                      />
                                      <label
                                        htmlFor={`showOr_main_${question.id}`}
                                        className="text-xs text-gray-700 cursor-pointer font-medium"
                                      >
                                        Show "(Or)" option - Add alternative
                                        question
                                      </label>
                                    </div>

                                    {/* Add Alternative Question button - shown when OR is enabled */}
                                    {question.showOr === true &&
                                      !question.alternativeQuestion && (
                                        <div className="mt-3">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const altQuestion = {
                                                id: `alt_${Date.now()}_${Math.random()}`,
                                                questionType: "Descriptive",
                                                questionText: "",
                                                marks: question.marks || "", // Copy marks from main question
                                                section: question.section,
                                                sectionInstruction:
                                                  question.sectionInstruction,
                                                sectionMarks:
                                                  question.sectionMarks || "",
                                                showOr: false,
                                                alternativeQuestion: null,
                                                subQuestions: [],
                                                options: [],
                                                correctAnswer: "",
                                                matchingPairs: [],
                                              };
                                              updateQuestion(
                                                question.id,
                                                "alternativeQuestion",
                                                altQuestion
                                              );
                                            }}
                                            className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                                          >
                                            + Add Alternative Question (OR)
                                          </button>
                                        </div>
                                      )}

                                    {/* Alternative Question Form - shown when alternative question exists */}
                                    {question.showOr === true &&
                                      question.alternativeQuestion && (
                                        <div className="mt-4 p-4 bg-white-50 border-2 border-grey-100 rounded-lg">
                                          <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-bold text-orange-800">
                                              Alternative Question (OR)
                                            </h4>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                updateQuestion(
                                                  question.id,
                                                  "alternativeQuestion",
                                                  null
                                                )
                                              }
                                              className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                              Remove Alternative
                                            </button>
                                          </div>

                                          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <label className="block mb-1 text-xs font-medium text-gray-600">
                                    Question Type*
                                  </label>
                                  <select
                                    value={question.alternativeQuestion.questionType || "Descriptive"}
                                    onChange={(e) => {
                                      const altQ = { ...question.alternativeQuestion, questionType: e.target.value };
                                      updateQuestion(question.id, "alternativeQuestion", altQ);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                    required
                                  >
                                    {questionTypes.map((type) => (
                                      <option key={type} value={type}>
                                        {type}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block mb-1 text-xs font-medium text-gray-600">
                                    Marks*
                                  </label>
                                  <input
                                    type="number"
                                    value={question.alternativeQuestion.marks || ""}
                                    onChange={(e) => {
                                      const altQ = { ...question.alternativeQuestion, marks: e.target.value };
                                      updateQuestion(question.id, "alternativeQuestion", altQ);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                    placeholder="e.g., 10"
                                    min="1"
                                    required
                                  />
                                </div>
                              </div> */}

                                          <div>
                                            <label className="block mb-1 text-xs font-medium text-gray-600">
                                              Question Text*
                                            </label>
                                            <textarea
                                              value={
                                                question.alternativeQuestion
                                                  .questionText || ""
                                              }
                                              onChange={(e) => {
                                                const altQ = {
                                                  ...question.alternativeQuestion,
                                                  questionText: e.target.value,
                                                };
                                                updateQuestion(
                                                  question.id,
                                                  "alternativeQuestion",
                                                  altQ
                                                );
                                              }}
                                              rows={3}
                                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                              placeholder="Enter the alternative question text..."
                                              required
                                            />
                                          </div>

                                          {/* Sub-questions for alternative question */}
                                          <div className="mt-3">
                                            <div className="flex justify-between items-center mb-2">
                                              {/* <label className="block text-xs font-medium text-gray-600">
                                    Sub-questions (with "or" option)
                                  </label> */}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const altQ = {
                                                    ...question.alternativeQuestion,
                                                    subQuestions: [
                                                      ...(question
                                                        .alternativeQuestion
                                                        .subQuestions || []),
                                                      {
                                                        text: "",
                                                        showOr: false,
                                                      },
                                                    ],
                                                  };
                                                  updateQuestion(
                                                    question.id,
                                                    "alternativeQuestion",
                                                    altQ
                                                  );
                                                }}
                                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                              >
                                                + Add Sub-question
                                              </button>
                                            </div>
                                            {(
                                              question.alternativeQuestion
                                                .subQuestions || []
                                            ).map((subQ, subIndex) => (
                                              <div
                                                key={subIndex}
                                                className="mb-2 p-2 bg-white border border-gray-200 rounded"
                                              >
                                                <div className="flex items-start gap-2">
                                                  <span className="text-xs text-gray-500 mt-2">
                                                    {subIndex === 0
                                                      ? "a)"
                                                      : subIndex === 1
                                                      ? "b)"
                                                      : String.fromCharCode(
                                                          97 + subIndex
                                                        ) + ")"}
                                                  </span>
                                                  <div className="flex-1">
                                                    <textarea
                                                      value={subQ.text || ""}
                                                      onChange={(e) => {
                                                        const altQ = {
                                                          ...question.alternativeQuestion,
                                                        };
                                                        altQ.subQuestions = [
                                                          ...(altQ.subQuestions ||
                                                            []),
                                                        ];
                                                        altQ.subQuestions[
                                                          subIndex
                                                        ] = {
                                                          ...altQ.subQuestions[
                                                            subIndex
                                                          ],
                                                          text: e.target.value,
                                                        };
                                                        updateQuestion(
                                                          question.id,
                                                          "alternativeQuestion",
                                                          altQ
                                                        );
                                                      }}
                                                      rows={2}
                                                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                                                      placeholder="Sub-question text..."
                                                    />
                                                  </div>
                                                  {(
                                                    question.alternativeQuestion
                                                      .subQuestions || []
                                                  ).length >= 1 && (
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const altQ = {
                                                          ...question.alternativeQuestion,
                                                        };
                                                        altQ.subQuestions = (
                                                          altQ.subQuestions ||
                                                          []
                                                        ).filter(
                                                          (_, idx) =>
                                                            idx !== subIndex
                                                        );
                                                        updateQuestion(
                                                          question.id,
                                                          "alternativeQuestion",
                                                          altQ
                                                        );
                                                      }}
                                                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs"
                                                      title="Remove sub-question"
                                                    >
                                                      ×
                                                    </button>
                                                  )}
                                                </div>
                                                {subIndex <
                                                  (
                                                    question.alternativeQuestion
                                                      .subQuestions || []
                                                  ).length -
                                                    1 && (
                                                  <div className="mt-2 flex items-center gap-2">
                                                    <input
                                                      type="checkbox"
                                                      id={`showOr_alt_${question.id}_${subIndex}`}
                                                      checked={
                                                        subQ.showOr !== false
                                                      }
                                                      onChange={(e) => {
                                                        const altQ = {
                                                          ...question.alternativeQuestion,
                                                        };
                                                        altQ.subQuestions = [
                                                          ...(altQ.subQuestions ||
                                                            []),
                                                        ];
                                                        altQ.subQuestions[
                                                          subIndex
                                                        ] = {
                                                          ...altQ.subQuestions[
                                                            subIndex
                                                          ],
                                                          showOr:
                                                            e.target.checked,
                                                        };
                                                        updateQuestion(
                                                          question.id,
                                                          "alternativeQuestion",
                                                          altQ
                                                        );
                                                      }}
                                                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                    />
                                                    <label
                                                      htmlFor={`showOr_alt_${question.id}_${subIndex}`}
                                                      className="text-xs text-gray-600 cursor-pointer"
                                                    >
                                                      Show "(Or)" after this
                                                      sub-question
                                                    </label>
                                                  </div>
                                                )}
                                                {subIndex <
                                                  (
                                                    question.alternativeQuestion
                                                      .subQuestions || []
                                                  ).length -
                                                    1 &&
                                                  subQ.showOr !== false && (
                                                    <div className="text-center text-xs text-gray-400 mt-1">
                                                      (or)
                                                    </div>
                                                  )}
                                              </div>
                                            ))}
                                          </div>

                                          {/* Options for MCQ in alternative question */}
                                          {question.alternativeQuestion
                                            .questionType === "MCQ" && (
                                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                              <label className="block mb-2 text-xs font-medium text-gray-700">
                                                Options*
                                              </label>
                                              <div className="space-y-2">
                                                {[0, 1, 2, 3].map((index) => (
                                                  <div
                                                    key={index}
                                                    className="flex items-center gap-2"
                                                  >
                                                    <input
                                                      type="radio"
                                                      name={`correct_alt_${question.id}`}
                                                      checked={
                                                        question
                                                          .alternativeQuestion
                                                          .correctAnswer ===
                                                        String.fromCharCode(
                                                          65 + index
                                                        )
                                                      }
                                                      onChange={() => {
                                                        const altQ = {
                                                          ...question.alternativeQuestion,
                                                          correctAnswer:
                                                            String.fromCharCode(
                                                              65 + index
                                                            ),
                                                        };
                                                        updateQuestion(
                                                          question.id,
                                                          "alternativeQuestion",
                                                          altQ
                                                        );
                                                      }}
                                                      className="w-4 h-4 text-emerald-600"
                                                    />
                                                    <span className="w-6 text-sm font-medium text-gray-700">
                                                      {String.fromCharCode(
                                                        65 + index
                                                      )}
                                                      .
                                                    </span>
                                                    <input
                                                      type="text"
                                                      value={
                                                        question
                                                          .alternativeQuestion
                                                          .options?.[index] ||
                                                        ""
                                                      }
                                                      onChange={(e) => {
                                                        const altQ = {
                                                          ...question.alternativeQuestion,
                                                        };
                                                        altQ.options = [
                                                          ...(altQ.options ||
                                                            []),
                                                        ];
                                                        altQ.options[index] =
                                                          e.target.value;
                                                        updateQuestion(
                                                          question.id,
                                                          "alternativeQuestion",
                                                          altQ
                                                        );
                                                      }}
                                                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                                      placeholder={`Option ${String.fromCharCode(
                                                        65 + index
                                                      )}`}
                                                      required
                                                    />
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Matching pairs for Match the Following in alternative question */}
                                          {question.alternativeQuestion
                                            .questionType ===
                                            "Match the Following" && (
                                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                              <div className="flex justify-between items-center mb-2">
                                                <label className="block text-xs font-medium text-gray-700">
                                                  Matching Pairs*
                                                </label>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const altQ = {
                                                      ...question.alternativeQuestion,
                                                    };
                                                    altQ.matchingPairs = [
                                                      ...(altQ.matchingPairs ||
                                                        []),
                                                      { left: "", right: "" },
                                                    ];
                                                    updateQuestion(
                                                      question.id,
                                                      "alternativeQuestion",
                                                      altQ
                                                    );
                                                  }}
                                                  className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                                >
                                                  + Add Pair
                                                </button>
                                              </div>
                                              <div className="space-y-2">
                                                {(
                                                  question.alternativeQuestion
                                                    .matchingPairs || []
                                                ).map((pair, pairIndex) => (
                                                  <div
                                                    key={pairIndex}
                                                    className="flex items-center gap-2"
                                                  >
                                                    <input
                                                      type="text"
                                                      value={pair.left || ""}
                                                      onChange={(e) => {
                                                        const altQ = {
                                                          ...question.alternativeQuestion,
                                                        };
                                                        altQ.matchingPairs = [
                                                          ...(altQ.matchingPairs ||
                                                            []),
                                                        ];
                                                        altQ.matchingPairs[
                                                          pairIndex
                                                        ] = {
                                                          ...altQ.matchingPairs[
                                                            pairIndex
                                                          ],
                                                          left: e.target.value,
                                                        };
                                                        updateQuestion(
                                                          question.id,
                                                          "alternativeQuestion",
                                                          altQ
                                                        );
                                                      }}
                                                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                                      placeholder="Left item"
                                                      required
                                                    />
                                                    <span className="text-gray-500">
                                                      →
                                                    </span>
                                                    <input
                                                      type="text"
                                                      value={pair.right || ""}
                                                      onChange={(e) => {
                                                        const altQ = {
                                                          ...question.alternativeQuestion,
                                                        };
                                                        altQ.matchingPairs = [
                                                          ...(altQ.matchingPairs ||
                                                            []),
                                                        ];
                                                        altQ.matchingPairs[
                                                          pairIndex
                                                        ] = {
                                                          ...altQ.matchingPairs[
                                                            pairIndex
                                                          ],
                                                          right: e.target.value,
                                                        };
                                                        updateQuestion(
                                                          question.id,
                                                          "alternativeQuestion",
                                                          altQ
                                                        );
                                                      }}
                                                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                                      placeholder="Right item"
                                                      required
                                                    />
                                                    {(
                                                      question
                                                        .alternativeQuestion
                                                        .matchingPairs || []
                                                    ).length > 1 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          const altQ = {
                                                            ...question.alternativeQuestion,
                                                          };
                                                          altQ.matchingPairs = (
                                                            altQ.matchingPairs ||
                                                            []
                                                          ).filter(
                                                            (_, idx) =>
                                                              idx !== pairIndex
                                                          );
                                                          updateQuestion(
                                                            question.id,
                                                            "alternativeQuestion",
                                                            altQ
                                                          );
                                                        }}
                                                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="Remove pair"
                                                      >
                                                        ×
                                                      </button>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    {/* Display (or) and alternative question between main questions if enabled */}
                                  </>
                                )}
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {(!formData.questions || formData.questions.length === 0) && (
          <div className="text-center py-8 text-gray-500 text-sm border border-gray-200 rounded-lg">
            No questions added yet. Click "Add Question" to start.
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Question Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-emerald-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-semibold">Question Preview</h2>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="space-y-4">
                {/* Question Type and Marks */}
                <div className="flex items-center gap-4 pb-3 border-b border-gray-200">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {previewQuestion.questionType || "Descriptive"}
                  </span>
                  <span className="text-sm text-gray-600">
                    Marks:{" "}
                    {previewQuestion.marks ||
                      (previewQuestion.sectionMarks
                        ? `${previewQuestion.sectionMarks} (Section)`
                        : "-")}
                  </span>
                  {previewQuestion.section && (
                    <span className="text-sm text-gray-600">
                      Section: {previewQuestion.section}
                    </span>
                  )}
                </div>

                {/* Question Text */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Question:
                  </h3>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {previewQuestion.questionText || "(No question text)"}
                  </p>
                </div>

                {/* Sub-questions */}
                {previewQuestion.subQuestions &&
                  previewQuestion.subQuestions.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Sub-questions:
                      </h3>
                      <div className="space-y-2 ml-4">
                        {previewQuestion.subQuestions.map((subQ, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 border-emerald-300 pl-3"
                          >
                            <span className="text-sm font-medium text-gray-600">
                              {String.fromCharCode(97 + idx)}){" "}
                            </span>
                            <span className="text-gray-800 whitespace-pre-wrap">
                              {subQ.text || "(No text)"}
                            </span>
                            {subQ.marks && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({subQ.marks} marks)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Alternative Question */}
                {previewQuestion.showOr &&
                  previewQuestion.alternativeQuestion && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        OR (Alternative Question):
                      </h3>
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {previewQuestion.alternativeQuestion.text ||
                          "(No alternative question text)"}
                      </p>
                      {previewQuestion.alternativeQuestion.marks && (
                        <span className="text-xs text-gray-500 mt-2 block">
                          Marks: {previewQuestion.alternativeQuestion.marks}
                        </span>
                      )}
                    </div>
                  )}

                {/* Options (for MCQ, True/False) */}
                {previewQuestion.options &&
                  previewQuestion.options.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Options:
                      </h3>
                      <div className="space-y-2 ml-4">
                        {previewQuestion.options.map((option, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-sm font-medium text-gray-600">
                              {String.fromCharCode(65 + idx)})
                            </span>
                            <span className="text-gray-800">
                              {option}
                              {previewQuestion.correctAnswer ===
                                String.fromCharCode(65 + idx) && (
                                <span className="ml-2 text-xs text-emerald-600 font-semibold">
                                  ✓ Correct
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Matching Pairs */}
                {previewQuestion.matchingPairs &&
                  previewQuestion.matchingPairs.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Matching Pairs:
                      </h3>
                      <div className="space-y-2 ml-4">
                        {previewQuestion.matchingPairs.map((pair, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 border-l-2 border-blue-300 pl-3"
                          >
                            <span className="text-sm text-gray-800 font-medium">
                              {pair.left || "(Empty)"}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="text-sm text-gray-800">
                              {pair.right || "(Empty)"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionPaperForm;