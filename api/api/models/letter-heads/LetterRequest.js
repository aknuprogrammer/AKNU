// import mongoose from "mongoose";
const mongoose = require("mongoose");

const letterRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    uploadedBy: { type: String, requried: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "departments" },
    campus: { type: String },
    systemIp: { type: String, required: true },
    date: { type: Date, default: Date.now },
    facultyId: { type: String, required: true },
    // department: { type: mongoose.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    authorization: { type: Boolean, required: true },
    //   accessType: { type: String, enum: ["location", "user"], required: true },

    // New Fields
    flag: { type: Boolean, default: false }, // For marking special requests
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    letterIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Letter" }],
    /** letter = generated document (Letter.type "created"); template = blank institutional file */
    requestKind: {
      type: String,
      enum: ["letter", "template"],
      default: "template",
    },
    refNo: { type: String },
    email: { type: String, required: true },
    requestId: {
      type: String,
    },
    isUsed: { type: Boolean, default: false }, // For one-time download enforcement
  },
  { timestamps: true }
);

const LetterRequest = mongoose.model("LetterRequest", letterRequestSchema);
// export default LetterRequest;
module.exports = LetterRequest;
