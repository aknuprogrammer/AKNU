const express = require("express");
const router = express.Router();
const {
  getIssuedBooks,
  getIssuedBookById,
  createIssuedBook,
  updateIssuedBook,
  deleteIssuedBook,
  returnBook,
  renewBook,
} = require("../../controllers/library/issuedBookController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

// Public routes
router.get("/", getIssuedBooks);
router.get("/:id", getIssuedBookById);

// Protected routes (admin, super_admin)
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  createIssuedBook
);
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateIssuedBook
);
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  deleteIssuedBook
);

// Special actions
router.put(
  "/:id/return",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  returnBook
);
router.put(
  "/:id/renew",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  renewBook
);

module.exports = router;

