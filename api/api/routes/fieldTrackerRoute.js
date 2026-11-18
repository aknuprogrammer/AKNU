const express = require("express");
const {
  createFieldTracker,
  getFieldTrackers,
  getFieldTrackerById,
  updateFieldTracker,
  verifyFieldTracker,
} = require("../controllers/fieldTrackerController");
const authenticationMiddleware = require("../middlewares/authentication");
const authorizationMiddleware = require("../middlewares/authorization");

const router = express.Router();

// POST - Create new field tracker
router.post(
  "/field-trackers",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createFieldTracker
);
router.post("/verify-credentials", verifyFieldTracker);

// GET - Get all field trackers
router.get("/field-trackers", getFieldTrackers);

// GET - Get single field tracker by ID
// router.get("/field-trackers/:id", authenticationMiddleware, getFieldTrackerById);

// PUT - Update field tracker
router.put(
  "/field-trackers/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateFieldTracker
);

module.exports = router;
