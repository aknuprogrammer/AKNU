const QuestionPaper = require("../../../models/examination/selector/QuestionPaper");
const mongoose = require("mongoose");
const multer = require("multer");
const { generateQuestionPaperPDF } = require("../../../utils/questionPaperPdfGenerator");

// Configure multer for PDF upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// @route GET /api/examination/question-papers
exports.getQuestionPapers = async (req, res) => {
  try {
    const {
      subjectId,
      academicYearId,
      courseId,
      streamId,
      semesterId,
      status,
      examinationType,
      includeArchived,
      search,
    } = req.query;

    let query = {};

    if (subjectId) query.subjectId = subjectId;
    if (academicYearId) query.academicYearId = academicYearId;
    if (courseId) query.courseId = courseId;
    if (streamId) query.streamId = streamId;
    if (semesterId) query.semesterId = semesterId;
    if (status) query.status = status;
    if (examinationType) query.examinationType = examinationType;

    // By default, exclude archived
    if (includeArchived !== "true") {
      query.status = query.status || { $ne: "Archived" };
    }

    let questionPapers;

    if (search) {
      questionPapers = await QuestionPaper.search(search, {
        status: query.status,
        includeArchived: includeArchived === "true",
      });
    } else {
      questionPapers = await QuestionPaper.find(query)
        .populate("subjectId", "name code status")
        .populate("academicYearId", "code name status")
        .populate("courseId", "code name status")
        .populate("streamId", "code name status")
        .populate("semesterId", "numberOfSemesters description status")
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .populate("approvedBy", "name email")
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      count: questionPapers.length,
      data: questionPapers,
    });
  } catch (error) {
    console.error("Error fetching question papers:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-papers/:id
exports.getQuestionPaperById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    const questionPaper = await QuestionPaper.findById(id)
      .populate("subjectId", "name code status")
      .populate("academicYearId", "code name status")
      .populate("courseId", "code name status")
      .populate("streamId", "code name status")
      .populate("semesterId", "numberOfSemesters description status")
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email")
        .populate("approvedBy", "name email");

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    res.json({
      success: true,
      data: questionPaper,
    });
  } catch (error) {
    console.error("Error fetching question paper:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route POST /api/examination/question-papers
exports.createQuestionPaper = async (req, res) => {
  try {
    // Normalize marks before saving
    if (req.body.totalMarks && typeof req.body.totalMarks === "string") {
      req.body.totalMarks = parseInt(req.body.totalMarks);
    }

    // Normalize question marks - ensure all questions have valid marks
    if (req.body.questions && Array.isArray(req.body.questions)) {
      // Validate that all questions have valid marks before processing
      const questionsWithInvalidMarks = [];
      req.body.questions.forEach((q, index) => {
        let marksValue = q.marks;
        
        // Convert string to number if needed
        if (typeof marksValue === "string") {
          marksValue = marksValue.trim() === "" ? null : parseInt(marksValue);
        }
        
        // Check if marks is valid (must be a number >= 1)
        if (marksValue === null || marksValue === undefined || isNaN(marksValue) || marksValue < 1) {
          questionsWithInvalidMarks.push({
            index: index + 1,
            questionId: q.questionId || q.id || `Question ${index + 1}`,
            questionText: q.questionText?.substring(0, 50) || "N/A",
            marks: q.marks
          });
        }
      });
      
      if (questionsWithInvalidMarks.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid question marks",
          error: `The following questions have invalid or missing marks (must be >= 1): ${questionsWithInvalidMarks.map(q => `Question ${q.index} (${q.questionId})`).join(", ")}`,
          invalidQuestions: questionsWithInvalidMarks
        });
      }
      
      // All marks are valid, normalize them
      req.body.questions = req.body.questions.map((q) => {
        if (typeof q.marks === "string") {
          q.marks = parseInt(q.marks);
        }
        if (typeof q.sectionMarks === "string") {
          q.sectionMarks = parseInt(q.sectionMarks) || 0;
        } else if (q.sectionMarks === null || q.sectionMarks === undefined || q.sectionMarks === "") {
          q.sectionMarks = 0;
        }
        return q;
      });
    }

    const questionPaper = new QuestionPaper(req.body);
    await questionPaper.save();

    // Populate before sending response
    await questionPaper.populate("subjectId", "name code status");
    await questionPaper.populate("academicYearId", "code name status");
    await questionPaper.populate("courseId", "code name status");
    await questionPaper.populate("streamId", "code name status");
    await questionPaper.populate("semesterId", "numberOfSemesters description status");

    res.status(201).json({
      success: true,
      message: "Question paper created successfully",
      data: questionPaper,
    });
  } catch (error) {
    console.error("Error creating question paper:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate question paper",
        error:
          "A question paper with this subject, academic year, paper type, and examination type already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
    });
  }
};

