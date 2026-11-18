const express = require("express");
const {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  bulkCreateFacilities,
} = require("../../controllers/hostel/facilityController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Get all facilities
router.get(
  "/",
  authenticationMiddleware,
  getFacilities
);

// Get facility by ID
router.get(
  "/:id",
  authenticationMiddleware,
  getFacilityById
);

// Create a new facility
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createFacility
);

// Bulk create facilities
router.post(
  "/bulk",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  bulkCreateFacilities
);

// Update a facility
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateFacility
);

// Delete a facility
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  deleteFacility
);

module.exports = router;

