const CombinedResult = require("../../models/examination/CombinedResult");
const InternalExamSetup = require("../../models/examination/InternalExamSetup");

// @desc    Save combined results (bulk)
// @route   POST /api/examination/combined-results
// @access  Private
exports.saveCombinedResults = async (req, res) => {
  try {
    const { internalExamSetupId, results } = req.body;

    if (!internalExamSetupId) {
      return res.status(400).json({
        success: false,
        message: "Internal exam setup ID is required",
      });
    }

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Results array is required",
      });
    }

    // Verify internal exam setup exists
    const setup = await InternalExamSetup.findById(internalExamSetupId);
    if (!setup) {
      return res.status(404).json({
        success: false,
        message: "Internal exam setup not found",
      });
    }

    const savedResults = [];
    const errors = [];

    // Process each result
    for (const resultData of results) {
      try {
        // Prepare result document
        const resultDoc = {
          internalExamSetupId,
          studentId: resultData.studentId || null,
          subjectId: setup.subjectId || resultData.subjectId,
          courseStreamMappingId: resultData.courseStreamMappingId || null,
          registrationNumber: resultData.registrationNumber,
          rollNumber: resultData.rollNumber || null,
          studentName: resultData.studentName,
          internalMarks: parseFloat(resultData.internalMarks || 0),
          externalMarks: parseFloat(resultData.externalMarks || 0),
          totalMarks: parseFloat(resultData.totalMarks || 0),
          maxMarks: parseFloat(resultData.maxMarks || 100),
          passMarks: parseFloat(resultData.passMarks || 0),
          isPass: resultData.isPass || false,
          status: resultData.status || (resultData.isPass ? "PASS" : "FAIL"),
          isAbsent: resultData.isAbsent || false,
          internalMarkId: resultData.internalMarkId || null,
          scriptId: resultData.scriptId || null,
          scriptStatus: resultData.scriptStatus || null,
          processedBy: req.user?.id || null,
          remarks: resultData.remarks || "",
        };

        // Use findOneAndUpdate with upsert to create or update
        const savedResult = await CombinedResult.findOneAndUpdate(
          {
            internalExamSetupId,
            registrationNumber: resultData.registrationNumber,
            subjectId: setup.subjectId || resultData.subjectId,
          },
          resultDoc,
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        )
          .populate("studentId", "firstName middleName lastName registrationNumber")
          .populate("subjectId", "code name")
          .populate("internalExamSetupId", "examType maxMarks passMarks");

        savedResults.push(savedResult);
      } catch (error) {
        errors.push({
          registrationNumber: resultData.registrationNumber,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully saved ${savedResults.length} combined results`,
      saved: savedResults.length,
      errors: errors.length > 0 ? errors : undefined,
      data: savedResults,
    });
  } catch (error) {
    console.error("Error saving combined results:", error);
    res.status(500).json({
      success: false,
      message: "Error saving combined results",
      error: error.message,
    });
  }
};

// @desc    Get all combined results
// @route   GET /api/examination/combined-results
// @access  Private
exports.getAllCombinedResults = async (req, res) => {
  try {
    const {
      internalExamSetupId,
      subjectId,
      studentId,
      registrationNumber,
      status,
      isPass,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (internalExamSetupId) {
      query.internalExamSetupId = internalExamSetupId;
    }

    if (subjectId) {
      query.subjectId = subjectId;
    }

    if (studentId) {
      query.studentId = studentId;
    }

    if (registrationNumber) {
      query.registrationNumber = { $regex: registrationNumber, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    if (isPass !== undefined) {
      query.isPass = isPass === "true";
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const results = await CombinedResult.find(query)
      .populate("studentId", "firstName middleName lastName registrationNumber")
      .populate("subjectId", "code name")
      .populate("internalExamSetupId", "examType maxMarks passMarks")
      .populate("courseStreamMappingId", "semesterNumber")
      .sort({ registrationNumber: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await CombinedResult.countDocuments(query);

    res.json({
      success: true,
      data: results,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error fetching combined results:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching combined results",
      error: error.message,
    });
  }
};

// @desc    Get combined result by ID
// @route   GET /api/examination/combined-results/:id
// @access  Private
exports.getCombinedResultById = async (req, res) => {
  try {
    const result = await CombinedResult.findById(req.params.id)
      .populate("studentId", "firstName middleName lastName registrationNumber")
      .populate("subjectId", "code name")
      .populate("internalExamSetupId", "examType maxMarks passMarks")
      .populate("courseStreamMappingId", "semesterNumber");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Combined result not found",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching combined result:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching combined result",
      error: error.message,
    });
  }
};

// @desc    Update combined result
// @route   PUT /api/examination/combined-results/:id
// @access  Private
exports.updateCombinedResult = async (req, res) => {
  try {
    const result = await CombinedResult.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("studentId", "firstName middleName lastName registrationNumber")
      .populate("subjectId", "code name")
      .populate("internalExamSetupId", "examType maxMarks passMarks");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Combined result not found",
      });
    }

    res.json({
      success: true,
      message: "Combined result updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating combined result:", error);
    res.status(500).json({
      success: false,
      message: "Error updating combined result",
      error: error.message,
    });
  }
};

// @desc    Delete combined result
// @route   DELETE /api/examination/combined-results/:id
// @access  Private
exports.deleteCombinedResult = async (req, res) => {
  try {
    const result = await CombinedResult.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Combined result not found",
      });
    }

    res.json({
      success: true,
      message: "Combined result deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting combined result:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting combined result",
      error: error.message,
    });
  }
};

// @desc    Delete combined results by internal exam setup
// @route   DELETE /api/examination/combined-results/setup/:setupId
// @access  Private
exports.deleteCombinedResultsBySetup = async (req, res) => {
  try {
    const { setupId } = req.params;

    const result = await CombinedResult.deleteMany({
      internalExamSetupId: setupId,
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} combined results`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting combined results:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting combined results",
      error: error.message,
    });
  }
};