// @route PUT /api/examination/question-papers/:id
exports.updateQuestionPaper = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    // Normalize marks
    if (req.body.totalMarks && typeof req.body.totalMarks === "string") {
      req.body.totalMarks = parseInt(req.body.totalMarks);
    }

    if (req.body.questions && Array.isArray(req.body.questions)) {
      req.body.questions = req.body.questions.map((q) => {
        // Handle marks - if empty string or invalid, keep as is to let validation catch it
        if (typeof q.marks === "string") {
          const marksNum = parseInt(q.marks);
          if (!isNaN(marksNum) && marksNum > 0) {
            q.marks = marksNum;
          } else if (q.marks.trim() === "") {
            // Empty string - set to undefined to trigger validation error
            q.marks = undefined;
          } else {
            // Invalid value - set to undefined to trigger validation error
            q.marks = undefined;
          }
        } else if (q.marks === null || q.marks === "") {
          q.marks = undefined;
        }
        
        // Handle sectionMarks
        if (typeof q.sectionMarks === "string") {
          const sectionMarksNum = parseInt(q.sectionMarks);
          if (!isNaN(sectionMarksNum) && sectionMarksNum >= 0) {
            q.sectionMarks = sectionMarksNum;
          } else if (q.sectionMarks.trim() === "") {
            q.sectionMarks = 0;
          } else {
            q.sectionMarks = 0;
          }
        } else if (q.sectionMarks === null || q.sectionMarks === "") {
          q.sectionMarks = 0;
        }
        return q;
      });
    }

    // Handle review fields
    if (req.body.reviewComments !== undefined || req.body.reviewStatus !== undefined) {
      req.body.reviewedAt = new Date();
      if (req.body.reviewedBy) {
        req.body.reviewedBy = req.body.reviewedBy;
      } else if (req.user && req.user._id) {
        req.body.reviewedBy = req.user._id;
      }
      
      // Update status based on reviewStatus if provided
      if (req.body.reviewStatus === "Approved") {
        req.body.status = "Approved";
        req.body.approvedAt = new Date();
        if (!req.body.approvedBy && req.body.reviewedBy) {
          req.body.approvedBy = req.body.reviewedBy;
        }
      } else if (req.body.reviewStatus === "Rejected") {
        req.body.status = "Rejected";
        req.body.rejectedAt = new Date();
      }
    }

    const updatedQuestionPaper = await QuestionPaper.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("subjectId", "name code status")
      .populate("academicYearId", "code name status")
      .populate("courseId", "code name status")
      .populate("streamId", "code name status")
      .populate("semesterId", "numberOfSemesters description status");

    if (!updatedQuestionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    res.json({
      success: true,
      message: "Question paper updated successfully",
      data: updatedQuestionPaper,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate question paper",
        error:
          "A question paper with this subject, academic year, paper type, and examination type already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// @route DELETE /api/examination/question-papers/:id
exports.deleteQuestionPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    const questionPaper = await QuestionPaper.findById(id);

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    // If hardDelete is explicitly requested, perform actual deletion
    if (hardDelete === "true") {
      const deletedPaper = await QuestionPaper.findByIdAndDelete(id);
      if (!deletedPaper) {
        return res.status(404).json({
          success: false,
          message: "Question paper not found",
        });
      }

      return res.json({
        success: true,
        message: "Question paper permanently deleted successfully",
        data: {
          _id: deletedPaper._id,
          subjectName: deletedPaper.subjectName,
          paperType: deletedPaper.paperType,
        },
      });
    }

    // Default: Archive (soft delete)
    await questionPaper.archive();

    res.json({
      success: true,
      message: "Question paper archived successfully",
      data: questionPaper,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

// @route PUT /api/examination/question-papers/:id/submit
exports.submitQuestionPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    const questionPaper = await QuestionPaper.findById(id);

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    await questionPaper.submit(userId);

    res.json({
      success: true,
      message: "Question paper submitted successfully",
      data: questionPaper,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Submit failed",
      error: error.message,
    });
  }
};

// @route PUT /api/examination/question-papers/:id/approve
exports.approveQuestionPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    const questionPaper = await QuestionPaper.findById(id);

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    await questionPaper.approve(userId);

    res.json({
      success: true,
      message: "Question paper approved successfully",
      data: questionPaper,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Approve failed",
      error: error.message,
    });
  }
};

// @route PUT /api/examination/question-papers/:id/reject
exports.rejectQuestionPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    const questionPaper = await QuestionPaper.findById(id);

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    await questionPaper.reject(userId, reason);

    res.json({
      success: true,
      message: "Question paper rejected successfully",
      data: questionPaper,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Reject failed",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-papers/subject/:subjectId
exports.getQuestionPapersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { status, academicYearId, includeArchived } = req.query;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID format",
      });
    }

    const questionPapers = await QuestionPaper.findBySubject(subjectId, {
      status,
      academicYearId,
      includeArchived: includeArchived === "true",
    });

    res.json({
      success: true,
      count: questionPapers.length,
      data: questionPapers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-papers/academic-year/:academicYearId
exports.getQuestionPapersByAcademicYear = async (req, res) => {
  try {
    const { academicYearId } = req.params;
    const { status, includeArchived } = req.query;

    if (!mongoose.Types.ObjectId.isValid(academicYearId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid academic year ID format",
      });
    }

    const questionPapers = await QuestionPaper.findByAcademicYear(
      academicYearId,
      {
        status,
        includeArchived: includeArchived === "true",
      }
    );

    res.json({
      success: true,
      count: questionPapers.length,
      data: questionPapers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-papers/status/:status
exports.getQuestionPapersByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ["Draft", "Submitted", "Approved", "Rejected", "Archived"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const questionPapers = await QuestionPaper.findByStatus(status);

    res.json({
      success: true,
      count: questionPapers.length,
      data: questionPapers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route POST /api/examination/question-papers/:id/upload-pdf
exports.uploadQuestionPaperPdf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required",
      });
    }

    const questionPaper = await QuestionPaper.findById(id);

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    // Store PDF in question paper
    questionPaper.pdfFile = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };
    questionPaper.pdfFileName = req.file.originalname || `question_paper_${id}.pdf`;

    await questionPaper.save();

    res.json({
      success: true,
      message: "PDF uploaded successfully",
      data: {
        _id: questionPaper._id,
        pdfFileName: questionPaper.pdfFileName,
        hasPdf: true,
      },
    });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    res.status(500).json({
      success: false,
      message: "PDF upload failed",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-papers/:id/download-pdf
exports.downloadQuestionPaperPdf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    // Fetch full question paper with all fields needed for PDF generation
    let questionPaper = await QuestionPaper.findById(id)
      .populate("subjectId", "name code status")
      .populate("academicYearId", "code name status")
      .populate("courseId", "code name status")
      .populate("streamId", "code name status")
      .populate("semesterId", "numberOfSemesters description status");

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    // Check for PDF in new format (pdfFile.data)
    if (questionPaper.pdfFile && questionPaper.pdfFile.data) {
      const fileName = questionPaper.pdfFileName ||
        `${questionPaper.subjectName || questionPaper.subjectCode}_${questionPaper.paperType}_${id}.pdf`;

      res.set({
        "Content-Type": questionPaper.pdfFile.contentType || "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      });

      return res.send(questionPaper.pdfFile.data);
    }

    // Check for PDF in legacy format (pdfBase64 field)
    if (questionPaper.pdfBase64 && questionPaper.pdfBase64.trim() !== "") {
      try {
        const pdfBuffer = Buffer.from(questionPaper.pdfBase64, "base64");
        if (pdfBuffer.length > 0) {
          const fileName = questionPaper.pdfFileName ||
            `${questionPaper.subjectName || questionPaper.subjectCode}_${questionPaper.paperType}_${id}.pdf`;

          res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${fileName}"`,
          });

          return res.send(pdfBuffer);
        }
      } catch (e) {
        console.error("Error decoding base64 PDF:", e);
      }
    }

    // Check for PDF in legacy format (pdfStorage as base64 or URL)
    if (questionPaper.pdfStorage && questionPaper.pdfStorage.trim() !== "") {
      // Try base64 first (common case)
      try {
        const pdfBuffer = Buffer.from(questionPaper.pdfStorage, "base64");
        // Check if it's valid base64 and produces a reasonable buffer
        if (pdfBuffer.length > 0) {
          const fileName = questionPaper.pdfFileName ||
            `${questionPaper.subjectName || questionPaper.subjectCode}_${questionPaper.paperType}_${id}.pdf`;

          res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${fileName}"`,
          });

          return res.send(pdfBuffer);
        }
      } catch (e) {
        // Not base64, might be URL
      }

      // Check if it's a URL
      if (questionPaper.pdfStorage.startsWith("http://") ||
        questionPaper.pdfStorage.startsWith("https://") ||
        questionPaper.pdfStorageType === "url") {
        return res.redirect(questionPaper.pdfStorage);
      }
    }

    // No PDF found - regenerate from current questions
    if (!questionPaper.pdfBase64 || questionPaper.pdfBase64.trim() === "") {
      try {
        console.log("Regenerating PDF for question paper:", id);

        // Generate PDF from current questions
        const pdfBuffer = await generateQuestionPaperPDF(questionPaper);
        const pdfBase64 = pdfBuffer.toString("base64");

        // Generate filename
        const fileName = `${questionPaper.subjectCode || questionPaper.subjectName || "QuestionPaper"}_${questionPaper.paperType || "Paper1"}_${Date.now()}.pdf`;

        // Save regenerated PDF
        questionPaper.pdfBase64 = pdfBase64;
        questionPaper.pdfFileName = fileName;
        await questionPaper.save();

        // Return the PDF
        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        });

        return res.send(pdfBuffer);
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        return res.status(500).json({
          success: false,
          message: "PDF generation failed",
          error: pdfError.message,
        });
      }
    }

    // No PDF found and regeneration failed - provide helpful error message
    return res.status(404).json({
      success: false,
      message: "PDF file not found for this question paper",
      error: "The question paper has a filename but no PDF data is stored. Please upload the PDF using the upload endpoint.",
      hasFileName: !!questionPaper.pdfFileName,
      fileName: questionPaper.pdfFileName || null,
    });
  } catch (error) {
    console.error("Error downloading PDF:", error);
    res.status(500).json({
      success: false,
      message: "PDF download failed",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-papers/:id/view-pdf
exports.viewQuestionPaperPdf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    // Fetch full question paper with all fields needed for PDF generation
    let questionPaper = await QuestionPaper.findById(id)
      .populate("subjectId", "name code status")
      .populate("academicYearId", "code name status")
      .populate("courseId", "code name status")
      .populate("streamId", "code name status")
      .populate("semesterId", "numberOfSemesters description status");

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    // Check for PDF in new format (pdfFile.data)
    if (questionPaper.pdfFile && questionPaper.pdfFile.data) {
      const fileName = questionPaper.pdfFileName ||
        `${questionPaper.subjectName || questionPaper.subjectCode}_${questionPaper.paperType}_${id}.pdf`;

      res.set({
        "Content-Type": questionPaper.pdfFile.contentType || "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`, // inline = view in browser
      });

      return res.send(questionPaper.pdfFile.data);
    }

    // Check for PDF in legacy format (pdfBase64 field)
    if (questionPaper.pdfBase64 && questionPaper.pdfBase64.trim() !== "") {
      try {
        const pdfBuffer = Buffer.from(questionPaper.pdfBase64, "base64");
        if (pdfBuffer.length > 0) {
          const fileName = questionPaper.pdfFileName ||
            `${questionPaper.subjectName || questionPaper.subjectCode}_${questionPaper.paperType}_${id}.pdf`;

          res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${fileName}"`,
          });

          return res.send(pdfBuffer);
        }
      } catch (e) {
        console.error("Error decoding base64 PDF:", e);
      }
    }

    // Check for PDF in legacy format (pdfStorage as base64 or URL)
    if (questionPaper.pdfStorage && questionPaper.pdfStorage.trim() !== "") {
      // Try base64 first (common case)
      try {
        const pdfBuffer = Buffer.from(questionPaper.pdfStorage, "base64");
        // Check if it's valid base64 and produces a reasonable buffer
        if (pdfBuffer.length > 0) {
          const fileName = questionPaper.pdfFileName ||
            `${questionPaper.subjectName || questionPaper.subjectCode}_${questionPaper.paperType}_${id}.pdf`;

          res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${fileName}"`,
          });

          return res.send(pdfBuffer);
        }
      } catch (e) {
        // Not base64, might be URL
      }

      // Check if it's a URL
      if (questionPaper.pdfStorage.startsWith("http://") ||
        questionPaper.pdfStorage.startsWith("https://") ||
        questionPaper.pdfStorageType === "url") {
        return res.redirect(questionPaper.pdfStorage);
      }
    }

    // No PDF found - regenerate from current questions
    if (!questionPaper.pdfBase64 || questionPaper.pdfBase64.trim() === "") {
      try {
        console.log("Regenerating PDF for question paper:", id);

        // Generate PDF from current questions
        const pdfBuffer = await generateQuestionPaperPDF(questionPaper);
        const pdfBase64 = pdfBuffer.toString("base64");

        // Generate filename
        const fileName = `${questionPaper.subjectCode || questionPaper.subjectName || "QuestionPaper"}_${questionPaper.paperType || "Paper1"}_${Date.now()}.pdf`;

        // Save regenerated PDF
        questionPaper.pdfBase64 = pdfBase64;
        questionPaper.pdfFileName = fileName;
        await questionPaper.save();

        // Return the PDF
        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
        });

        return res.send(pdfBuffer);
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        return res.status(500).json({
          success: false,
          message: "PDF generation failed",
          error: pdfError.message,
        });
      }
    }

    // No PDF found and regeneration failed - provide helpful error message
    return res.status(404).json({
      success: false,
      message: "PDF file not found for this question paper",
      error: "The question paper has a filename but no PDF data is stored. Please upload the PDF using the upload endpoint.",
      hasFileName: !!questionPaper.pdfFileName,
      fileName: questionPaper.pdfFileName || null,
    });
  } catch (error) {
    console.error("Error viewing PDF:", error);
    res.status(500).json({
      success: false,
      message: "PDF view failed",
      error: error.message,
    });
  }
};

