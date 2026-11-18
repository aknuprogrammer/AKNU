const mongoose = require("mongoose");

const cdcComplaintSchema = new mongoose.Schema(
  {
    complainantName: { type: String, required: true },
    affiliatedCollegeName: { type: String, required: true },
    collegeName: { type: String, required: true },
    address: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    emailId: { type: String, required: true },

    natureOfComplaint: [String],
    otherNature: { type: String },

    incidentDate: { type: String, required: true },
    description: { type: String, required: true },

    reportedToAuthority: { type: String, required: true },
    authorityDetails: { type: String },

    supportingDocuments: [String],

    files: [
      {
        originalName: String,
        mimeType: String,
        size: Number,
        buffer: Buffer,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CDCComplaint", cdcComplaintSchema);
