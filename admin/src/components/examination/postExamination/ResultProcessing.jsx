import React, { useState, useEffect } from "react";
import { API } from "../../../config/urls";
import {
  showSuccessMessage,
  showErrorMessage,
  showAxiosError,
} from "../../../config/Toast";
import {
  coursesApi,
  courseStreamMappingsApi,
  streamsApi,
  subjectsApi,
  combinedResultsApi,
} from "../../../services/apiService";

const ResultProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    courseId: "",
    streamId: "",
    semesterNumber: "", // Use semesterNumber like InternalExamSetup
    semesterId: "", // Will be auto-filled from mapping
    subjectId: "",
  });
  const [courseStreamMappings, setCourseStreamMappings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [streamsData, setStreamsData] = useState([]);
  const [subjectsData, setSubjectsData] = useState([]);
  const [availableStreams, setAvailableStreams] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [internalExamSetups, setInternalExamSetups] = useState([]);
  const [selectedSetup, setSelectedSetup] = useState(null);

  // Helper function to extract data from API response
  const extractData = (response) => {
    if (response?.data?.data) return response.data.data;
    if (response?.data)
      return Array.isArray(response.data) ? response.data : [response.data];
    if (Array.isArray(response)) return response;
    return [];
  };

  // Fetch all data on mount (like InternalExamSetup)
  useEffect(() => {
    fetchMeta();
    fetchStreamsAndSubjects();
    fetchCourseStreamMappings();
  }, []);

  // Fetch courses
  const fetchMeta = async () => {
    try {
      const coursesRes = (await coursesApi.getAll?.()) ?? coursesApi.getAll();
      setCourses(coursesRes?.data || coursesRes || []);
    } catch (err) {
      console.error("Failed to load courses", err);
    }
  };

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

  // Fetch course-stream mappings (all at once, like InternalExamSetup)
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

  // Filter streams based on selected course (like InternalExamSetup)
  useEffect(() => {
    if (!filters.courseId || courseStreamMappings.length === 0) {
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
        mappingCourseId === filters.courseId &&
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
    if (filters.streamId) {
      const currentStream = filteredStreams.find(
        (s) => s._id === filters.streamId
      );
      if (!currentStream) {
        setFilters((prev) => ({
          ...prev,
          streamId: "",
          semesterNumber: "",
          semesterId: "",
          subjectId: "",
        }));
      }
    }
  }, [filters.courseId, courseStreamMappings, streamsData]);

  // Filter semester numbers based on selected course and stream (like InternalExamSetup)
  useEffect(() => {
    if (
      !filters.courseId ||
      !filters.streamId ||
      courseStreamMappings.length === 0
    ) {
      setAvailableSemesters([]);
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
        mappingCourseId === filters.courseId &&
        mappingStreamId === filters.streamId &&
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

      // Store unique semester numbers with their semesterId and semesterYear
      if (semesterNumber && !semesterNumberSet.has(semesterNumber)) {
        semesterNumberSet.add(semesterNumber);

        // Format semesterYear from semesterNumber
        const year = Math.ceil(semesterNumber / 2);
        const semesterInYear = ((semesterNumber - 1) % 2) + 1;
        const yearOrdinal =
          year === 1
            ? "1st"
            : year === 2
            ? "2nd"
            : year === 3
            ? "3rd"
            : `${year}th`;
        const semesterOrdinal =
          semesterInYear === 1
            ? "1st"
            : semesterInYear === 2
            ? "2nd"
            : semesterInYear === 3
            ? "3rd"
            : `${semesterInYear}th`;
        const semesterYear = `${yearOrdinal} Year - ${semesterOrdinal} Semester`;

        semesterNumberArray.push({
          semesterNumber,
          semesterId,
          semesterYear,
        });
      }
    });

    // Sort by semester number
    semesterNumberArray.sort((a, b) => a.semesterNumber - b.semesterNumber);
    setAvailableSemesters(semesterNumberArray);

    // Reset semesterNumber and subject if course or stream changes
    if (filters.semesterNumber) {
      const currentSemesterNumber = semesterNumberArray.find(
        (item) => item.semesterNumber === Number(filters.semesterNumber)
      );
      if (!currentSemesterNumber) {
        setFilters((prev) => ({
          ...prev,
          semesterNumber: "",
          semesterId: "",
          subjectId: "",
        }));
      }
    }
  }, [filters.courseId, filters.streamId, courseStreamMappings]);

  // Filter subjects based on selected course, stream, and semesterNumber (like InternalExamSetup)
  useEffect(() => {
    if (
      !filters.courseId ||
      !filters.streamId ||
      !filters.semesterNumber ||
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
        mappingCourseId === filters.courseId &&
        mappingStreamId === filters.streamId &&
        mappingSemesterNumber === Number(filters.semesterNumber) &&
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
    filters.courseId,
    filters.streamId,
    filters.semesterNumber,
    courseStreamMappings,
    subjectsData,
  ]);

  // Fetch internal exam setups when course, stream, semester, or subject changes
  // This ensures we get setups that match ALL selected filters
  useEffect(() => {
    if (filters.courseId && filters.streamId && filters.semesterId && filters.subjectId) {
      fetchInternalExamSetups();
    } else {
      setInternalExamSetups([]);
      setSelectedSetup(null);
      setResults([]);
    }
  }, [filters.courseId, filters.streamId, filters.semesterId, filters.subjectId]);

  const processResultsWithSetup = async (setup) => {
    if (!setup) {
      showErrorMessage("No internal exam setup available for this subject");
      return;
    }

    // Validate that the setup matches the current filters (course, stream, semester, subject)
    // This ensures we don't process results for the wrong branch/semester
    const setupCourseId = typeof setup.courseId === "object" && setup.courseId?._id ? setup.courseId._id : setup.courseId;
    const setupStreamId = typeof setup.streamId === "object" && setup.streamId?._id ? setup.streamId._id : setup.streamId;
    const setupSemesterId = typeof setup.semesterId === "object" && setup.semesterId?._id ? setup.semesterId._id : setup.semesterId;
    const setupSubjectId = typeof setup.subjectId === "object" && setup.subjectId?._id ? setup.subjectId._id : setup.subjectId;

    if (
      setupCourseId !== filters.courseId ||
      setupStreamId !== filters.streamId ||
      setupSemesterId !== filters.semesterId ||
      setupSubjectId !== filters.subjectId
    ) {
      console.warn("Setup does not match current filters, skipping processing");
      showErrorMessage("Selected setup does not match current filters. Please select the correct course, stream, semester, and subject.");
      return;
    }

    try {
      setLoading(true);

      // Fetch internal marks - also include course/stream/semester filters for additional validation
      const internalResponse = await API.get("/examination/internal-marks", {
        params: {
          internalExamSetupId: setup._id,
          courseId: filters.courseId,
          streamId: filters.streamId,
          semesterId: filters.semesterId,
          subjectId: filters.subjectId,
          status: "Submitted",
        },
      });
      const internalMarks =
        internalResponse.data?.data ||
        internalResponse.data?.marks ||
        internalResponse.data ||
        [];

      // Fetch external marks (scripts) for the same subject.
      // Include Scrutinized as well (after scrutiny we still need marks).
      const subjectCodeParam = (
        setup.subjectId?.code ||
        setup.subjectCode ||
        ""
      ).toUpperCase();
      const subjectIdParam =
        setup.subjectId?._id ||
        (typeof setup.subjectId === "string" ? setup.subjectId : "");

      // Extract courseId, streamId, and semesterId from setup (they may be populated objects or IDs)
      const courseIdParam =
        typeof setup.courseId === "object" && setup.courseId?._id
          ? setup.courseId._id
          : setup.courseId || "";
      const streamIdParam =
        typeof setup.streamId === "object" && setup.streamId?._id
          ? setup.streamId._id
          : setup.streamId || "";
      const semesterIdParam =
        typeof setup.semesterId === "object" && setup.semesterId?._id
          ? setup.semesterId._id
          : setup.semesterId || "";

      // Fetch scripts - filter by subjectCode/subjectId AND courseId/streamId/semesterId to ensure only scripts from the correct branch and semester are fetched
      const scriptsResponse = await API.get("/examination/scripts", {
        params: {
          subjectCode: subjectCodeParam || undefined,
          subjectId: subjectIdParam || undefined,
          courseId: courseIdParam || undefined,
          streamId: streamIdParam || undefined,
          semesterId: semesterIdParam || undefined,
          // Don't filter by status - we want both Evaluated and Scrutinized
        },
      });
      const rawScripts =
        scriptsResponse.data?.data || scriptsResponse.data || [];

      // Filter to only include scripts with marks (Evaluated or Scrutinized)
      const scriptsWithMarks = rawScripts.filter((script) => {
        const validStatus =
          script.status === "Evaluated" || script.status === "Scrutinized";

        if (!validStatus) return false;

        // For scrutinized scripts, check if finalMarks exists
        if (script.status === "Scrutinized") {
          const hasFinalMarks =
            (script.marks &&
              script.marks.finalMarks !== undefined &&
              script.marks.finalMarks !== null) ||
            script.finalMarks !== undefined;
          return hasFinalMarks;
        }

        // For evaluated scripts, check if any evaluation exists or finalMarks exists
        const hasMarks =
          (script.marks &&
            script.marks.finalMarks !== undefined &&
            script.marks.finalMarks !== null) ||
          script.finalMarks !== undefined ||
          (script.marks?.firstEvaluation &&
            script.marks.firstEvaluation.total > 0) ||
          (script.marks?.secondEvaluation &&
            script.marks.secondEvaluation.total > 0) ||
          (script.marks?.thirdEvaluation &&
            script.marks.thirdEvaluation.total > 0);

        return hasMarks;
      });

      console.log("Scripts fetched:", {
        total: rawScripts.length,
        withMarks: scriptsWithMarks.length,
        scrutinized: scriptsWithMarks.filter((s) => s.status === "Scrutinized")
          .length,
        evaluated: scriptsWithMarks.filter((s) => s.status === "Evaluated")
          .length,
      });
      // Normalize subject id for comparison
      const normalizeId = (val) => {
        if (!val) return "";
        if (typeof val === "string") return val;
        if (val._id) return val._id;
        return "";
      };

      // Keep only scripts for this subject (by code or id) and with valid marks
      const scripts = scriptsWithMarks.filter((script) => {
        const codeMatch =
          subjectCodeParam &&
          script.subjectCode &&
          script.subjectCode.toUpperCase() === subjectCodeParam;
        const scriptSubId = normalizeId(script.subjectId);
        const idMatch =
          subjectIdParam && scriptSubId && scriptSubId === subjectIdParam;
        return codeMatch || idMatch;
      });

      // Combine internal and external marks
      const combinedResults = [];

      // Create a map of scripts by roll number and registration number
      const scriptsMap = new Map();
      const normalizeKey = (value) =>
        value?.toString().trim().toUpperCase() || "";

      // Helper function to extract registration numbers from barcodes
      const extractRegistrationFromBarcode = (barcode) => {
        if (!barcode) return [];
        const barcodeUpper = barcode.toUpperCase();
        const regMatches = [];

        // Pattern 1: REG followed by digits (e.g., REG202500134)
        const regPattern1 = /REG\d+/g;
        let match;
        while ((match = regPattern1.exec(barcodeUpper)) !== null) {
          regMatches.push(match[0]);
        }

        // Pattern 2: Look for registration-like patterns in barcode parts
        const parts = barcodeUpper.split("-");
        parts.forEach((part) => {
          // If part starts with REG and has digits
          if (part.startsWith("REG") && /\d/.test(part)) {
            regMatches.push(part);
          }
          // If part looks like a registration number (alphanumeric, 8+ chars)
          else if (part.length >= 8 && /[A-Z]/.test(part) && /\d/.test(part)) {
            regMatches.push(part);
          }
        });

        return [...new Set(regMatches)]; // Remove duplicates
      };

      scripts.forEach((script) => {
        const keys = [
          normalizeKey(script.rollNumber),
          normalizeKey(script.hallTicketNumber),
          normalizeKey(script.registrationNumber), // in case backend adds it later
          normalizeKey(script.originalScriptNumber),
          // Also try studentName if available for matching
          normalizeKey(script.studentName),
        ].filter(Boolean);

        // Extract registration numbers from script barcode
        if (script.scriptBarcode) {
          const extractedRegs = extractRegistrationFromBarcode(
            script.scriptBarcode
          );
          extractedRegs.forEach((reg) => {
            keys.push(normalizeKey(reg));
          });
        }

        // Also try extracting from bundle barcode
        if (script.bundleBarcode) {
          const extractedRegs = extractRegistrationFromBarcode(
            script.bundleBarcode
          );
          extractedRegs.forEach((reg) => {
            keys.push(normalizeKey(reg));
          });
        }

        keys.forEach((key) => {
          if (key) {
            // Allow overwriting if new script has better status (Scrutinized > Evaluated)
            const existing = scriptsMap.get(key);
            if (
              !existing ||
              (script.status === "Scrutinized" &&
                existing.status !== "Scrutinized") ||
              (script.marks?.finalMarks && !existing.marks?.finalMarks)
            ) {
              scriptsMap.set(key, script);
            }
          }
        });
      });

      console.log("Scripts map created:", {
        totalKeys: scriptsMap.size,
        sampleKeys: Array.from(scriptsMap.keys()).slice(0, 5),
      });

      // Process internal marks and match with external marks
      internalMarks.forEach((internalMark) => {
        const student = internalMark.studentId || {};

        // Prefer explicit fields on internalMark, then populated student
        const registrationNumber = normalizeKey(
          internalMark.registrationNumber ||
            student.registrationNumber ||
            internalMark.rollNumber ||
            student.rollNumber ||
            internalMark.hallTicketNumber ||
            student.hallTicketNumber ||
            internalMark.hallTicketNo ||
            student.hallTicketNo
        );
        const studentRoll = normalizeKey(
          internalMark.rollNumber || student.rollNumber
        );
        const studentHall = normalizeKey(
          internalMark.hallTicketNumber ||
            student.hallTicketNumber ||
            internalMark.hallTicketNo ||
            student.hallTicketNo
        );

        const keyCandidates = [
          registrationNumber,
          studentRoll,
          studentHall,
        ].filter(Boolean);

        // Find matching script
        let script = null;
        for (const key of keyCandidates) {
          if (scriptsMap.has(key)) {
            script = scriptsMap.get(key);
            console.log("Matched script for student:", {
              registrationNumber,
              matchedKey: key,
              scriptStatus: script.status,
              finalMarks: script.marks?.finalMarks,
              scriptBarcode: script.scriptBarcode,
            });
            break;
          }
        }

        // If no direct match, try partial matching on script barcodes
        if (!script && registrationNumber) {
          for (const [mapKey, mapScript] of scriptsMap.entries()) {
            // Check if registration number appears in script barcode
            if (
              mapScript.scriptBarcode &&
              mapScript.scriptBarcode.toUpperCase().includes(registrationNumber)
            ) {
              script = mapScript;
              console.log("Matched script via barcode partial match:", {
                registrationNumber,
                scriptBarcode: script.scriptBarcode,
                scriptStatus: script.status,
                finalMarks: script.marks?.finalMarks,
              });
              break;
            }
            // Check if registration number appears in any script field
            const scriptFields = [
              mapScript.rollNumber,
              mapScript.hallTicketNumber,
              mapScript.registrationNumber,
              mapScript.originalScriptNumber,
            ]
              .filter(Boolean)
              .map((f) => normalizeKey(f));

            if (
              scriptFields.some(
                (field) =>
                  field.includes(registrationNumber) ||
                  registrationNumber.includes(field)
              )
            ) {
              script = mapScript;
              console.log("Matched script via field partial match:", {
                registrationNumber,
                scriptBarcode: script.scriptBarcode,
                scriptStatus: script.status,
                finalMarks: script.marks?.finalMarks,
              });
              break;
            }
          }
        }

        if (!script && registrationNumber) {
          console.warn("No script found for student:", {
            registrationNumber,
            studentRoll,
            studentHall,
            availableKeys: Array.from(scriptsMap.keys()).slice(0, 10),
          });
        }

        // Get external marks (final marks from script evaluation)
        // For scrutinized scripts, finalMarks should be available
        // Priority: marks.finalMarks > marks.firstEvaluation.total > marks.secondEvaluation.total > marks.thirdEvaluation.total > top-level finalMarks > 0
        let externalMarks = 0;

        if (script) {
          // First try marks.finalMarks (most reliable for scrutinized scripts)
          if (
            script.marks?.finalMarks !== undefined &&
            script.marks.finalMarks !== null
          ) {
            externalMarks = parseFloat(script.marks.finalMarks);
          }
          // If not available, try calculating from evaluation totals for scrutinized scripts
          else if (script.status === "Scrutinized" && script.marks) {
            const evaluations = [
              script.marks.firstEvaluation,
              script.marks.secondEvaluation,
              script.marks.thirdEvaluation,
            ].filter((e) => e && e.total > 0);

            if (evaluations.length > 0) {
              const sum = evaluations.reduce((acc, e) => acc + e.total, 0);
              externalMarks = Math.round(sum / evaluations.length);
            }
          }
          // Try top-level finalMarks
          else if (
            script.finalMarks !== undefined &&
            script.finalMarks !== null
          ) {
            externalMarks = parseFloat(script.finalMarks);
          }
          // For evaluated scripts, try to get from evaluation totals
          else if (script.status === "Evaluated" && script.marks) {
            const evaluations = [
              script.marks.firstEvaluation,
              script.marks.secondEvaluation,
              script.marks.thirdEvaluation,
            ].filter((e) => e && e.total > 0);

            if (evaluations.length > 0) {
              const sum = evaluations.reduce((acc, e) => acc + e.total, 0);
              externalMarks = Math.round(sum / evaluations.length);
            }
          }
        }

        // Debug logging for missing marks
        if (script && script.status === "Scrutinized" && externalMarks === 0) {
          console.warn("Scrutinized script missing finalMarks:", {
            scriptId: script._id,
            scriptBarcode: script.scriptBarcode,
            status: script.status,
            marks: script.marks,
            topLevelFinalMarks: script.finalMarks,
            calculatedExternalMarks: externalMarks,
            hasFirstEval: !!script.marks?.firstEvaluation,
            hasSecondEval: !!script.marks?.secondEvaluation,
            hasThirdEval: !!script.marks?.thirdEvaluation,
          });
        }

        // Additional debug for successful matches
        if (script && script.status === "Scrutinized" && externalMarks > 0) {
          console.log("✅ Scrutinized script matched with marks:", {
            scriptId: script._id,
            scriptBarcode: script.scriptBarcode,
            registrationNumber,
            externalMarks,
            finalMarksSource:
              script.marks?.finalMarks !== undefined
                ? "marks.finalMarks"
                : script.finalMarks !== undefined
                ? "top-level finalMarks"
                : "calculated from evaluations",
          });
        }

        // Debug for all matched scripts
        if (script) {
          console.log("📊 Script marks extraction:", {
            scriptBarcode: script.scriptBarcode,
            status: script.status,
            registrationNumber,
            externalMarks,
            marksObject: script.marks
              ? {
                  finalMarks: script.marks.finalMarks,
                  firstEval: script.marks.firstEvaluation?.total,
                  secondEval: script.marks.secondEvaluation?.total,
                  thirdEval: script.marks.thirdEvaluation?.total,
                }
              : null,
            topLevelFinalMarks: script.finalMarks,
          });
        }
        const internalMarksTotal = parseFloat(internalMark.totalMarks) || 0;

        // Calculate total marks (internal + external)
        const totalMarks = internalMarksTotal + externalMarks;

        // Get pass marks from setup
        // For Final exams: Need to check BOTH individual and combined thresholds
        // - passMarks: Minimum internal marks required
        // - passMarksExternal: Minimum external marks required  
        // - passMarksFinal: Combined minimum (should equal passMarks + passMarksExternal)
        const internalPassMarks = setup.passMarks || 0;
        const externalPassMarks = setup.passMarksExternal || 0;
        const finalPassMarks = setup.passMarksFinal > 0 ? setup.passMarksFinal : (setup.passMarks || 0);
        
        // Get max marks: totalMarksFinal (for Final exams - combined) or maxMarks (for Mids/Labs - internal only)
        const maxMarks = setup.totalMarksFinal > 0 ? setup.totalMarksFinal : (setup.maxMarks || 100);

        // Determine pass/fail with comprehensive criteria
        // Student must pass BOTH components individually AND meet combined threshold
        let isPass = false;
        
        // Check if script is evaluated/scrutinized (required for passing)
        const scriptEvaluated = script?.status === "Evaluated" || script?.status === "Scrutinized";
        
        if (!internalMark.isAbsent && scriptEvaluated) {
          // If we have both internal and external pass marks defined, check individually
          if (internalPassMarks > 0 && externalPassMarks > 0) {
            // Student must pass BOTH components separately AND meet combined threshold
            isPass = 
              internalMarksTotal >= internalPassMarks &&
              externalMarks >= externalPassMarks &&
              totalMarks >= finalPassMarks;
          } else {
            // Fallback: Only check combined total (for Mids/Labs or legacy data)
            isPass = totalMarks >= finalPassMarks;
          }
        }

        combinedResults.push({
          studentId: student._id,
          registrationNumber: registrationNumber,
          rollNumber: registrationNumber,
          studentName:
            `${student.firstName || ""} ${student.middleName || ""} ${
              student.lastName || ""
            }`.trim() || "N/A",
          internalMarks: internalMarksTotal,
          externalMarks: externalMarks,
          totalMarks: totalMarks,
          maxMarks: maxMarks,
          passMarks: finalPassMarks,
          passMarksInternal: internalPassMarks,
          passMarksExternal: externalPassMarks,
          isPass: isPass,
          status: isPass ? "PASS" : "FAIL",
          isAbsent: internalMark.isAbsent || false,
          scriptStatus: script?.status || "Not Found",
          scriptId: script?._id || null,
          internalMarkId: internalMark._id,
        });
      });

      // Note: We only include students who have internal marks for the selected course/stream/semester/subject
      // Scripts without matching internal marks are excluded to prevent showing students from different branches
      // This ensures that only students from the filtered course/stream/semester are displayed

      // Sort by registration number
      combinedResults.sort((a, b) => {
        return (a.registrationNumber || "").localeCompare(
          b.registrationNumber || ""
        );
      });

      setResults(combinedResults);

      // Save combined results to database
      try {
        const saveResponse = await combinedResultsApi.save({
          internalExamSetupId: setup._id,
          results: combinedResults.map((result) => ({
            studentId: result.studentId,
            registrationNumber: result.registrationNumber,
            rollNumber: result.rollNumber || result.registrationNumber,
            studentName: result.studentName,
            internalMarks: result.internalMarks,
            externalMarks: result.externalMarks,
            totalMarks: result.totalMarks,
            maxMarks: result.maxMarks,
            passMarks: result.passMarks,
            isPass: result.isPass,
            status: result.status,
            isAbsent: result.isAbsent,
            internalMarkId: result.internalMarkId,
            scriptId: result.scriptId,
            scriptStatus: result.scriptStatus,
            remarks: "",
          })),
        });
        console.log("Save Response:", saveResponse);

        if (saveResponse?.success) {
          showSuccessMessage(
            `Processed and saved ${combinedResults.length} student results to database`
          );
        } else {
          showSuccessMessage(
            `Processed ${combinedResults.length} student results (save to database failed)`
          );
        }
      } catch (saveError) {
        console.error("Error saving combined results to database:", saveError);
        showSuccessMessage(
          `Processed ${combinedResults.length} student results (could not save to database)`
        );
      }
    } catch (error) {
      console.error("Error processing results:", error);
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInternalExamSetups = async () => {
    try {
      const response = await API.get("/examination/internal-exam-setups", {
        params: {
          courseId: filters.courseId,
          streamId: filters.streamId,
          semesterId: filters.semesterId, // Auto-filled from semesterNumber
          subjectId: filters.subjectId,
          status: "Active",
        },
      });
      const setups = response.data?.data || response.data || [];
      setInternalExamSetups(setups);
      // Auto-select the first setup if available and auto-process
      if (setups.length > 0) {
        setSelectedSetup(setups[0]);
        // Auto-process results when setup is found
        processResultsWithSetup(setups[0]);
      } else {
        setSelectedSetup(null);
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching internal exam setups:", error);
      setSelectedSetup(null);
      setResults([]);
    }
  };

  const exportToCSV = () => {
    if (results.length === 0) {
      showErrorMessage("No results to export");
      return;
    }

    const headers = [
      "Registration Number",
      "Student Name",
      "Internal Marks",
      "External Marks",
      "Total Marks",
      "Status",
      "Absent",
    ];

    const csvContent = [
      headers.join(","),
      ...results.map((result) =>
        [
          result.registrationNumber || "",
          `"${result.studentName || ""}"`,
          result.internalMarks || 0,
          result.externalMarks || 0,
          result.totalMarks || 0,
          result.status || "FAIL",
          result.isAbsent ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `results_${selectedSetup?.subjectId?.code || "results"}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const passCount = results.filter((r) => r.isPass).length;
  const failCount = results.filter((r) => !r.isPass).length;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Result Processing
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Combine internal and external marks to determine pass/fail status
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border p-6">
        <h4 className="text-lg font-semibold mb-4">Select Filters</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.courseId}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  courseId: e.target.value,
                  streamId: "",
                  semesterNumber: "",
                  semesterId: "",
                  subjectId: "",
                });
                setSelectedSetup(null);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stream */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stream <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.streamId}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  streamId: e.target.value,
                  semesterNumber: "",
                  semesterId: "",
                  subjectId: "",
                });
                setSelectedSetup(null);
              }}
              disabled={!filters.courseId}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Stream</option>
              {availableStreams.map((stream) => (
                <option key={stream._id} value={stream._id}>
                  {stream.name}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Number (like InternalExamSetup) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.semesterNumber || ""}
              onChange={(e) => {
                const selectedSemesterNumber = e.target.value;
                // Find the corresponding semesterId from availableSemesters array
                const selectedItem = availableSemesters.find(
                  (item) =>
                    item.semesterNumber === Number(selectedSemesterNumber)
                );

                setFilters({
                  ...filters,
                  semesterNumber: selectedSemesterNumber,
                  semesterId: selectedItem?.semesterId || "", // Auto-fill semesterId
                  subjectId: "",
                });
                setSelectedSetup(null);
              }}
              disabled={!filters.courseId || !filters.streamId}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                {!filters.courseId || !filters.streamId
                  ? "Select course and stream first"
                  : "Choose semester"}
              </option>
              {availableSemesters.map((item) => (
                <option key={item.semesterNumber} value={item.semesterNumber}>
                  {item.semesterYear || `Semester ${item.semesterNumber}`}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.subjectId}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  subjectId: e.target.value,
                });
                setSelectedSetup(null);
              }}
              disabled={!filters.semesterNumber}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Subject</option>
              {availableSubjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name} {subject.code ? `(${subject.code})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto-process when subject is selected - no manual button needed */}
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border">
          <div className="p-6 border-b bg-blue-50">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-blue-900">
                  Results Summary
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Total: {results.length} | Pass: {passCount} | Fail:{" "}
                  {failCount}
                </p>
              </div>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Export to CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Reg. Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Internal
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    External
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Absent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr
                    key={index}
                    className={result.isPass ? "bg-green-50" : "bg-red-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {result.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      {result.internalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      {result.externalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-900">
                      {result.totalMarks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          result.isPass
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                      {result.isAbsent ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultProcessing;
