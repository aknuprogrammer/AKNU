const mongoose = require("mongoose");

const equipmentCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
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
equipmentCategorySchema.index({ code: 1 });
equipmentCategorySchema.index({ status: 1 });

// Pre-save hook to update updatedAt
equipmentCategorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.EquipmentCategory) {
  delete mongoose.models.EquipmentCategory;
}

module.exports = mongoose.model("EquipmentCategory", equipmentCategorySchema);
