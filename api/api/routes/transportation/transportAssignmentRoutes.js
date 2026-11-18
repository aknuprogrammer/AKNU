const express = require("express");
const router = express.Router();
const transportAssignmentController = require("../../controllers/transportation/transportAssignmentController");

// Create
router.post("/", transportAssignmentController.createAssignment);

// Bulk Create
router.post("/bulk", transportAssignmentController.createBulkAssignments);

// Read All
router.get("/", transportAssignmentController.getAllAssignments);

// Read One
router.get("/:id", transportAssignmentController.getAssignmentById);

// Update
router.put("/:id", transportAssignmentController.updateAssignment);

// Delete
router.delete("/:id", transportAssignmentController.deleteAssignment);

module.exports = router;
