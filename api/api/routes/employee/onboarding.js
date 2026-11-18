const express = require("express");
const multer = require("multer");
const {
  createOnboarding,
  getOnboardingRecords,
  getOnboardingById,
  updateOnboarding,
  deleteOnboarding,
  getDocument,
  getDocumentsList,
} = require("../../controllers/employee/onboardingController");

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
router.post("/", handleMulterUpload, createOnboarding);

router.get("/", getOnboardingRecords);
router.get("/:id", getOnboardingById);
router.put("/:id", handleMulterUpload, updateOnboarding);
router.delete("/:id", deleteOnboarding);
router.get("/:id/document/:docType", getDocument);
router.get("/:id/documents", getDocumentsList); // Get all documents metadata

module.exports = router;
