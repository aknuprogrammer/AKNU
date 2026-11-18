const express = require("express");
const router = express.Router();
const {
  getMalpracticeReports,
  getMalpracticeReportById,
  createMalpracticeReport,
  updateMalpracticeReport,
  deleteMalpracticeReport,
} = require("../../controllers/examination/malpracticeReportController");
const authenticationMiddleware = require("../../middlewares/authentication");

// All routes require authentication
router.use(authenticationMiddleware);

// Get all malpractice reports
router.get("/", getMalpracticeReports);

// Get malpractice report by ID
router.get("/:id", getMalpracticeReportById);

// Create malpractice report
router.post("/", createMalpracticeReport);

// Update malpractice report
router.put("/:id", updateMalpracticeReport);

// Delete malpractice report
router.delete("/:id", deleteMalpracticeReport);

module.exports = router;

