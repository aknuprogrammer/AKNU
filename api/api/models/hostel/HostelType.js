const mongoose = require("mongoose");

const hostelTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 20,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
hostelTypeSchema.index({ code: 1 });
hostelTypeSchema.index({ status: 1 });
hostelTypeSchema.index({ code: 1, status: 1 }); // Compound index

// Pre-save hook
hostelTypeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.HostelType) {
  delete mongoose.models.HostelType;
}

module.exports = mongoose.model("HostelType", hostelTypeSchema);

