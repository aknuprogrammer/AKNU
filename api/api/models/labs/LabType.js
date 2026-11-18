const mongoose = require("mongoose");

const labTypeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 50,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
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
labTypeSchema.index({ code: 1 });
labTypeSchema.index({ status: 1 });

// Pre-save hook to update updatedAt
labTypeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.LabType) {
  delete mongoose.models.LabType;
}

module.exports = mongoose.model("LabType", labTypeSchema);
