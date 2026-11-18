const express = require("express");
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  createBulkRooms,
} = require("../../controllers/hostel/roomController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Get all rooms
router.get(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getAllRooms
);

// Get room by ID
router.get(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getRoomById
);

// Create a new room
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  createRoom
);

// Create multiple rooms with full details
router.post(
  "/bulk",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  createBulkRooms
);

// Update a room
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  updateRoom
);

// Delete a room
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  deleteRoom
);

module.exports = router;

