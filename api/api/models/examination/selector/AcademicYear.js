const mongoose = require("mongoose");

const academicYearSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  }, // Batch Code (e.g., "2024-25")
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    maxlength: 250,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
academicYearSchema.index({ status: 1 });
academicYearSchema.index({ startDate: 1, endDate: 1 });

// Update timestamp before saving
academicYearSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Validation: endDate should be after startDate
academicYearSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error("End date must be after start date"));
  }
  next();
});

// Force remove old model definition
if (mongoose.models.AcademicYear) {
  delete mongoose.models.AcademicYear;
}

const AcademicYear = mongoose.model("AcademicYear", academicYearSchema);

module.exports = AcademicYear;

