const InternalExamSetup = require("../../models/examination/InternalExamSetup");
const FromStudents = require("../../models/admission/FromStudents");
const CourseStreamMapping = require("../../models/examination/selector/CourseStreamMapping");

// @desc Get all internal exam setups
// @route GET /api/examination/internal-exam-setups
exports.getInternalExamSetups = async (req, res) => {
  try {
    const {
      courseId,
      streamId,
      semesterId,
      subjectId,
      examType,
      status,
      activeOnly,
    } = req.query;

    // Build query
    const query = {};

    if (courseId) query.courseId = courseId;
    if (streamId) query.streamId = streamId;
    if (semesterId) query.semesterId = semesterId;
    if (subjectId) query.subjectId = subjectId;
    if (examType) query.examType = examType;
    if (status) query.status = status;
    if (activeOnly === "true") query.status = "Active";

    const setups = await InternalExamSetup.find(query)
      .populate("courseId", "code name")
      .populate("streamId", "code name")
      .populate("semesterId", "numberOfSemesters description")
      .populate("subjectId", "code name")
      .sort({ createdAt: -1 });

    res.json(setups);
  } catch (error) {
    console.error("Error fetching internal exam setups:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get single internal exam setup by ID
// @route GET /api/examination/internal-exam-setups/:id
exports.getInternalExamSetupById = async (req, res) => {
  try {
    const { id } = req.params;
    const setup = await InternalExamSetup.findById(id)
      .populate("courseId", "code name")
      .populate("streamId", "code name")
      .populate("semesterId", "numberOfSemesters description")
      .populate("subjectId", "code name");

    if (!setup)
      return res
        .status(404)
        .json({ message: "Internal exam setup not found" });
    res.json(setup);
  } catch (error) {
    console.error("Error fetching internal exam setup:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create an internal exam setup
// @route POST /api/examination/internal-exam-setups
exports.createInternalExamSetup = async (req, res) => {
  try {
    const {
      courseId,
      streamId,
      semesterId,
      semesterNumber,
      subjectId,
      examType,
      maxMarks,
      passMarks,
      totalInternalMarks,
      test1Max,
      test2Max,
      assignmentMax,
      attendanceMax,
      recordMax,
      performanceMax,
      internalTestMax,
      vivaMax,
      externalMarksMax,
      passMarksExternal,
      totalMarksFinal,
      passMarksFinal,
      totalMarksMax, // Legacy field - kept for backward compatibility
      examDate,
      duration,
      examinationType,
      freezeDate,
      status,
    } = req.body;

    const internalExamSetup = new InternalExamSetup({
      courseId,
      streamId,
      semesterId,
      semesterNumber: semesterNumber ? Number(semesterNumber) : undefined,
      subjectId,
      examType,
      maxMarks,
      passMarks,
      totalInternalMarks,
      test1Max: test1Max || 0,
      test2Max: test2Max || 0,
      assignmentMax: assignmentMax || 0,
      attendanceMax: attendanceMax || 0,
      recordMax: recordMax || 0,
      performanceMax: performanceMax || 0,
      internalTestMax: internalTestMax || 0,
      vivaMax: vivaMax || 0,
      externalMarksMax: externalMarksMax || 0,
      passMarksExternal: passMarksExternal || 0,
      totalMarksFinal: totalMarksFinal || 0,
      passMarksFinal: passMarksFinal || 0,
      totalMarksMax: totalMarksMax || 0, // Legacy field - kept for backward compatibility
      examDate: examDate ? new Date(examDate) : undefined,
      duration: duration || "3 hours",
      examinationType: examinationType || "Regular",
      freezeDate: freezeDate ? new Date(freezeDate) : undefined,
      status: status || "Active",
    });

    await internalExamSetup.save();

    // Populate references before sending response
    await internalExamSetup.populate([
      { path: "courseId", select: "code name" },
      { path: "streamId", select: "code name" },
      { path: "semesterId", select: "numberOfSemesters description" },
      { path: "subjectId", select: "code name" },
    ]);

    res.status(201).json(internalExamSetup);
  } catch (error) {
    console.error("Error creating internal exam setup:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Duplicate configuration. A setup with the same course, stream, semester, subject, and exam type already exists.",
      });
    }
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update an internal exam setup
// @route PUT /api/examination/internal-exam-setups/:id
exports.updateInternalExamSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert date strings to Date objects if provided
    if (updateData.freezeDate) {
      updateData.freezeDate = new Date(updateData.freezeDate);
    }
    if (updateData.examDate) {
      updateData.examDate = new Date(updateData.examDate);
    }
    
    // Ensure numeric fields are properly converted
    if (updateData.externalMarksMax !== undefined) {
      updateData.externalMarksMax = Number(updateData.externalMarksMax) || 0;
    }
    if (updateData.passMarksExternal !== undefined) {
      updateData.passMarksExternal = Number(updateData.passMarksExternal) || 0;
    }
    if (updateData.totalMarksFinal !== undefined) {
      updateData.totalMarksFinal = Number(updateData.totalMarksFinal) || 0;
    }
    if (updateData.passMarksFinal !== undefined) {
      updateData.passMarksFinal = Number(updateData.passMarksFinal) || 0;
    }
    // Legacy field - kept for backward compatibility
    if (updateData.totalMarksMax !== undefined) {
      updateData.totalMarksMax = Number(updateData.totalMarksMax) || 0;
    }

    const updatedSetup = await InternalExamSetup.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("courseId", "code name")
      .populate("streamId", "code name")
      .populate("semesterId", "numberOfSemesters description")
      .populate("subjectId", "code name");

    if (!updatedSetup)
      return res
        .status(404)
        .json({ message: "Internal exam setup not found" });
    res.json(updatedSetup);
  } catch (error) {
    console.error("Error updating internal exam setup:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Duplicate configuration. A setup with the same course, stream, semester, subject, and exam type already exists.",
      });
    }
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete an internal exam setup
// @route DELETE /api/examination/internal-exam-setups/:id
exports.deleteInternalExamSetup = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSetup = await InternalExamSetup.findByIdAndDelete(id);
    if (!deletedSetup)
      return res
        .status(404)
        .json({ message: "Internal exam setup not found" });
    res.json({ message: "Internal exam setup deleted successfully" });
  } catch (error) {
    console.error("Error deleting internal exam setup:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get all setups for a specific course
// @route GET /api/examination/internal-exam-setups/course/:courseId
exports.getSetupsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const setups = await InternalExamSetup.find({ courseId })
      .populate("courseId", "code name")
      .populate("streamId", "code name")
      .populate("semesterId", "numberOfSemesters description")
      .populate("subjectId", "code name")
      .sort({ createdAt: -1 });

    res.json(setups);
  } catch (error) {
    console.error("Error fetching setups by course:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get all setups for a specific subject
// @route GET /api/examination/internal-exam-setups/subject/:subjectId
exports.getSetupsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const setups = await InternalExamSetup.find({ subjectId })
      .populate("courseId", "code name")
      .populate("streamId", "code name")
      .populate("semesterId", "numberOfSemesters description")
      .populate("subjectId", "code name")
      .sort({ createdAt: -1 });

    res.json(setups);
  } catch (error) {
    console.error("Error fetching setups by subject:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Helper function to convert semester number to semester year string (from course-stream mapping)
function getSemesterYearString(semesterNumber) {
  const year = Math.ceil(semesterNumber / 2);
  const semester = semesterNumber % 2 === 1 ? "1st Semester" : "2nd Semester";
  const yearOrdinal = 
    year === 1 ? "1st" : 
    year === 2 ? "2nd" : 
    year === 3 ? "3rd" : 
    `${year}th`;
  return `${yearOrdinal} Year - ${semester}`;
}

// @desc Get students for internal marks entry (filtered by course, stream, semester)
// @route GET /api/examination/internal-exam-setups/students
// Query params: courseId, streamId, semesterId (optional), status (optional, default: "Admitted")
// Note: semesterYear is dynamically fetched from course-stream mapping based on semesterNumber
exports.getStudentsForInternalMarks = async (req, res) => {
  try {
    const { courseId, streamId, semesterId, status } = req.query;

    if (!courseId || !streamId) {
      return res.status(400).json({
        success: false,
        message: "courseId and streamId are required",
      });
    }

    // First, find the CourseStreamMapping that matches the criteria
    const mappingQuery = {
      courseId: courseId,
      streamId: streamId,
      status: "Active",
    };

    if (semesterId) {
      mappingQuery.semesterId = semesterId;
    }

    const matchingMappings = await CourseStreamMapping.find(mappingQuery)
      .select("_id courseId streamId semesterId semesterNumber")
      .lean();

    if (matchingMappings.length === 0) {
      return res.json({
        success: true,
        count: 0,
        students: [],
        message: "No CourseStreamMapping found for the given criteria",
      });
    }

    // Get mapping IDs
    const mappingIds = matchingMappings.map(m => m._id);

    // Build query using courseStreamMappingId
    const query = {
      courseStreamMappingId: { $in: mappingIds },
      status: status || "Admitted", // Default to only "Admitted" students
    };

    // Fetch students with populated references
    const students = await FromStudents.find(query)
      .populate("courseStreamMappingId", "courseId streamId semesterId semesterNumber")
      .populate("campus", "code name city")
      .select(
        "firstName middleName lastName registrationNumber hallTicketNo courseStreamMappingId batch batchYear campus status email phone"
      )
      .sort({ registrationNumber: 1 })
      .lean(); // Use lean() for better performance

    // Use the matchingMappings we already fetched
    const mappings = matchingMappings;

    // Create a map of semesterId -> semesterNumber for quick lookup
    const semesterNumberMap = {};
    mappings.forEach((mapping) => {
      const key = mapping.semesterId?.toString();
      if (key && mapping.semesterNumber) {
        semesterNumberMap[key] = mapping.semesterNumber;
      }
    });

    // Add semesterYear dynamically from course-stream mapping
    const studentsWithSemesterYear = students.map((student) => {
      // Get the mapping from the student's courseStreamMappingId
      const studentMapping = student.courseStreamMappingId;
      const mappingId = studentMapping?._id?.toString() || studentMapping?.toString();
      
      // Find the matching mapping to get semesterNumber
      const matchingMapping = mappings.find(m => m._id.toString() === mappingId);
      const semesterNumber = matchingMapping?.semesterNumber;
      
      // Get semesterYear from mapping's semesterNumber (dynamic from course-stream mapping)
      const semesterYear = semesterNumber 
        ? getSemesterYearString(semesterNumber)
        : "N/A";

      return {
        ...student,
        course: matchingMapping?.courseId || null,
        stream: matchingMapping?.streamId || null,
        semester: matchingMapping?.semesterId || null,
        semesterYear: semesterYear, // Dynamically from course-stream mapping
        semesterNumber: semesterNumber || null, // Also include semesterNumber from mapping
      };
    });

    res.json({
      success: true,
      count: studentsWithSemesterYear.length,
      students: studentsWithSemesterYear,
      note: "semesterYear is dynamically fetched from course-stream mapping based on semesterNumber",
    });
  } catch (error) {
    console.error("Error fetching students for internal marks:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get students by course and stream (for dropdown/filtering)
// @route GET /api/examination/internal-exam-setups/students/filter
// Query params: courseId (required), streamId (optional)
// Note: semesterYear is dynamically fetched from course-stream mapping
exports.getStudentsByCourseStream = async (req, res) => {
  try {
    const { courseId, streamId } = req.query;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    const query = {
      course: courseId,
      status: "Admitted", // Only admitted students
    };

    if (streamId) {
      query.stream = streamId;
    }

    const students = await FromStudents.find(query)
      .populate("course", "code name")
      .populate("stream", "code name")
      .populate("semester", "numberOfSemesters description")
      .select(
        "_id firstName middleName lastName registrationNumber hallTicketNo stream semester"
      )
      .sort({ registrationNumber: 1 })
      .limit(1000)
      .lean(); // Use lean() for better performance

    // Fetch course-stream mappings to get semesterYear dynamically
    const mappingQuery = {
      courseId: courseId,
      status: "Active",
    };

    if (streamId) {
      mappingQuery.streamId = streamId;
    }

    const mappings = await CourseStreamMapping.find(mappingQuery)
      .select("courseId streamId semesterId semesterNumber")
      .lean();

    // Create a map of semesterId -> semesterNumber
    const semesterNumberMap = {};
    mappings.forEach((mapping) => {
      const key = mapping.semesterId?.toString();
      if (key && mapping.semesterNumber) {
        semesterNumberMap[key] = mapping.semesterNumber;
      }
    });

    // Add semesterYear dynamically from course-stream mapping
    const studentsWithSemesterYear = students.map((student) => {
      const studentSemesterId = student.semester?._id?.toString() || student.semester?.toString();
      const semesterNumber = semesterNumberMap[studentSemesterId];
      
      // Get semesterYear from mapping's semesterNumber (dynamic from course-stream mapping)
      const semesterYear = semesterNumber 
        ? getSemesterYearString(semesterNumber)
        : "N/A";

      return {
        ...student,
        semesterYear: semesterYear, // Dynamically from course-stream mapping
        semesterNumber: semesterNumber || null,
      };
    });

    res.json({
      success: true,
      count: studentsWithSemesterYear.length,
      students: studentsWithSemesterYear,
      note: "semesterYear is dynamically fetched from course-stream mapping based on semesterNumber",
    });
  } catch (error) {
    console.error("Error fetching students by course/stream:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

