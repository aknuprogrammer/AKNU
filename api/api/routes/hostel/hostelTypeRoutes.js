const express = require("express");
const {
  getAllHostelTypes,
  getHostelTypeById,
  createHostelType,
  updateHostelType,
  deleteHostelType,
} = require("../../controllers/hostel/hostelTypeController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Get all hostel types (can be accessed for dropdowns)
router.get("/", authenticationMiddleware, getAllHostelTypes);

// Get hostel type by ID
router.get(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getHostelTypeById
);

// Create a new hostel type
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  createHostelType
);

// Update a hostel type
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  updateHostelType
);

// Delete a hostel type
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  deleteHostelType
);

module.exports = router;

