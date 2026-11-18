const mongoose = require("mongoose");

const womenCellSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    rollNo: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },

    complaintTypes: [String],
    otherComplaint: { type: String },

    incidentDate: { type: String, required: true },
    incidentTime: { type: String, required: true },
    incidentPlace: { type: String, required: true },

    involvedPerson: { type: String },
    involvedDesignation: { type: String },
    witnessName: { type: String },
    witnessContact: { type: String },

    resolution: { type: String },
    otherResolution: { type: String },

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

module.exports = mongoose.model("WomenCell", womenCellSchema);
