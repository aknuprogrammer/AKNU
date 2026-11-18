const express = require("express");
const router = express.Router();
const CDCComplaint = require("../models/cdcComplaint");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/cdc-complaint
router.post("/", upload.array("supportingFiles"), async (req, res) => {
  try {
    const {
      complainantName,
      affiliatedCollegeName,
      collegeName,
      address,
      mobileNumber,
      emailId,
      otherNature,
      incidentDate,
      description,
      reportedToAuthority,
      authorityDetails,
    } = req.body;

    const natureOfComplaint = req.body.natureOfComplaint || req.body["natureOfComplaint[]"];
    const natureOfComplaintArray = Array.isArray(natureOfComplaint)
      ? natureOfComplaint
      : natureOfComplaint ? [natureOfComplaint] : [];

    const supportingDocuments = req.body.supportingDocuments || req.body["supportingDocuments[]"];
    const supportingDocumentsArray = Array.isArray(supportingDocuments)
      ? supportingDocuments
      : supportingDocuments ? [supportingDocuments] : [];

    // Handle uploaded files
    const files = req.files ? req.files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    })) : [];

    const newEntry = new CDCComplaint({
      complainantName,
      affiliatedCollegeName,
      collegeName,
      address,
      mobileNumber,
      emailId,
      natureOfComplaint: natureOfComplaintArray,
      otherNature,
      incidentDate,
      description,
      reportedToAuthority,
      authorityDetails,
      supportingDocuments: supportingDocumentsArray,
      files,
    });

    await newEntry.save();

    res.status(201).json({ success: true, message: "CDC Complaint submitted successfully." });
  } catch (error) {
    console.error("Error saving CDC Complaint form:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// GET /api/cdc-complaint
router.get("/complaints", async (req, res) => {
  try {
    const entries = await CDCComplaint.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    console.error("Error fetching CDC Complaints:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
