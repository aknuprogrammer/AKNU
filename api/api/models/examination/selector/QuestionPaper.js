const mongoose = require("mongoose");

// ==========================================
// NESTED SCHEMAS
// ==========================================

// Nested schema for matching pairs (used in "Match the Following" questions)
const matchingPairSchema = new mongoose.Schema(
  {
    left: {
      type: String,
      required: true,
      trim: true,
    },
    right: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

// Nested schema for sub-questions (used for questions with OR options)
const subQuestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    showOr: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Nested schema for alternative question (used when showOr is true)
const alternativeQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      trim: true,
      default: "",
    },
    marks: {
      type: Number,
      min: 0,
      default: 0,
    },
    subQuestions: {
      type: [subQuestionSchema],
      default: [],
    },
  },
  { _id: false }
);

// Nested schema for individual questions
const questionSchema = new mongoose.Schema(
  {
    // Unique identifier for the question
    questionId: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: [
        "MCQ",
        "Descriptive",
        "True/False",
        "Fill in the Blanks",
        "Match the Following",
      ],
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    marks: {
      type: Number,
      required: true,
      min: [1, "Question marks must be at least 1"],
      // Removed default: 0 as it conflicts with min: [1]
    },
    // Section information
    section: {
      type: String,
      trim: true,
      default: "No Section",
    },
    sectionInstruction: {
      type: String,
      trim: true,
      default: "Answer All Questions.",
    },
    sectionMarks: {
      type: Number,
      min: 0,
      default: 0,
    },
    // For questions with OR options
    showOr: {
      type: Boolean,
      default: false,
    },
    alternativeQuestion: {
      type: alternativeQuestionSchema,
      default: null,
    },
    subQuestions: {
      type: [subQuestionSchema],
      default: [],
    },
    // For MCQ and True/False questions
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      trim: true,
      default: "",
    },
    // For Match the Following questions
    matchingPairs: {
      type: [matchingPairSchema],
      default: [],
    },
    // Order/sequence of question within the paper
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

// Nested schema for sections (optional, can be derived from questions)
const sectionSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
      required: true,
      trim: true,
    },
    instruction: {
      type: String,
      trim: true,
      default: "Answer All Questions.",
    },
    totalMarks: {
      type: Number,
      min: 0,
      default: 0,
    },
    questionCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

// ==========================================
// MAIN QUESTION PAPER SCHEMA
// ==========================================

const questionPaperSchema = new mongoose.Schema(
  {
    // Subject reference
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject ID is required"],
      index: true,
    },
    // Denormalized subject info for quick access
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    // Academic Year reference
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: [true, "Academic Year ID is required"],
      index: true,
    },
    // Denormalized academic year info for quick access
    academicYearCode: {
      type: String,
      trim: true,
      default: "",
    },
    academicYearName: {
      type: String,
      trim: true,
      default: "",
    },
    // Course, Stream, Semester references (NEW)
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course_data",
      index: true,
    },
    streamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      index: true,
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      index: true,
    },
    // Paper details
    paperType: {
      type: String,
      required: true,
      trim: true,
      default: "Paper 1",
    },
    questionPaperNumber: {
      type: String,
      trim: true,
      default: "",
    },
    // Professor information
    professorName: {
      type: String,
      trim: true,
      default: "",
    },
    professorEmployeeId: {
      type: String,
      trim: true,
      default: "",
    },
    // Examination details
    examinationType: {
      type: String,
      required: true,
      trim: true,
      default: "Regular",
      enum: ["Regular", "Supplementary", "Revaluation", "Improvement", "Other"],
      index: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      default: "3 hours",
    },
    totalMarks: {
      type: Number,
      required: false, // Can be auto-calculated from questions
      min: 0,
      default: 0,
    },
    // Questions array
    questions: {
      type: [questionSchema],
      required: [true, "At least one question is required"],
      validate: {
        validator: function (questions) {
          return questions && questions.length > 0;
        },
        message: "At least one question is required",
      },
    },
    // Sections (optional, can be derived from questions)
    sections: {
      type: [sectionSchema],
      default: [],
    },
    // Status
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Rejected", "Archived"],
      default: "Draft",
      index: true,
    },
    // PDF storage (Binary storage in MongoDB)
    pdfFile: {
      data: {
        type: Buffer,
        default: null,
      },
      contentType: {
        type: String,
        default: "application/pdf",
      },
    },
    // Legacy field for backward compatibility (base64 storage)
    pdfBase64: {
      type: String,
      default: "",
    },
    // Legacy field for backward compatibility (URL/reference storage)
    pdfStorage: {
      type: String,
      default: "",
    },
    pdfStorageType: {
      type: String,
      enum: ["gridfs", "s3", "local", "url", "base64"],
      default: "gridfs",
    },
    pdfFileName: {
      type: String,
      trim: true,
      default: "",
    },
    // Additional metadata
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    // Version tracking for optimistic locking
    version: {
      type: Number,
      default: 0,
    },
    // Workflow timestamps (IMPROVED)
    submittedAt: {
      type: Date,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    // Audit fields
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
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    versionKey: "__v", // Optimistic locking
    collection: "question_papers",
  }
);

