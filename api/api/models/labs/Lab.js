const mongoose = require("mongoose");

const labSchema = new mongoose.Schema(
  {
    labName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    labTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabType",
      required: true,
      index: true,
    },
    building: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    equipmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    inCharge: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    contact: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
labSchema.index({ labTypeId: 1 });
labSchema.index({ building: 1 });
labSchema.index({ status: 1 });
labSchema.index({ labName: 1, building: 1 }); // Compound index for search

// Pre-save hook to update updatedAt
labSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.Lab) {
  delete mongoose.models.Lab;
}

module.exports = mongoose.model("Lab", labSchema);
