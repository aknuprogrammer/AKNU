const mongoose = require("mongoose");

const questionPaperExamCenterMappingSchema = new mongoose.Schema(
  {
    // Required References
    examCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExaminationCenter",
      required: [true, "Examination Center ID is required"],
    },
    questionPaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionPaper",
      required: [true, "Question Paper ID is required"],
    },

    // Denormalized Exam Center Info (auto-populated)
    examCenterName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Exam center name cannot exceed 200 characters"],
    },
    examCenterCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: [50, "Exam center code cannot exceed 50 characters"],
    },

    // Denormalized Question Paper Info (auto-populated)
    questionPaperNumber: {
      type: String,
      trim: true,
      default: "",
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Subject name cannot exceed 200 characters"],
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: [50, "Subject code cannot exceed 50 characters"],
    },
    paperType: {
      type: String,
      trim: true,
      default: "Paper 1",
    },

    // Status
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // Notes
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },

    // Version & Audit
    version: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: "__v",
    collection: "question_paper_exam_center_mappings",
  }
);

// Indexes
// Compound unique index to prevent duplicate mappings
questionPaperExamCenterMappingSchema.index(
  { examCenterId: 1, questionPaperId: 1 },
  { unique: true, name: "unique_exam_center_question_paper" }
);

// Individual indexes for faster queries
questionPaperExamCenterMappingSchema.index({ examCenterId: 1 });
questionPaperExamCenterMappingSchema.index({ questionPaperId: 1 });
questionPaperExamCenterMappingSchema.index({ status: 1 });
questionPaperExamCenterMappingSchema.index({ subjectCode: 1 });
questionPaperExamCenterMappingSchema.index({ examCenterCode: 1 });

