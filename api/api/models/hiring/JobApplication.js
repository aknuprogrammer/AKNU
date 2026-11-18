const mongoose = require("mongoose");

const JobApplicationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HiringNotification",
      required: true,
    },
    candidateName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    resume: {
      type: Buffer,
    },
    resumeContentType: {
      type: String,
    },
    resumeName: {
      type: String,
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Received", "Shortlisted", "Interviewed", "Selected", "Rejected"],
      default: "Received",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
JobApplicationSchema.index({ notificationId: 1 });
JobApplicationSchema.index({ email: 1 });
JobApplicationSchema.index({ status: 1 });

module.exports =
  mongoose.models.JobApplication ||
  mongoose.model("JobApplication", JobApplicationSchema, "job_applications");
