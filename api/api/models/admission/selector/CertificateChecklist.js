const mongoose = require("mongoose");

const certificateChecklistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    required: {
      type: Boolean,
      required: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    check: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CertificateChecklist", certificateChecklistSchema);
