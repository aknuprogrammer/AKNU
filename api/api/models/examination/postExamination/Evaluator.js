const mongoose = require("mongoose");

const evaluatorSchema = new mongoose.Schema(
  {
    evaluatorId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    subjects: [
      {
        type: String,
        trim: true,
        uppercase: true,
      },
    ],
    maxLoad: {
      type: Number,
      required: true,
      default: 50,
      min: 1,
    },
    currentLoad: {
      type: Number,
      default: 0,
      min: 0,
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
evaluatorSchema.index({ subjects: 1, status: 1 });
evaluatorSchema.index({ evaluatorId: 1, status: 1 });

// Pre-save hook to update updatedAt
evaluatorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Force remove old model definition
if (mongoose.models.Evaluator) {
  delete mongoose.models.Evaluator;
}

module.exports = mongoose.model("Evaluator", evaluatorSchema);

