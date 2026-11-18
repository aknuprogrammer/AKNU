const express = require("express");
const {
  getAllFeeStructures,
  getFeeStructureById,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
} = require("../../controllers/hostel/hostelFeeStructureController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Get all fee structures
router.get("/", getAllFeeStructures); // Public access for fetching

// Get fee structure by ID
router.get("/:id", getFeeStructureById); // Public access for fetching

// Create a new fee structure
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createFeeStructure
);

// Update a fee structure
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateFeeStructure
);

// Delete a fee structure
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  deleteFeeStructure
);

module.exports = router;

