const express = require("express");
const router = express.Router();
const {
  saveInternalMarks,
  getMarksBySetup,
  getAllInternalMarks,
  getMarksByStudent,
  deleteInternalMarks,
} = require("../../controllers/examination/internalMarksController");

// Save marks for multiple students
router.post("/", saveInternalMarks);

// Get marks by Internal Exam Setup
router.get("/setup/:setupId", getMarksBySetup);

// Get marks by student
router.get("/student/:studentId", getMarksByStudent);

// Get all marks with optional filters
router.get("/", getAllInternalMarks);

// Delete marks
router.delete("/:id", deleteInternalMarks);

module.exports = router;