// @route DELETE /api/examination/question-papers/:id/delete-pdf
exports.deleteQuestionPaperPdf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    const questionPaper = await QuestionPaper.findById(id);

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    questionPaper.pdfFile = {
      data: null,
      contentType: "application/pdf",
    };
    questionPaper.pdfFileName = "";

    await questionPaper.save();

    res.json({
      success: true,
      message: "PDF deleted successfully",
      data: {
        _id: questionPaper._id,
        hasPdf: false,
      },
    });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    res.status(500).json({
      success: false,
      message: "PDF deletion failed",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-papers/subject-code/:subjectCode
// @desc Get question paper by subject code (for evaluation)
// @access Private
exports.getQuestionPaperBySubjectCode = async (req, res) => {
  try {
    const { subjectCode } = req.params;

    if (!subjectCode) {
      return res.status(400).json({
        success: false,
        message: "Subject code or ID is required",
      });
    }

    let query = { status: "Approved" };

    // Check if it's a MongoDB ObjectId or subject code
    if (mongoose.Types.ObjectId.isValid(subjectCode)) {
      // It's a MongoDB ObjectId - use subjectId
      query.subjectId = subjectCode;
    } else {
      // It's a subject code string
      query.subjectCode = subjectCode.toUpperCase();
    }

    // Find the most recent approved question paper for this subject
    const questionPaper = await QuestionPaper.findOne(query)
      .populate("subjectId", "name code status")
      .populate("academicYearId", "code name status")
      .sort({ createdAt: -1 }); // Get the most recent one

    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: `No approved question paper found for subject: ${subjectCode}`,
      });
    }

    // Return only necessary fields for evaluation
    res.json({
      success: true,
      data: {
        _id: questionPaper._id,
        subjectCode: questionPaper.subjectCode,
        subjectName: questionPaper.subjectName,
        totalMarks: questionPaper.totalMarks,
        questions: questionPaper.questions,
        sections: questionPaper.sections,
      },
    });
  } catch (error) {
    console.error("Error fetching question paper by subject code:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Export multer upload middleware
exports.upload = upload;


