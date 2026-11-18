const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    equipmentName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EquipmentCategory",
      required: true,
      index: true,
    },
    serialNumber: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    assetId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 100,
      index: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    vendor: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    warranty: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    condition: {
      type: String,
      enum: ["working", "faulty", "maintenance", "disposed"],
      default: "working",
      index: true,
    },
    assignedLab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      index: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
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
equipmentSchema.index({ category: 1 });
equipmentSchema.index({ assignedLab: 1 });
equipmentSchema.index({ condition: 1 });
equipmentSchema.index({ status: 1 });

// Pre-save hook to update updatedAt
equipmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.Equipment) {
  delete mongoose.models.Equipment;
}

module.exports = mongoose.model("Equipment", equipmentSchema);
