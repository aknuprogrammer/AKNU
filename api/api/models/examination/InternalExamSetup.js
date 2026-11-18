const mongoose = require("mongoose");

const internalExamSetupSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course_data",
      required: true,
    },
    streamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    semesterNumber: {
      type: Number,
      required: true,
      min: [1, "Semester number must be at least 1"],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    examType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Marks Configuration
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
    totalInternalMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    // Mids Marks Distribution
    // Configuration Total: test1Max + test2Max + assignmentMax + attendanceMax (e.g., 15+15+5+5=40)
    // Max Achievable: max(test1Max, test2Max) + assignmentMax + attendanceMax (e.g., max(15,15)+5+5=25)
    test1Max: {
      type: Number,
      default: 0,
      min: 0,
    },
    test2Max: {
      type: Number,
      default: 0,
      min: 0,
    },
    assignmentMax: {
      type: Number,
      default: 0,
      min: 0,
    },
    attendanceMax: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Labs Marks Distribution (50 marks total)
    recordMax: {
      type: Number,
      default: 0,
      min: 0,
    },
    performanceMax: {
      type: Number,
      default: 0,
      min: 0,
    },
    internalTestMax: {
      type: Number,
      default: 0,
      min: 0,
    },
    vivaMax: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Final Examination Fields
    externalMarksMax: {
      type: Number,
      default: 0,
      min: 0,
    },
    passMarksExternal: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMarksFinal: {
      type: Number,
      default: 0,
      min: 0,
    },
    passMarksFinal: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Legacy field - kept for backward compatibility
    totalMarksMax: {
      type: Number,
      default: 0,
      min: 0,
    },
    examDate: {
      type: Date,
    },
    duration: {
      type: String,
      trim: true,
      default: "3 hours",
    },
    examinationType: {
      type: String,
      enum: ["Regular", "Supplementary", "Revaluation", "Improvement", "Other"],
      default: "Regular",
    },

    // Additional Fields
    freezeDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: "internal_exam_setups",
  }
);

// Compound index for unique constraint
internalExamSetupSchema.index(
  { courseId: 1, streamId: 1, semesterId: 1, semesterNumber: 1, subjectId: 1, examType: 1 },
  { unique: true }
);

// Indexes for better query performance
internalExamSetupSchema.index({ courseId: 1, streamId: 1 });
internalExamSetupSchema.index({ semesterId: 1, subjectId: 1 });
internalExamSetupSchema.index({ examType: 1 });
internalExamSetupSchema.index({ status: 1 });

