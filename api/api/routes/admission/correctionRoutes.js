// routes/correctionRoutes.js
const express = require("express");
const router = express.Router();
const correctionController = require("../controllers/correctionController");

// Create a new correction request
router.post("/", correctionController.createCorrection);

// Get all correction requests
router.get("/", correctionController.getCorrections);

// Update correction status
router.put("/:id/status", correctionController.updateCorrectionStatus);

module.exports = router;
 