const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    file: {
      data: Buffer,
      contentType: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Pdf || mongoose.model("PdfResultUploads", pdfSchema);
