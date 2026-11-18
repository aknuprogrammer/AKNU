const express = require("express");
const {
  getAllWardens,
  getWardenById,
  getWardenByHostelId,
  createWarden,
  updateWarden,
  deleteWarden,
  getWardensByDesignation,
} = require("../../controllers/hostel/wardenController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Get wardens by designation (must come before /:id route)
router.get(
  "/designation/:designation",
  authenticationMiddleware,
  getWardensByDesignation
);

// Get warden by hostel ID (must come before /:id route)
router.get(
  "/hostel/:hostelId",
  authenticationMiddleware,
  getWardenByHostelId
);

// Get all wardens
router.get(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getAllWardens
);

// Get warden by ID
router.get(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getWardenById
);

// Create a new warden
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  createWarden
);

// Update a warden
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  updateWarden
);

// Delete a warden
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  deleteWarden
);

module.exports = router;

