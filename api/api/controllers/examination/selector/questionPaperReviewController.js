const QuestionPaperReview = require("../../../models/examination/selector/QuestionPaperReview");
const QuestionPaper = require("../../../models/examination/selector/QuestionPaper");
const mongoose = require("mongoose");

// @route GET /api/examination/question-paper-reviews
exports.getQuestionPaperReviews = async (req, res) => {
  try {
    const { questionPaperId, reviewStatus, reviewedBy } = req.query;

    let query = {};

    if (questionPaperId) {
      if (!mongoose.Types.ObjectId.isValid(questionPaperId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid question paper ID format",
        });
      }
      query.questionPaperId = questionPaperId;
    }

    if (reviewStatus) {
      query.reviewStatus = reviewStatus;
    }

    if (reviewedBy) {
      if (!mongoose.Types.ObjectId.isValid(reviewedBy)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reviewer ID format",
        });
      }
      query.reviewedBy = reviewedBy;
    }

    const reviews = await QuestionPaperReview.find(query)
      .populate("questionPaperId", "questionPaperNumber subjectId paperType examinationType")
      .populate("reviewedBy", "name email")
      .populate("reviewedProfessorId", "name professorId employeeId contactNumber")
      .sort({ reviewedAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching question paper reviews:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-paper-reviews/:id
exports.getQuestionPaperReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format",
      });
    }

    const review = await QuestionPaperReview.findById(id)
      .populate("questionPaperId", "questionPaperNumber subjectId paperType examinationType")
      .populate("reviewedBy", "name email")
      .populate("reviewedProfessorId", "name professorId employeeId contactNumber");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-paper-reviews/question-paper/:questionPaperId
exports.getReviewsByQuestionPaper = async (req, res) => {
  try {
    const { questionPaperId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionPaperId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    const reviews = await QuestionPaperReview.getReviewsByQuestionPaper(questionPaperId);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews for question paper:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route GET /api/examination/question-paper-reviews/question-paper/:questionPaperId/latest
exports.getLatestReview = async (req, res) => {
  try {
    const { questionPaperId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionPaperId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    const review = await QuestionPaperReview.getLatestReview(questionPaperId);

    if (!review) {
      return res.status(200).json({
        success: true,
        message: "No review found for this question paper",
        data: null,
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Error fetching latest review:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @route POST /api/examination/question-paper-reviews
exports.createQuestionPaperReview = async (req, res) => {
  try {
    const { questionPaperId, reviewStatus, reviewComments, reviewedBy, reviewedProfessorId } = req.body;

    if (!questionPaperId) {
      return res.status(400).json({
        success: false,
        message: "Question paper ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(questionPaperId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question paper ID format",
      });
    }

    // Verify question paper exists
    const questionPaper = await QuestionPaper.findById(questionPaperId);
    if (!questionPaper) {
      return res.status(404).json({
        success: false,
        message: "Question paper not found",
      });
    }

    // Deactivate any existing active review for this question paper
    await QuestionPaperReview.updateMany(
      { questionPaperId: questionPaperId, status: "Active" },
      { status: "Inactive" }
    );

    // Create new review
    const reviewData = {
      questionPaperId,
      reviewStatus: reviewStatus || "Pending",
      reviewComments: reviewComments || "",
      reviewedAt: new Date(),
      status: "Active",
    };

    if (reviewedBy) {
      if (!mongoose.Types.ObjectId.isValid(reviewedBy)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reviewer ID format",
        });
      }
      reviewData.reviewedBy = reviewedBy;
    } else if (req.user && req.user._id) {
      reviewData.reviewedBy = req.user._id;
    }

    if (reviewedProfessorId) {
      if (!mongoose.Types.ObjectId.isValid(reviewedProfessorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid professor ID format",
        });
      }
      reviewData.reviewedProfessorId = reviewedProfessorId;
    }

    // Set questionPaperNumber from the question paper
    if (questionPaper.questionPaperNumber) {
      reviewData.questionPaperNumber = questionPaper.questionPaperNumber;
    }

    const review = new QuestionPaperReview(reviewData);
    await review.save();

    // Update question paper status based on review status
    if (reviewStatus === "Approved") {
      questionPaper.status = "Approved";
      questionPaper.approvedAt = new Date();
      if (reviewData.reviewedBy) {
        questionPaper.approvedBy = reviewData.reviewedBy;
      }
      await questionPaper.save();
    } else if (reviewStatus === "Rejected") {
      questionPaper.status = "Rejected";
      questionPaper.rejectedAt = new Date();
      await questionPaper.save();
    }

    await review.populate("questionPaperId", "questionPaperNumber subjectId paperType examinationType");
    await review.populate("reviewedBy", "name email");
    await review.populate("reviewedProfessorId", "name professorId employeeId");

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error creating review:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An active review already exists for this question paper",
        error: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
    });
  }
};

// @route PUT /api/examination/question-paper-reviews/:id
exports.updateQuestionPaperReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format",
      });
    }

    const review = await QuestionPaperReview.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Update review fields
    if (req.body.reviewStatus !== undefined) {
      review.reviewStatus = req.body.reviewStatus;
    }
    if (req.body.reviewComments !== undefined) {
      review.reviewComments = req.body.reviewComments;
    }
    if (req.body.reviewedBy !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(req.body.reviewedBy)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reviewer ID format",
        });
      }
      review.reviewedBy = req.body.reviewedBy;
    }
    if (req.body.reviewedProfessorId !== undefined) {
      if (req.body.reviewedProfessorId && !mongoose.Types.ObjectId.isValid(req.body.reviewedProfessorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid professor ID format",
        });
      }
      review.reviewedProfessorId = req.body.reviewedProfessorId || null;
    }
    review.reviewedAt = new Date();

    await review.save();

    // Update question paper status based on review status
    const questionPaper = await QuestionPaper.findById(review.questionPaperId);
    if (questionPaper) {
      if (review.reviewStatus === "Approved") {
        questionPaper.status = "Approved";
        questionPaper.approvedAt = new Date();
        if (review.reviewedBy) {
          questionPaper.approvedBy = review.reviewedBy;
        }
        await questionPaper.save();
      } else if (review.reviewStatus === "Rejected") {
        questionPaper.status = "Rejected";
        questionPaper.rejectedAt = new Date();
        await questionPaper.save();
      }
    }

    await review.populate("questionPaperId", "questionPaperNumber subjectId paperType examinationType");
    await review.populate("reviewedBy", "name email");
    await review.populate("reviewedProfessorId", "name professorId employeeId");

    res.json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(400).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

// @route DELETE /api/examination/question-paper-reviews/:id
exports.deleteQuestionPaperReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID format",
      });
    }

    const review = await QuestionPaperReview.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Soft delete by setting status to Inactive
    review.status = "Inactive";
    await review.save();

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
