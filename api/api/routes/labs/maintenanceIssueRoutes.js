const express = require("express");
const {
  getMaintenanceIssues,
  getMaintenanceIssueById,
  createMaintenanceIssue,
  updateMaintenanceIssue,
  deleteMaintenanceIssue,
} = require("../../controllers/labs/maintenanceIssueController");
const router = express.Router();

router.get("/", getMaintenanceIssues);
router.post("/", createMaintenanceIssue);
router.get("/:id", getMaintenanceIssueById);
router.put("/:id", updateMaintenanceIssue);
router.delete("/:id", deleteMaintenanceIssue);

module.exports = router;
