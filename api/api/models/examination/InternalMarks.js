const mongoose = require("mongoose");

const internalMarksSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },

    // Course-Stream-Semester mapping reference
    courseStreamMappingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseStreamMapping",
      required: true,
      index: true,
    },

    // Subject reference
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    // Exam type (Mids or Labs)
    examType: {
      type: String,
      required: true,
      trim: true,
    },

    // Marks based on exam type
    // For Mids (30 marks total)
    test1: {
      type: Number,
      default: 0,
      min: 0,
    },
    test2: {
      type: Number,
      default: 0,
      min: 0,
    },
    bestTest: {
      type: Number,
      default: 0,
      min: 0,
    },
    assignment: {
      type: Number,
      default: 0,
      min: 0,
    },
    attendance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // For Labs (50 marks total)
    record: {
      type: Number,
      default: 0,
      min: 0,
    },
    performance: {
      type: Number,
      default: 0,
      min: 0,
    },
    internalTest: {
      type: Number,
      default: 0,
      min: 0,
    },
    viva: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total marks
    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    // Absent flag
    isAbsent: {
      type: Boolean,
      default: false,
    },

    // Status
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Finalized"],
      default: "Draft",
    },

    // Additional metadata
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    enteredAt: {
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
    collection: "internal_marks",
  }
);

// Compound unique index to prevent duplicate entries
internalMarksSchema.index(
  { internalExamSetupId: 1, studentId: 1 },
  { unique: true }
);

// Indexes for better query performance
internalMarksSchema.index({ studentId: 1, subjectId: 1 });
internalMarksSchema.index({ courseStreamMappingId: 1 });
internalMarksSchema.index({ status: 1 });
internalMarksSchema.index({ enteredAt: -1 });

// Pre-save middleware to calculate bestTest and totalMarks
internalMarksSchema.pre("save", function (next) {
  // Calculate bestTest for Mids
  const examTypeLower = (this.examType || "").toString().toLowerCase();
  const isMids = examTypeLower.includes("mid") || examTypeLower.includes("mids") || examTypeLower.includes("midterm");
  const isLabs = examTypeLower === "labs" || examTypeLower.includes("lab");
  
  if (isMids) {
    this.bestTest = Math.max(this.test1 || 0, this.test2 || 0);
    this.totalMarks =
      this.bestTest +
      (this.assignment || 0) +
      (this.attendance || 0);
  } else if (isLabs) {
    // Calculate total for Labs
    this.totalMarks =
      (this.record || 0) +
      (this.performance || 0) +
      (this.internalTest || 0) +
      (this.viva || 0);
  }

  // If absent, set total to 0
  if (this.isAbsent) {
    this.totalMarks = 0;
  }

  next();
});

module.exports = mongoose.model("InternalMarks", internalMarksSchema);

