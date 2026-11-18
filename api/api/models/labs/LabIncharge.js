const mongoose = require("mongoose");

const labInchargeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      trim: true,
      maxlength: 50,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      index: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
      match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, "Please enter a valid phone number"],
    },
    department: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    designation: {
      type: String,
      trim: true,
      maxlength: 200,
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
labInchargeSchema.index({ employeeId: 1 });
labInchargeSchema.index({ email: 1 });
labInchargeSchema.index({ status: 1 });
labInchargeSchema.index({ name: 1 });

// Pre-save hook to update updatedAt
labInchargeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.LabIncharge) {
  delete mongoose.models.LabIncharge;
}

module.exports = mongoose.model("LabIncharge", labInchargeSchema);

