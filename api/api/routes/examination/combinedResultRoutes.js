const express = require("express");
const router = express.Router();
const {
  saveCombinedResults,
  getAllCombinedResults,
  getCombinedResultById,
  updateCombinedResult,
  deleteCombinedResult,
  deleteCombinedResultsBySetup,
} = require("../../controllers/examination/combinedResultController");

// @route   POST /api/examination/combined-results
// @desc    Save combined results (bulk)
// @access  Private
router.post("/", saveCombinedResults);

// @route   GET /api/examination/combined-results
// @desc    Get all combined results
// @access  Private
router.get("/", getAllCombinedResults);

// @route   GET /api/examination/combined-results/:id
// @desc    Get combined result by ID
// @access  Private
router.get("/:id", getCombinedResultById);

// @route   PUT /api/examination/combined-results/:id
// @desc    Update combined result
// @access  Private
router.put("/:id", updateCombinedResult);

// @route   DELETE /api/examination/combined-results/:id
// @desc    Delete combined result
// @access  Private
router.delete("/:id", deleteCombinedResult);

// @route   DELETE /api/examination/combined-results/setup/:setupId
// @desc    Delete combined results by internal exam setup
// @access  Private
router.delete("/setup/:setupId", deleteCombinedResultsBySetup);

module.exports = router;

