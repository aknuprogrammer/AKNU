const express = require("express");
const router = express.Router();
const {
  getAllSeatingArrangements,
  getSeatingArrangementsByCenter,
  getSeatingArrangementById,
  createSeatingArrangements,
  updateSeatingArrangement,
  deleteSeatingArrangement,
  deleteSeatingArrangementsByCenter,
  getSeatingStatsByCenter,
} = require("../../controllers/examination/jumblingCentersController");

// @route   GET /api/examination/seating-arrangements
// @desc    Get all seating arrangements
// @access  Private
router.get("/", getAllSeatingArrangements);

// @route   GET /api/examination/seating-arrangements/center/:centerId
// @desc    Get seating arrangements by center
// @access  Private
router.get("/center/:centerId", getSeatingArrangementsByCenter);

// @route   GET /api/examination/seating-arrangements/center/:centerId/stats
// @desc    Get seating statistics for a center
// @access  Private
router.get("/center/:centerId/stats", getSeatingStatsByCenter);

// @route   GET /api/examination/seating-arrangements/:id
// @desc    Get seating arrangement by ID
// @access  Private
router.get("/:id", getSeatingArrangementById);

// @route   POST /api/examination/seating-arrangements
// @desc    Create seating arrangements (bulk)
// @access  Private
router.post("/", createSeatingArrangements);

// @route   PUT /api/examination/seating-arrangements/:id
// @desc    Update seating arrangement
// @access  Private
router.put("/:id", updateSeatingArrangement);

// @route   DELETE /api/examination/seating-arrangements/:id
// @desc    Delete seating arrangement
// @access  Private
router.delete("/:id", deleteSeatingArrangement);

// @route   DELETE /api/examination/seating-arrangements/center/:centerId
// @desc    Delete all seating arrangements for a center
// @access  Private
router.delete("/center/:centerId", deleteSeatingArrangementsByCenter);

module.exports = router;

