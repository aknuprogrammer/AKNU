const express = require("express");
const {
  getMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
  resolveIssue,
  rejectIssue,
} = require("../../controllers/labs/maintenanceLogController");
const router = express.Router();

router.get("/", getMaintenanceLogs);
router.post("/", createMaintenanceLog);
router.get("/:id", getMaintenanceLogById);
router.put("/:id", updateMaintenanceLog);
router.put("/:id/resolve-issue", resolveIssue);
router.put("/:id/reject-issue", rejectIssue);
router.delete("/:id", deleteMaintenanceLog);

module.exports = router;
