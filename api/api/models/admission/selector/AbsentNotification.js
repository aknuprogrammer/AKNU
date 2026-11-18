const mongoose = require("mongoose");

const absentNotificationSchema = new mongoose.Schema(
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
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
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
    absentDate: {
      type: Date,
      required: true,
    },
    subject: {
      type: String,
    },
    channels: {
      type: [String],
      enum: ["Email", "SMS", "App"],
      default: ["SMS", "App"],
    },
    status: {
      type: String,
      enum: ["Sent", "Scheduled", "Failed"],
      default: "Sent",
    },
    sentCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AbsentNotification", absentNotificationSchema);
