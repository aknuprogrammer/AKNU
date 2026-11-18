const express = require("express");
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require("../../controllers/library/bookController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Public route - Get all books (can be accessed without auth for browsing)
router.get("/", getBooks);

// Protected routes - Require authentication and authorization
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createBook
);

router.get(
  "/:id",
  authenticationMiddleware,
  getBookById
);

router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateBook
);

router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  deleteBook
);

module.exports = router;