// Validation middleware
internalExamSetupSchema.pre("save", function (next) {
  // Validate passMarks <= maxMarks
  if (this.passMarks > this.maxMarks) {
    return next(
      new Error("Pass marks cannot be greater than maximum marks")
    );
  }

  // Determine exam type category - normalize examType for comparison
  const examTypeStr = (this.examType || "").toString().trim();
  const examTypeLower = examTypeStr.toLowerCase();
  
  // Check for Mids exams (must be checked FIRST)
  // Mids exams include: "Mids", "Mid-Term Examination", "Mid Term", "Midterm", etc.
  const isMids = 
    examTypeLower === "mids" || 
    examTypeLower.includes("mid") || 
    examTypeLower.includes("mid-term") || 
    examTypeLower.includes("midterm") ||
    examTypeLower.includes("mid term");
  
  // Check for Final exams
  const isFinal = 
    examTypeLower.includes("final") || 
    examTypeLower.includes("external") || 
    examTypeLower.includes("university");
  
  // Check for Labs exams
  const isLabs = 
    examTypeLower === "labs" || 
    examTypeLower.includes("lab");

  // DEBUG: Log exam type detection (remove after confirming fix)
  console.log("[InternalExamSetup Validation]", {
    examType: this.examType,
    examTypeLower,
    isMids,
    isLabs,
    isFinal,
    maxMarks: this.maxMarks,
    totalInternalMarks: this.totalInternalMarks
  });

  // CRITICAL: For Mids exams, maxMarks and totalInternalMarks are DIFFERENT by design
  // maxMarks = max(test1Max, test2Max) + assignmentMax + attendanceMax (best of tests)
  // totalInternalMarks = test1Max + test2Max + assignmentMax + attendanceMax (all tests)
  // Therefore, we MUST skip the maxMarks === totalInternalMarks validation for Mids
  
  // ONLY validate maxMarks === totalInternalMarks for Labs (NOT for Mids or Final)
  if (isMids) {
    // Skip validation for Mids - maxMarks and totalInternalMarks are intentionally different
    // Do nothing - proceed to next validation
    console.log("[InternalExamSetup] Skipping maxMarks validation for Mids exam");
  } else if (isFinal) {
    // For Final exams, maxMarks should equal totalMarksFinal (internal + external)
    // Final examination: maxMarks = totalMarksFinal (internal + external)
    // Use totalMarksFinal if available, otherwise fall back to totalMarksMax for backward compatibility
    const totalMarks = this.totalMarksFinal > 0 ? this.totalMarksFinal : this.totalMarksMax;
    if (totalMarks > 0 && this.maxMarks !== totalMarks) {
      return next(
        new Error("Maximum marks must equal total marks (Internal + External) for Final Examination")
      );
    }
  } else if (isLabs) {
    // For Labs ONLY: maxMarks should equal totalInternalMarks (all components are counted)
    if (this.maxMarks !== this.totalInternalMarks) {
      return next(
        new Error("Maximum marks must equal total internal marks for Labs")
      );
    }
  }
  // For any other exam type (or if none matched), we skip this check to avoid false positives

  // Validate Mids marks distribution (if examType is Mids)
  if (isMids) {
    const midsTotal =
      this.test1Max +
      this.test2Max +
      this.assignmentMax +
      this.attendanceMax;
    if (midsTotal !== this.totalInternalMarks) {
      return next(
        new Error(
          `Mids marks distribution must equal total internal marks. Expected ${this.totalInternalMarks}, got ${midsTotal}`
        )
      );
    }
  }

  // Validate Labs marks distribution (if examType is Labs or Lab Internal)
  if (
    this.examType === "Labs" ||
    this.examType === "Lab Internal" ||
    this.examType.toLowerCase().includes("lab")
  ) {
    const labsTotal =
      this.recordMax +
      this.performanceMax +
      this.internalTestMax +
      this.vivaMax;
    if (labsTotal !== this.totalInternalMarks) {
      return next(
        new Error(
          `Labs marks distribution must equal total internal marks. Expected ${this.totalInternalMarks}, got ${labsTotal}`
        )
      );
    }
  }

  // Validate Final Examination marks (if examType is Final)
  if (
    this.examType &&
    (this.examType.toLowerCase().includes("final") ||
      this.examType.toLowerCase().includes("external") ||
      this.examType.toLowerCase().includes("university"))
  ) {
    // Validate totalMarksFinal = maxMarks (internal max) + externalMarksMax
    if (this.externalMarksMax > 0 && this.maxMarks > 0) {
      const expectedTotal = this.maxMarks + this.externalMarksMax;
      // Use totalMarksFinal if available, otherwise check totalMarksMax for backward compatibility
      const actualTotal = this.totalMarksFinal > 0 ? this.totalMarksFinal : this.totalMarksMax;
      if (actualTotal > 0 && actualTotal !== expectedTotal) {
        return next(
          new Error(
            `Final examination total marks must equal Internal Max Marks (${this.maxMarks}) + External Max Marks (${this.externalMarksMax}) = ${expectedTotal}, but got ${actualTotal}`
          )
        );
      }
    }
    
    // Auto-calculate totalMarksFinal if not provided but internal max marks and external marks are available
    if (this.totalMarksFinal === 0 && this.externalMarksMax > 0 && this.maxMarks > 0) {
      this.totalMarksFinal = this.maxMarks + this.externalMarksMax;
    }
    
    // Validate passMarksFinal = passMarks (internal) + passMarksExternal (external)
    if (this.passMarksExternal > 0 && this.passMarks > 0) {
      const expectedPassTotal = this.passMarks + this.passMarksExternal;
      if (this.passMarksFinal > 0 && this.passMarksFinal !== expectedPassTotal) {
        return next(
          new Error(
            `Final examination pass marks must equal Internal Pass Marks (${this.passMarks}) + External Pass Marks (${this.passMarksExternal}) = ${expectedPassTotal}, but got ${this.passMarksFinal}`
          )
        );
      }
    }
    
    // Auto-calculate passMarksFinal if not provided but internal and external pass marks are available
    if (this.passMarksFinal === 0 && this.passMarksExternal > 0 && this.passMarks > 0) {
      this.passMarksFinal = this.passMarks + this.passMarksExternal;
    }
  }

  next();
});

// Update timestamp before saving
internalExamSetupSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition to ensure fresh model loading
if (mongoose.models.InternalExamSetup) {
  delete mongoose.models.InternalExamSetup;
  console.log("[InternalExamSetup] Cleared cached model definition");
}

const InternalExamSetup = mongoose.model(
  "InternalExamSetup",
  internalExamSetupSchema
);

module.exports = InternalExamSetup;

