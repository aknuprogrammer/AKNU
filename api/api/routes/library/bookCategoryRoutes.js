const express = require("express");
const {
  getBookCategories,
  getBookCategoryById,
  createBookCategory,
  updateBookCategory,
  deleteBookCategory,
} = require("../../controllers/library/bookCategoryController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Public route - Get all categories (can be accessed without auth for dropdowns)
router.get("/", getBookCategories);

// Protected routes - Require authentication and authorization
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createBookCategory
);

router.get(
  "/:id",
  authenticationMiddleware,
  getBookCategoryById
);

router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateBookCategory
);

router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  deleteBookCategory
);

module.exports = router;

