const express = require("express");
const router = express.Router();
const {
  getExamAttendance,
  getStudentsForAttendance,
  createExamAttendance,
  bulkCreateExamAttendance,
  updateExamAttendance,
  deleteExamAttendance,
} = require("../../controllers/examination/examAttendanceController");
const authenticationMiddleware = require("../../middlewares/authentication");

// All routes require authentication
router.use(authenticationMiddleware);

// Get all attendance records
router.get("/", getExamAttendance);

// Get students who appeared for exam
router.get("/students", getStudentsForAttendance);

// Create attendance record
router.post("/", createExamAttendance);

// Bulk create attendance records
router.post("/bulk", bulkCreateExamAttendance);

// Update attendance record
router.put("/:id", updateExamAttendance);

// Delete attendance record
router.delete("/:id", deleteExamAttendance);

module.exports = router;