// Pre-save hook to auto-populate denormalized fields
// Use pre('validate') to populate before validation runs
questionPaperExamCenterMappingSchema.pre("validate", async function (next) {
  try {
    // Auto-populate exam center info if not provided
    if (
      (!this.examCenterName || !this.examCenterCode) &&
      this.examCenterId
    ) {
      try {
        const ExaminationCenter = mongoose.model("ExaminationCenter");
        const examCenter = await ExaminationCenter.findById(
          this.examCenterId
        ).select("name code");

        if (examCenter) {
          this.examCenterName = examCenter.name || this.examCenterName || "";
          this.examCenterCode = examCenter.code || this.examCenterCode || "";
        } else {
          return next(new Error(`Examination Center with ID ${this.examCenterId} not found`));
        }
      } catch (err) {
        return next(new Error(`Error loading Examination Center: ${err.message}`));
      }
    }

    // Auto-populate question paper info if not provided
    if (
      (!this.subjectName ||
        !this.subjectCode ||
        !this.questionPaperNumber ||
        !this.paperType) &&
      this.questionPaperId
    ) {
      try {
        const QuestionPaper = mongoose.model("QuestionPaper");
        const questionPaper = await QuestionPaper.findById(
          this.questionPaperId
        ).select("subjectName subjectCode questionPaperNumber paperType");

        if (questionPaper) {
          this.subjectName = questionPaper.subjectName || this.subjectName || "";
          this.subjectCode = questionPaper.subjectCode || this.subjectCode || "";
          this.questionPaperNumber =
            questionPaper.questionPaperNumber || this.questionPaperNumber || "";
          this.paperType = questionPaper.paperType || this.paperType || "Paper 1";
        } else {
          return next(new Error(`Question Paper with ID ${this.questionPaperId} not found`));
        }
      } catch (err) {
        return next(new Error(`Error loading Question Paper: ${err.message}`));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save hook for version and timestamp updates
questionPaperExamCenterMappingSchema.pre("save", async function (next) {
  try {
    // Increment version for optimistic locking
    if (this.isNew) {
      this.version = 0;
    } else {
      this.version = (this.version || 0) + 1;
    }

    // Update updatedAt
    this.updatedAt = Date.now();

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update hook for findOneAndUpdate
questionPaperExamCenterMappingSchema.pre(
  ["findOneAndUpdate", "updateOne"],
  async function (next) {
    try {
      const update = this.getUpdate();
      const examCenterId = update.examCenterId || this.getFilter().examCenterId;
      const questionPaperId =
        update.questionPaperId || this.getFilter().questionPaperId;

      // Auto-populate exam center info if examCenterId is being updated
      if (examCenterId && (!update.examCenterName || !update.examCenterCode)) {
        try {
          const ExaminationCenter = mongoose.model("ExaminationCenter");
          const examCenter = await ExaminationCenter.findById(
            examCenterId
          ).select("name code");

          if (examCenter) {
            if (!update.examCenterName) {
              update.examCenterName = examCenter.name;
            }
            if (!update.examCenterCode) {
              update.examCenterCode = examCenter.code;
            }
          }
        } catch (err) {
          // Model not loaded, skip
        }
      }

      // Auto-populate question paper info if questionPaperId is being updated
      if (
        questionPaperId &&
        (!update.subjectName ||
          !update.subjectCode ||
          !update.questionPaperNumber ||
          !update.paperType)
      ) {
        try {
          const QuestionPaper = mongoose.model("QuestionPaper");
          const questionPaper = await QuestionPaper.findById(
            questionPaperId
          ).select("subjectName subjectCode questionPaperNumber paperType");

          if (questionPaper) {
            if (!update.subjectName) {
              update.subjectName = questionPaper.subjectName;
            }
            if (!update.subjectCode) {
              update.subjectCode = questionPaper.subjectCode;
            }
            if (!update.questionPaperNumber) {
              update.questionPaperNumber = questionPaper.questionPaperNumber;
            }
            if (!update.paperType) {
              update.paperType = questionPaper.paperType;
            }
          }
        } catch (err) {
          // Model not loaded, skip
        }
      }

      // Increment version
      if (update.$set) {
        update.$set.version = (update.$set.version || 0) + 1;
      } else {
        update.version = (update.version || 0) + 1;
      }

      // Update updatedAt
      if (update.$set) {
        update.$set.updatedAt = Date.now();
      } else {
        update.updatedAt = Date.now();
      }

      next();
    } catch (error) {
      next(error);
    }
  }
);

// Virtuals
questionPaperExamCenterMappingSchema.virtual("examCenter", {
  ref: "ExaminationCenter",
  localField: "examCenterId",
  foreignField: "_id",
  justOne: true,
});

questionPaperExamCenterMappingSchema.virtual("questionPaper", {
  ref: "QuestionPaper",
  localField: "questionPaperId",
  foreignField: "_id",
  justOne: true,
});

questionPaperExamCenterMappingSchema.set("toJSON", { virtuals: true });

// Instance Methods
questionPaperExamCenterMappingSchema.methods.isActive = function () {
  return this.status === "Active";
};

questionPaperExamCenterMappingSchema.methods.softDelete = async function () {
  this.status = "Inactive";
  return await this.save();
};

questionPaperExamCenterMappingSchema.methods.restore = async function () {
  this.status = "Active";
  return await this.save();
};

// Static Methods
questionPaperExamCenterMappingSchema.statics.findByExamCenter = function (
  examCenterId,
  options = {}
) {
  const query = { examCenterId };
  if (options.activeOnly !== false) {
    query.status = "Active";
  }
  return this.find(query)
    .populate("examCenterId", "name code address capacity")
    .populate("questionPaperId", "subjectName subjectCode paperType examinationType totalMarks status")
    .sort({ createdAt: -1 });
};

questionPaperExamCenterMappingSchema.statics.findByQuestionPaper = function (
  questionPaperId,
  options = {}
) {
  const query = { questionPaperId };
  if (options.activeOnly !== false) {
    query.status = "Active";
  }
  return this.find(query)
    .populate("examCenterId", "name code address capacity")
    .populate("questionPaperId", "subjectName subjectCode paperType examinationType totalMarks status")
    .sort({ createdAt: -1 });
};

// Force remove old model definition
if (mongoose.models.QuestionPaperExamCenterMapping) {
  delete mongoose.models.QuestionPaperExamCenterMapping;
}

const QuestionPaperExamCenterMapping = mongoose.model(
  "QuestionPaperExamCenterMapping",
  questionPaperExamCenterMappingSchema
);

module.exports = QuestionPaperExamCenterMapping;

