const express = require("express");
const router = express.Router();
const hiringController = require("../../controllers/hiring/hiringController");
const authentication = require("../../middlewares/authentication");
const authorization = require("../../middlewares/authorization");

// Public routes (if any)
router.get("/", hiringController.getNotifications);

// IMPORTANT: This must come BEFORE /:id route
// Get hiring notification by Model_Jobs ID
router.get("/by-job/:jobId", async (req, res) => {
  try {
    const HiringNotification = require("../../models/hiring/HiringNotification");
    const notification = await HiringNotification.findOne({ publishedJobId: req.params.jobId })
      .populate("departmentId", "title shortCode");
    
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:id", hiringController.getNotificationById);

// Admin routes
router.post(
  "/",
  authentication,
  authorization("super_admin", "admin"),
  hiringController.createNotification
);
router.put(
  "/:id",
  authentication,
  authorization("super_admin", "admin"),
  hiringController.updateNotification
);
router.delete(
  "/:id",
  authentication,
  authorization("super_admin", "admin"),
  hiringController.deleteNotification
);

module.exports = router;
