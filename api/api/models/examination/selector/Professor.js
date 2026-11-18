const mongoose = require("mongoose");

const professorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  professorId: {
    type: String,
    trim: true,
    index: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
  },
  alternateContactNumber: {
    type: String,
    trim: true,
  },
  subjectIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  ],
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  notes: {
    type: String,
    maxlength: 250,
    trim: true,
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
professorSchema.index({ status: 1 });
professorSchema.index({ subjectIds: 1 });

// Update timestamp before saving
professorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Validation: At least one subject is required
professorSchema.pre("save", function (next) {
  if (!this.subjectIds || this.subjectIds.length === 0) {
    return next(new Error("At least one subject is required"));
  }
  next();
});

// Force remove old model definition
if (mongoose.models.Professor) {
  delete mongoose.models.Professor;
}

const Professor = mongoose.model("Professor", professorSchema);

module.exports = Professor;

