const express = require("express");
const {
  getAbsentNotifications,
  createAbsentNotification,
  getAbsentNotificationById,
  deleteAbsentNotification,
} = require("../../../controllers/admission/selector/absentNotificationController");

const router = express.Router();

router.get("/", getAbsentNotifications);
router.post("/", createAbsentNotification);
router.get("/:id", getAbsentNotificationById);
router.delete("/:id", deleteAbsentNotification);

module.exports = router;
