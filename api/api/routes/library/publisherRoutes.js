const express = require("express");
const {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
} = require("../../controllers/library/publisherController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Public route - Get all publishers (can be accessed without auth for dropdowns)
router.get("/", getPublishers);

// Protected routes - Require authentication and authorization
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createPublisher
);

router.get(
  "/:id",
  authenticationMiddleware,
  getPublisherById
);

router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updatePublisher
);

router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  deletePublisher
);

module.exports = router;

