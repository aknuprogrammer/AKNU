const express = require("express");
const router = express.Router();
const applicationController = require("../../controllers/hiring/applicationController");
const authentication = require("../../middlewares/authentication");
const authorization = require("../../middlewares/authorization");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Public route for submitting applications
router.post("/", upload.single("resume"), applicationController.submitApplication);

// Admin routes for viewing and managing applications
router.get(
  "/",
  authentication,
  authorization("super_admin", "admin"),
  applicationController.getApplications
);
router.get(
  "/:id",
  authentication,
  authorization("super_admin", "admin"),
  applicationController.getApplicationById
);
router.put(
  "/:id/status",
  authentication,
  authorization("super_admin", "admin"),
  applicationController.updateApplicationStatus
);
router.get(
  "/:id/resume",
  authentication,
  authorization("super_admin", "admin"),
  applicationController.getResume
);

module.exports = router;
