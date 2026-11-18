const mongoose = require("mongoose");

const eventCommunicationSchema = new mongoose.Schema(
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
    targetType: {
      type: String,
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
    eventDate: {
      type: Date,
      required: true,
    },
    eventTime: {
      type: String,
    },
    venue: {
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
  "EventCommunication",
  eventCommunicationSchema
);
