// import PdfUpload from "../../models/results/PdfUpload.js";
const PdfUpload = require("../../models/results/PdfUpload");

// Upload PDF to MongoDB (binary)
const uploadPdf = async (req, res) => {
  try {
    const { title, date } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const newPdf = new PdfUpload({
      title,
      date,
      file: {
        data: req.file.buffer, // multer gives buffer
        contentType: req.file.mimetype,
      },
    });

    await newPdf.save();
    res
      .status(201)
      .json({ message: "PDF uploaded successfully", pdfId: newPdf._id });
  } catch (error) {
    res.status(500).json({ message: "Error uploading PDF", error });
  }
};

// Get all PDFs (metadata only)
const getPdfs = async (req, res) => {
  try {
    // const pdfs = await PdfUpload.find().select("title date createdAt");
    const pdfs = await PdfUpload.find();
    console.log("36____pdfs", pdfs);
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching PDFs", error });
  }
};

// View PDF in browser by ID
const viewPdf = async (req, res) => {
  try {
    const pdf = await PdfUpload.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.set({
      "Content-Type": pdf.file.contentType,
      "Content-Disposition": `inline; filename="${pdf.title}.pdf"`, // inline lets browser open it
    });

    res.send(pdf.file.data);
  } catch (error) {
    res.status(500).json({ message: "Error viewing PDF", error });
  }
};

// Download PDF by ID
const downloadPdf = async (req, res) => {
  try {
    const pdf = await PdfUpload.findById(req.params.id);

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.set("Content-Type", pdf.file.contentType);
    res.send(pdf.file.data);
  } catch (error) {
    res.status(500).json({ message: "Error downloading PDF", error });
  }
};

// Delete PDF
const deletePdf = async (req, res) => {
  try {
    const pdf = await PdfUpload.findByIdAndDelete(req.params.id);

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.json({ message: "PDF deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting PDF", error });
  }
};
module.exports = { deletePdf, downloadPdf, viewPdf, getPdfs, uploadPdf };
