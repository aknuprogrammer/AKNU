// controllers/correctionController.js
const CorrectionRequest = require("../models/CorrectionRequest");
const Student = require("../models/Student");

// Create a new correction request
exports.createCorrection = async (req, res) => {
  try {
    const { studentId, hallTicketNo, counsellorName, reason } = req.body;

    if (!studentId || !hallTicketNo || !counsellorName || !reason) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Optionally, check if student exists
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const correction = await CorrectionRequest.create({
      studentId,
      hallTicketNo,
      counsellorName,
      reason,
    });

    res.status(201).json({ message: "Correction request created", correction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all correction requests
exports.getCorrections = async (req, res) => {
  try {
    const corrections = await CorrectionRequest.find().populate("studentId", "firstName lastName hallTicketNo");
    res.json(corrections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update correction status (resolved/rejected)
exports.updateCorrectionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "resolved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const correction = await CorrectionRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!correction) return res.status(404).json({ error: "Correction not found" });

    res.json({ message: "Status updated", correction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
