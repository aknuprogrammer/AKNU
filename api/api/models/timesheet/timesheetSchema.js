const mongoose = require("mongoose");

const timesheetSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    inTime: {
      type: String,
      required: true,
    },
    outTime: {
      type: String,
      required: false,
    },
    breakMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "submitted",
        "completed",
        "in_progress",
        "not_started",
      ],
      default: "pending",
    },
    subject: {
      type: String,
      trim: true,
    },
    chapter: {
      type: String,
      trim: true,
    },
    task: {
      type: String,
      trim: true,
    },
    hours: {
      type: Number,
      default: 0,
      min: 0,
    },
    // active: {
    //   type: Boolean,
    //   default: true,
    // },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
// Compound index for employeeId and date (covers both single field queries)
timesheetSchema.index({ employeeId: 1, date: 1 });
timesheetSchema.index({ date: 1 });
timesheetSchema.index({ status: 1 });
// Additional compound index for common queries
timesheetSchema.index({ status: 1, date: 1 });

module.exports =
  mongoose.models.Timesheet ||
  mongoose.model("Timesheet", timesheetSchema, "timesheets");
