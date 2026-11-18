// models/CorrectionRequest.js
const mongoose = require("mongoose");

const correctionRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  hallTicketNo: {
    type: String,
    required: true,
  },
  counsellorName: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "resolved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CorrectionRequest", correctionRequestSchema);
