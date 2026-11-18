const InternalMarks = require("../../models/examination/InternalMarks");
const InternalExamSetup = require("../../models/examination/InternalExamSetup");
const FromStudents = require("../../models/admission/FromStudents");

// @desc Save internal marks for students
// @route POST /api/examination/internal-marks
exports.saveInternalMarks = async (req, res) => {
  try {
    const { internalExamSetupId, marks } = req.body;

    if (!internalExamSetupId) {
      return res.status(400).json({
        success: false,
        message: "Internal Exam Setup ID is required",
      });
    }

    if (!marks || !Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Marks array is required",
      });
    }

    // Get the Internal Exam Setup to validate
    const setup = await InternalExamSetup.findById(internalExamSetupId)
      .populate("courseId", "name")
      .populate("streamId", "name")
      .populate("subjectId", "name code")
      .lean();

    if (!setup) {
      return res.status(404).json({
        success: false,
        message: "Internal Exam Setup not found",
      });
    }

    const savedMarks = [];
    const errors = [];

    // Process each student's marks
    for (const markData of marks) {
      try {
        const {
          studentId,
          courseStreamMappingId,
          test1,
          test2,
          assignment,
          attendance,
          record,
          performance,
          internalTest,
          viva,
          isAbsent,
          remarks,
        } = markData;

        if (!studentId) {
          errors.push({ studentId: "Student ID is required" });
          continue;
        }

        // Verify student exists
        const student = await FromStudents.findById(studentId).lean();
        if (!student) {
          errors.push({ studentId, error: "Student not found" });
          continue;
        }

        // Calculate marks based on exam type
        let totalMarks = 0;
        const examType = setup.examType?.toLowerCase() || "";
        
        // Check for Mids exams - handle "Mid-Term Examination", "Mids", "Midterm", etc.
        const isMids = examType.includes("mid") || examType.includes("mids") || examType.includes("midterm");
        const isLabs = examType.includes("lab") || examType === "labs";

        if (isMids) {
          const bestTest = Math.max(parseFloat(test1 || 0), parseFloat(test2 || 0));
          totalMarks = bestTest + parseFloat(assignment || 0) + parseFloat(attendance || 0);
        } else if (isLabs) {
          totalMarks =
            parseFloat(record || 0) +
            parseFloat(performance || 0) +
            parseFloat(internalTest || 0) +
            parseFloat(viva || 0);
        }

        // If absent, total is 0
        if (isAbsent) {
          totalMarks = 0;
        }

        // Create or update marks
        const markDoc = await InternalMarks.findOneAndUpdate(
          {
            internalExamSetupId,
            studentId,
          },
          {
            internalExamSetupId,
            studentId,
            courseStreamMappingId: courseStreamMappingId || student.courseStreamMappingId,
            subjectId: setup.subjectId,
            examType: setup.examType,
            test1: parseFloat(test1 || 0),
            test2: parseFloat(test2 || 0),
            bestTest: isMids
              ? Math.max(parseFloat(test1 || 0), parseFloat(test2 || 0))
              : 0,
            assignment: parseFloat(assignment || 0),
            attendance: parseFloat(attendance || 0),
            record: parseFloat(record || 0),
            performance: parseFloat(performance || 0),
            internalTest: parseFloat(internalTest || 0),
            viva: parseFloat(viva || 0),
            totalMarks,
            isAbsent: isAbsent || false,
            status: "Submitted",
            remarks: remarks || "",
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        )
          .populate("studentId", "firstName middleName lastName registrationNumber")
          .populate("subjectId", "code name");

        savedMarks.push(markDoc);
      } catch (error) {
        errors.push({
          studentId: markData.studentId,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully saved ${savedMarks.length} student marks`,
      saved: savedMarks.length,
      errors: errors.length > 0 ? errors : undefined,
      data: savedMarks,
    });
  } catch (error) {
    console.error("Error saving internal marks:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get internal marks by Internal Exam Setup
// @route GET /api/examination/internal-marks/setup/:setupId
exports.getMarksBySetup = async (req, res) => {
  try {
    const { setupId } = req.params;

    const marks = await InternalMarks.find({
      internalExamSetupId: setupId,
    })
      .populate("studentId", "firstName middleName lastName registrationNumber hallTicketNo")
      .populate("subjectId", "code name")
      .populate("internalExamSetupId", "examType maxMarks passMarks")
      .sort({ "studentId.registrationNumber": 1 })
      .lean();

    res.json({
      success: true,
      count: marks.length,
      marks,
    });
  } catch (error) {
    console.error("Error fetching internal marks:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get all internal marks with filters
// @route GET /api/examination/internal-marks
exports.getAllInternalMarks = async (req, res) => {
  try {
    const { internalExamSetupId, courseId, streamId, semesterId, subjectId, examType, status } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    // If internalExamSetupId is directly provided, use it (most specific filter)
    if (internalExamSetupId) {
      // Validate the setup matches the provided course/stream/semester/subject filters if they exist
      const setup = await InternalExamSetup.findById(internalExamSetupId).lean();
      
      if (!setup) {
        return res.json({
          success: true,
          count: 0,
          marks: [],
          message: "Internal Exam Setup not found",
        });
      }

      // If additional filters are provided, validate they match the setup
      if (courseId && setup.courseId?.toString() !== courseId && setup.courseId?.toString() !== courseId.toString()) {
        return res.json({
          success: true,
          count: 0,
          marks: [],
          message: "Setup does not match provided course filter",
        });
      }
      if (streamId && setup.streamId?.toString() !== streamId && setup.streamId?.toString() !== streamId.toString()) {
        return res.json({
          success: true,
          count: 0,
          marks: [],
          message: "Setup does not match provided stream filter",
        });
      }
      if (semesterId && setup.semesterId?.toString() !== semesterId && setup.semesterId?.toString() !== semesterId.toString()) {
        return res.json({
          success: true,
          count: 0,
          marks: [],
          message: "Setup does not match provided semester filter",
        });
      }
      if (subjectId && setup.subjectId?.toString() !== subjectId && setup.subjectId?.toString() !== subjectId.toString()) {
        return res.json({
          success: true,
          count: 0,
          marks: [],
          message: "Setup does not match provided subject filter",
        });
      }

      query.internalExamSetupId = internalExamSetupId;
    } 
    // If filters are provided (but no direct internalExamSetupId), find matching Internal Exam Setups
    else if (courseId || streamId || semesterId || subjectId || examType) {
      const setupQuery = {};
      if (courseId) setupQuery.courseId = courseId;
      if (streamId) setupQuery.streamId = streamId;
      if (semesterId) setupQuery.semesterId = semesterId;
      if (subjectId) setupQuery.subjectId = subjectId;
      if (examType) setupQuery.examType = examType;

      const setups = await InternalExamSetup.find(setupQuery).select("_id").lean();
      const setupIds = setups.map((s) => s._id);

      if (setupIds.length === 0) {
        return res.json({
          success: true,
          count: 0,
          marks: [],
          message: "No matching Internal Exam Setups found",
        });
      }

      query.internalExamSetupId = { $in: setupIds };
    }

    const marks = await InternalMarks.find(query)
      .populate("studentId", "firstName middleName lastName registrationNumber hallTicketNo")
      .populate("subjectId", "code name")
      .populate("internalExamSetupId", "examType maxMarks passMarks")
      .populate({
        path: "internalExamSetupId",
        populate: {
          path: "courseId streamId semesterId",
          select: "name code description",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: marks.length,
      marks,
    });
  } catch (error) {
    console.error("Error fetching internal marks:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get internal marks for a specific student
// @route GET /api/examination/internal-marks/student/:studentId
exports.getMarksByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const marks = await InternalMarks.find({
      studentId,
    })
      .populate("subjectId", "code name")
      .populate("internalExamSetupId", "examType maxMarks passMarks")
      .populate({
        path: "internalExamSetupId",
        populate: {
          path: "courseId streamId semesterId",
          select: "name code description",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: marks.length,
      marks,
    });
  } catch (error) {
    console.error("Error fetching student marks:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Delete internal marks
// @route DELETE /api/examination/internal-marks/:id
exports.deleteInternalMarks = async (req, res) => {
  try {
    const { id } = req.params;

    const marks = await InternalMarks.findByIdAndDelete(id);

    if (!marks) {
      return res.status(404).json({
        success: false,
        message: "Internal marks not found",
      });
    }

    res.json({
      success: true,
      message: "Internal marks deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting internal marks:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

