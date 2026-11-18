const mongoose = require("mongoose");

const bundleSchema = new mongoose.Schema(
  {
    bundleNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course_data",
      required: false, // Optional for backward compatibility
    },
    streamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: false, // Optional for backward compatibility
    },
    semesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: false, // Optional for backward compatibility
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    centerCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExaminationCenter",
      required: true,
    },
    scriptCount: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    startHallTicketNumber: {
      type: String,
      trim: true,
      default: null,
    },
    endHallTicketNumber: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["Created", "Dispatched", "Received", "AllScriptsRegistered"],
      default: "Created",
      index: true,
    },
    registeredScriptsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    allScriptsRegistered: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    dispatchedAt: {
      type: Date,
      default: null,
    },
    receivedAtSpotCentre: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evaluator",
      index: true,
      default: null,
    },
    scripts: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Note: barcode already has index: true in field definition
bundleSchema.index({ subjectCode: 1, status: 1 });
bundleSchema.index({ centerCode: 1, status: 1 });
bundleSchema.index({ courseId: 1, streamId: 1, semesterId: 1 }); // For filtering by course/stream/semester

// Pre-save hook to update updatedAt
bundleSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.Bundle) {
  delete mongoose.models.Bundle;
}

module.exports = mongoose.model("Bundle", bundleSchema);
