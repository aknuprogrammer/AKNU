const express = require("express");
const multer = require("multer");
const {
  deletePdf,
  downloadPdf,
  getPdfs,
  uploadPdf,
  viewPdf,
} = require("../../controllers/results/PdfUploadController");

const router = express.Router();

// Multer in-memory storage (store PDF as Buffer in DB)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post("/", upload.single("file"), uploadPdf); // Upload PDF
router.get("/", getPdfs); // Get all PDFs
router.get("/file/view/:id", viewPdf);
router.get("/:id", downloadPdf); // Download PDF
router.delete("/:id", deletePdf); // Delete PDF

module.exports = router;
