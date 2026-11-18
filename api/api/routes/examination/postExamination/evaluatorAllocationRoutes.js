const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../../../middlewares/authentication");
const {
  getAllAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  getAllocationsByEvaluator,
} = require("../../../controllers/examination/postExamination/evaluatorAllocationController");

// All routes require authentication
router.use(authenticationMiddleware);

// @route   GET /api/examination/evaluator-allocations
router.get("/", getAllAllocations);

// @route   GET /api/examination/evaluator-allocations/evaluator/:evaluatorId
router.get("/evaluator/:evaluatorId", getAllocationsByEvaluator);

// @route   GET /api/examination/evaluator-allocations/:id
router.get("/:id", getAllocationById);

// @route   POST /api/examination/evaluator-allocations
router.post("/", createAllocation);

// @route   PUT /api/examination/evaluator-allocations/:id
router.put("/:id", updateAllocation);

module.exports = router;

