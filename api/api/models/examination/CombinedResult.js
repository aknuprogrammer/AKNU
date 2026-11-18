const mongoose = require("mongoose");

const combinedResultSchema = new mongoose.Schema(
  {
    // Reference to Internal Exam Setup
    internalExamSetupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalExamSetup",
      required: true,
      index: true,
    },

    // Student reference
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      index: true,
    },

    // Subject reference
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    // Course-Stream-Semester mapping reference
    courseStreamMappingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseStreamMapping",
      index: true,
    },

    // Student Information
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    rollNumber: {
      type: String,
      trim: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    // Marks Information
    internalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    externalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    passMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    // Result Status
    isPass: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["PASS", "FAIL", "ABSENT"],
      default: "FAIL",
      index: true,
    },
    isAbsent: {
      type: Boolean,
      default: false,
    },

    // References to source data
    internalMarkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalMarks",
      index: true,
    },
    scriptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Script",
      index: true,
    },
    scriptStatus: {
      type: String,
      trim: true,
    },

    // Processing metadata
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "combined_results",
  }
);

// Compound unique index to prevent duplicate entries
combinedResultSchema.index(
  { internalExamSetupId: 1, registrationNumber: 1, subjectId: 1 },
  { unique: true }
);

// Indexes for better query performance
combinedResultSchema.index({ studentId: 1, subjectId: 1 });
combinedResultSchema.index({ registrationNumber: 1, status: 1 });
combinedResultSchema.index({ isPass: 1, status: 1 });
combinedResultSchema.index({ processedAt: -1 });

// Pre-save hook to update updatedAt
combinedResultSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.CombinedResult) {
  delete mongoose.models.CombinedResult;
}

module.exports = mongoose.model("CombinedResult", combinedResultSchema);

