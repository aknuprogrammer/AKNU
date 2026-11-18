// import mongoose from "mongoose";
const mongoose = require("mongoose");
const letterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    dateFiled: { type: Date, required: true },
    letterCode: { type: String, required: true },
    type: { type: String, default: "uploaded" }, // "uploaded" or "created"
    
    // Design metadata for "created" templates
    logo: { type: String }, // Base64 or URL
    description: { type: String },
    email: { type: String },
    phone: { type: String },
    footerText: { type: String },
    layout: { type: String }, // "1", "2", "3"
    faithfulText: { type: String },
    hrText: { type: String },
    greetings: { type: String },
    thumbnail: { type: String }, // Base64 preview for fast rendering
    department: { type: String }, // Source department origin point
    refNo: { type: String }, // System reference tag
    systemIp: { type: String }, // Track from which system it is created/uploaded
    pageSize: { type: String, default: "A4" },
    margins: { type: mongoose.Schema.Types.Mixed }, // Stores individual page margins
    
    file: {
      data: Buffer,
      contentType: String,
      originalName: String,
    },
    status: { type: String, default: "active" }, // "active" or "disabled"
  },
  { timestamps: true }
);

const Letter = mongoose.model("Letter", letterSchema);
// export default Letter;
module.exports = Letter;
