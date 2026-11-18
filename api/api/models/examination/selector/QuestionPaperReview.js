const mongoose = require("mongoose");

const questionPaperReviewSchema = new mongoose.Schema(
  {
    questionPaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: true,
      index: true,
    },
    questionPaperNumber: {
      type: String,
      trim: true,
      index: true,
    },
    reviewStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Needs Revision"],
      default: "Pending",
      required: true,
    },
    reviewComments: {
      type: String,
      trim: true,
      maxlength: [1000, "Review comments cannot exceed 1000 characters"],
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedProfessorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professor",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
    // Additional metadata
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "question_paper_reviews",
  }
);

// Indexes
questionPaperReviewSchema.index({ questionPaperId: 1, reviewedAt: -1 });
questionPaperReviewSchema.index({ reviewStatus: 1 });
questionPaperReviewSchema.index({ reviewedBy: 1 });
questionPaperReviewSchema.index({ reviewedProfessorId: 1 });
questionPaperReviewSchema.index({ questionPaperNumber: 1 });

// Compound index to ensure one active review per question paper
questionPaperReviewSchema.index(
  { questionPaperId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "Active" },
  }
);

// Pre-save middleware to update questionPaperNumber from referenced question paper
questionPaperReviewSchema.pre("save", async function (next) {
  if (this.isNew && !this.questionPaperNumber && this.questionPaperId) {
    try {
      const QuestionPaper = mongoose.model("QuestionPaper");
      const questionPaper = await QuestionPaper.findById(this.questionPaperId);
      if (questionPaper && questionPaper.questionPaperNumber) {
        this.questionPaperNumber = questionPaper.questionPaperNumber;
      }
    } catch (error) {
      // If question paper not found, continue without questionPaperNumber
      console.error("Error fetching question paper for review:", error);
    }
  }
  next();
});

// Static method to get latest review for a question paper
questionPaperReviewSchema.statics.getLatestReview = async function (questionPaperId) {
  return this.findOne({
    questionPaperId: questionPaperId,
    status: "Active",
  })
    .populate("reviewedBy", "name email")
    .populate("reviewedProfessorId", "name professorId employeeId contactNumber")
    .sort({ reviewedAt: -1 });
};

// Static method to get all reviews for a question paper
questionPaperReviewSchema.statics.getReviewsByQuestionPaper = async function (questionPaperId) {
  return this.find({
    questionPaperId: questionPaperId,
  })
    .populate("reviewedBy", "name email")
    .populate("reviewedProfessorId", "name professorId employeeId contactNumber")
    .sort({ reviewedAt: -1 });
};

const QuestionPaperReview = mongoose.model(
  "QuestionPaperReview",
  questionPaperReviewSchema
);

module.exports = QuestionPaperReview;
