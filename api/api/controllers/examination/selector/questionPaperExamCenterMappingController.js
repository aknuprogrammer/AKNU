const QuestionPaperExamCenterMapping = require("../../../models/examination/selector/QuestionPaperExamCenterMapping");
const mongoose = require("mongoose");

// @route GET /api/examination/question-paper-exam-center-mappings
exports.getQuestionPaperExamCenterMappings = async (req, res) => {
  try {
    const {
      examCenterId,
      questionPaperId,
      subjectCode,
      examCenterCode,
      includeInactive,
    } = req.query;

    let query = {};

    if (examCenterId) query.examCenterId = examCenterId;
    if (questionPaperId) query.questionPaperId = questionPaperId;
    if (subjectCode) query.subjectCode = subjectCode.toUpperCase();
    if (examCenterCode) query.examCenterCode = examCenterCode.toUpperCase();

    // By default, only show Active records
    if (includeInactive !== "true") {
      query.status = "Active";
    }

    const mappings = await QuestionPaperExamCenterMapping.find(query)
      .populate("examCenterId", "name code address capacity status")
      .populate("questionPaperId", "subjectName subjectCode paperType examinationType totalMarks status")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: mappings.length,
      data: mappings,
    });
  } catch (error) {
    console.error("Error fetching mappings:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-paper-exam-center-mappings/:id
exports.getQuestionPaperExamCenterMappingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mapping ID format",
      });
    }

    const mapping = await QuestionPaperExamCenterMapping.findById(id)
      .populate("examCenterId", "name code address capacity status")
      .populate("questionPaperId", "subjectName subjectCode paperType examinationType totalMarks status")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Mapping not found",
      });
    }

    res.json({
      success: true,
      data: mapping,
    });
  } catch (error) {
    console.error("Error fetching mapping:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route POST /api/examination/question-paper-exam-center-mappings
exports.createQuestionPaperExamCenterMapping = async (req, res) => {
  try {
    const {
      examCenterId,
      questionPaperId,
      status,
      notes,
      createdBy,
    } = req.body;

    const mapping = new QuestionPaperExamCenterMapping({
      examCenterId,
      questionPaperId,
      status,
      notes,
      createdBy,
    });

    await mapping.save();

    // Populate before sending response
    await mapping.populate("examCenterId", "name code address capacity status");
    await mapping.populate("questionPaperId", "subjectName subjectCode paperType examinationType totalMarks status");

    res.status(201).json({
      success: true,
      message: "Question paper exam center mapping created successfully",
      data: mapping,
    });
  } catch (error) {
    console.error("Error creating mapping:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate mapping",
        error:
          "A mapping with this exam center and question paper combination already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
    });
  }
};

// @route PUT /api/examination/question-paper-exam-center-mappings/:id
exports.updateQuestionPaperExamCenterMapping = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mapping ID format",
      });
    }

    // Add updatedBy if provided
    if (req.body.updatedBy) {
      req.body.updatedBy = req.body.updatedBy;
    }

    const updatedMapping = await QuestionPaperExamCenterMapping.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("examCenterId", "name code address capacity status")
      .populate("questionPaperId", "subjectName subjectCode paperType examinationType totalMarks status");

    if (!updatedMapping) {
      return res.status(404).json({
        success: false,
        message: "Mapping not found",
      });
    }

    res.json({
      success: true,
      message: "Question paper exam center mapping updated successfully",
      data: updatedMapping,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate mapping",
        error:
          "A mapping with this exam center and question paper combination already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// @route DELETE /api/examination/question-paper-exam-center-mappings/:id
exports.deleteQuestionPaperExamCenterMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mapping ID format",
      });
    }

    const mapping = await QuestionPaperExamCenterMapping.findById(id);

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Mapping not found",
      });
    }

    // If hardDelete is explicitly requested, perform actual deletion
    if (hardDelete === "true") {
      const deletedMapping = await QuestionPaperExamCenterMapping.findByIdAndDelete(
        id
      );
      if (!deletedMapping) {
        return res.status(404).json({
          success: false,
          message: "Mapping not found",
        });
      }

      return res.json({
        success: true,
        message: "Mapping permanently deleted successfully",
        data: {
          _id: deletedMapping._id,
          examCenterId: deletedMapping.examCenterId,
          questionPaperId: deletedMapping.questionPaperId,
        },
      });
    }

    // Default: Soft delete (set status to Inactive)
    await mapping.softDelete();

    res.json({
      success: true,
      message: "Mapping deleted successfully (status set to Inactive)",
      data: mapping,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

// @route PUT /api/examination/question-paper-exam-center-mappings/:id/restore
exports.restoreQuestionPaperExamCenterMapping = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mapping ID format",
      });
    }

    const mapping = await QuestionPaperExamCenterMapping.findById(id);

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Mapping not found",
      });
    }

    await mapping.restore();

    res.json({
      success: true,
      message: "Mapping restored successfully",
      data: mapping,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Restore failed",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-paper-exam-center-mappings/exam-center/:examCenterId
exports.getMappingsByExamCenter = async (req, res) => {
  try {
    const { examCenterId } = req.params;
    const { activeOnly } = req.query;

    if (!mongoose.Types.ObjectId.isValid(examCenterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam center ID format",
      });
    }

    const options = { activeOnly: activeOnly !== "false" };
    const mappings = await QuestionPaperExamCenterMapping.findByExamCenter(
      examCenterId,
      options
    );

    res.json({
      success: true,
      count: mappings.length,
      data: mappings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-paper-exam-center-mappings/question-paper/:questionPaperId
exports.getMappingsByQuestionPaper = async (req, res) => {
  try {
    const { questionPaperId } = req.params;
    const { activeOnly } = req.query;

    if (!mongoose.Types.ObjectId.isValid(questionPaperId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    const options = { activeOnly: activeOnly !== "false" };
    const mappings = await QuestionPaperExamCenterMapping.findByQuestionPaper(
      questionPaperId,
      options
    );

    res.json({
      success: true,
      count: mappings.length,
      data: mappings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

