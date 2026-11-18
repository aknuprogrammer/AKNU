const mongoose = require("mongoose");

const labBookingSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200,
    },
    course: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    internalExamSetupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalExamSetup",
      required: false, // Made optional to support direct lab selection
      index: true,
    },
    // Legacy field - kept for backward compatibility, derived from internalExamSetupId
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      index: true,
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
    bookingDate: {
      type: Date,
      required: true,
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
    purpose: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    approvedBy: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    approvedAt: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
labBookingSchema.index({ internalExamSetupId: 1 });
labBookingSchema.index({ labId: 1, bookingDate: 1 });
labBookingSchema.index({ facultyId: 1 });
labBookingSchema.index({ status: 1 });
labBookingSchema.index({ bookingDate: 1, startTime: 1, endTime: 1 });

// Pre-save hook to update updatedAt
labBookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.LabBooking) {
  delete mongoose.models.LabBooking;
}

module.exports = mongoose.model("LabBooking", labBookingSchema);
