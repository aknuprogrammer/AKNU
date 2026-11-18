const express = require("express");
const router = express.Router();
const {
  createLeave,
  getLeaves,
  getLeaveById,
  getLeavesByEmployeeId,
  updateLeave,
  deleteLeave,
  updateLeaveStatus,
} = require("../../controllers/employee/leaveController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

// Create new leave request
router.post("/", authenticationMiddleware, createLeave);

// Get all leave requests (with optional filters)
router.get("/", authenticationMiddleware, getLeaves);

// Get single leave request by ID
router.get("/:id", authenticationMiddleware, getLeaveById);

// Get leave requests by employeeId
router.get("/employee/:employeeId", authenticationMiddleware, getLeavesByEmployeeId);

// Update leave request
router.put("/:id", authenticationMiddleware, updateLeave);

// Update leave status (for admin approval)
router.patch(
  "/:id/status",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateLeaveStatus
);

// Delete leave request
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  deleteLeave
);

module.exports = router;

