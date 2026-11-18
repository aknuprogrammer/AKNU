const express = require("express");
const multer = require("multer");
const {
  createEmployeeRegistration,
  getEmployeeRegistrations,
  getEmployeeRegistrationById,
  updateEmployeeRegistration,
  deleteEmployeeRegistration,
  getDocument,
} = require("../../controllers/employee/employeeRegistrationController");

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
router.post("/", handleMulterUpload, createEmployeeRegistration);

router.get("/", getEmployeeRegistrations);

router.get("/:id", getEmployeeRegistrationById);

router.put("/:id", handleMulterUpload, updateEmployeeRegistration);

router.delete("/:id", deleteEmployeeRegistration);

router.get("/:id/document/:docType", getDocument);

module.exports = router;
