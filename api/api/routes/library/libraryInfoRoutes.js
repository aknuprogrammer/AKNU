const express = require("express");
const {
  getLibraryInfo,
  getLibraryInfoById,
  createLibraryInfo,
  updateLibraryInfo,
  deleteLibraryInfo,
} = require("../../controllers/library/libraryInfoController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Public route - Get all library info (can be accessed without auth for dropdowns)
router.get("/", getLibraryInfo);

// Protected routes - Require authentication and authorization
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createLibraryInfo
);

router.get(
  "/:id",
  authenticationMiddleware,
  getLibraryInfoById
);

router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateLibraryInfo
);

router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  deleteLibraryInfo
);

module.exports = router;