// ==========================================
// INDEXES
// ==========================================

// Compound index for unique question paper per subject-academicYear-paperType
questionPaperSchema.index(
  {
    subjectId: 1,
    academicYearId: 1,
    paperType: 1,
    examinationType: 1,
  },
  {
    unique: true,
    name: "unique_question_paper",
    partialFilterExpression: { status: { $ne: "Archived" } }, // Only enforce uniqueness for non-archived papers
  }
);

// Index for searching by status
questionPaperSchema.index({ status: 1, createdAt: -1 });

// Index for searching by academic year
questionPaperSchema.index({ academicYearId: 1, status: 1 });

// Index for searching by subject
questionPaperSchema.index({ subjectId: 1, status: 1 });

// Index for course, stream, semester
questionPaperSchema.index({ courseId: 1, streamId: 1, semesterId: 1 });

// Text index for searching
questionPaperSchema.index({
  subjectName: "text",
  subjectCode: "text",
  paperType: "text",
  questionPaperNumber: "text",
  professorName: "text",
});

// ==========================================
// VALIDATION MIDDLEWARE
// ==========================================

// Pre-save validation: Ensure Subject and AcademicYear exist
questionPaperSchema.pre("save", async function (next) {
  try {
    // Map 'id' to 'questionId' if frontend sends 'id'
    if (this.questions && this.questions.length > 0) {
      for (const question of this.questions) {
        if (question.id && !question.questionId) {
          question.questionId = question.id;
        }
        // Generate questionId if missing (IMPROVED: Use ObjectId)
        if (!question.questionId) {
          question.questionId = mongoose.Types.ObjectId().toString();
        }
      }
    }

    const Subject = mongoose.model("Subject");
    const AcademicYear = mongoose.model("AcademicYear");

    // Validate Subject exists
    const subject = await Subject.findById(this.subjectId);
    if (!subject) {
      return next(
        new Error(
          `Subject with ID ${this.subjectId} not found. Please select a valid subject.`
        )
      );
    }
    if (subject.status === "Inactive") {
      return next(
        new Error("Cannot create question paper for inactive subject")
      );
    }

    // Update denormalized subject info
    this.subjectName = subject.name || this.subjectName;
    this.subjectCode = subject.code || this.subjectCode;

    // Validate AcademicYear exists
    const academicYear = await AcademicYear.findById(this.academicYearId);
    if (!academicYear) {
      return next(
        new Error(
          `Academic Year with ID ${this.academicYearId} not found. Please select a valid academic year.`
        )
      );
    }
    if (academicYear.status === "Inactive") {
      return next(
        new Error("Cannot create question paper for inactive academic year")
      );
    }

    // Update denormalized academic year info
    this.academicYearCode = academicYear.code || this.academicYearCode;
    this.academicYearName = academicYear.name || this.academicYearName;

    // Validate questions
    if (!this.questions || this.questions.length === 0) {
      return next(
        new Error(
          "Question paper must contain at least one question. Please add questions before saving."
        )
      );
    }

    // Validate and normalize question data
    for (const question of this.questions) {
      // Ensure marks is a number
      if (typeof question.marks === "string") {
        question.marks = parseInt(question.marks) || 0;
      }
      if (typeof question.sectionMarks === "string") {
        question.sectionMarks = parseInt(question.sectionMarks) || 0;
      }

      // Validate marks
      if (question.marks <= 0) {
        return next(
          new Error(
            `Question "${question.questionText.substring(0, 50)}..." must have marks greater than 0`
          )
        );
      }

      // Validate question types and their required fields
      if (
        question.questionType === "MCQ" ||
        question.questionType === "True/False"
      ) {
        if (!question.options || question.options.length === 0) {
          return next(
            new Error(
              `${question.questionType} question must have at least one option`
            )
          );
        }
        if (!question.correctAnswer || question.correctAnswer.trim() === "") {
          return next(
            new Error(
              `${question.questionType} question must have a correct answer`
            )
          );
        }
      }

      if (question.questionType === "Match the Following") {
        if (!question.matchingPairs || question.matchingPairs.length === 0) {
          return next(
            new Error(
              "Match the Following question must have at least one matching pair"
            )
          );
        }
      }
    }

    // Validate total marks matches sum of question marks
    const calculatedTotalMarks = this.questions.reduce((sum, q) => {
      return sum + (q.marks || 0);
    }, 0);

    if (this.totalMarks) {
      const totalMarksNum =
        typeof this.totalMarks === "number"
          ? this.totalMarks
          : parseInt(this.totalMarks) || 0;
      if (Math.abs(totalMarksNum - calculatedTotalMarks) > 1) {
        // Auto-correct if difference is small, warn if significant
        if (Math.abs(totalMarksNum - calculatedTotalMarks) <= 5) {
          this.totalMarks = calculatedTotalMarks;
        } else {
          console.warn(
            `Total marks (${totalMarksNum}) doesn't match sum of question marks (${calculatedTotalMarks})`
          );
        }
      }
    } else {
      // Auto-calculate if not provided
      this.totalMarks = calculatedTotalMarks;
    }

    // Auto-generate sections from questions if not provided
    if (!this.sections || this.sections.length === 0) {
      const sectionMap = new Map();

      this.questions.forEach((q, index) => {
        const sectionName = q.section || "No Section";
        if (!sectionMap.has(sectionName)) {
          sectionMap.set(sectionName, {
            sectionName: sectionName,
            instruction: q.sectionInstruction || "Answer All Questions.",
            totalMarks: 0,
            questionCount: 0,
          });
        }
        const section = sectionMap.get(sectionName);
        section.totalMarks += q.marks || 0;
        section.questionCount += 1;
      });

      this.sections = Array.from(sectionMap.values());
    }

    // Update workflow timestamps
    if (this.isModified("status")) {
      const now = new Date();
      if (this.status === "Submitted" && !this.submittedAt) {
        this.submittedAt = now;
      } else if (this.status === "Approved" && !this.approvedAt) {
        this.approvedAt = now;
      } else if (this.status === "Rejected" && !this.rejectedAt) {
        this.rejectedAt = now;
      }
    }

    // Increment version for optimistic locking
    if (this.isNew) {
      this.version = 0;
    } else {
      this.version = (this.version || 0) + 1;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// VIRTUAL PROPERTIES
// ==========================================

// Virtual for question count
questionPaperSchema.virtual("questionCount").get(function () {
  return this.questions ? this.questions.length : 0;
});

// Virtual for display name
questionPaperSchema.virtual("displayName").get(function () {
  return `${this.subjectName} - ${this.paperType}${
    this.questionPaperNumber ? ` (${this.questionPaperNumber})` : ""
  }`;
});

questionPaperSchema.set("toJSON", { virtuals: true });

// ==========================================
// INSTANCE METHODS
// ==========================================

// Check if question paper is draft
questionPaperSchema.methods.isDraft = function () {
  return this.status === "Draft";
};

// Check if question paper is submitted
questionPaperSchema.methods.isSubmitted = function () {
  return this.status === "Submitted";
};

// Submit the question paper
questionPaperSchema.methods.submit = async function (userId = null) {
  if (this.status !== "Draft") {
    throw new Error("Only draft question papers can be submitted");
  }
  this.status = "Submitted";
  this.submittedAt = new Date();
  if (userId) {
    this.updatedBy = userId;
  }
  return this.save();
};

// Approve the question paper
questionPaperSchema.methods.approve = async function (userId = null) {
  if (this.status !== "Submitted") {
    throw new Error("Only submitted question papers can be approved");
  }
  this.status = "Approved";
  this.approvedBy = userId;
  this.approvedAt = new Date();
  if (userId) {
    this.updatedBy = userId;
  }
  return this.save();
};

// Reject the question paper
questionPaperSchema.methods.reject = async function (userId = null, reason = "") {
  if (this.status !== "Submitted") {
    throw new Error("Only submitted question papers can be rejected");
  }
  this.status = "Rejected";
  this.rejectedAt = new Date();
  if (reason) {
    this.notes = (this.notes ? this.notes + "\n" : "") + `Rejection reason: ${reason}`;
  }
  if (userId) {
    this.updatedBy = userId;
  }
  return this.save();
};

// Archive the question paper
questionPaperSchema.methods.archive = async function (userId = null) {
  this.status = "Archived";
  if (userId) {
    this.updatedBy = userId;
  }
  return this.save();
};

// Calculate total marks from questions
questionPaperSchema.methods.calculateTotalMarks = function () {
  if (!this.questions || this.questions.length === 0) {
    return 0;
  }
  return this.questions.reduce((sum, q) => {
    return sum + (q.marks || 0);
  }, 0);
};

// Get questions by section
questionPaperSchema.methods.getQuestionsBySection = function (sectionName) {
  if (!this.questions) return [];
  return this.questions.filter(
    (q) => (q.section || "No Section") === sectionName
  );
};

// ==========================================
// STATIC METHODS
// ==========================================

// Find question papers by subject
questionPaperSchema.statics.findBySubject = function (subjectId, options = {}) {
  const { status, academicYearId, includeArchived = false } = options;
  const query = { subjectId };

  if (status) {
    query.status = status;
  } else if (!includeArchived) {
    query.status = { $ne: "Archived" };
  }

  if (academicYearId) {
    query.academicYearId = academicYearId;
  }

  return this.find(query)
    .populate("subjectId", "name code status")
    .populate("academicYearId", "code name status")
    .sort({ createdAt: -1 });
};

// Find question papers by academic year
questionPaperSchema.statics.findByAcademicYear = function (
  academicYearId,
  options = {}
) {
  const { status, includeArchived = false } = options;
  const query = { academicYearId };

  if (status) {
    query.status = status;
  } else if (!includeArchived) {
    query.status = { $ne: "Archived" };
  }

  return this.find(query)
    .populate("subjectId", "name code status")
    .populate("academicYearId", "code name status")
    .sort({ createdAt: -1 });
};

// Find question papers by status
questionPaperSchema.statics.findByStatus = function (status) {
  return this.find({ status })
    .populate("subjectId", "name code status")
    .populate("academicYearId", "code name status")
    .sort({ createdAt: -1 });
};

// Search question papers
questionPaperSchema.statics.search = function (searchTerm, options = {}) {
  const { status, includeArchived = false } = options;
  const query = {
    $text: { $search: searchTerm },
  };

  if (status) {
    query.status = status;
  } else if (!includeArchived) {
    query.status = { $ne: "Archived" };
  }

  return this.find(query)
    .populate("subjectId", "name code status")
    .populate("academicYearId", "code name status")
    .sort({ score: { $meta: "textScore" }, createdAt: -1 });
};

// Find duplicate question papers
questionPaperSchema.statics.findDuplicates = function (
  subjectId,
  academicYearId,
  paperType,
  examinationType,
  excludeId = null
) {
  const query = {
    subjectId,
    academicYearId,
    paperType,
    examinationType,
    status: { $ne: "Archived" },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return this.find(query);
};

// ==========================================
// EXPORT
// ==========================================

// Force remove old model definition
if (mongoose.models.QuestionPaper) {
  delete mongoose.models.QuestionPaper;
}

const QuestionPaper = mongoose.model("QuestionPaper", questionPaperSchema);

module.exports = QuestionPaper;

