const mongoose = require("mongoose");

const maintenanceIssueSchema = new mongoose.Schema(
  {
    issueTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
      index: true,
    },
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      index: true,
    },
    reportedBy: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    reportedById: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    issueDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    assignedTo: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    assignedToId: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    resolvedAt: {
      type: Date,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    estimatedCost: {
      type: Number,
      min: 0,
    },
    actualCost: {
      type: Number,
      min: 0,
    },
    technicianName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    technicianId: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    technicianContact: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    resolutionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
maintenanceIssueSchema.index({ labId: 1 });
maintenanceIssueSchema.index({ equipmentId: 1 });
maintenanceIssueSchema.index({ status: 1 });
maintenanceIssueSchema.index({ priority: 1 });
maintenanceIssueSchema.index({ reportedById: 1 });

// Pre-save hook to update updatedAt
maintenanceIssueSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.MaintenanceIssue) {
  delete mongoose.models.MaintenanceIssue;
}

module.exports = mongoose.model("MaintenanceIssue", maintenanceIssueSchema);
