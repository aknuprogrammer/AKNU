const express = require("express");
const router = express.Router();
const {
  getAllFloors,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
  createRoomsForFloors,
} = require("../../controllers/hostel/floorController");

// Get all floors
router.get("/", getAllFloors);

// Get floor by ID
router.get("/:id", getFloorById);

// Create a new floor
router.post("/", createFloor);

// Create rooms for floors based on room counts
router.post("/create-rooms", createRoomsForFloors);

// Update a floor
router.put("/:id", updateFloor);

// Delete a floor
router.delete("/:id", deleteFloor);

module.exports = router;

