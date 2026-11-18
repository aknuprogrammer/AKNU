const mongoose = require("mongoose");

const examTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true,
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
examTypeSchema.index({ status: 1 });

// Update timestamp before saving
examTypeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.ExamType) {
  delete mongoose.models.ExamType;
}

const ExamType = mongoose.model("ExamType", examTypeSchema);

module.exports = ExamType;

