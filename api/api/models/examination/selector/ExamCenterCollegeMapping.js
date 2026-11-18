const mongoose = require("mongoose");

const examCenterCollegeMappingSchema = new mongoose.Schema(
  {
    examCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExaminationCenter",
      required: true,
    },
    examCenterName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    examCenterCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    collegeName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    collegeCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    fromRoll: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      validate: {
        validator: function (v) {
          // Allow alphanumeric values (letters and numbers only)
          if (!v) return true; // Required validation will handle empty values
          return /^[A-Za-z0-9]+$/.test(v);
        },
        message: "From Roll Number must contain only letters and numbers (alphanumeric)",
      },
    },
    toRoll: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      validate: {
        validator: function (v) {
          // Allow alphanumeric values (letters and numbers only)
          if (!v) return true; // Required validation will handle empty values
          return /^[A-Za-z0-9]+$/.test(v);
        },
        message: "To Roll Number must contain only letters and numbers (alphanumeric)",
      },
    },
    roomName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    roomCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    invigilatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invigilator",
      default: null,
      // Transform empty strings to null before validation
      set: function (v) {
        // Convert empty strings to null
        if (v === "" || (typeof v === "string" && v.trim() === "")) {
          return null;
        }
        return v;
      },
    },
    invigilatorName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    invigilatorCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate mappings
examCenterCollegeMappingSchema.index(
  { examCenterId: 1, collegeId: 1 },
  { unique: true }
);

// Individual indexes for faster queries
examCenterCollegeMappingSchema.index({ examCenterId: 1 });
examCenterCollegeMappingSchema.index({ collegeId: 1 });
examCenterCollegeMappingSchema.index({ invigilatorId: 1 });
examCenterCollegeMappingSchema.index({ status: 1 });
examCenterCollegeMappingSchema.index({ fromRoll: 1, toRoll: 1 });

// Compound index for roll range queries
examCenterCollegeMappingSchema.index({
  examCenterId: 1,
  collegeId: 1,
  fromRoll: 1,
  toRoll: 1,
});

// Pre-save hook to validate roll number range and update updatedAt
examCenterCollegeMappingSchema.pre("save", function (next) {
  // Validate that fromRoll is less than toRoll (using string comparison for alphanumeric)
  if (this.fromRoll && this.toRoll) {
    const fromRollTrimmed = String(this.fromRoll).trim();
    const toRollTrimmed = String(this.toRoll).trim();
    
    // Use localeCompare for alphanumeric string comparison
    if (fromRollTrimmed.localeCompare(toRollTrimmed) >= 0) {
      return next(
        new Error("From Roll Number must be less than To Roll Number")
      );
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.ExamCenterCollegeMapping) {
  delete mongoose.models.ExamCenterCollegeMapping;
}

module.exports = mongoose.model(
  "ExamCenterCollegeMapping",
  examCenterCollegeMappingSchema
);

