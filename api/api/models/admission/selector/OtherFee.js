const mongoose = require("mongoose");

const subFeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
});

const otherFeeSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },

    feeCategory: { type: String, required: true }, // Tuition, Special, Exam, Admission
    courseType: { type: String }, // Arts, MBA, Science (optional for Tuition)
    subCategory: { type: String }, // e.g., Lab Fee, Placement Fee (optional)
    subFees: [subFeeSchema], // for tuition sub-fees
    amount: { type: Number, required: true },
    frequency: { type: String, default: "One-time" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OtherFee", otherFeeSchema);
