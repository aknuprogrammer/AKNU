const mongoose = require("mongoose");

const examinationCenterSchema = new mongoose.Schema(
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
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 100000,
    },
    rooms: {
      type: Number,
      default: 0,
      min: 0,
      max: 10000,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{10}$/,
      maxlength: 10,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxlength: 100,
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
examinationCenterSchema.index({ collegeId: 1 });
examinationCenterSchema.index({ status: 1 });

// Pre-save hook to update updatedAt
examinationCenterSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.ExaminationCenter) {
  delete mongoose.models.ExaminationCenter;
}

module.exports = mongoose.model("ExaminationCenter", examinationCenterSchema);

