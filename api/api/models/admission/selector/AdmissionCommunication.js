const mongoose = require("mongoose");

const admissionCommunicationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "commencement",
        "branch_specific",
        "fee_pending",
        "exam_timetable",
        "event_update",
        "absent_notification",
        "start_date_notification", // Compatibility
        "branch_based_communication", // Compatibility
      ],
      required: true,
    },
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
      required: function () {
        return ["branch_specific", "exam_timetable", "event_update"].includes(
          this.type
        );
      },
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
    },
    targetType: {
      type: String,
      // enum: ["All Students", "Branch-wise", "Parents", "Student only", "Parent only", "Both"],
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
    // Commencement fields
    startDate: {
      type: Date,
    },
    timings: {
      type: String,
    },
    // Fee fields
    feeAmount: {
      type: Number,
    },
    dueDate: {
      type: Date,
    },
    paymentLink: {
      type: String,
    },
    // Exam fields
    examStartDate: {
      type: Date,
    },
    timetableUrl: {
      type: String,
    },
    // Event fields
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification", // Assuming 'Notification' model is used for events
    },
    // Attendance fields
    absentDate: {
      type: Date,
    },
    channels: {
      type: [String],
      enum: ["Email", "SMS", "App"],
      default: ["App"],
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
  "AdmissionCommunication",
  admissionCommunicationSchema
);
