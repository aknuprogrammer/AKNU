const mongoose = require("mongoose");

const examTimetableCommunicationSchema = new mongoose.Schema(
  {
    campusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: false,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course_data",
      required: false,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: false,
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: false,
    },
    semesterNumber: {
      type: Number,
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    examStartDate: {
      type: Date,
      required: true,
    },
    timetableUrl: {
      type: String,
    },
    // File Storage Fields
    fileData: {
      type: Buffer, // Store file directly
      select: false, // Don't return by default to keep responses light
    },
    contentType: {
      type: String,
    },
    originalName: {
      type: String,
    },
    channels: {
      type: [String],
      enum: ["Email", "SMS", "App"],
      default: ["App", "Email"],
    },
    status: {
      type: String,
      enum: ["Sent", "Scheduled", "Failed"],
      default: "Sent",
    },
    sentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ExamTimetableCommunication",
  examTimetableCommunicationSchema
);
