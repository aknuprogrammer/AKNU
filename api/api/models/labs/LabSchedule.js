const mongoose = require("mongoose");

const labScheduleSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    course: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    stream: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    semester: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    internalExamSetupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalExamSetup",
      required: true,
      index: true,
    },
    // Legacy field - kept for backward compatibility
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      index: true,
    },
    labName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    facultyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    facultyId: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    // Legacy field - kept for backward compatibility, auto-generated from date
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
      match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
      match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
    },
    duration: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
labScheduleSchema.index({ internalExamSetupId: 1 });
labScheduleSchema.index({ labId: 1, date: 1 });
labScheduleSchema.index({ labId: 1, day: 1 }); // Legacy index
labScheduleSchema.index({ facultyId: 1 });
labScheduleSchema.index({ status: 1 });

// Compound index for conflict detection
labScheduleSchema.index({ labId: 1, date: 1, startTime: 1, endTime: 1 });
labScheduleSchema.index({ labId: 1, day: 1, startTime: 1, endTime: 1 }); // Legacy index

// Pre-save hook to update updatedAt and auto-generate day from date
labScheduleSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  
  // Auto-generate day from date if date is provided and day is not set
  if (this.date && !this.day) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dateObj = new Date(this.date);
    this.day = days[dateObj.getDay()];
  }
  
  next();
});

// Force remove old model definition
if (mongoose.models.LabSchedule) {
  delete mongoose.models.LabSchedule;
}

module.exports = mongoose.model("LabSchedule", labScheduleSchema);
