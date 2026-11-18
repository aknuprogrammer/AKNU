const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
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
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    leaveType: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "sick",
        "casual",
        "earned",
        "maternity",
        "paternity",
        "compensatory",
        "sabbatical",
        "unpaid",
        "other",
      ],
    },
    leaveDuration: {
      type: String,
      enum: ["half", "fullday"],
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
leaveSchema.index({ employeeId: 1, startDate: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1 });

// Virtual to calculate total days
leaveSchema.virtual("totalDays").get(function () {
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
});

module.exports =
  mongoose.models.Leave || mongoose.model("Leave", leaveSchema, "leaves");

