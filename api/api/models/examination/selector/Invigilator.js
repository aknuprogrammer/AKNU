const mongoose = require("mongoose");

const invigilatorSchema = new mongoose.Schema(
  {
    invigilatorCode: {
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
      maxlength: 100,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    collegeName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    collegeCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    role: {
      type: String,
      required: true,
      enum: ["Coordinator", "Invigilator", "Squad"],
      trim: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
invigilatorSchema.index({ collegeId: 1 });
invigilatorSchema.index({ status: 1 });
invigilatorSchema.index({ role: 1 });

// Compound index for common queries
invigilatorSchema.index({ collegeId: 1, status: 1 });
invigilatorSchema.index({ role: 1, status: 1 });

// Pre-save hook to update updatedAt
invigilatorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.Invigilator) {
  delete mongoose.models.Invigilator;
}

module.exports = mongoose.model("Invigilator", invigilatorSchema);

