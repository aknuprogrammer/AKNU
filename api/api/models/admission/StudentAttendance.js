const mongoose = require("mongoose");

const studentAttendanceSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course_data",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
    },
    // storing semesterId is safer than just number/string if we have mappings
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject", 
      // If Subject model doesn't exist or we use simple string, we might need adjustments.
      // Based on ExamAttendance it seemed to use Subject model. 
      // User said "subject" in filters. Assuming we have subject ID.
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // The student model is registered as "Student"
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "OnDuty"],
      default: "Present",
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    markedBy: {
      type: String, // Employee ID or User ID
    }
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance for same student, subject, date
studentAttendanceSchema.index({ studentId: 1, subjectId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StudentAttendance", studentAttendanceSchema);
