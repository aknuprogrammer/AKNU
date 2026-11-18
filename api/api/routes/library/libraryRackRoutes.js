const express = require("express");
const {
  getLibraryRacks,
  getLibraryRackById,
  createLibraryRack,
  updateLibraryRack,
  deleteLibraryRack,
} = require("../../controllers/library/libraryRackController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Public route - Get all library racks (can be accessed without auth for dropdowns)
router.get("/", getLibraryRacks);

// Protected routes - Require authentication and authorization
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createLibraryRack
);

router.get(
  "/:id",
  authenticationMiddleware,
  getLibraryRackById
);

router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateLibraryRack
);

router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  deleteLibraryRack
);

module.exports = router;

