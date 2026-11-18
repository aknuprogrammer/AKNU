const express = require("express");
const {
  getLabUsageReport,
  getEquipmentReport,
  getMaintenanceReport,
} = require("../../controllers/labs/labReportsController");
const router = express.Router();

router.get("/usage", getLabUsageReport);
router.get("/equipment", getEquipmentReport);
router.get("/maintenance", getMaintenanceReport);

module.exports = router;

