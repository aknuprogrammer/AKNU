const mongoose = require("mongoose");

const evaluatorAllocationSchema = new mongoose.Schema(
  {
    evaluatorId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    evaluatorName: {
      type: String,
      required: true,
      trim: true,
    },
    evaluatorCollege: {
      type: String,
      required: true,
      trim: true,
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    bundleBarcode: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    bundleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bundle",
      index: true,
    },
    allocatedScripts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    evaluatedScripts: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    scriptIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Script",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
      index: true,
    },
    allocatedAt: {
      type: Date,
      default: Date.now,
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
evaluatorAllocationSchema.index({ evaluatorId: 1, status: 1 });
evaluatorAllocationSchema.index({ subjectCode: 1, status: 1 });
evaluatorAllocationSchema.index({ evaluatorId: 1, subjectCode: 1 });

// Pre-save hook to update updatedAt
evaluatorAllocationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.EvaluatorAllocation) {
  delete mongoose.models.EvaluatorAllocation;
}

module.exports = mongoose.model("EvaluatorAllocation", evaluatorAllocationSchema);

