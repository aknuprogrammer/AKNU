const express = require("express");
const router = express.Router();
const {
  createTimesheet,
  getTimesheets,
  getTimesheetById,
  getTimesheetsByEmployeeId,
  updateTimesheet,
  deleteTimesheet,
  updateTimesheetStatus,
} = require("../../controllers/timesheet/timesheetController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

// Create new timesheet entry
router.post(
  "/",
  authenticationMiddleware,
  createTimesheet
);

// Get all timesheets (with optional filters)
router.get(
  "/",
  authenticationMiddleware,
  getTimesheets
);

// Get single timesheet by ID
router.get(
  "/:id",
  authenticationMiddleware,
  getTimesheetById
);

// Get timesheets by employeeId
router.get(
  "/employee/:employeeId",
  authenticationMiddleware,
  getTimesheetsByEmployeeId
);

// Update timesheet
router.put(
  "/:id",
  authenticationMiddleware,
  updateTimesheet
);

// Update timesheet status (for admin approval)
router.patch(
  "/:id/status",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateTimesheetStatus
);

// Delete timesheet
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  deleteTimesheet
);

module.exports = router;

