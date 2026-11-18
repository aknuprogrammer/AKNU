const mongoose = require("mongoose");

const apscheAllotmentSchema = new mongoose.Schema(
  {
    hallTicket: {
      type: String,
      required: true,
      trim: true,
    },
    rank: { type: String, trim: true, default: "" },
    applicantName: { type: String, trim: true, default: "" },
    gender: { type: String, trim: true, default: "" },
    caste: { type: String, trim: true, default: "" },
    region: { type: String, trim: true, default: "" },
    allotedCategory: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    date: { type: String, trim: true, default: "" },
  },
  { _id: false },
  { timestamps: true }
);

module.exports =
  mongoose.models.ApscheAllotment ||
  mongoose.model("ApscheAllotment", apscheAllotmentSchema);
