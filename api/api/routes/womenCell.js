const express = require("express");
const router = express.Router();
const WomenCell = require("../models/womenCell");
const multer = require("multer");

// Configure multer (you can change to cloud storage like Cloudinary if needed)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/women-cell
router.post("/", upload.array("supportingFiles"), async (req, res) => {
  try {
    const {
      name,
      department,
      rollNo,
      phone,
      email,
      address,
      otherComplaint,
      incidentDate,
      incidentTime,
      incidentPlace,
      involvedPerson,
      involvedDesignation,
      witnessName,
      witnessContact,
      resolution,
      otherResolution,
    } = req.body;

    const complaintTypes = req.body.complaintTypes || req.body["complaintTypes[]"];
    const complaintTypesArray = Array.isArray(complaintTypes)
      ? complaintTypes
      : complaintTypes ? [complaintTypes] : [];

    // Handle uploaded files
    const files = req.files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      buffer: file.buffer, // Optional: Upload to S3/Cloudinary instead of saving buffer directly
    }));

    const newEntry = new WomenCell({
      name,
      department,
      rollNo,
      phone,
      email,
      address,
      complaintTypes: complaintTypesArray,
      otherComplaint,
      incidentDate,
      incidentTime,
      incidentPlace,
      involvedPerson,
      involvedDesignation,
      witnessName,
      witnessContact,
      resolution,
      otherResolution,
      files, // Store file metadata or URLs if uploading to cloud
    });

    await newEntry.save();

    res.status(201).json({ success: true, message: "Complaint submitted successfully." });
  } catch (error) {
    console.error("Error saving Women Cell form:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// GET /api/women-cell
router.get("/complaints", async (req, res) => {
  console.log("______jhgfdcv")
  try {
    const entries = await WomenCell.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    console.error("Error fetching Women Cell forms:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
