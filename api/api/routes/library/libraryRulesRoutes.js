const express = require("express");
const {
  getActiveRules,
  getAllRules,
  getRulesById,
  createOrUpdateRules,
  createNewRules,
  updateRules,
  deleteRules,
} = require("../../controllers/library/libraryRulesController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Public route - Get active rules (can be accessed without auth for frontend)
router.get("/", getActiveRules);
router.get("/active", getActiveRules);

// Public route - Get all rules (for history)
router.get("/all", getAllRules);

// Protected routes - Require authentication and authorization
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createOrUpdateRules
);

router.put(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createOrUpdateRules
);

router.post(
  "/new",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createNewRules
);

router.get(
  "/:id",
  authenticationMiddleware,
  getRulesById
);

router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateRules
);

router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  deleteRules
);

module.exports = router;

