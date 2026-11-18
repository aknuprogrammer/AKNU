const express = require("express");
const {
  getAllBeds,
  getBedById,
  createBed,
  updateBed,
  deleteBed,
} = require("../../controllers/hostel/bedController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Get all beds
router.get(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getAllBeds
);

// Get bed by ID
router.get(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getBedById
);

// Create a new bed
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  createBed
);

// Update a bed
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  updateBed
);

// Delete a bed
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  deleteBed
);

module.exports = router;

