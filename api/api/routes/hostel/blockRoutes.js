const express = require("express");
const {
  getAllBlocks,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
} = require("../../controllers/hostel/blockController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Get all blocks
router.get(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getAllBlocks
);

// Get block by ID
router.get(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getBlockById
);

// Create a new block
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  createBlock
);

// Update a block
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  updateBlock
);

// Delete a block
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  deleteBlock
);

module.exports = router;

