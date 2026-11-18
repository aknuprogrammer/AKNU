const express = require("express");
const multer = require("multer");
const {
  createEmployeeResignation,
  getEmployeeResignations,
  getEmployeeResignationById,
  updateEmployeeResignation,
  deleteEmployeeResignation,
  getAttachment,
} = require("../../controllers/employee/employeeResignationController");

const router = express.Router();

// Multer setup for file uploads (memory storage) - using .any() to accept all fields
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Middleware wrapper to handle multer errors gracefully
const handleMulterUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err.message);
      console.error("Field:", err.field);
      return res.status(400).json({
        success: false,
        error: "File upload error",
        details: err.message,
        field: err.field,
      });
    }
    next();
  });
};

// Routes - using handleMulterUpload to accept all fields (files and text)
router.post("/", handleMulterUpload, createEmployeeResignation);

router.get("/", getEmployeeResignations);

router.get("/:id", getEmployeeResignationById);

router.put("/:id", handleMulterUpload, updateEmployeeResignation);

router.delete("/:id", deleteEmployeeResignation);

router.get("/:id/attachment/:attachmentId", getAttachment);

module.exports = router;

