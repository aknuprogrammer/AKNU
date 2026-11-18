const mongoose = require("mongoose");

const letterSchema = new mongoose.Schema({
  logo: { type: String, required: true }, // Base64 image
  title: { type: String, required: true },
  description: { type: String },
  email: { type: String },
  phone: { type: String },
  faithfulText: { type: String },
  closingText: { type: String },
  footerText: { type: String },
  greetings: { type: String },
  hrText: { type: String },
  layout: { type: String },
  letterContent: { type: String }, // Flattened or joined content
  letterText: { type: String },
  refNo: { type: String, required: true, unique: true },
  pageSize: { type: String, default: "A4" },
  department: { type: String },
  templateId: { type: String },
  subject: { type: String },
  signatureName: { type: String },
  margins: { type: mongoose.Schema.Types.Mixed }, // Page specific margins
  letterCode: { type: String }, // Added for role identification
  thumbnail: { type: String }, // Base64 thumbnail for fast preview
  status: { type: String, default: "active" }, // active | disabled

}, { timestamps: true });

module.exports = mongoose.model("CreatedLetter", letterSchema);
