const mongoose = require("mongoose");

const maintenanceLogSchema = new mongoose.Schema(
  {
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
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaintenanceIssue",
      index: true,
    },
    maintenanceType: {
      type: String,
      enum: ["Preventive", "Corrective", "Routine", "Emergency"],
      required: true,
    },
    maintenanceDate: {
      type: Date,
      required: true,
      index: true,
    },
    performedBy: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    performedById: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    actionsTaken: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    partsReplaced: [
      {
        partName: String,
        quantity: Number,
        cost: Number,
      },
    ],
    cost: {
      type: Number,
      min: 0,
      default: 0,
    },
    nextMaintenanceDate: {
      type: Date,
    },
    resolutionDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Cancelled"],
      default: "Completed",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
maintenanceLogSchema.index({ labId: 1 });
maintenanceLogSchema.index({ equipmentId: 1 });
maintenanceLogSchema.index({ maintenanceDate: 1 });
maintenanceLogSchema.index({ status: 1 });
maintenanceLogSchema.index({ maintenanceType: 1 });

// Pre-save hook to update updatedAt
maintenanceLogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.MaintenanceLog) {
  delete mongoose.models.MaintenanceLog;
}

module.exports = mongoose.model("MaintenanceLog", maintenanceLogSchema);
